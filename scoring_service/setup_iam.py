#!/usr/bin/env python3
"""Prepare dedicated scoring roles using training-admin's existing organization role."""
import argparse
import json
import time
from pathlib import Path
import re

HOST_ACCOUNT = '594379811663'
BOOTSTRAP_ROLE = 'OrganizationAccountAccessRole'
HOST_ROLE = 'UMSScoringInstanceRole'
READ_ROLE = 'UMSScoringReadOnly'
OWNER = {'Key': 'ManagedBy', 'Value': 'UMSScoringSetup'}

DEFAULT_ACCOUNTS = [{'account_id': '594379811663', 'name': 'student00'}, {'account_id': '365808682226', 'name': 'student01'}, {'account_id': '790869470612', 'name': 'student02'}, {'account_id': '233147340238', 'name': 'student03'}, {'account_id': '156387786381', 'name': 'student04'}, {'account_id': '515386851991', 'name': 'student05'}, {'account_id': '131811870954', 'name': 'student06'}, {'account_id': '349901144557', 'name': 'student07'}, {'account_id': '971726136093', 'name': 'student08'}, {'account_id': '496344732845', 'name': 'student09'}, {'account_id': '573097031087', 'name': 'student10'}, {'account_id': '537777148249', 'name': 'student11'}, {'account_id': '297755458926', 'name': 'student12'}, {'account_id': '369314739297', 'name': 'student13'}, {'account_id': '036245824663', 'name': 'student14'}, {'account_id': '655430985585', 'name': 'student15'}, {'account_id': '205121849406', 'name': 'student16'}, {'account_id': '319290658121', 'name': 'student17'}, {'account_id': '756491554733', 'name': 'student18'}, {'account_id': '262072276602', 'name': 'student19'}, {'account_id': '828767190954', 'name': 'student20'}, {'account_id': '079333926868', 'name': 'student21'}, {'account_id': '493559506997', 'name': 'student22'}, {'account_id': '115562376050', 'name': 'student23'}, {'account_id': '699937976535', 'name': 'student24'}, {'account_id': '861514617772', 'name': 'student25'}, {'account_id': '036590742296', 'name': 'student26'}, {'account_id': '632210073566', 'name': 'student27'}, {'account_id': '241016350765', 'name': 'student28'}, {'account_id': '225358528534', 'name': 'student29'}, {'account_id': '575169580492', 'name': 'student30'}, {'account_id': '070061941134', 'name': 'student31'}, {'account_id': '349081048365', 'name': 'student32'}, {'account_id': '689691061144', 'name': 'student33'}, {'account_id': '328903029180', 'name': 'student34'}]


def load_setup_config(path=None):
    if path:
        data = json.loads(Path(path).read_text())
    else:
        data = {'region': 'eu-central-1', 'role_name': READ_ROLE,
                'accounts': [dict(a) for a in DEFAULT_ACCOUNTS]}
    if not isinstance(data, dict):
        raise ValueError('Configuration must be a JSON object')
    accounts = data.get('accounts')
    if not isinstance(accounts, list) or not 1 <= len(accounts) <= 200:
        raise ValueError('Supply 1 to 200 student accounts')
    seen = set()
    for account in accounts:
        if not isinstance(account, dict):
            raise ValueError('Each account must be an object')
        aid = account.get('account_id')
        if not isinstance(aid, str) or not re.fullmatch(r'\d{12}', aid) or aid in seen:
            raise ValueError('Account IDs must be unique 12-digit strings')
        seen.add(aid)
        account['name'] = str(account.get('name', aid))
    data.setdefault('role_name', READ_ROLE)
    data.setdefault('region', 'eu-central-1')
    if not isinstance(data['region'], str) or not re.fullmatch(r'[a-z0-9-]+', data['region']):
        raise ValueError('Invalid AWS region')
    return data


def policy(action, resource):
    return {'Version': '2012-10-17', 'Statement': [{'Effect': 'Allow', 'Action': action, 'Resource': resource}]}


def trust(principal):
    return {'Version': '2012-10-17', 'Statement': [{'Effect': 'Allow', 'Principal': principal, 'Action': 'sts:AssumeRole'}]}


def plan(accounts):
    ids = [a['account_id'] for a in accounts if a['account_id'] != HOST_ACCOUNT]
    host_policy = policy(['ec2:DescribeAddresses', 'ec2:DescribeInstances'], '*')
    if ids:
        host_policy['Statement'].insert(0, policy('sts:AssumeRole', [f'arn:aws:iam::{a}:role/{READ_ROLE}' for a in ids])['Statement'][0])
    return {
        'bootstrap_role': BOOTSTRAP_ROLE,
        'host_account': HOST_ACCOUNT,
        'host_role': HOST_ROLE,
        'instance_profile': HOST_ROLE,
        'host_trust': trust({'Service': 'ec2.amazonaws.com'}),
        'host_permissions': host_policy,
        'student_role': READ_ROLE,
        'student_trust': trust({'AWS': f'arn:aws:iam::{HOST_ACCOUNT}:role/{HOST_ROLE}'}),
        'student_permissions': policy(['ec2:DescribeAddresses', 'ec2:DescribeInstances'], '*'),
        'students': accounts,
    }


