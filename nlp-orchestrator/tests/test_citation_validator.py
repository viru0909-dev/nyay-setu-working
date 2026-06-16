import json
from pathlib import Path

from validators.citation_validator import validate_citation


def test_bns_bnss_section_ranges():
    data_path = Path(__file__).resolve().parent.parent / "data" / "legal_sections.json"

    with open(data_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data["acts"]["BNS"]["section_range"] == [1, 358]
    assert data["acts"]["BNSS"]["section_range"] == [1, 531]


def test_valid_bns_sections():
    assert validate_citation("BNS", "302")["valid"]
    assert validate_citation("BNS", "350")["valid"]


def test_valid_bnss_sections():
    assert validate_citation("BNSS", "482")["valid"]
    assert validate_citation("BNSS", "531")["valid"]


def test_invalid_sections():
    assert not validate_citation("BNS", "999")["valid"]
    assert not validate_citation("BNSS", "999")["valid"]
