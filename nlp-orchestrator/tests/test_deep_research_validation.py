"""
Request validation tests for POST /research/deep.

The Vakil Friend chat caps its input at 2,000 characters in the browser. These
tests cover the server-side fallback for clients that bypass that limit, so an
oversized payload never reaches Groq/Gemini and drains the shared token quota.
"""

import os

from starlette.testclient import TestClient

os.environ.setdefault("GROQ_API_KEY", "test")
os.environ.setdefault("GOOGLE_GEMINI_API_KEY", "test")

from main import MAX_QUERY_LENGTH, MAX_RAW_QUERY_LENGTH, app

client = TestClient(app)


def test_rejects_payload_above_raw_ceiling_with_400():
    response = client.post(
        "/research/deep",
        json={"query": "x" * (MAX_RAW_QUERY_LENGTH + 1), "language": "en"},
    )

    assert response.status_code == 400
    assert str(MAX_RAW_QUERY_LENGTH) in response.json()["detail"]


def test_rejects_query_above_sanitized_cap_with_422():
    """Between the two limits the Pydantic model is still the rejecting layer."""
    response = client.post(
        "/research/deep",
        json={"query": "x" * (MAX_QUERY_LENGTH + 1), "language": "en"},
    )

    assert response.status_code == 422


def test_non_string_query_falls_through_to_model_validation():
    response = client.post(
        "/research/deep",
        json={"query": ["not", "a", "string"], "language": "en"},
    )

    assert response.status_code == 422


def test_empty_body_still_reported_by_request_validation():
    response = client.post("/research/deep")

    assert response.status_code == 422
