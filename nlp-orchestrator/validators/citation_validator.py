import json
import re
from pathlib import Path
from typing import Any
from functools import lru_cache


from legal_utils.citation_extractor import extract_legal_citations

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "legal_sections.json"


@lru_cache(maxsize=1)
def _load_legal_sections() -> dict[str, Any]:
    with open(DATA_PATH, "r", encoding="utf-8") as handle:
        return json.load(handle)


def _parse_numeric_section(section: str) -> tuple[int, str] | None:
    match = re.match(
        r"^(?P<number>\d{1,4})(?P<suffix>[A-Za-z]{1,2})?$", section.strip()
    )

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
            "message": "Malformed citation: missing act or section",
        }

    metadata = _load_legal_sections().get("acts", {})

    if act not in metadata:
        return {
            "citation": raw_citation,
            "act": act,
            "section": section,
            "valid": False,
            "message": "Unsupported or unrecognized legal act",
        }

    parsed = _parse_numeric_section(section)

    if parsed is None:
        return {
            "citation": raw_citation,
            "act": act,
            "section": section,
            "valid": False,
            "message": "Malformed citation: invalid section format",
        }

    number, _ = parsed

    min_section, max_section = metadata[act]["section_range"]

    is_valid = min_section <= number <= max_section

    return {
        "citation": raw_citation,
        "act": act,
        "section": section,
        "valid": is_valid,
        "message": (
            "Valid legal citation"
            if is_valid
            else "Invalid or unverifiable legal citation"
        ),
    }


def validate_citations_from_text(text: str) -> list[dict[str, Any]]:
    citations = extract_legal_citations(text)

    return [
        validate_citation(citation["act"], citation["section"], citation["raw"])
        for citation in citations
    ]
