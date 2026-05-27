"""
Input Sanitization Utilities for Nyay Saarthi NLP Orchestrator.

Provides defense-in-depth sanitization against:
- XSS / HTML injection
- Script injection
- Prompt injection
- Control character injection

All user-facing input should pass through these functions before
being processed or injected into AI prompts.
"""

import re
import html


def strip_html_tags(text: str) -> str:
    """Remove all HTML/XML tags from input text."""
    return re.sub(r'<[^>]+>', '', text)


def sanitize_user_input(text: str) -> str:
    """
    Full sanitization pipeline for user-facing text input.

    Steps:
      1. Strip HTML tags
      2. Escape remaining HTML special characters
      3. Remove ASCII control characters (except newline/tab)
      4. Collapse excessive whitespace
    """
    text = strip_html_tags(text)
    text = html.escape(text)
    # Remove control characters (keep \n and \t for readability)
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    # Collapse excessive whitespace (3+ newlines → 2)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def sanitize_prompt_input(text: str) -> str:
    """
    Sanitize user input before injecting into AI prompts.

    Applies standard sanitization plus filters common prompt injection
    patterns that attempt to override system instructions.
    """
    text = sanitize_user_input(text)

    # Common prompt injection patterns to neutralize
    injection_patterns = [
        r'(?i)ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)',
        r'(?i)you\s+are\s+now\s+',
        r'(?i)system\s*:\s*',
        r'(?i)\\n\s*system\s*:',
        r'(?i)forget\s+(everything|all|your\s+instructions)',
        r'(?i)disregard\s+(all\s+)?(previous|above|prior)',
        r'(?i)new\s+instruction\s*:',
        r'(?i)override\s+(previous|system)',
    ]
    for pattern in injection_patterns:
        text = re.sub(pattern, '[FILTERED]', text)

    return text


def sanitize_url(url: str) -> str:
    """
    Basic URL sanitization.

    Rejects dangerous URI schemes (javascript:, data:, vbscript:)
    that could be used for XSS attacks.
    """
    url = url.strip()
    if re.match(r'(?i)^(javascript|data|vbscript):', url):
        raise ValueError(f"Blocked dangerous URL scheme: {url[:30]}")
    return url
