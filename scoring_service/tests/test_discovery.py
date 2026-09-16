import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch, MagicMock
import types
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from aws_discovery import load_accounts,select_address,AWSDiscovery
from server import Student,Dashboard

class DiscoveryTests(unittest.TestCase):
    def test_only_associated_eip(self):
        self.assertEqual(select_address([{'PublicIp':'203.0.113.1'}])[0],'')
        self.assertEqual(select_address([{'PublicIp':'203.0.113.1','AssociationId':'a','NetworkInterfaceId':'eni'}])[0],'http://203.0.113.1')
    def test_ambiguous(self):
        address=dict(PublicIp='203.0.113.1',AssociationId='a',NetworkInterfaceId='eni')
        url,error=select_address([address,address]);self.assertEqual(url,'');self.assertIn('Ambiguous',error)
    def test_accounts_validation(self):
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/'a.json'
            path.write_text(json.dumps(dict(role_name='LabRole',accounts=[dict(account_id='123456789012')])) )
            c=load_accounts(path);self.assertEqual(c['region'],'eu-central-1');self.assertEqual(c['accounts'][0]['url'],'')
            path.write_text(json.dumps(dict(role_name='REPLACE_ME',accounts=[])))
            with self.assertRaises(ValueError):load_accounts(path)
    def test_pending_discovered_and_replaced(self):
        student=Student(dict(id='s',name='s',account_id='123456789012',url=''))
        discovery=AWSDiscovery({},session_factory=lambda **kw:None)
        with patch.object(discovery,'resolve',return_value=('', 'Pending')):
            discovery.refresh(student)
        self.assertFalse(student.view['reachable'])
        student.aws_checked_at=0
        with patch.object(discovery,'resolve',return_value=('http://203.0.113.1','Found')):
            discovery.refresh(student)
        student.history['three_healthy']=100
        student.aws_checked_at=0
        with patch.object(discovery,'resolve',side_effect=RuntimeError()):
            discovery.refresh(student)
        self.assertEqual(student.history['three_healthy'],100)
        self.assertEqual(student.view['url'],'')
        student.aws_checked_at=0
        with patch.object(discovery,'resolve',return_value=('http://203.0.113.2','Found')):
            discovery.refresh(student)
        self.assertIsNone(student.history['three_healthy'])
    def test_role_and_tag_filter(self):
        base,target=MagicMock(),MagicMock()
        base.client.return_value.assume_role.return_value={'Credentials':{'AccessKeyId':'key','SecretAccessKey':'secret','SessionToken':'token'}}
        target.client.return_value.describe_addresses.return_value={'Addresses':[dict(PublicIp='203.0.113.9',AssociationId='a',NetworkInterfaceId='eni')]}
        factory=MagicMock(side_effect=[base,target])
        module=types.ModuleType('botocore.config');module.Config=MagicMock()
        d=AWSDiscovery(dict(role_name='LabReadRole',region='eu-central-1'),session_factory=factory)
        with patch.dict(sys.modules,{'botocore.config':module}):
            url,status=d.resolve(dict(account_id='123456789012'))
        self.assertEqual(url,'http://203.0.113.9')
        self.assertEqual(base.client.return_value.assume_role.call_args.kwargs['RoleArn'],'arn:aws:iam::123456789012:role/LabReadRole')
        self.assertEqual(factory.call_args.kwargs['region_name'],'eu-central-1')
        self.assertEqual(target.client.return_value.describe_addresses.call_args.kwargs['Filters'],[{'Name':'tag:Name','Values':['*gwlb-demo-web']}])

    def test_student00_uses_local_instance_role(self):
        base=MagicMock()
        sts,ec2=MagicMock(),MagicMock()
        base.client.side_effect=lambda service,**kw: sts if service=='sts' else ec2
        sts.get_caller_identity.return_value={'Account':'594379811663'}
        ec2.describe_addresses.return_value={'Addresses':[dict(PublicIp='203.0.113.9',AssociationId='a',NetworkInterfaceId='eni')]}
        factory=MagicMock(return_value=base)
        module=types.ModuleType('botocore.config');module.Config=MagicMock()
        d=AWSDiscovery(dict(role_name='UMSScoringReadOnly',region='eu-central-1'),session_factory=factory)
        with patch.dict(sys.modules,{'botocore.config':module}):
            self.assertEqual(d.resolve(dict(account_id='594379811663'))[0],'http://203.0.113.9')
            sts.get_caller_identity.return_value={'Account':'111111111111'}
            with self.assertRaises(ValueError): d.resolve(dict(account_id='594379811663'))
        sts.assume_role.assert_not_called()
        self.assertEqual(ec2.describe_addresses.call_count,1)

    def test_no_http_until_discovered(self):
        dashboard=Dashboard([dict(id='s',name='s',url='')])
        with patch.object(dashboard.students[0],'poll') as poll:
            dashboard.check_student(dashboard.students[0]);poll.assert_not_called()

if __name__=='__main__':unittest.main()
