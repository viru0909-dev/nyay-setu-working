import json
import re
from pathlib import Path
from typing import Any

from utils.citation_extractor import extract_legal_citations

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "legal_sections.json"


def _load_legal_sections() -> dict[str, Any]:
    with open(DATA_PATH, "r", encoding="utf-8") as handle:
        return json.load(handle)


def _parse_numeric_section(section: str) -> tuple[int, str] | None:
    match = re.match(r"^(?P<number>\d{1,4})(?P<suffix>[A-Za-z]{1,2})?$", section.strip())
    if not match:
        return None

    number = int(match.group("number"))
    suffix = match.group("suffix") or ""
    return number, suffix


def validate_citation(act: str, section: str, raw: str | None = None) -> dict[str, Any]:
    raw_citation = raw or f"{act} Section {section}"
    act = act.strip()
    section = section.strip()

    if not act or not section:
        return {
            "citation": raw_citation,
            "act": act,
            "section": section,
            "valid": False,
            "message": "Malformed citation: missing act or section"
        }

    metadata = _load_legal_sections().get("acts", {})
    canonical_act = act
    if canonical_act not in metadata:
        return {
            "citation": raw_citation,
            "act": act,
            "section": section,
            "valid": False,
            "message": "Unsupported or unrecognized legal act"
        }

    parsed = _parse_numeric_section(section)
    if parsed is None:
        return {
            "citation": raw_citation,
            "act": canonical_act,
            "section": section,
            "valid": False,
            "message": "Malformed citation: invalid section format"
        }

    number, suffix = parsed
    range_min, range_max = metadata[canonical_act]["section_range"]
    if number < range_min or number > range_max:
        return {
            "citation": raw_citation,
            "act": canonical_act,
            "section": section,
            "valid": False,
            "message": "Invalid legal section: section number out of range"
        }

    return {
        "citation": raw_citation,
        "act": canonical_act,
        "section": section,
        "valid": True,
        "message": "Verified legal citation"
    }


def validate_citations_from_text(text: str) -> list[dict[str, Any]]:
    citations = extract_legal_citations(text)
    if not citations:
        return []

    return [
        validate_citation(citation["act"], citation["section"], raw=citation["raw"])
        for citation in citations
    ]
