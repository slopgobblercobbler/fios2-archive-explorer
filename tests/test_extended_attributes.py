import json
import os
import unittest

class TestExtendedAttributes(unittest.TestCase):
    def setUp(self):
        p = os.path.join(os.path.dirname(__file__), '..', 'src', 'fios2_file_attribute_extended_matrix.json')
        with open(p, 'r') as f:
            self.data = json.load(f)

    def test_attributes(self):
        self.assertEqual(self.data['FIOS2_ATTR_COMPRESSED'], "0x0100")
        self.assertEqual(self.data['FIOS2_ATTR_ENCRYPTED'], "0x0200")

if __name__ == '__main__':
    unittest.main()
