"""
Unit tests for avatar_speech Hinglish conversion (Issue #849).

Covers the prompt-tuning fix for "[NLP] Tune prompt for regional language
translation": the system prompt must steer the model toward colloquial,
understandable Hinglish instead of overly formal / Sanskritised Hindi.

These tests guard the *prompt contract* (so the register cannot silently
regress) and verify the surrounding conversion logic still behaves correctly
without making any real network call to Groq.

Run with: python -m pytest tests/test_avatar_speech.py -v
Or directly: python tests/test_avatar_speech.py
"""

import os
import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# Allow direct execution from the project root.
_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

# Mock GROQ_API_KEY before importing avatar_speech so config.py does not
# exit in CI environments without a .env file.
with patch.dict(os.environ, {"GROQ_API_KEY": "test-key-for-ci"}):
    import avatar_speech
    from avatar_speech import (
        HINGLISH_CONVERSION_PROMPT,
        convert_to_hinglish,
        detect_domain,
        get_interim_messages,
    )


# ── Prompt contract: register-tuning regression guards ───────────────────────

class TestHinglishPromptRegister:
    """The tuned prompt must actively steer away from formal Hindi (Issue #849)."""

    def test_prompt_still_accepts_the_answer_placeholder(self):
        # The prompt must keep exactly one format placeholder, so .format() works.
        assert "{markdown_answer}" in HINGLISH_CONVERSION_PROMPT
        assert HINGLISH_CONVERSION_PROMPT.count("{") == 1
        assert HINGLISH_CONVERSION_PROMPT.count("}") == 1

    def test_prompt_formats_without_keyerror(self):
        rendered = HINGLISH_CONVERSION_PROMPT.format(markdown_answer="SAMPLE ANSWER")
        assert "SAMPLE ANSWER" in rendered
        assert "{markdown_answer}" not in rendered

    def test_prompt_demands_colloquial_register(self):
        lowered = HINGLISH_CONVERSION_PROMPT.lower()
        # At least one explicit colloquial-register cue must be present.
        assert "colloquial" in lowered
        assert "shuddh" in lowered or "sanskrit" in lowered

    @pytest.mark.parametrize(
        "formal_word",
        ["nyayalaya", "adhiniyam", "praavdhaan", "kshatipoorti", "vidhik"],
    )
    def test_prompt_names_formal_words_to_avoid(self, formal_word):
        # The avoid-list anchors the model away from these specific formal terms.
        assert formal_word in HINGLISH_CONVERSION_PROMPT.lower()

    @pytest.mark.parametrize(
        "english_keep",
        ["court", "police", "fir", "bail", "compensation", "insurance"],
    )
    def test_prompt_whitelists_common_english_terms(self, english_keep):
        assert english_keep in HINGLISH_CONVERSION_PROMPT.lower()

    def test_prompt_preserves_original_constraints(self):
        lowered = HINGLISH_CONVERSION_PROMPT.lower()
        # Existing behavioural rules must survive the tuning.
        assert "aap" in lowered                 # respectful pronoun
        assert "tum" in lowered                 # explicitly disallowed
        assert "markdown" in lowered            # plain-text / TTS rule
        assert "4-6" in HINGLISH_CONVERSION_PROMPT  # length guidance
        assert "nyay saarthi" in lowered        # avatar persona retained

    def test_prompt_keeps_legal_accuracy_requirement(self):
        lowered = HINGLISH_CONVERSION_PROMPT.lower()
        assert "section" in lowered  # section numbers / law names stay accurate


# ── convert_to_hinglish: behaviour with a mocked Groq client ─────────────────

class TestConvertToHinglish:
    @pytest.mark.asyncio
    async def test_returns_stripped_model_output(self):
        fake_message = MagicMock()
        fake_message.content = "  Dekhiye, aapka case strong hai.  "
        fake_choice = MagicMock(message=fake_message)
        fake_response = MagicMock(choices=[fake_choice])

        with patch.object(
            avatar_speech.client.chat.completions,
            "create",
            new=AsyncMock(return_value=fake_response),
        ) as mock_create:
            result = await convert_to_hinglish("The petitioner may claim compensation.")

        assert result == "Dekhiye, aapka case strong hai."
        # The tuned prompt (with the user's answer) must be what we send.
        sent = mock_create.call_args.kwargs["messages"][0]["content"]
        assert "The petitioner may claim compensation." in sent
        assert "colloquial" in sent.lower()

    @pytest.mark.asyncio
    async def test_falls_back_to_first_sentences_on_error(self):
        long_answer = (
            "First sentence here. Second sentence here. "
            "Third sentence here. Fourth sentence here."
        )
        with patch.object(
            avatar_speech.client.chat.completions,
            "create",
            new=AsyncMock(side_effect=RuntimeError("groq down")),
        ):
            result = await convert_to_hinglish(long_answer)

        # Fallback keeps the first three sentences and stays non-empty.
        assert result.startswith("First sentence here")
        assert "Third sentence here" in result
        assert "Fourth sentence here" not in result
        assert result.endswith(".")


# ── Unchanged helpers: light coverage so the module stays green ──────────────

class TestDomainHelpers:
    def test_detect_domain_matches_keywords(self):
        assert detect_domain("My car had an accident on the road") == "accident"
        assert detect_domain("I need to file an FIR with the police") == "criminal"
        assert detect_domain("question about my rented flat possession") == "property"

    def test_detect_domain_defaults_to_general(self):
        assert detect_domain("hello there, random question") == "general"

    def test_get_interim_messages_respects_count_and_dedupes(self):
        msgs = get_interim_messages("car accident claim", count=3)
        assert len(msgs) == 3
        assert len(set(msgs)) == 3  # no duplicates


if __name__ == "__main__":
    sys.exit(pytest.main([__file__, "-v"]))
