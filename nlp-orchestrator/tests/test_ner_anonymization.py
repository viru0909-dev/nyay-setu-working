"""
Unit tests for pii_ner.py — NER anonymization pipeline.

Tests cover:
  1. _detect_regex_entities — phone and email detection
  2. anonymize_document     — placeholder substitution, audit trail, filtering
  3. POST /internal/pii/anonymize — HTTP endpoint via TestClient
  4. POST /internal/pii/entities  — HTTP endpoint (existing) still works
"""

from __future__ import annotations

from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

# Import the functions/app we want to test
from pii_ner import (
    _detect_regex_entities,
    _PLACEHOLDER,
    anonymize_document,
    AnonymizeRequest,
    detect_sensitive_entities,
    router,
)
from fastapi import FastAPI

# Build a minimal test app that only includes the pii_ner router
test_app = FastAPI()
test_app.include_router(router)
client = TestClient(test_app)


# ── Regex entity detection ────────────────────────────────────────────────────

@pytest.mark.parametrize("text,expected_type,fragment", [
    ("Call us at 9876543210.", "PHONE", "9876543210"),
    ("Mobile: +91 9123456789", "PHONE", "+91 9123456789"),
    ("Email witness at rahul.sharma@nyaysetu.in for details.", "EMAIL", "rahul.sharma@nyaysetu.in"),
    ("Fax: 022-4567-8901 for records.", "PHONE", "022-4567-8901"),
])
def test_detect_regex_entities(text: str, expected_type: str, fragment: str) -> None:
    entities = _detect_regex_entities(text)
    types = {e.type for e in entities}
    values = {e.value for e in entities}
    assert expected_type in types, f"Expected {expected_type} in {types}"
    assert any(fragment in v for v in values), f"Expected '{fragment}' in {values}"


def test_detect_regex_entities_empty() -> None:
    assert _detect_regex_entities("") == []


def test_detect_regex_entities_no_match() -> None:
    assert _detect_regex_entities("The court convened at 10 AM.") == []


# ── anonymize_document — core logic ──────────────────────────────────────────

@patch("pii_ner._get_ner_pipeline")
def test_anonymize_replaces_phone_and_email(mock_pipeline) -> None:
    """With no model entities, regex should still redact phone/email."""
    mock_pipeline.return_value = lambda text: []  # model returns nothing

    text = "Contact Rahul at 9876543210 or rahul@court.in for details."
    result = anonymize_document(text)

    assert "[REDACTED_PHONE]" in result.anonymized_text
    assert "[REDACTED_EMAIL]" in result.anonymized_text
    assert result.entity_count == 2


@patch("pii_ner._get_ner_pipeline")
def test_anonymize_with_model_entities(mock_pipeline) -> None:
    """Model entities should also be replaced with correct placeholders."""
    mock_pipeline.return_value = lambda text: [
        {"entity_group": "PER", "score": 0.95, "start": 8, "end": 22, "word": "Priya Sharma"},
    ]

    text = "Witness Priya Sharma testified before the court."
    result = anonymize_document(text)

    assert "[REDACTED_NAME]" in result.anonymized_text
    assert "Priya Sharma" not in result.anonymized_text
    assert result.entity_count >= 1


@patch("pii_ner._get_ner_pipeline")
def test_anonymize_entity_type_filter(mock_pipeline) -> None:
    """entity_types filter should only redact selected types."""
    mock_pipeline.return_value = lambda text: []

    text = "Call 9876543210 or email test@court.in."
    result = anonymize_document(text, entity_types=["PHONE"])

    assert "[REDACTED_PHONE]" in result.anonymized_text
    # EMAIL should NOT be redacted
    assert "test@court.in" in result.anonymized_text


@patch("pii_ner._get_ner_pipeline")
def test_anonymize_empty_text(mock_pipeline) -> None:
    """Empty text should return empty anonymized text with 0 entities."""
    mock_pipeline.return_value = lambda text: []
    result = anonymize_document("   ")
    assert result.entity_count == 0
    assert result.redacted_spans == []


@patch("pii_ner._get_ner_pipeline")
def test_anonymize_audit_trail(mock_pipeline) -> None:
    """redacted_spans should contain original value and replacement."""
    mock_pipeline.return_value = lambda text: []

    text = "Send papers to judge@court.gov.in immediately."
    result = anonymize_document(text)

    assert len(result.redacted_spans) == 1
    span = result.redacted_spans[0]
    assert span.original == "judge@court.gov.in"
    assert span.replacement == "[REDACTED_EMAIL]"
    assert span.entity_type == "EMAIL"


@patch("pii_ner._get_ner_pipeline")
def test_anonymize_model_failure_fallback(mock_pipeline) -> None:
    """If model raises exception, regex-based detection should still work."""
    mock_pipeline.return_value = lambda text: (_ for _ in ()).throw(RuntimeError("model error"))  # type: ignore[arg-type]

    text = "Reach out at 9876543210."
    # Should not raise; should still detect phone via regex
    result = anonymize_document(text)
    assert "[REDACTED_PHONE]" in result.anonymized_text


# ── HTTP endpoint tests ───────────────────────────────────────────────────────

@patch("pii_ner._get_ner_pipeline")
def test_http_anonymize_success(mock_pipeline) -> None:
    mock_pipeline.return_value = lambda text: []

    resp = client.post("/internal/pii/anonymize", json={
        "text": "Contact info: 9988776655 and info@court.in",
        "minor_protection": False,
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "anonymized_text" in data
    assert "redacted_spans" in data
    assert "entity_count" in data
    assert data["entity_count"] == 2


def test_http_anonymize_text_too_long() -> None:
    """Text exceeding max_length (200_000) should return 422."""
    resp = client.post("/internal/pii/anonymize", json={"text": "a" * 200_001})
    assert resp.status_code == 422


@patch("pii_ner._get_ner_pipeline")
def test_http_entities_still_works(mock_pipeline) -> None:
    """The original /entities endpoint must remain functional."""
    mock_pipeline.return_value = lambda text: []

    resp = client.post("/internal/pii/entities", json={"text": "The court is in order."})
    assert resp.status_code == 200
    assert "entities" in resp.json()
