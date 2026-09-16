import json
import unittest
import subprocess
import sys
from pathlib import Path
import tempfile
from unittest.mock import MagicMock
from setup_iam import plan,ensure_role,ensure_profile,HOST_ACCOUNT,HOST_ROLE,OWNER

class Missing(Exception):
    response={'Error':{'Code':'NoSuchEntity'}}

class SetupTests(unittest.TestCase):
    def test_standalone_preview_without_sibling_modules(self):
        source=Path(__file__).resolve().parents[1]/'setup_iam.py'
        with tempfile.TemporaryDirectory() as folder:
            script=Path(folder)/'ums_iam.py'
            script.write_text(source.read_text())
            result=subprocess.run([sys.executable,'-I',str(script)],cwd=folder,capture_output=True,text=True,check=True)
        desired=json.loads(result.stdout.split('\nPREVIEW ONLY:')[0])
        self.assertEqual(len(desired['students']),35)
        self.assertEqual(desired['students'][14]['account_id'],'036245824663')
        self.assertEqual(desired['host_account'],'594379811663')

    def test_minimal_policies(self):
        p=plan([{'account_id':'036245824663','name':'student14'}])
        self.assertEqual(p['host_permissions']['Statement'][0]['Resource'],['arn:aws:iam::036245824663:role/UMSScoringReadOnly'])
        self.assertEqual(p['student_permissions']['Statement'][0]['Action'],['ec2:DescribeAddresses','ec2:DescribeInstances'])
        self.assertEqual(p['student_trust']['Statement'][0]['Principal'],{'AWS':f'arn:aws:iam::{HOST_ACCOUNT}:role/{HOST_ROLE}'})
    def test_host_uses_direct_read_only_access(self):
        p=plan([{'account_id':HOST_ACCOUNT}])
        self.assertEqual(p['host_permissions']['Statement'],[{'Effect':'Allow','Action':['ec2:DescribeAddresses','ec2:DescribeInstances'],'Resource':'*'}])
    def test_refuses_unowned_role(self):
        iam=MagicMock();iam.get_role.return_value={'Role':{'Tags':[]}}
        with self.assertRaises(RuntimeError):ensure_role(iam,'role',{}, {})
        iam.update_assume_role_policy.assert_not_called()
        iam.put_role_policy.assert_not_called()
    def test_create_then_update_owned_role(self):
        iam=MagicMock();iam.get_role.side_effect=Missing()
        ensure_role(iam,'role',{'trust':1},{'permission':1})
        self.assertEqual(iam.create_role.call_args.kwargs['Tags'],[OWNER])
        iam.get_role.side_effect=None;iam.get_role.return_value={'Role':{'Tags':[OWNER]}}
        ensure_role(iam,'role',{'trust':2},{'permission':2})
        self.assertEqual(json.loads(iam.update_assume_role_policy.call_args.kwargs['PolicyDocument']),{'trust':2})
        self.assertEqual(iam.create_role.call_count,1)
    def test_profile_does_not_replace_other_role(self):
        iam=MagicMock();iam.get_instance_profile.return_value={'InstanceProfile':{'Tags':[OWNER],'Roles':[{'RoleName':'Other'}]}}
        with self.assertRaises(RuntimeError):ensure_profile(iam)
        iam.add_role_to_instance_profile.assert_not_called()
    def test_profile_idempotent(self):
        iam=MagicMock();iam.get_instance_profile.return_value={'InstanceProfile':{'Tags':[OWNER],'Roles':[{'RoleName':HOST_ROLE}]}}
        ensure_profile(iam)
        iam.add_role_to_instance_profile.assert_not_called()
if __name__=='__main__':unittest.main()
