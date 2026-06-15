"""
Configuration module — loads environment variables from .env

Merged: viru's OCR/cache settings + RAG retrieval settings.
All API keys and secrets MUST be provided via environment variables or a .env file.
Never hardcode secrets in source code — use .env.example as a template.
All new variables have safe defaults; existing .env files keep working unchanged.
"""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# ─── API keys — loaded from environment variables only ────────────────────────
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY: str = os.getenv("GOOGLE_GEMINI_API_KEY", "")

# Model names
GROQ_MODEL_FAST: str = "llama-3.3-70b-versatile"   # Current recommended model
GEMINI_MODEL: str = "gemini-1.5-flash"             # Fast + deep reasoning
# Retry / fallback configuration
RETRY_ENABLED: bool = True
RETRY_MAX_ATTEMPTS: int = 2
RETRY_DELAY_SECONDS: float = 1.0
PROVIDER_ORDER: list[str] = ["gemini", "groq", "ollama"]

# ─── Ollama Configuration ─────────────────────────────────────────────────────
OLLAMA_API_URL: str = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama-3-8b")

# ─── Model names ──────────────────────────────────────────────────────────────
GROQ_MODEL_FAST: str = "llama-3.3-70b-versatile"
GEMINI_MODEL: str = "gemini-1.5-flash"

# ─── OCR (viru's additions) ───────────────────────────────────────────────────
TROCR_MODEL_NAME: str = os.getenv("TROCR_MODEL_NAME", "Piyush3142/trocr-sanskrit-ocr")
TROCR_DEVICE: str = os.getenv("TROCR_DEVICE", "")
HF_TOKEN: str = os.getenv("HF_TOKEN", "")

# ─── Indian Kanoon API ────────────────────────────────────────────────────────
INDIAN_KANOON_TOKEN: str = os.getenv("INDIAN_KANOON_TOKEN", "")
INDIAN_KANOON_API_URL: str = os.getenv(
    "INDIAN_KANOON_API_URL", "https://api.indiankanoon.org"
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

# ─── Retrieval / RAG settings ─────────────────────────────────────────────────
EMBEDDING_MODEL: str = os.getenv(
    "EMBEDDING_MODEL", "law-ai/InLegalBERT"
)
RERANKER_MODEL: str = os.getenv("RERANKER_MODEL", "BAAI/bge-reranker-base")
CHROMA_PATH: str = os.getenv(
    "CHROMA_PATH", str(Path(__file__).parent / "data" / "chroma")
)
RETRIEVAL_FETCH_K: int = int(os.getenv("RETRIEVAL_FETCH_K", "20"))
RETRIEVAL_TOP_K: int = int(os.getenv("RETRIEVAL_TOP_K", "5"))


def _bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


RETRIEVAL_ENABLED: bool = _bool("RETRIEVAL_ENABLED", True)
RERANKER_ENABLED: bool = _bool("RERANKER_ENABLED", True)
GROUND_RESEARCH: bool = _bool("GROUND_RESEARCH", True)

# ─── Validate required keys ───────────────────────────────────────────────────
if not GROQ_API_KEY:
    print("[Config] ERROR: GROQ_API_KEY is not set. Please add it to .env (see .env.example)", file=sys.stderr)
    sys.exit(1)
if not GEMINI_API_KEY:
    print("[Config] WARNING: GOOGLE_GEMINI_API_KEY not set. Gemini calls will fall back to Groq.")