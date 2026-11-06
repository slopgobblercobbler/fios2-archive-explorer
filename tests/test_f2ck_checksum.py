import json
import os
import unittest

class TestF2ckChecksum(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'f2ck_chunk_checksum_format.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_checksum(self):
        self.assertEqual(self.data['signature'], "F2CK")
        self.assertEqual(self.data['sha256_hash_length'], 32)

if __name__ == '__main__':
    unittest.main()
