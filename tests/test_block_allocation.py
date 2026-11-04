import json
import os
import unittest

class TestBlockAllocation(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'block_allocation_table.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_extent_layout(self):
        self.assertEqual(self.data['extent_start_block_offset'], 0)
        self.assertEqual(self.data['entry_size_bytes'], 16)

if __name__ == '__main__':
    unittest.main()
