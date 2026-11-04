import json
import os
import unittest

class TestPfsSignature(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'archive_signature_pfs.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_pfs(self):
        self.assertEqual(self.data['magic'], "PFS0")
        self.assertEqual(self.data['version'], 1)

if __name__ == '__main__':
    unittest.main()
