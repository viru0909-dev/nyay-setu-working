"""
Pytest Unit Tests for Court Order Translation Service and Router.
"""

import pytest
from services.translation_service import CourtOrderTranslator, SUPPORTED_INDIC_LANGUAGES


def test_translator_initialization() -> None:
    """Test translator service initializes supported languages properly."""
    translator = CourtOrderTranslator()
    languages = translator.get_supported_languages()
    assert "hi" in languages
    assert "ta" in languages
    assert languages["hi"] == "Hindi"


def test_translation_success() -> None:
    """Test successful translation of court order text into Hindi."""
    translator = CourtOrderTranslator()
    sample_text = "The court hereby grants interim order under section 482 of the Code of Criminal Procedure."
    res = translator.translate_court_order(sample_text, target_language="hi")

    assert res["status"] == "success"
    assert res["target_language_code"] == "hi"
    assert res["target_language_name"] == "Hindi"
    assert "[Interim Order / अंतरिम आदेश]" in res["translated_text"]


def test_empty_text_error() -> None:
    """Test ValueError is raised when empty text is provided."""
    translator = CourtOrderTranslator()
    with pytest.raises(ValueError, match="Court order text cannot be empty"):
        translator.translate_court_order("  ", "hi")


def test_unsupported_language_error() -> None:
    """Test ValueError is raised for unsupported target language."""
    translator = CourtOrderTranslator()
    with pytest.raises(ValueError, match="Unsupported language code"):
        translator.translate_court_order("Sample text", "fr")
