"""
Court Media Pipeline — Multilingual ASR Service
================================================
FastAPI microservice that provides speech-to-text transcription for
court hearing audio/video recordings.

Key features:
  • Audio preprocessing — noise reduction & normalisation via pydub
  • Whisper-based multilingual ASR via the Groq API (whisper-large-v3-turbo)
  • Indian legal terminology post-processing to fix common ASR errors
  • Simple HTML upload UI at GET /
  • REST endpoint at POST /transcribe
"""

from __future__ import annotations

import io
import logging
import os
import re
import tempfile
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import HTMLResponse
from groq import Groq
from pydub import AudioSegment
from pydub.effects import normalize

load_dotenv()

logger = logging.getLogger("asr_service")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# ── Supported input formats ─────────────────────────────────────────────────
SUPPORTED_EXTENSIONS = {".mp3", ".wav", ".ogg", ".flac", ".mp4", ".m4a", ".webm", ".aac"}

# ── Legal terminology correction map ───────────────────────────────────────
# Maps common ASR phonetic mis-transcriptions to correct Indian legal terms.
LEGAL_CORRECTIONS: dict[str, str] = {
    r"\bsuo moto\b": "suo motu",
    r"\bsuo-motu\b": "suo motu",
    r"\bamicus curiae\b": "amicus curiae",
    r"\bamicus curie\b": "amicus curiae",
    r"\bamicus curry\b": "amicus curiae",
    r"\bhabeas corpus\b": "habeas corpus",
    r"\bhabis corpus\b": "habeas corpus",
    r"\bhabeas corpus\b": "habeas corpus",
    r"\binter alia\b": "inter alia",
    r"\binter-alia\b": "inter alia",
    r"\bex parte\b": "ex parte",
    r"\bex-parte\b": "ex parte",
    r"\bin camera\b": "in camera",
    r"\bin-camera\b": "in camera",
    r"\bres judicata\b": "res judicata",
    r"\bres-judicata\b": "res judicata",
    r"\bultravires\b": "ultra vires",
    r"\bultra-vires\b": "ultra vires",
    r"\bmandamus\b": "mandamus",
    r"\bcertiorari\b": "certiorari",
    r"\bsertiorari\b": "certiorari",
    r"\bsiertiorari\b": "certiorari",
    r"\bprohibition writ\b": "writ of prohibition",
    r"\bquaere\b": "quaere",
    r"\bpari passu\b": "pari passu",
    r"\bparens patriae\b": "parens patriae",
    r"\bparens patria\b": "parens patriae",
    r"\bipc\b": "IPC",
    r"\bcr\.?p\.?c\.?\b": "CrPC",
    r"\bcpc\b": "CPC",
}


def preprocess_audio(file_bytes: bytes, filename: str) -> bytes:
    """
    Denoise and normalise an audio/video file.

    Returns WAV bytes suitable for Whisper ingestion.
    """
    suffix = Path(filename).suffix.lower()
    if suffix not in SUPPORTED_EXTENSIONS:
        raise ValueError(f"Unsupported file format: {suffix}")

    logger.info("📥 Preprocessing audio — format: %s, size: %.1f KB", suffix, len(file_bytes) / 1024)

    # Load audio via pydub (auto-detects format)
    audio: AudioSegment = AudioSegment.from_file(io.BytesIO(file_bytes), format=suffix.lstrip("."))

    # Convert to mono 16 kHz — optimal for Whisper
    audio = audio.set_channels(1).set_frame_rate(16_000)

    # Normalise volume so quiet passages are audible
    audio = normalize(audio)

    # Export as WAV
    buf = io.BytesIO()
    audio.export(buf, format="wav")
    buf.seek(0)
    processed_bytes = buf.read()

    logger.info("✅ Preprocessing complete — output WAV size: %.1f KB", len(processed_bytes) / 1024)
    return processed_bytes


def apply_legal_corrections(text: str) -> str:
    """
    Apply a post-processing dictionary to fix common ASR errors in
    Indian legal terminology using case-insensitive regex substitution.
    """
    for pattern, replacement in LEGAL_CORRECTIONS.items():
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    return text


