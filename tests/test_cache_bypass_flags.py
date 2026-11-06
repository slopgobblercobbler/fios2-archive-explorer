import json
import os
import unittest

class TestCacheBypassFlags(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'fios2_cache_bypass_flags.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_bypass_flags(self):
        self.assertEqual(self.data['FIOS2_FLAG_BYPASS_CACHE'], "0x0010")
        self.assertTrue(self.data['FIOS2_FLAG_DIRECT_ACCESS'].startswith("0x"))

if __name__ == '__main__':
    unittest.main()
