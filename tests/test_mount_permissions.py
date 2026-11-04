import json
import os
import unittest

class TestMountPermissions(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'archive_mount_permissions.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_perms(self):
        self.assertEqual(self.data['PERM_READ'], 0x01)
        self.assertEqual(self.data['PERM_WRITE'], 0x02)
        self.assertEqual(self.data['PERM_EXEC'], 0x04)

if __name__ == '__main__':
    unittest.main()
