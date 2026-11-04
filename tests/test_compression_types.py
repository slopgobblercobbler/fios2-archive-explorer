import json
import os
import unittest

class TestCompressionTypes(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'compression_types.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_codecs(self):
        self.assertEqual(self.data['COMPRESSION_NONE'], 0)
        self.assertEqual(self.data['COMPRESSION_ZSTD'], 1)
        self.assertEqual(self.data['COMPRESSION_DEFLATE'], 2)
        self.assertEqual(self.data['COMPRESSION_LZ4'], 3)

if __name__ == '__main__':
    unittest.main()
