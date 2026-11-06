import json
import os
import unittest

class TestOverlayPriority(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'fios2_overlay_priority.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_priority_order(self):
        self.assertGreater(self.data['OVERLAY_PRIORITY_PATCH'], self.data['OVERLAY_PRIORITY_BASE'])
        self.assertEqual(self.data['OVERLAY_PRIORITY_HOST'], 100)

if __name__ == '__main__':
    unittest.main()
