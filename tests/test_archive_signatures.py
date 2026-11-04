import json
import os
import unittest

class TestArchiveSignatures(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'archive_magic_signatures.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_signatures(self):
        self.assertEqual(self.data['F2AR'], [0x46, 0x32, 0x41, 0x52])
        self.assertEqual(self.data['PFS0'], [0x50, 0x46, 0x53, 0x30])

if __name__ == '__main__':
    unittest.main()
