import json
import os
import unittest

class TestFlushModes(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'fios2_sync_flush_modes.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_flush_modes(self):
        self.assertEqual(self.data['FIOS2_FLUSH_METADATA'], 1)
        self.assertEqual(self.data['FIOS2_FLUSH_ALL'], 3)

if __name__ == '__main__':
    unittest.main()
