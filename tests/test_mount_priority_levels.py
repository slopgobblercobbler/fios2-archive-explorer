import json
import os
import unittest

class TestMountPriorityLevels(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'fios2_vfs_mount_priority_levels.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_priorities(self):
        self.assertEqual(self.data['FIOS2_PRIORITY_NORMAL'], 128)
        self.assertLess(self.data['FIOS2_PRIORITY_LOW'], self.data['FIOS2_PRIORITY_HIGH'])

if __name__ == '__main__':
    unittest.main()
