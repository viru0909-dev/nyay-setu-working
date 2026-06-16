"""
Unit tests for synthesizer.format_research_for_synthesis()

Tests cover all three scenarios from Issue #286:
  1. Correct numbered formatting
  2. Ignore empty answers
  3. Handle empty input list

Plus additional edge-case coverage for production robustness.
"""

import os
from unittest.mock import patch

# Mock GROQ_API_KEY before importing synthesizer so config.py
# does not raise EnvironmentError in CI environments without .env
with patch.dict(os.environ, {"GROQ_API_KEY": "test-key-for-ci"}):
    from synthesizer import format_research_for_synthesis


# ── Test 1: Correct numbered formatting ──────────────────────────────────────


def test_correct_numbered_formatting():
    """Verify numbering, source uppercasing, answer inclusion, and separator."""
    results = [
        {
            "question": "What is IPC Section 420?",
            "answer": "IPC 420 deals with cheating and dishonestly inducing delivery of property.",
            "source": "groq",
            "error": None,
        },
        {
            "question": "What are the penalties under Section 420?",
            "answer": "Imprisonment up to 7 years and fine.",
            "source": "gemini",
            "error": None,
        },
    ]

    output = format_research_for_synthesis(results)

    # Verify sub-question numbering starts at 1
    assert "Sub-Question 1:" in output
    assert "Sub-Question 2:" in output

    # Verify questions are included
    assert "What is IPC Section 420?" in output
    assert "What are the penalties under Section 420?" in output

    # Verify source is uppercased
    assert "Source: GROQ" in output
    assert "Source: GEMINI" in output

    # Verify answers are included
    assert "IPC 420 deals with cheating" in output
    assert "Imprisonment up to 7 years" in output

    # Verify separator between multiple results
    assert "\n---\n" in output


# ── Test 2: Ignore empty answers ─────────────────────────────────────────────


def test_ignores_empty_answers():
    """Entries with empty string or None answers should be excluded."""
    results = [
        {
            "question": "Valid question",
            "answer": "Valid answer",
            "source": "groq",
            "error": None,
        },
        {
            "question": "Empty string answer",
            "answer": "",
            "source": "groq",
            "error": "API timeout",
        },
        {
            "question": "None answer",
            "answer": None,
            "source": "gemini",
            "error": "Connection refused",
        },
    ]

    output = format_research_for_synthesis(results)

    # Only the valid entry should appear
    assert "Valid answer" in output
    assert "Empty string answer" not in output
    assert "None answer" not in output

    # No separator since only one result made it through
    assert "\n---\n" not in output


# ── Test 3: Handle empty input list ──────────────────────────────────────────


def test_empty_input_list():
    """An empty list should return an empty string."""
    output = format_research_for_synthesis([])

    assert output == ""


# ── Test 4: Single result (edge case) ────────────────────────────────────────


def test_single_result():
    """A single valid result should produce output with no separator."""
    results = [
        {
            "question": "What is RTI?",
            "answer": "Right to Information Act 2005.",
            "source": "groq",
            "error": None,
        },
    ]

    output = format_research_for_synthesis(results)

    assert "Sub-Question 1:" in output
    assert "Right to Information Act 2005." in output
    assert "Source: GROQ" in output

    # No separator for a single result
    assert "---" not in output


# ── Test 5: Preserves original numbering ─────────────────────────────────────


def test_preserves_original_numbering():
    """
    When an entry is skipped due to an empty answer, the numbering should
    reflect the original position, not the filtered position.
    e.g., if item 2 has no answer, item 3 should still be 'Sub-Question 3'.
    """
    results = [
        {
            "question": "First question",
            "answer": "First answer",
            "source": "groq",
            "error": None,
        },
        {
            "question": "Skipped question",
            "answer": "",
            "source": "groq",
            "error": "Failed",
        },
        {
            "question": "Third question",
            "answer": "Third answer",
            "source": "gemini",
            "error": None,
        },
    ]

    output = format_research_for_synthesis(results)

    # Item 1 should be numbered 1
    assert "Sub-Question 1: First question" in output

    # Item 2 is skipped entirely (no Sub-Question 2)
    assert "Sub-Question 2" not in output

    # Item 3 retains its original position number
    assert "Sub-Question 3: Third question" in output
