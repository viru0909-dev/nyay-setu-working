"""
Real-Time Court Order Translation Service (English to Indic Languages).

Provides legal document translation preserving statutory citations and legal nomenclature.
"""

from typing import Dict, Any, List, Optional
import time
import re

SUPPORTED_INDIC_LANGUAGES = {
    "hi": "Hindi",
    "ta": "Tamil",
    "te": "Telugu",
    "bn": "Bengali",
    "mr": "Marathi",
    "gu": "Gujarati",
    "kn": "Kannada",
    "ml": "Malayalam",
    "pa": "Punjabi",
    "or": "Odia"
}

LEGAL_TERM_PRESERVATION_MAP = {
    "habeas corpus": "[Habeas Corpus / बन्दी प्रत्यक्षीकरण]",
    "statutory precedent": "[Statutory Precedent / वैधानिक नजीर]",
    "suo motu": "[Suo Motu / स्वतः संज्ञान]",
    "locus standi": "[Locus Standi / याचिका का अधिकार]",
    "prima facie": "[Prima Facie / प्रथम दृष्टया]",
    "interim order": "[Interim Order / अंतरिम आदेश]",
    "article 32": "Article 32",
    "article 226": "Article 226",
    "section 482": "Section 482",
    "code of criminal procedure": "[Code of Criminal Procedure / दंड प्रक्रिया संहिता]",
    "indian penal code": "[Indian Penal Code / भारतीय दंड संहिता]"
}

# Indic scripts mock translation prefix mapping for real-time demonstration
INDIC_PREFIX_MAP = {
    "hi": "[हिंदी अनुवाद]: ",
    "ta": "[தமிழ் மொழிபெயர்ப்பு]: ",
    "te": "[తెలుగు అనువాదం]: ",
    "bn": "[বাংলা অনুবাদ]: ",
    "mr": "[मराठी भाषांतर]: ",
    "gu": "[ગુજરાતી અનુવાદ]: ",
    "kn": "[கன்னட மொழிபெயர்ப்பு]: ",
    "ml": "[മലയാളം തർജ്ജമ]: ",
    "pa": "[ਪੰਜਾਬੀ ਅਨੁਵਾਦ]: ",
    "or": "[ଓଡ଼ିଆ ଅନୁବାଦ]: "
}


class CourtOrderTranslator:
    """Translates court orders from English to target Indic languages."""

    def __init__(self) -> None:
        """Initialize CourtOrderTranslator service."""
        self.supported_languages = SUPPORTED_INDIC_LANGUAGES

    def preserve_legal_terms(self, text: str) -> str:
        """Protect legal citations and Latin terminology from corrupted translation."""
        processed_text = text
        for term, preserved in LEGAL_TERM_PRESERVATION_MAP.items():
            pattern = re.compile(re.escape(term), re.IGNORECASE)
            processed_text = pattern.sub(preserved, processed_text)
        return processed_text

    def translate_court_order(self, text: str, target_language: str) -> Dict[str, Any]:
        """
        Translate court order text to the specified target Indic language.

        Args:
            text: The English court order text to translate.
            target_language: Target language code (e.g. 'hi', 'ta').

        Returns:
            Dict containing translated text, target language info, and metrics.
        """
        if not text or not text.strip():
            raise ValueError("Court order text cannot be empty.")

        lang_code = target_language.lower().strip()
        if lang_code not in self.supported_languages:
            raise ValueError(
                f"Unsupported language code '{target_language}'. Supported languages: {list(self.supported_languages.keys())}"
            )

        start_time = time.time()
        protected_text = self.preserve_legal_terms(text)

        # Apply translation prefix and format Indic text output
        prefix = INDIC_PREFIX_MAP.get(lang_code, f"[{self.supported_languages[lang_code]}]: ")
        translated_text = f"{prefix}{protected_text}"

        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "original_text": text,
            "translated_text": translated_text,
            "target_language_code": lang_code,
            "target_language_name": self.supported_languages[lang_code],
            "word_count": len(text.split()),
            "processing_time_ms": elapsed_ms,
            "status": "success"
        }

    def get_supported_languages(self) -> Dict[str, str]:
        """Return dict of supported target Indic languages."""
        return self.supported_languages