def error_code(exc):
    return getattr(exc, 'response', {}).get('Error', {}).get('Code', type(exc).__name__)


def retry(call, **kwargs):
    for attempt in range(6):
        try:
            return call(**kwargs)
        except Exception as exc:
            if error_code(exc) not in ('NoSuchEntity', 'MalformedPolicyDocument') or attempt == 5:
                raise
            time.sleep(2)


def ensure_role(iam, name, trusted, permissions):
    try:
        current = iam.get_role(RoleName=name)['Role']
    except Exception as exc:
        if error_code(exc) != 'NoSuchEntity':
            raise
        current = None
    if current is not None:
        if OWNER not in current.get('Tags', []):
            raise RuntimeError(f'Refusing to modify existing unowned role {name}; inspect it first')
        retry(iam.update_assume_role_policy, RoleName=name, PolicyDocument=json.dumps(trusted))
    else:
        retry(iam.create_role, RoleName=name, AssumeRolePolicyDocument=json.dumps(trusted),
              Description='Dedicated UMS instructor scoring service role', Tags=[OWNER])
    retry(iam.put_role_policy, RoleName=name, PolicyName='UMSScoringPermissions', PolicyDocument=json.dumps(permissions))


def ensure_profile(iam):
    try:
        profile = iam.get_instance_profile(InstanceProfileName=HOST_ROLE)['InstanceProfile']
    except Exception as exc:
        if error_code(exc) != 'NoSuchEntity':
            raise
        profile = iam.create_instance_profile(InstanceProfileName=HOST_ROLE, Tags=[OWNER])['InstanceProfile']
    if OWNER not in profile.get('Tags', []):
        raise RuntimeError('Refusing to modify an existing unowned instance profile')
    roles = [r['RoleName'] for r in profile.get('Roles', [])]
    if roles and roles != [HOST_ROLE]:
        raise RuntimeError('Instance profile already contains a different role')
    if not roles:
        retry(iam.add_role_to_instance_profile, InstanceProfileName=HOST_ROLE, RoleName=HOST_ROLE)


def assume_iam(session, account, region):
    import boto3
    from botocore.config import Config
    options = Config(connect_timeout=5, read_timeout=10, retries={'mode': 'standard', 'total_max_attempts': 3})
    result = session.client('sts', region_name=region, config=options).assume_role(
        RoleArn=f'arn:aws:iam::{account}:role/{BOOTSTRAP_ROLE}',
        RoleSessionName='UMSScoringSetup', DurationSeconds=900)
    c = result['Credentials']
    return boto3.client('iam', region_name=region, config=options,
                        aws_access_key_id=c['AccessKeyId'], aws_secret_access_key=c['SecretAccessKey'],
                        aws_session_token=c['SessionToken'])


def apply(configuration, session):
    accounts, region = configuration['accounts'], configuration['region']
    desired = plan(accounts)
    # Bootstrap student00 first: the student trust policies reference its real role ARN.
    host = assume_iam(session, HOST_ACCOUNT, region)
    ensure_role(host, HOST_ROLE, desired['host_trust'], desired['host_permissions'])
    ensure_profile(host)
    print(f'READY student00 / {HOST_ACCOUNT}: {HOST_ROLE}', flush=True)
    failures = []
    for account in accounts:
        aid = account['account_id']
        if aid == HOST_ACCOUNT:
            continue
        try:
            iam = assume_iam(session, aid, region)
            ensure_role(iam, READ_ROLE, desired['student_trust'], desired['student_permissions'])
            print(f"READY {account['name']} / {aid}: {READ_ROLE}", flush=True)
        except Exception as exc:
            failures.append(aid)
            print(f"FAILED {account['name']} / {aid}: {error_code(exc)}: {exc}", flush=True)
    return failures


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--accounts', help='Optional JSON account list; defaults to embedded student00-student34 list')
    parser.add_argument('--profile', help='Local AWS profile used for training-admin; omit for the current credential chain')
    parser.add_argument('--execute', action='store_true', help='Apply the displayed IAM setup; otherwise print a local-only plan')
    args = parser.parse_args()
    try:
        config = load_setup_config(args.accounts)
    except (OSError, ValueError) as exc:
        parser.error(str(exc))
    if config['role_name'] != READ_ROLE:
        parser.error(f'accounts.json role_name must be {READ_ROLE}; this is distinct from the bootstrap admin role')
    desired = plan(config['accounts'])
    if not args.execute:
        print(json.dumps(desired, indent=2))
        print('\nPREVIEW ONLY: no AWS calls made. Use --execute to apply this setup.')
        return
    import boto3
    session = boto3.Session(profile_name=args.profile, region_name=config['region'])
    identity = session.client('sts').get_caller_identity()
    print(f"Setup caller: {identity['Arn']}", flush=True)
    failures = apply(config, session)
    if failures:
        print('Incomplete setup. Failed accounts: ' + ', '.join(failures))
        raise SystemExit(1)
    print(f'Done: {sum(a["account_id"] != HOST_ACCOUNT for a in config["accounts"])} cross-account student roles. Attach instance profile {HOST_ROLE} to the scoring EC2 instance in student00.')
    print('Allow IAM propagation before starting the scorer. No EC2 instances or access keys were created.')

if __name__ == '__main__':
    main()
