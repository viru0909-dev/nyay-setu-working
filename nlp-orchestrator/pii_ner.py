"""
Named Entity Recognition (NER) for Legal Document Anonymization.

Provides two public API endpoints:
  POST /internal/pii/entities  — detect sensitive entities (existing)
  POST /internal/pii/anonymize — detect + redact entities in document text

Sensitive entity types detected:
  PERSON       — Names of individuals (victims, minors, witnesses, parties)
  ORGANIZATION — Court bodies, law firms, companies
  ADDRESS      — Locations, postal addresses, geographic names
  PHONE        — Phone/fax numbers (regex-based, model-independent)
  EMAIL        — Email addresses (regex-based, model-independent)
"""

from __future__ import annotations

import logging
import os
import re
from functools import lru_cache
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field

logger = logging.getLogger("nlp-orchestrator.pii-ner")
router = APIRouter(prefix="/internal/pii", tags=["internal-pii"])

# ── Regex patterns for model-independent entity detection ─────────────────────
_PHONE_RE = re.compile(
    r"""(?<!\d)                         # no leading digit
        (?:\+91[\s\-]?)?                # optional country code
        (?:\(0\d{1,4}\)[\s\-]?)?       # optional STD code in parens
        [6-9]\d{9}                      # 10-digit mobile
        |(?:\d{2,4}[\s\-]\d{3,4}[\s\-]\d{4})  # landline with separators
    """,
    re.VERBOSE,
)
_EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")

# ── Placeholder mapping by entity type ───────────────────────────────────────
_PLACEHOLDER: dict[str, str] = {
    "PERSON": "[REDACTED_NAME]",
    "ORGANIZATION": "[REDACTED_ORG]",
    "ADDRESS": "[REDACTED_ADDRESS]",
    "PHONE": "[REDACTED_PHONE]",
    "EMAIL": "[REDACTED_EMAIL]",
}


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class NerRequest(BaseModel):
    """Text submitted by the backend before an external LLM request."""

    text: str = Field(max_length=50_000)
    minor_protection: bool = False


class DetectedEntity(BaseModel):
    """An exact sensitive span and its normalized entity type."""

    value: str
    type: Literal["PERSON", "ORGANIZATION", "ADDRESS", "PHONE", "EMAIL"]
    start: int = 0
    end: int = 0


class NerResponse(BaseModel):
    """Sensitive entities detected entirely inside the local deployment."""

    entities: list[DetectedEntity]


class RedactedSpan(BaseModel):
    """A single redacted entity with its original value and replacement."""

    original: str
    replacement: str
    entity_type: str
    start: int
    end: int


class AnonymizeRequest(BaseModel):
    """Request body for the anonymization endpoint."""

    text: str = Field(max_length=200_000, description="Legal document text to anonymize.")
    minor_protection: bool = Field(
        default=False,
        description="Lower detection threshold to maximally protect minor identities.",
    )
    entity_types: list[str] | None = Field(
        default=None,
        description="Optional whitelist of entity types to redact. Defaults to all.",
    )


class AnonymizeResponse(BaseModel):
    """Response containing anonymized text and audit trail of redactions."""

    anonymized_text: str
    redacted_spans: list[RedactedSpan]
    entity_count: int


# ── Model loader ──────────────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _get_ner_pipeline():
    """Load the configured model once; inference never calls a hosted API."""
    from transformers import pipeline

    model_name = os.getenv("PII_NER_MODEL", "ai4bharat/IndicNER")
    logger.info("Loading local PII NER model: %s", model_name)
    return pipeline(
        "token-classification",
        model=model_name,
        tokenizer=model_name,
        aggregation_strategy="simple",
    )


# ── Core detection helpers ────────────────────────────────────────────────────

def _detect_regex_entities(text: str) -> list[DetectedEntity]:
    """Detect phone and email entities via regex (no model required)."""
    entities: list[DetectedEntity] = []
    for m in _PHONE_RE.finditer(text):
        val = m.group().strip()
        if val:
            entities.append(DetectedEntity(value=val, type="PHONE", start=m.start(), end=m.end()))
    for m in _EMAIL_RE.finditer(text):
        entities.append(DetectedEntity(value=m.group(), type="EMAIL", start=m.start(), end=m.end()))
    return entities


