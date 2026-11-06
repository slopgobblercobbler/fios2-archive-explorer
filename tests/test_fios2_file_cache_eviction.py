import json
import os
import unittest

class TestFios2CacheEviction(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'fios2_file_cache_eviction_policy.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_eviction_policy(self):
        self.assertEqual(self.data['policy'], 'LRU_APPROXIMATE')
        self.assertEqual(self.data['high_watermark_ratio'], 0.90)

if __name__ == '__main__':
    unittest.main()
