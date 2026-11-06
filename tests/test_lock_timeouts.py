import json
import os
import unittest

class TestLockTimeouts(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'fios2_file_lock_timeout_constants.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_timeouts(self):
        self.assertEqual(self.data['FIOS2_TIMEOUT_INFINITE'], -1)
        self.assertEqual(self.data['FIOS2_DEFAULT_LOCK_TIMEOUT_MS'], 5000)

if __name__ == '__main__':
    unittest.main()
