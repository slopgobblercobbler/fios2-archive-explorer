import json
import os
import unittest

class TestTrpSignature(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'archive_signature_trp.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_trp_magic(self):
        self.assertEqual(self.data['magic'], [0xDC, 0xA2, 0x4D, 0x00])

if __name__ == '__main__':
    unittest.main()
