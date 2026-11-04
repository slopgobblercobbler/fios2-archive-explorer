import json
import os
import unittest

class TestSdatSignature(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'archive_signature_sdat.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_sdat(self):
        self.assertEqual(self.data['magic'], "SDAT")
        self.assertEqual(self.data['iv_length'], 16)

if __name__ == '__main__':
    unittest.main()
