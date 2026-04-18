"""
Configuration module — loads environment variables from .env
"""

import os
from dotenv import load_dotenv

load_dotenv()

# API Keys
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY: str = os.getenv("GOOGLE_GEMINI_API_KEY", "")

# Model names
GROQ_MODEL_FAST: str = "llama-3.3-70b-versatile"   # Current recommended model
GEMINI_MODEL: str = "gemini-1.5-flash"             # Fast + deep reasoning

# Indian Kanoon API
INDIAN_KANOON_TOKEN: str = os.getenv("INDIAN_KANOON_TOKEN", "")
INDIAN_KANOON_API_URL: str = "https://api.indiankanoon.org"

# CORS
FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

# Validate
if not GROQ_API_KEY:
    raise EnvironmentError("GROQ_API_KEY is not set. Please add it to .env")
if not GEMINI_API_KEY:
    print("[Config] WARNING: GOOGLE_GEMINI_API_KEY not set. Gemini calls will fall back to Groq.")
