import json
import os
import unittest

class TestDirectoryEntryLayout(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'directory_entry_layout.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_offsets(self):
        self.assertEqual(self.data['inode_id_offset'], 0)
        self.assertEqual(self.data['file_size_offset'], 8)
        self.assertEqual(self.data['flags_offset'], 28)

if __name__ == '__main__':
    unittest.main()
