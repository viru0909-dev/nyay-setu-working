import hashlib
import re
from typing import Any

TIME_PATTERN = re.compile(
    r"\b(?P<hour>1[0-2]|0?[1-9])"
    r"(?::(?P<minute>[0-5][0-9]))?"
    r"\s*(?P<period>a\.?m\.?|p\.?m\.?|AM|PM|am|pm)\b"
)

DATE_PATTERN = re.compile(
    r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b",
    re.IGNORECASE,
)

LOCATION_PATTERN = re.compile(
    r"\b(?:at|near|inside|outside|in front of|around|beside)"
    r"\s+([A-Z][A-Za-z0-9\s,.-]{2,80})",
    re.IGNORECASE,
)


def split_sentences(text: str) -> list[str]:
    cleaned = re.sub(r"\s+", " ", text or "").strip()
    if not cleaned:
        return []
    return [
        item.strip() for item in re.split(r"(?<=[.!?])\s+", cleaned) if item.strip()
    ]


def normalize_time(match: re.Match) -> str:
    hour = int(match.group("hour"))
    minute = int(match.group("minute") or 0)
    period = match.group("period").lower().replace(".", "")

    if period == "pm" and hour != 12:
        hour += 12
    if period == "am" and hour == 12:
        hour = 0

    return f"{hour:02d}:{minute:02d}"


def normalize_location(value: str) -> str:
    value = re.sub(r"\s+", " ", value.strip())
    value = re.sub(
        r"\b(on|at|when|where|while|and|but)\b.*$", "", value, flags=re.IGNORECASE
    )
    return value.strip(" ,.-").lower()


def make_id(*parts: str) -> str:
    return hashlib.sha256("|".join(parts).encode("utf-8")).hexdigest()[:16]


def extract_claims(document: dict[str, Any]) -> list[dict[str, Any]]:
    document_id = str(document.get("id") or "unknown")
    document_name = str(document.get("name") or document_id)
    document_type = str(document.get("type") or "document")
    text = str(document.get("text") or "")

    claims: list[dict[str, Any]] = []

    for sentence in split_sentences(text):
        for match in TIME_PATTERN.finditer(sentence):
            claims.append(
                {
                    "field": "time",
                    "value": match.group(0),
                    "normalized_value": normalize_time(match),
                    "sentence": sentence,
                    "document_id": document_id,
                    "document_name": document_name,
                    "document_type": document_type,
                }
            )

        for match in DATE_PATTERN.finditer(sentence):
            value = match.group(1)
            claims.append(
                {
                    "field": "date",
                    "value": value,
                    "normalized_value": value.lower(),
                    "sentence": sentence,
                    "document_id": document_id,
                    "document_name": document_name,
                    "document_type": document_type,
                }
            )

        for match in LOCATION_PATTERN.finditer(sentence):
            value = match.group(1)
            normalized = normalize_location(value)
            if normalized:
                claims.append(
                    {
                        "field": "location",
                        "value": value.strip(),
                        "normalized_value": normalized,
                        "sentence": sentence,
                        "document_id": document_id,
                        "document_name": document_name,
                        "document_type": document_type,
                    }
                )

    return claims


def build_contradiction(
    claim_a: dict[str, Any], claim_b: dict[str, Any]
) -> dict[str, Any]:
    field = claim_a["field"]

    severity = "High" if field in {"time", "date"} else "Medium"
    confidence = 0.92 if field == "time" else 0.88 if field == "date" else 0.76

    contradiction_id = make_id(
        field,
        claim_a["document_id"],
        claim_a["normalized_value"],
        claim_b["document_id"],
        claim_b["normalized_value"],
    )

    return {
        "id": contradiction_id,
        "field": field,
        "severity": severity,
        "confidence_score": confidence,
        "status": "pending",
        "statement_a": claim_a["sentence"],
        "statement_b": claim_b["sentence"],
        "source_document_a": {
            "id": claim_a["document_id"],
            "name": claim_a["document_name"],
            "type": claim_a["document_type"],
            "value": claim_a["value"],
        },
        "source_document_b": {
            "id": claim_b["document_id"],
            "name": claim_b["document_name"],
            "type": claim_b["document_type"],
            "value": claim_b["value"],
        },
        "explanation": (
            f"Potential {field} contradiction detected: "
            f"{claim_a['document_name']} states '{claim_a['value']}', while "
            f"{claim_b['document_name']} states '{claim_b['value']}'."
        ),
    }


def detect_contradictions(
    documents: list[dict[str, Any]], case_id: str | None = None
) -> dict[str, Any]:
    claims: list[dict[str, Any]] = []

    for document in documents:
        claims.extend(extract_claims(document))

    contradictions: list[dict[str, Any]] = []
    seen: set[str] = set()

    for index, claim_a in enumerate(claims):
        for claim_b in claims[index + 1 :]:
            if claim_a["document_id"] == claim_b["document_id"]:
                continue

            if claim_a["field"] != claim_b["field"]:
                continue

            if claim_a["normalized_value"] == claim_b["normalized_value"]:
                continue

            contradiction = build_contradiction(claim_a, claim_b)

            if contradiction["id"] not in seen:
                contradictions.append(contradiction)
                seen.add(contradiction["id"])

    severity_counts = {
        "High": sum(1 for item in contradictions if item["severity"] == "High"),
        "Medium": sum(1 for item in contradictions if item["severity"] == "Medium"),
        "Low": sum(1 for item in contradictions if item["severity"] == "Low"),
    }

    report_id = make_id(
        case_id or "adhoc", str(len(documents)), str(len(contradictions))
    )

    return {
        "report_id": report_id,
        "case_id": case_id,
        "document_count": len(documents),
        "summary": {
            "total_contradictions": len(contradictions),
            "severity_counts": severity_counts,
        },
        "contradictions": contradictions,
    }
