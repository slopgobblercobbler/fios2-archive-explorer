import json
import os
import unittest

class TestDirEntryTypes(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'fios2_dir_entry_type_codes.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_types(self):
        self.assertEqual(self.data['FIOS2_TYPE_FILE'], 1)
        self.assertEqual(self.data['FIOS2_TYPE_DIRECTORY'], 2)

if __name__ == '__main__':
    unittest.main()
