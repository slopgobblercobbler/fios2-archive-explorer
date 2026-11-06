import json
import os
import unittest

class TestCreationFlags(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'fios2_file_mode_creation_flags.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_creation_flags(self):
        self.assertEqual(self.data['FIOS2_O_CREAT'], "0x0200")
        self.assertEqual(self.data['FIOS2_O_EXCL'], "0x0800")

if __name__ == '__main__':
    unittest.main()
