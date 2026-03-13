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
GROQ_MODEL_FAST: str = "llama3-8b-8192"          # Fast, lightweight
GEMINI_MODEL: str = "gemini-1.5-flash"             # Fast + deep reasoning

# CORS
FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

# Validate
if not GROQ_API_KEY:
    raise EnvironmentError("GROQ_API_KEY is not set. Please add it to .env")
if not GEMINI_API_KEY:
    print("[Config] WARNING: GOOGLE_GEMINI_API_KEY not set. Gemini calls will fall back to Groq.")
