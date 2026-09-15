import json
import tempfile
import unittest
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from server import Student,validate_url,load_config

def state(now=100,count=3,probes=None,stale=False):
    return dict(now=now,discovery_at=now,stale=stale,discovery_error='',nodes=[dict(id=f'n{i}',health='healthy',lifecycle='InService') for i in range(count)],probes=probes or [])

class ScoringTests(unittest.TestCase):
    def setUp(self):
        self.now=100
        self.s=Student(dict(id='s1',name='Student',account_id='',url='http://example.test'),clock=lambda:self.now)
    def test_unrelated_probes_never_count(self):
        self.s.accept(state(probes=[dict(id='other',node='n0')]),100)
        self.assertEqual(self.s.view['healthy'],3)
        self.assertEqual(self.s.view['verified'],0)
    def test_async_match_counts_once(self):
        self.s.pending={f'p{i}':100 for i in range(3)}
        self.s.accept(state(),100)
        self.assertEqual(self.s.view['verified'],0)
        data=state(probes=[dict(id=f'p{i}',node=f'n{i}') for i in range(3)])
        self.s.accept(data,101);self.s.accept(data,102)
        self.assertEqual(self.s.view['verified'],3)
        self.assertEqual(self.s.events,dict(n0=1,n1=1,n2=1))
        self.assertEqual(self.s.history['three_inspected'],101)
    def test_stale_cannot_award_progress(self):
        self.s.pending={'p':100}
        self.s.accept(state(probes=[dict(id='p',node='n0')],stale=True),100)
        self.assertEqual(self.s.view['healthy'],0)
        self.assertEqual(self.s.view['verified'],0)
        self.assertIsNone(self.s.history['three_healthy'])
    def test_expired_and_unknown_ignored(self):
        self.s.pending={'old':-21,'unknown':100}
        self.s.accept(state(probes=[dict(id='old',node='n0'),dict(id='unknown',node='x')]),100)
        self.assertEqual(self.s.events,{})
    def test_scalein_retains_history_not_current_success(self):
        self.s.pending={f'p{i}':100 for i in range(3)}
        self.s.accept(state(probes=[dict(id=f'p{i}',node=f'n{i}') for i in range(3)]),100)
        self.s.accept(state(count=2),105)
        self.assertEqual(self.s.view['healthy'],2)
        self.assertEqual(self.s.view['verified'],2)
        self.assertEqual(self.s.history['three_inspected'],100)
    def test_verified_expires(self):
        self.s.pending={'p':100}
        self.s.accept(state(probes=[dict(id='p',node='n0')]),100)
        self.s.accept(state(now=221),221)
        self.assertEqual(self.s.view['verified'],0)
    def test_unreachable_clears_live_counts(self):
        self.s.accept(state(),100)
        def fail(*args):raise TimeoutError()
        self.s.poll(fail)
        self.assertFalse(self.s.view['reachable']);self.assertFalse(self.s.view['fresh'])
        self.assertEqual(self.s.view['healthy'],0);self.assertEqual(len(self.s.view['nodes']),3)
    def test_poll_tracks_own_probes(self):
        ids=iter(['a','b','c'])
        def get(url,path):
            if path=='/healthz':return True
            if path=='/probe':return dict(id=next(ids),status='served')
            return state(probes=[dict(id='a',node='n0'),dict(id='b',node='n1')])
        self.s.poll(get)
        self.assertEqual(self.s.view['verified'],2);self.assertEqual(set(self.s.pending),{'c'})
    def test_malformed_inventory(self):
        self.s.poll(lambda url,path:True if path=='/healthz' else {})
        self.assertTrue(self.s.view['reachable']);self.assertFalse(self.s.view['fresh'])
    def test_delayed_snapshot_stale(self):
        self.s.accept(state(),100);self.s.view['checked_at']=100;self.now=131
        self.assertFalse(self.s.snapshot()['fresh']);self.assertEqual(self.s.snapshot()['healthy'],0)
    def test_old_cached_response_is_stale(self):
        self.s.accept(state(now=50),100)
        self.assertFalse(self.s.view['fresh'])
        self.assertEqual(self.s.view['healthy'],0)
    def test_config_validation(self):
        for url in ['file:///tmp/a','http://u:p@example.com','http://example.com/a','http://example.com?x=1']:
            with self.assertRaises(ValueError):validate_url(url)
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/'students.json';p.write_text(json.dumps({'students':[{'id':'a','url':'http://example.com'}]*2}))
            with self.assertRaises(ValueError):load_config(p)
if __name__=='__main__':unittest.main()
