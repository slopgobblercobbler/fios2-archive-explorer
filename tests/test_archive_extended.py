import json
import os
import unittest

class TestArchiveExtended(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'archive_magic_extended.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_magics(self):
        self.assertEqual(self.data['SDAT'], [0x53, 0x44, 0x41, 0x54])
        self.assertEqual(self.data['EDAT'], [0x45, 0x44, 0x41, 0x54])

if __name__ == '__main__':
    unittest.main()
