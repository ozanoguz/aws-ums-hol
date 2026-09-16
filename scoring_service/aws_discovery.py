"""Discover each student's demo EIP using student00's cross-account role access."""
import ipaddress
import json
import re
import time
from pathlib import Path


def load_accounts(path):
    data = json.loads(Path(path).read_text())
    role = data.get('role_name', '')
    if not re.fullmatch(r'[\w+=,.@/-]{1,512}', role) or 'REPLACE' in role:
        raise ValueError('Set role_name to the role student00 assumes in student accounts')
    region = data.get('region', 'eu-central-1')
    if not isinstance(region, str) or not re.fullmatch(r'[a-z0-9-]+', region):
        raise ValueError('Invalid region')
    accounts = data.get('accounts')
    if not isinstance(accounts, list) or not 1 <= len(accounts) <= 200:
        raise ValueError('accounts must contain 1 to 200 student accounts')
    seen = set()
    for entry in accounts:
        if not isinstance(entry, dict):
            raise ValueError('Account entries must be objects')
        aid = entry.get('account_id', '')
        if not isinstance(aid, str) or not re.fullmatch(r'\d{12}', aid) or aid in seen:
            raise ValueError('Account IDs must be unique 12-digit strings')
        seen.add(aid)
        entry['id'] = aid
        entry['name'] = str(entry.get('name', aid))[:150]
        entry['url'] = ''
        entry['discovery_status'] = 'Waiting for AWS URL discovery'
    data['region'] = region
    return data


def select_address(addresses):
    matches = [a for a in addresses if a.get('AssociationId') and a.get('NetworkInterfaceId') and a.get('PublicIp')]
    if not matches:
        return '', 'Pending deployment: no associated demo Elastic IP found'
    if len(matches) != 1:
        return '', 'Ambiguous deployment: multiple demo EIPs; set an exact eip_name for this account'
    address = str(ipaddress.IPv4Address(matches[0]['PublicIp']))
    return 'http://' + address, 'Demo Elastic IP discovered'


class AWSDiscovery:
    def __init__(self, config, session_factory=None):
        self.config = config
        if session_factory is None:
            import boto3
            session_factory = boto3.Session
        self.session_factory = session_factory

    def ec2_client(self, account):
        # One session per worker avoids sharing mutable boto3 Session objects.
        from botocore.config import Config
        options = Config(connect_timeout=3, read_timeout=5, retries={'mode': 'standard', 'total_max_attempts': 2})
        region = self.config['region']
        base = self.session_factory(region_name=region)
        sts = base.client('sts', config=options)
        if account['account_id'] == '594379811663':
            if sts.get_caller_identity()['Account'] != account['account_id']:
                raise ValueError('Student00 direct discovery must run with student00 credentials')
            target = base
        else:
            request = dict(RoleArn=f"arn:aws:iam::{account['account_id']}:role/{self.config['role_name']}",
                           RoleSessionName='ums-scoring-discovery', DurationSeconds=900)
            if self.config.get('external_id'):
                request['ExternalId'] = self.config['external_id']
            c = sts.assume_role(**request)['Credentials']
            target = self.session_factory(region_name=region, aws_access_key_id=c['AccessKeyId'],
                                          aws_secret_access_key=c['SecretAccessKey'], aws_session_token=c['SessionToken'])
        return target.client('ec2', config=options)

    def resolve(self, account):
        ec2 = self.ec2_client(account)
        # Existing demo module uses Name = <prefix>gwlb-demo-web on its EIP.
        name = account.get('eip_name') or '*gwlb-demo-web'
        response = ec2.describe_addresses(Filters=[{'Name': 'tag:Name', 'Values': [name]}])
        return select_address(response['Addresses'])

    def fortimanager(self, account):
        import fnmatch
        ec2 = self.ec2_client(account)
        filters = [{'Name': 'instance-state-name', 'Values': ['pending', 'running', 'stopping', 'stopped']}]
        if account.get('fmg_instance_id'):
            filters.append({'Name': 'instance-id', 'Values': [account['fmg_instance_id']]})
        matches = []
        for page in ec2.get_paginator('describe_instances').paginate(Filters=filters):
            for reservation in page.get('Reservations', []):
                for instance in reservation.get('Instances', []):
                    name = next((t['Value'] for t in instance.get('Tags', []) if t['Key'] == 'Name'), '')
                    state = instance.get('State', {}).get('Name', '')
                    if state not in ('pending', 'running', 'stopping', 'stopped'):
                        continue
                    pattern = account.get('fmg_name')
                    identified = (bool(account.get('fmg_instance_id')) or
                        (fnmatch.fnmatchcase(name, pattern) if pattern else
                         ('fortimanager' in name.lower() or bool(re.search(r'(^|[-_ ])fmg($|[-_ ])', name.lower())))))
                    if identified:
                        matches.append({'id': instance['InstanceId'], 'state': state})
        return {'deployed': bool(matches), 'instances': matches, 'error': '', 'checked_at': time.time()}

    def fortigates(self, account):
        """Read lab ASG members independently of the inspected web path."""
        ec2 = self.ec2_client(account)
        filters = [
            {'Name': 'instance-state-name', 'Values': ['pending', 'running', 'stopping', 'stopped']},
            {'Name': 'tag:aws:autoscaling:groupName',
             'Values': [account.get('fgt_asg_name') or '*fgt_byol_asg']},
        ]
        instances = []
        for page in ec2.get_paginator('describe_instances').paginate(Filters=filters):
            for reservation in page.get('Reservations', []):
                for instance in reservation.get('Instances', []):
                    state = instance.get('State', {}).get('Name', '')
                    if state in ('pending', 'running', 'stopping', 'stopped'):
                        instances.append({'id': instance['InstanceId'], 'state': state})
        return {'instances': instances, 'error': '', 'checked_at': time.time()}

    def refresh(self, student):
        now = time.time()
        if now - getattr(student, 'aws_checked_at', 0) < 60:
            return
        student.aws_checked_at = now
        try:
            url, status = self.resolve(student.config)
        except Exception as exc:
            # Expose AWS error codes, never credentials or raw response bodies.
            code = getattr(exc, 'response', {}).get('Error', {}).get('Code', type(exc).__name__)
            url, status = '', f'AWS discovery failed: {code}'
        try:
            fmg = self.fortimanager(student.config)
        except Exception as exc:
            code = getattr(exc, 'response', {}).get('Error', {}).get('Code', type(exc).__name__)
            fmg = {'deployed': None, 'instances': [], 'error': str(code), 'checked_at': time.time()}
        try:
            fgt = self.fortigates(student.config)
        except Exception as exc:
            code = getattr(exc, 'response', {}).get('Error', {}).get('Code', type(exc).__name__)
            fgt = {'instances': [], 'error': str(code), 'checked_at': time.time()}
        with student.lock:
            student.view['fortigates'] = fgt
            student.view['fortimanager'] = fmg
            if url and getattr(student, 'last_discovered_url', '') != url:
                student.pending.clear()
                student.confirmed.clear()
                student.events.clear()
                student.history = {'two_healthy': None, 'three_healthy': None, 'three_inspected': None}
                student.view.update(nodes=[], healthy=0, verified=0, fresh=False, reachable=False,
                                    history=dict(student.history))
            if url:
                student.last_discovered_url = url
            student.config['url'] = url
            student.view.update(url=url, discovery_status=status, aws_checked_at=now)
            if not url:
                student.view.update(error=status, checked_at=now, fresh=False, reachable=False, healthy=0, verified=0)