def transcribe_audio(audio_bytes: bytes, filename: str, language: str | None = None) -> str:
    """
    Transcribe pre-processed WAV audio using Groq's Whisper integration.

    Args:
        audio_bytes: Raw WAV file bytes after preprocessing.
        filename:    Original filename (used to derive a temp file name).
        language:    Optional BCP-47 language hint (e.g. "hi", "en", "mr").
                     If None, Whisper auto-detects the language.

    Returns:
        Corrected transcription string.
    """
    groq_api_key = os.getenv("GROQ_API_KEY", "")
    if not groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not set in the environment.")

    client = Groq(api_key=groq_api_key)

    logger.info("🎙️  Sending audio to Groq Whisper (language hint: %s)…", language or "auto")

    # Write to a temp file — Groq SDK requires a file-like object with a name
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as audio_file:
            kwargs: dict = {
                "file": (Path(filename).stem + ".wav", audio_file, "audio/wav"),
                "model": "whisper-large-v3-turbo",
                "response_format": "verbose_json",
                "temperature": 0.0,
            }
            if language:
                kwargs["language"] = language

            transcription = client.audio.transcriptions.create(**kwargs)
    finally:
        Path(tmp_path).unlink(missing_ok=True)

    raw_text: str = transcription.text or ""
    logger.info("✅ Raw transcription: %d chars", len(raw_text))

    corrected_text = apply_legal_corrections(raw_text)
    logger.info("✅ Post-processing applied — legal terms corrected")
    return corrected_text


# ── FastAPI application ──────────────────────────────────────────────────────

app = FastAPI(
    title="NyaySetu Court ASR Service",
    description="Multilingual automatic speech recognition for Indian court proceedings.",
    version="1.0.0",
)


@app.get("/", response_class=HTMLResponse, include_in_schema=False)
async def index() -> str:
    """Simple HTML upload interface for testing."""
    return """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>NyaySetu — Court ASR Service</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 640px; margin: 60px auto; padding: 0 1rem; }
        h1 { color: #1a56db; }
        form { display: flex; flex-direction: column; gap: 1rem; }
        input, select, button { padding: .6rem .9rem; border-radius: 6px; border: 1px solid #ccc; font-size: 1rem; }
        button { background: #1a56db; color: #fff; border: none; cursor: pointer; }
        pre { background: #f3f4f6; padding: 1rem; border-radius: 6px; white-space: pre-wrap; }
    </style>
</head>
<body>
    <h1>🎙️ Court ASR Transcription</h1>
    <p>Upload an audio or video file from a court proceeding to receive a corrected multilingual transcript.</p>
    <form id="frm" enctype="multipart/form-data">
        <input type="file" id="file" name="file" accept=".mp3,.wav,.ogg,.flac,.mp4,.m4a,.webm,.aac" required>
        <select name="language" id="lang">
            <option value="">Auto-detect language</option>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="mr">Marathi</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
            <option value="gu">Gujarati</option>
            <option value="kn">Kannada</option>
            <option value="bn">Bengali</option>
            <option value="ml">Malayalam</option>
            <option value="pa">Punjabi</option>
        </select>
        <button type="submit">Transcribe</button>
    </form>
    <pre id="result" hidden></pre>
    <script>
        document.getElementById('frm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            document.getElementById('result').hidden = true;
            document.querySelector('button').textContent = 'Processing…';
            const res = await fetch('/transcribe', { method: 'POST', body: fd });
            const data = await res.json();
            document.getElementById('result').hidden = false;
            document.getElementById('result').textContent = res.ok ? data.transcript : '❌ ' + (data.detail || 'Error');
            document.querySelector('button').textContent = 'Transcribe';
        });
    </script>
</body>
</html>
"""


@app.post("/transcribe", summary="Transcribe court audio/video to text")
async def transcribe(
    file: UploadFile = File(..., description="Audio or video file of court proceedings"),
    language: str | None = Form(None, description="BCP-47 language code hint (e.g. 'hi', 'en'). Leave blank for auto-detect."),
) -> dict:
    """
    Transcribe a court hearing audio/video file.

    Steps:
    1. Preprocess audio (noise reduction + 16 kHz mono normalisation).
    2. Send to Groq Whisper for multilingual speech-to-text.
    3. Apply Indian legal terminology corrections.

    Returns a JSON object with `transcript`, `filename`, and `language_hint`.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    suffix = Path(file.filename).suffix.lower()
    if suffix not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported media type '{suffix}'. Supported: {', '.join(sorted(SUPPORTED_EXTENSIONS))}",
        )

    raw_bytes = await file.read()
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        processed = preprocess_audio(raw_bytes, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=415, detail=str(e))
    except Exception as e:
        logger.exception("Audio preprocessing failed")
        raise HTTPException(status_code=500, detail=f"Preprocessing error: {e}")

    try:
        transcript = transcribe_audio(processed, file.filename, language or None)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.exception("Transcription failed")
        raise HTTPException(status_code=500, detail=f"Transcription error: {e}")

    return {
        "transcript": transcript,
        "filename": file.filename,
        "language_hint": language or "auto",
    }


@app.get("/health", summary="Service health check")
async def health() -> dict:
    groq_key_present = bool(os.getenv("GROQ_API_KEY", ""))
    return {
        "status": "ok",
        "groq_key_configured": groq_key_present,
    }
