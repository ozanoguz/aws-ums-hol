import importlib.util
import pathlib
import unittest

spec = importlib.util.spec_from_file_location('server', pathlib.Path(__file__).parents[1] / 'assets/server.py')
server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)

class CorrelationTests(unittest.TestCase):
    def setUp(self):
        self.now = 1800000000
        self.state = server.State('10.50.0.10', lambda: self.now)
        self.nodes = [dict(id='i-one', ips=['10.0.0.10'], health='healthy', az='az1', group='demo', lifecycle='InService')]
        self.state.inventory(self.nodes)
    def log(self, **overrides):
        fields = dict(type='traffic', subtype='forward', devid='FGT001', dstip='10.50.0.10',
            dstport='80', proto='6', srcip='203.0.113.5', srcport='43000', action='start',
            eventtime=str(self.now * 1000000000))
        fields.update(overrides)
        return ' '.join(f'{k}="{v}"' for k,v in fields.items())
    def test_new_node_does_not_fake_activity(self):
        self.state.inventory(self.nodes + [dict(self.nodes[0], id='i-three', ips=['10.0.0.30'])])
        self.assertEqual(len(self.state.snapshot()['nodes']), 2)
        self.assertEqual(self.state.nodes['i-three']['observed'], 0)
    def test_log_after_http_matches_once(self):
        self.state.probe('203.0.113.5', 43000)
        self.assertTrue(self.state.ingest(self.log(), '10.0.0.10'))
        self.state.ingest(self.log(action='close'), '10.0.0.10')
        self.assertEqual(self.state.nodes['i-one']['observed'], 1)
        self.assertEqual(self.state.probes[0]['node'], 'i-one')
    def test_log_before_http_matches(self):
        self.state.ingest(self.log(), '10.0.0.10')
        self.state.probe('203.0.113.5', 43000)
        self.assertEqual(self.state.probes[0]['node'], 'i-one')
    def test_wrong_sender_and_non_web_events_ignored(self):
        self.assertFalse(self.state.ingest(self.log(), '192.0.2.99'))
        self.assertFalse(self.state.ingest(self.log(dstip='10.50.0.11'), '10.0.0.10'))
        self.assertFalse(self.state.ingest(self.log(subtype='local'), '10.0.0.10'))
        self.assertFalse(self.state.ingest(self.log(action='deny'), '10.0.0.10'))
    def test_wrong_tuple_unattributed(self):
        self.state.probe('203.0.113.5', 43001)
        self.state.ingest(self.log(), '10.0.0.10')
        self.assertIsNone(self.state.probes[0]['node'])
    def test_old_log_rejected(self):
        self.assertFalse(self.state.ingest(self.log(eventtime=str((self.now-121)*1000000000)), '10.0.0.10'))
    def test_discovery_failure_retains_inventory_and_marks_error(self):
        self.state.failure('unavailable')
        self.assertEqual(len(self.state.snapshot()['nodes']), 1)
        self.assertEqual(self.state.snapshot()['discovery_error'], 'unavailable')
        self.now += 31
        self.assertTrue(self.state.snapshot()['stale'])
    def test_scale_in_removes_member(self):
        self.state.inventory([])
        self.assertEqual(self.state.snapshot()['nodes'], [])
    def test_non_probe_log_never_blinks(self):
        self.state.ingest(self.log(), '10.0.0.10')
        self.assertEqual(self.state.nodes['i-one']['last_activity'], 0)

if __name__ == '__main__':
    unittest.main()
