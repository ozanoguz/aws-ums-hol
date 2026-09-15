#!/usr/bin/env python3
"""Instructor dashboard; polls student demo endpoints without AWS credentials."""
import argparse
import concurrent.futures
import copy
import json
import logging
import math
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
from urllib.request import Request, build_opener, HTTPRedirectHandler

ROOT = Path(__file__).resolve().parent
MAX_BODY = 1024 * 1024

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def validate_url(value):
    p = urlsplit(value)
    if p.scheme not in ('http', 'https') or not p.hostname or p.username or p.password or p.query or p.fragment or p.path not in ('', '/'):
        raise ValueError('Each URL must be an http(s) origin, e.g. http://203.0.113.10 (no path or credentials)')
    _ = p.port
    return value.rstrip('/')


def load_config(path):
    data = json.loads(Path(path).read_text())
    students = data.get('students')
    if not isinstance(students, list) or len(students) > 200:
        raise ValueError('students must be a list of at most 200 entries')
    seen = set()
    for s in students:
        if not isinstance(s, dict) or not isinstance(s.get('id'), str) or not s['id'].strip() or s['id'] in seen:
            raise ValueError('Each student needs a unique nonempty string id')
        seen.add(s['id'])
        if not isinstance(s.get('url'), str):
            raise ValueError('Each student needs a URL')
        s['url'] = validate_url(s['url'])
        s['name'] = str(s.get('name', s['id']))[:150]
        s['account_id'] = str(s.get('account_id', ''))[:40]
    return students


def fetch(origin, path, timeout=3):
    request = Request(origin + path, headers={'Connection': 'close', 'Accept': 'application/json, text/plain', 'User-Agent': 'UMS-Instructor-Scorer/1.0'})
    with build_opener(NoRedirect).open(request, timeout=timeout) as response:
        body = response.read(MAX_BODY + 1)
        if len(body) > MAX_BODY:
            raise ValueError('Student response is too large')
        if path == '/healthz':
            if body.strip() != b'ok':
                raise ValueError('Unexpected health response')
            return True
        return json.loads(body)


def validate_state(data):
    if not isinstance(data, dict) or not isinstance(data.get('nodes'), list) or not isinstance(data.get('probes'), list):
        raise ValueError('Student /api/state has an unexpected schema')
    if not isinstance(data.get('stale'), bool) or not isinstance(data.get('discovery_error'), str):
        raise ValueError('Missing discovery status')
    for key in ('now', 'discovery_at'):
        if type(data.get(key)) not in (float, int) or not math.isfinite(data[key]):
            raise ValueError('Missing discovery timestamps')
    ids = set()
    for n in data['nodes']:
        if not isinstance(n, dict) or not isinstance(n.get('id'), str) or n['id'] in ids:
            raise ValueError('Invalid or duplicate node ID')
        ids.add(n['id'])
    return data


class Student:
    def __init__(self, config, clock=time.time):
        self.config, self.clock = config, clock
        self.lock = threading.Lock()
        self.pending = {}
        self.confirmed = {}  # node -> instructor receipt timestamp
        self.events = {}  # per-node counter; UI blinks only when it increases
        self.history = {'two_healthy': None, 'three_healthy': None, 'three_inspected': None}
        self.view = dict(config, checked_at=0, state_at=0, reachable=False, fresh=False,
                         error='Waiting for first check', nodes=[], healthy=0, verified=0, history=dict(self.history))

    def accept(self, data, now):
        validate_state(data)
        fresh = (not data['stale'] and not data['discovery_error']
                 and abs(now - data['now']) <= 30
                 and 0 <= data['now'] - data['discovery_at'] <= 30)
        nodes = data['nodes']
        node_ids = {n['id'] for n in nodes}
        self.pending = {k: t for k, t in self.pending.items() if now - t <= 120}
        if fresh:
            for probe in data['probes']:
                if not isinstance(probe, dict):
                    continue
                pid, node = probe.get('id'), probe.get('node')
                if isinstance(pid, str) and isinstance(node, str) and pid in self.pending and node in node_ids:
                    self.confirmed[node] = now
                    self.events[node] = self.events.get(node, 0) + 1
                    del self.pending[pid]
        healthy_ids = {n['id'] for n in nodes if n.get('health') == 'healthy' and n.get('lifecycle') == 'InService'} if fresh else set()
        verified_ids = {i for i in healthy_ids if i in self.confirmed and now - self.confirmed[i] <= 120}
        healthy, verified = len(healthy_ids), len(verified_ids)
        for key, passed in [('two_healthy', healthy >= 2), ('three_healthy', healthy >= 3), ('three_inspected', verified >= 3)]:
            if passed and self.history[key] is None:
                self.history[key] = now
        display = [dict(id=n['id'], serial=str(n.get('serial', '')), az=str(n.get('az', '')),
                        health=str(n.get('health', 'unknown')), lifecycle=str(n.get('lifecycle', 'unknown')),
                        confirmed_at=self.confirmed.get(n['id'], 0), event=self.events.get(n['id'], 0),
                        verified=n['id'] in verified_ids) for n in nodes]
        self.view.update(state_at=now, fresh=fresh, nodes=display, healthy=healthy, verified=verified,
                         error='' if fresh else (data['discovery_error'] or 'AWS discovery is stale'), history=dict(self.history))
        # Retain only current nodes, so replaced instances do not count toward progress.
        self.confirmed = {i: t for i, t in self.confirmed.items() if i in node_ids}
        self.events = {i: t for i, t in self.events.items() if i in node_ids}

    def poll(self, getter=fetch, probe_count=3):
        # Only one worker owns a student; serialize snapshots with its updates.
        now = self.clock()
        try:
            getter(self.config['url'], '/healthz')
        except Exception as exc:
            with self.lock:
                self.view.update(checked_at=now, reachable=False, fresh=False, healthy=0, verified=0,
                                 error=f'Web service unreachable: {type(exc).__name__}')
            return
        errors = []
        new_probes = []
        for _ in range(probe_count):
            try:
                result = getter(self.config['url'], '/probe')
                if not isinstance(result, dict) or not isinstance(result.get('id'), str) or not result['id'] or result.get('status') != 'served':
                    raise ValueError('Invalid probe response')
                new_probes.append((result['id'], self.clock()))
            except Exception as exc:
                errors.append(f'Probe failed: {type(exc).__name__}')
                break
        try:
            data = validate_state(getter(self.config['url'], '/api/state'))
            with self.lock:
                self.pending.update(new_probes)
                self.view.update(checked_at=self.clock(), reachable=True)
                self.accept(data, self.clock())
                if errors:
                    self.view['error'] = '; '.join(filter(None, [self.view['error'], *errors]))
        except Exception as exc:
            with self.lock:
                self.pending.update(new_probes)
                self.view.update(checked_at=self.clock(), reachable=True, fresh=False, healthy=0, verified=0,
                                 error=f'Inventory unavailable: {type(exc).__name__}')
        with self.lock:
            self.pending = dict(list((k, t) for k, t in self.pending.items() if self.clock()-t <= 120)[-500:])

    def snapshot(self):
        with self.lock:
            v = copy.deepcopy(self.view)
        # Even if a poll is delayed, never present old results as live.
        if v.get('url') and self.clock() - v['checked_at'] > 30:
            v.update(fresh=False, healthy=0, verified=0, error='Check delayed; last result is stale')
        if not v['fresh']:
            for n in v['nodes']:
                n['verified'] = False
        return v


