import json
import os
import unittest

class TestFios2PathNorm(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'fios2_vfs_path_case_normalization.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_norm(self):
        self.assertEqual(self.data['case_folding_rule'], 'ASCII_TO_LOWERCASE')
        self.assertTrue(self.data['strip_trailing_slashes'])

if __name__ == '__main__':
    unittest.main()
