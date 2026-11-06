import json
import os
import unittest

class TestPfs0Geometry(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'pfs0_header_geometry.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_pfs0(self):
        self.assertEqual(self.data['signature'], "PFS0")
        self.assertEqual(self.data['file_entry_size'], 24)

if __name__ == '__main__':
    unittest.main()