def detect_sensitive_entities(
    text: str, minor_protection: bool = False
) -> list[DetectedEntity]:
    """Detect person, organization, location, phone, and email spans."""
    if not text.strip():
        return []

    threshold = 0.35 if minor_protection else 0.55
    detected: list[DetectedEntity] = []
    seen: set[tuple[str, str]] = set()
    label_mapping = {
        "PER": "PERSON",
        "PERSON": "PERSON",
        "ORG": "ORGANIZATION",
        "ORGANIZATION": "ORGANIZATION",
        "LOC": "ADDRESS",
        "LOCATION": "ADDRESS",
        "GPE": "ADDRESS",
    }

    try:
        for entity in _get_ner_pipeline()(text):
            score = float(entity.get("score", 0.0))
            raw_label = str(entity.get("entity_group", entity.get("entity", "")))
            normalized_label = raw_label.upper().removeprefix("B-").removeprefix("I-")
            entity_type = label_mapping.get(normalized_label)
            start = entity.get("start")
            end = entity.get("end")
            if entity_type is None or score < threshold or start is None or end is None:
                continue

            value = text[int(start):int(end)].strip()
            key = (value.casefold(), entity_type)
            if value and key not in seen:
                seen.add(key)
                detected.append(DetectedEntity(value=value, type=entity_type, start=int(start), end=int(end)))
    except Exception as e:
        logger.warning("NER model inference failed, falling back to regex-only: %s", e)

    # Regex-based phone/email detection (always runs)
    for ent in _detect_regex_entities(text):
        key = (ent.value.casefold(), ent.type)
        if key not in seen:
            seen.add(key)
            detected.append(ent)

    return detected


def anonymize_document(
    text: str,
    minor_protection: bool = False,
    entity_types: list[str] | None = None,
) -> AnonymizeResponse:
    """
    Replace sensitive entities in *text* with typed placeholders.

    The replacement is performed right-to-left by character offset so that
    earlier offsets remain valid after each substitution.

    Args:
        text:             Raw legal document text.
        minor_protection: If True, lower detection threshold for names.
        entity_types:     Optional whitelist of entity types to redact.

    Returns:
        AnonymizeResponse with anonymized text and full audit trail.
    """
    entities = detect_sensitive_entities(text, minor_protection)

    # Filter by requested types
    active_types = {t.upper() for t in entity_types} if entity_types else set(_PLACEHOLDER)
    entities = [e for e in entities if e.type in active_types]

    # Sort by (start, -end) so overlapping spans are handled deterministically
    entities.sort(key=lambda e: (e.start, -e.end))

    # Deduplicate overlapping spans (keep first / longest)
    deduped: list[DetectedEntity] = []
    cursor = 0
    for ent in entities:
        if ent.start >= cursor:
            deduped.append(ent)
            cursor = ent.end

    # Build redacted spans (right-to-left replacement)
    result = text
    redacted_spans: list[RedactedSpan] = []

    for ent in reversed(deduped):
        placeholder = _PLACEHOLDER.get(ent.type, "[REDACTED]")
        original_slice = result[ent.start:ent.end]
        if not original_slice.strip():
            continue
        result = result[: ent.start] + placeholder + result[ent.end :]
        redacted_spans.append(
            RedactedSpan(
                original=original_slice,
                replacement=placeholder,
                entity_type=ent.type,
                start=ent.start,
                end=ent.start + len(placeholder),
            )
        )

    # Return spans in document order
    redacted_spans.sort(key=lambda s: s.start)

    return AnonymizeResponse(
        anonymized_text=result,
        redacted_spans=redacted_spans,
        entity_count=len(redacted_spans),
    )


# ── API endpoints ─────────────────────────────────────────────────────────────

@router.post("/entities", response_model=NerResponse)
def find_pii_entities(request: NerRequest) -> NerResponse:
    """Return sensitive spans without persisting or forwarding the supplied text."""
    return NerResponse(
        entities=detect_sensitive_entities(request.text, request.minor_protection)
    )


@router.post("/anonymize", response_model=AnonymizeResponse)
def anonymize_legal_document(request: AnonymizeRequest) -> AnonymizeResponse:
    """
    Detect and redact all sensitive entities in a legal document.

    Replaces personal names, organizations, addresses, phone numbers,
    and email addresses with typed placeholders (e.g. [REDACTED_NAME]).
    Returns the anonymized text together with a full redaction audit trail
    so authorized users can review and approve individual redactions.
    """
    logger.info(
        "📄 Anonymizing document — length: %d chars, minor_protection: %s",
        len(request.text),
        request.minor_protection,
    )
    return anonymize_document(
        text=request.text,
        minor_protection=request.minor_protection,
        entity_types=request.entity_types,
    )

