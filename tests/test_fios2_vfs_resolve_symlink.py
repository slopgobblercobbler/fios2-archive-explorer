import json
import os
import unittest

class TestFios2Symlink(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'fios2_vfs_resolve_symlink_depth.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_symlink(self):
        self.assertEqual(self.data['max_symlink_traversals'], 32)
        self.assertEqual(self.data['loop_detection_errno'], 'ELOOP')

if __name__ == '__main__':
    unittest.main()
