#!/usr/bin/env python3
"""Lab HTTP server. Only correlated FortiGate forward logs light an appliance."""
import collections
import ipaddress
import json
import logging
import os
import re
import socketserver
import threading
import time
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

FIELDS = re.compile(r'(\w+)=(?:"([^"\\]*(?:\\.[^"\\]*)*)"|([^\s]+))')

def parse_log(message):
    return {m[0]: m[1] if m[1] else m[2] for m in FIELDS.findall(message)}

class State:
    def __init__(self, destination, clock=time.time):
        self.destination, self.clock = destination, clock
        self.lock = threading.RLock()
        self.nodes = {}
        self.probes = collections.deque(maxlen=1000)
        self.logs = collections.deque(maxlen=2000)
        self.discovery_at = 0
        self.discovery_error = 'Waiting for AWS discovery'
        self.last_log = 0

    def inventory(self, nodes):
        with self.lock:
            previous = self.nodes
            self.nodes = {n['id']: dict(n, serial=previous.get(n['id'], {}).get('serial', ''),
                observed=previous.get(n['id'], {}).get('observed', 0),
                last_activity=previous.get(n['id'], {}).get('last_activity', 0)) for n in nodes}
            self.discovery_at, self.discovery_error = self.clock(), ''

    def failure(self, message):
        with self.lock:
            self.discovery_error = message

    def probe(self, source, port):
        with self.lock:
            item = dict(id=uuid.uuid4().hex, source=source, port=port, at=self.clock(), node=None)
            self.probes.append(item)
            self.correlate()
            return item['id']

    def ingest(self, message, sender):
        fields = parse_log(message)
        with self.lock:
            node = next((n for n in self.nodes.values() if sender in n['ips']), None)
            if not node or fields.get('type') != 'traffic' or fields.get('subtype') != 'forward':
                return False
            if fields.get('dstip') != self.destination or fields.get('dstport') != '80' or fields.get('proto') != '6':
                return False
            # The identity comes from the discovered ENI source address, not an arbitrary claimed devid.
            serial = fields.get('devid', '')
            if not serial or fields.get('action') not in ('accept', 'start', 'close', 'timeout', 'client-rst', 'server-rst'):
                return False
            try:
                source = str(ipaddress.ip_address(fields['srcip']))
                port = int(fields['srcport'])
                event_at = int(fields['eventtime']) / 1_000_000_000
                if abs(self.clock() - event_at) > 120:
                    return False
            except (KeyError, ValueError):
                return False
            node['serial'] = serial
            self.last_log = self.clock()
            self.logs.append(dict(node=node['id'], source=source, port=port, at=event_at))
            self.correlate()
            return True

    def correlate(self):
        for p in self.probes:
            if p['node'] or self.clock() - p['at'] > 120:
                continue
            matches = {log['node'] for log in self.logs if log['source'] == p['source']
                       and log['port'] == p['port'] and abs(log['at'] - p['at']) < 15}
            if len(matches) == 1:
                node_id = next(iter(matches))
                if node_id in self.nodes:
                    p['node'] = node_id
                    self.nodes[node_id]['observed'] += 1
                    self.nodes[node_id]['last_activity'] = self.clock()

    def snapshot(self):
        with self.lock:
            now = self.clock()
            return dict(now=now, discovery_at=self.discovery_at,
                discovery_error=self.discovery_error, stale=now-self.discovery_at > 30,
                last_log=self.last_log,
                nodes=[{k: v for k, v in n.items() if k != 'ips'} for n in self.nodes.values()],
                probes=[dict(id=p['id'], at=p['at'], node=p['node']) for p in list(self.probes)[-80:]])

def discover(state, config):
    import boto3
    from botocore.config import Config
    session = boto3.Session(region_name=config['region'])
    clients = {name: session.client(name, config=Config(connect_timeout=3, read_timeout=5,
               retries={'max_attempts': 2})) for name in ('autoscaling', 'ec2', 'elbv2')}
    while True:
        try:
            groups = clients['autoscaling'].describe_auto_scaling_groups(
                AutoScalingGroupNames=config['asg_names'])['AutoScalingGroups']
            if {g['AutoScalingGroupName'] for g in groups} != set(config['asg_names']):
                raise ValueError('One or more configured ASGs were not found')
            members = {i['InstanceId']: dict(i, group=g['AutoScalingGroupName'])
                       for g in groups for i in g['Instances']}
            health = clients['elbv2'].describe_target_health(TargetGroupArn=config['target_group_arn'])['TargetHealthDescriptions']
            targets = {h['Target']['Id']: h['TargetHealth']['State'] for h in health}
            instances = []
            if members:
                # ASGs in this lab are small; chunk to respect EC2 request limits.
                ids = list(members)
                for offset in range(0, len(ids), 100):
                    for r in clients['ec2'].describe_instances(InstanceIds=ids[offset:offset+100])['Reservations']:
                        instances.extend(r['Instances'])
            nodes = []
            for i in instances:
                ips = [a['PrivateIpAddress'] for eni in i['NetworkInterfaces'] for a in eni.get('PrivateIpAddresses', [])]
                target_states = [targets[x] for x in [i['InstanceId']] + ips if x in targets]
                nodes.append(dict(id=i['InstanceId'], az=i['Placement']['AvailabilityZone'],
                    group=members[i['InstanceId']]['group'], lifecycle=members[i['InstanceId']]['LifecycleState'],
                    health=target_states[0] if len(set(target_states)) == 1 else ('mixed' if target_states else 'unregistered'), ips=ips))
            state.inventory(sorted(nodes, key=lambda n: (n['az'], n['id'])))
        except Exception:
            logging.exception('AWS discovery failed')
            state.failure('AWS discovery unavailable; displayed inventory may be stale')
        time.sleep(10)

def serve(config):
    state = State(config['private_ip'])
    page = Path(__file__).with_name('index.html').read_bytes()
    class HTTP(BaseHTTPRequestHandler):
        protocol_version = 'HTTP/1.1'
        def do_GET(self):
            path = urlsplit(self.path).path
            if path == '/':
                body, content_type = page, 'text/html; charset=utf-8'
            elif path == '/api/state':
                body, content_type = json.dumps(state.snapshot()).encode(), 'application/json'
            elif path == '/probe':
                body = json.dumps({'id': state.probe(*self.client_address), 'status': 'served'}).encode()
                content_type = 'application/json'
            elif path == '/healthz':
                body, content_type = b'ok', 'text/plain'
            else:
                self.send_error(404)
                return
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(len(body)))
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Connection', 'close')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.send_header('Content-Security-Policy', "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'")
            self.end_headers()
            self.wfile.write(body)
            self.close_connection = True  # Each probe needs a new 5-tuple for GWLB distribution.
        def log_message(self, *args):
            pass
    class Syslog(socketserver.BaseRequestHandler):
        def handle(self):
            state.ingest(self.request[0].decode('utf-8', errors='replace'), self.client_address[0])
    threading.Thread(target=discover, args=(state, config), daemon=True).start()
    udp = socketserver.UDPServer(('0.0.0.0', config.get('syslog_port', 5514)), Syslog)
    threading.Thread(target=udp.serve_forever, daemon=True).start()
    ThreadingHTTPServer(('0.0.0.0', int(os.getenv('HTTP_PORT', '80'))), HTTP).serve_forever()

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    serve(json.loads(Path(os.getenv('DEMO_CONFIG', '/etc/gwlb-demo.json')).read_text()))
