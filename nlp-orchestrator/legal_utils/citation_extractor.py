import re
from typing import List

ACT_REGEX = (
    r"(?:IPC|CrPC|CPC|MVA|BNS|BNSS|Article|Art|"
    r"Indian Penal Code|Criminal Procedure Code|Civil Procedure Code|"
    r"Motor Vehicles Act)"
)
SECTION_REGEX = r"(?P<section>\d{1,4}[A-Za-z]?)"

CITATION_PATTERNS = [
    re.compile(
        rf"\b(?P<act>{ACT_REGEX})\s*(?:Section|Sec|S\.?|Article|Art)?\.?\s*"
        rf"{SECTION_REGEX}\b",
        re.IGNORECASE,
    ),
    re.compile(
        rf"\b(?:u/s|under section|section|sec|s\.?|article|art)\s*"
        rf"{SECTION_REGEX}\s*(?:of\s*)?(?P<act>{ACT_REGEX})\b",
        re.IGNORECASE,
    ),
]


def normalize_act_name(raw_act: str) -> str:
    if not raw_act:
        return ""
    normalized = raw_act.strip().lower()

    alias_map = {
        "ipc": "IPC",
        "indian penal code": "IPC",
        "penal code": "IPC",
        "crpc": "CrPC",
        "criminal procedure code": "CrPC",
        "code of criminal procedure": "CrPC",
        "cpc": "CPC",
        "civil procedure code": "CPC",
        "mva": "MVA",
        "motor vehicles act": "MVA",
        "bns": "BNS",
        "bnss": "BNSS",
        "article": "Article",
        "art": "Article",
    }
    return alias_map.get(normalized, raw_act.strip())


def normalize_citation(raw: str, act: str, section: str) -> dict:
    if not raw or not section:
        return {}

    return {
        "raw": raw.strip(),
        "act": normalize_act_name(act),
        "section": section.strip(),
    }


def extract_legal_citations(text: str) -> List[dict]:
    citations = []
    seen = set()

    if not text:
        return citations

    for pattern in CITATION_PATTERNS:
        for match in pattern.finditer(text):
            raw = match.group(0).strip()
            act = match.groupdict().get("act", "") or ""
            section = match.groupdict().get("section", "") or ""
            citation = normalize_citation(raw, act, section)
            if citation and citation["raw"].lower() not in seen:
                citations.append(citation)
                seen.add(citation["raw"].lower())

    return citations
