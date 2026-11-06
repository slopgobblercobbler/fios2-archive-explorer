import json
import os
import unittest

class TestCacheEviction(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'fios2_cache_eviction_strategy.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_eviction(self):
        self.assertEqual(self.data['EVICTION_LRU'], 1)
        self.assertEqual(self.data['default_cache_capacity_mb'], 64)

if __name__ == '__main__':
    unittest.main()
