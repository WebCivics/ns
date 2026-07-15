import importlib.util
import unittest
from pathlib import Path


SCRIPT = Path(__file__).with_name("publish-legislation-corpus.py")
SPEC = importlib.util.spec_from_file_location("publish_legislation_corpus", SCRIPT)
assert SPEC and SPEC.loader
publisher = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(publisher)


class PublicationTests(unittest.TestCase):
    def test_compilation_ids_link_to_exact_record(self):
        self.assertEqual(
            publisher.official_register_url("F2025C00572"),
            ("F2025C00572", "https://www.legislation.gov.au/F2025C00572"),
        )
        self.assertEqual(
            publisher.official_register_url("C2026C00206VOL04"),
            ("C2026C00206", "https://www.legislation.gov.au/C2026C00206"),
        )

    def test_as_made_ids_link_to_latest_downloads(self):
        self.assertEqual(
            publisher.official_register_url("C2004A00601"),
            (
                "C2004A00601",
                "https://www.legislation.gov.au/C2004A00601/latest/downloads",
            ),
        )

    def test_graph_gets_dataset_id_and_official_provenance(self):
        source = "<https://example.test/instrument> a cof:Document ;\n    dc:title \"X\" .\n"
        augmented = publisher.augment_graph(
            source,
            "https://example.test/instrument",
            "F2025C00572",
            "https://www.legislation.gov.au/F2025C00572",
        )
        self.assertIn('dc:identifier "F2025C00572"', augmented)
        self.assertIn(
            "prov:wasDerivedFrom <https://www.legislation.gov.au/F2025C00572>",
            augmented,
        )


if __name__ == "__main__":
    unittest.main()
