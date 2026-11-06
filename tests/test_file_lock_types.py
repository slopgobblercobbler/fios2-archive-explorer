import json
import os
import unittest

class TestFileLockTypes(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'fios2_file_lock_types.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_locks(self):
        self.assertEqual(self.data['FIOS2_LOCK_SHARED'], 1)
        self.assertEqual(self.data['FIOS2_LOCK_EXCLUSIVE'], 2)

if __name__ == '__main__':
    unittest.main()
