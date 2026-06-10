"""prompt_builder helper moved into the `lawgpt` package for correct imports."""
from typing import Dict, Iterable, List


def _ensure_str_map(fields: Dict[str, object]) -> Dict[str, str]:
    out: Dict[str, str] = {}
    for k, v in fields.items():
        if v is None:
            out[k] = ""
        else:
            out[k] = str(v).strip()
    return out


def validate_required_fields(fields: Dict[str, str], required: Iterable[str]) -> List[str]:
    missing: List[str] = []
    for r in required:
        val = fields.get(r, "")
        if not val:
            missing.append(r)
    return missing


def detect_prompt_injection(fields: Dict[str, str]) -> List[str]:
    suspicious: List[str] = []
    checks = [
        "ignore previous",
        "ignore all previous",
        "system prompt",
        "{{",
        "}}",
        "<script",
        "</script>",
        "sudo ",
        "exec(",
        "openai",
        "gpt-",
        "http://",
        "https://",
    ]
    lower = " ".join(v.lower() for v in fields.values())
    for c in checks:
        if c in lower:
            suspicious.append(c)
    return suspicious


def build_prompt(template: str, fields: Dict[str, object], legal_context: str = "") -> str:
    safe_fields = _ensure_str_map(fields)
    safe_fields["legal_context"] = legal_context or ""
    try:
        prompt = template.format(**safe_fields)
    except Exception:
        parts = [template, "\n\n"]
        for k, v in safe_fields.items():
            parts.append(f"{k}: {v}\n")
        prompt = "".join(parts)
    return prompt
