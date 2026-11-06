import json
import os
import unittest

class TestFios2OpenFlags(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'fios2_vfs_open_flags_matrix.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_flags(self):
        self.assertEqual(self.data['O_DIRECT'], '0x00010000')

if __name__ == '__main__':
    unittest.main()
