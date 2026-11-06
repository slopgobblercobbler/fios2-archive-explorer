import json
import os
import unittest

class TestFios2Statfs(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'fios2_vfs_statfs_geometry.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_statfs(self):
        self.assertEqual(self.data['f_bsize'], 4096)
        self.assertEqual(self.data['f_type'], 'PFS')

if __name__ == '__main__':
    unittest.main()
