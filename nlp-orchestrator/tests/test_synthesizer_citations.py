"""
Unit tests for structured synthesis with explicit cited-law extraction (#851).

All tests mock the Groq client so no LLM call is made. They verify that
synthesize_answers_structured:
  - parses the model's JSON {answer_markdown, cited_laws} object,
  - strips ```json fences,
  - normalizes and de-duplicates cited laws,
  - backfills citations from the prose when the model returns none,
  - falls back to plain markdown synthesis on malformed/invalid JSON,
and that the pure helper functions behave correctly.
"""

import os

os.environ.setdefault("GROQ_API_KEY", "test-key-not-used")

import json
import pytest
from unittest.mock import AsyncMock, patch

import synthesizer
from synthesizer import (
    synthesize_answers_structured,
    extract_cited_laws_from_markdown,
    _normalize_cited_law,
    _dedupe_cited_laws,
    _strip_json_fence,
)
from models.schemas import SynthesisResult

RESEARCH = [
    {
        "question": "What is the punishment for murder?",
        "source": "groq",
        "answer": "Section 302 IPC prescribes death or life imprisonment.",
    },
]


def _mock_response(content: str):
    message = type("Message", (), {"content": content})()
    choice = type("Choice", (), {"message": message})()
    return type("Response", (), {"choices": [choice]})()


# ─── Pure helpers ─────────────────────────────────────────────────────────────


def test_strip_json_fence_removes_fence():
    assert _strip_json_fence('```json\n{"a": 1}\n```') == '{"a": 1}'
    assert _strip_json_fence('```\n{"a": 1}\n```') == '{"a": 1}'
    assert _strip_json_fence('{"a": 1}') == '{"a": 1}'


def test_normalize_cited_law_canonical_forms():
    assert _normalize_cited_law("IPC Section 302") == "IPC Sec 302"
    assert _normalize_cited_law("section 144 of CrPC") == "CrPC Sec 144"
    assert _normalize_cited_law("Article 21") == "Article 21"


def test_dedupe_cited_laws_is_order_preserving_and_case_insensitive():
    out = _dedupe_cited_laws(["IPC Sec 302", "ipc section 302", "CrPC Sec 144", ""])
    assert out == ["IPC Sec 302", "CrPC Sec 144"]


def test_extract_cited_laws_from_markdown():
    md = "Under Section 304A IPC and MVA Section 166 you may claim compensation."
    laws = extract_cited_laws_from_markdown(md)
    assert "IPC Sec 304A" in laws
    assert "MVA Sec 166" in laws


# ─── Structured synthesis happy path ──────────────────────────────────────────


@pytest.mark.asyncio
@patch("synthesizer.client.chat.completions.create", new_callable=AsyncMock)
async def test_parses_json_object_with_cited_laws(mock_create):
    mock_create.return_value = _mock_response(
        json.dumps(
            {
                "answer_markdown": "## Answer\nMurder is punishable under Section 302 IPC.",
                "cited_laws": ["IPC Sec 302", "CrPC Sec 144"],
            }
        )
    )

    result = await synthesize_answers_structured("punishment for murder?", RESEARCH)

    assert isinstance(result, SynthesisResult)
    assert "Murder is punishable" in result.answer_markdown
    assert result.cited_laws == ["IPC Sec 302", "CrPC Sec 144"]


@pytest.mark.asyncio
@patch("synthesizer.client.chat.completions.create", new_callable=AsyncMock)
async def test_strips_fence_and_normalizes_and_dedupes(mock_create):
    mock_create.return_value = _mock_response(
        "```json\n"
        + json.dumps(
            {
                "answer_markdown": "## Answer\nSee the provisions below.",
                "cited_laws": ["IPC Section 302", "ipc sec 302", "Article 21"],
            }
        )
        + "\n```"
    )

    result = await synthesize_answers_structured("q", RESEARCH)

    assert result.cited_laws == ["IPC Sec 302", "Article 21"]


@pytest.mark.asyncio
@patch("synthesizer.client.chat.completions.create", new_callable=AsyncMock)
async def test_backfills_cited_laws_from_markdown_when_empty(mock_create):
    mock_create.return_value = _mock_response(
        json.dumps(
            {
                "answer_markdown": "Negligent driving is covered by Section 304A IPC.",
                "cited_laws": [],
            }
        )
    )

    result = await synthesize_answers_structured("q", RESEARCH)

    assert "IPC Sec 304A" in result.cited_laws


# ─── Fallback path ────────────────────────────────────────────────────────────


@pytest.mark.asyncio
@patch("synthesizer.synthesize_answers", new_callable=AsyncMock)
@patch("synthesizer.client.chat.completions.create", new_callable=AsyncMock)
async def test_malformed_json_falls_back_to_plain_synthesis(mock_create, mock_plain):
    mock_create.return_value = _mock_response("this is not json")
    mock_plain.return_value = "## Answer\nRefer to Section 420 IPC for cheating."

    result = await synthesize_answers_structured("q", RESEARCH)

    mock_plain.assert_awaited_once()
    assert "Section 420 IPC" in result.answer_markdown
    assert "IPC Sec 420" in result.cited_laws


@pytest.mark.asyncio
@patch("synthesizer.synthesize_answers", new_callable=AsyncMock)
@patch("synthesizer.client.chat.completions.create", new_callable=AsyncMock)
async def test_wrong_json_shape_falls_back(mock_create, mock_plain):
    # Valid JSON, but an array rather than the required object.
    mock_create.return_value = _mock_response('["not", "an", "object"]')
    mock_plain.return_value = "Plain fallback answer with no citations."

    result = await synthesize_answers_structured("q", RESEARCH)

    mock_plain.assert_awaited_once()
    assert result.answer_markdown.startswith("Plain fallback")
    assert result.cited_laws == []


@pytest.mark.asyncio
@patch("synthesizer.synthesize_answers", new_callable=AsyncMock)
@patch("synthesizer.client.chat.completions.create", new_callable=AsyncMock)
async def test_api_exception_falls_back(mock_create, mock_plain):
    mock_create.side_effect = Exception("rate limited")
    mock_plain.return_value = "Fallback under Article 21."

    result = await synthesize_answers_structured("q", RESEARCH)

    mock_plain.assert_awaited_once()
    assert "Article 21" in result.cited_laws