class Dashboard:
    def __init__(self, students, interval=5, workers=16, discovery=None):
        self.students = [Student(s) for s in students]
        self.discovery = discovery
        self.interval, self.workers = interval, workers
        self.stop = threading.Event()
        self.started = time.time()

    def check_student(self, student):
        if self.discovery:
            self.discovery.refresh(student)
        if student.config.get('url'):
            student.poll()

    def run(self):
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.workers) as pool:
            while not self.stop.is_set():
                started = time.monotonic()
                tasks = [pool.submit(self.check_student, s) for s in self.students]
                for future in concurrent.futures.as_completed(tasks):
                    try:
                        future.result()
                    except Exception:
                        logging.exception('Student polling failed')
                self.stop.wait(max(0.1, self.interval - (time.monotonic() - started)))

    def snapshot(self):
        return {'now': time.time(), 'started_at': self.started, 'students': [s.snapshot() for s in self.students]}


def handler(dashboard):
    page = (ROOT / 'index.html').read_bytes()
    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            path = urlsplit(self.path).path
            if path == '/':
                body, kind = page, 'text/html; charset=utf-8'
            elif path == '/api/state':
                body, kind = json.dumps(dashboard.snapshot()).encode(), 'application/json'
            elif path == '/healthz':
                body, kind = b'ok', 'text/plain'
            else:
                self.send_error(404)
                return
            self.send_response(200)
            self.send_header('Content-Type', kind)
            self.send_header('Content-Length', str(len(body)))
            self.send_header('Cache-Control', 'no-store')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.end_headers()
            self.wfile.write(body)
        def log_message(self, fmt, *args):
            pass
    return Handler


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    inputs = parser.add_mutually_exclusive_group()
    inputs.add_argument('--config', default=str(ROOT / 'students.json'))
    inputs.add_argument('--aws-config', help='Discover URLs from cross-account roles using accounts.json')
    parser.add_argument('--host', default='127.0.0.1')
    parser.add_argument('--port', type=int, default=8090)
    parser.add_argument('--interval', type=float, default=5)
    args = parser.parse_args()
    if args.interval < 2:
        parser.error('--interval must be at least 2 seconds')
    try:
        discovery = None
        if args.aws_config:
            from aws_discovery import load_accounts, AWSDiscovery
            aws_config = load_accounts(args.aws_config)
            students = aws_config['accounts']
            discovery = AWSDiscovery(aws_config)
        else:
            students = load_config(args.config)
    except (OSError, ValueError, TypeError, ImportError) as exc:
        parser.error(str(exc))
    dashboard = Dashboard(students, interval=args.interval, discovery=discovery)
    server = ThreadingHTTPServer((args.host, args.port), handler(dashboard))
    thread = threading.Thread(target=dashboard.run, daemon=True)
    thread.start()
    print(f'Instructor dashboard: http://{args.host}:{server.server_port} ({len(students)} students)', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        dashboard.stop.set()
        server.server_close()

if __name__ == '__main__':
    main()
