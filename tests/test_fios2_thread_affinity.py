import json
import os
import unittest

class TestFios2ThreadAffinity(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'fios2_thread_affinity_profiles.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_affinity(self):
        self.assertEqual(self.data['affinity_io_worker'], '0x0002')
        self.assertEqual(self.data['worker_priority'], 250)

if __name__ == '__main__':
    unittest.main()
