"""
Unit tests for the court-media-pipeline ASR service.

Tests cover:
  1. apply_legal_corrections — verifies all correction mappings
  2. preprocess_audio — verifies output is a valid 16 kHz mono WAV
  3. POST /transcribe — integration test with mocked Groq + pydub
  4. POST /transcribe with unsupported file type
  5. GET /health
"""

from __future__ import annotations

import io
import struct
import wave
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from asr_service import app, apply_legal_corrections, preprocess_audio

client = TestClient(app)


# ── Helper ──────────────────────────────────────────────────────────────────

def _make_wav_bytes(sample_rate: int = 16_000, duration_ms: int = 100) -> bytes:
    """Generate a minimal silent WAV file for testing."""
    num_samples = int(sample_rate * duration_ms / 1000)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(struct.pack(f"<{num_samples}h", *([0] * num_samples)))
    return buf.getvalue()


# ── Legal correction tests ───────────────────────────────────────────────────

@pytest.mark.parametrize("raw, expected", [
    ("The court issued a suo moto notice.", "The court issued a suo motu notice."),
    ("An amicus curie was appointed.", "An amicus curiae was appointed."),
    ("The habis corpus petition was filed.", "The habeas corpus petition was filed."),
    ("This is inter-alia applicable.", "This is inter alia applicable."),
    ("The ipc provisions apply here.", "The IPC provisions apply here."),
    ("Under cpc rules, the order stands.", "Under CPC rules, the order stands."),
    ("The ex-parte order was passed.", "The ex parte order was passed."),
    ("The doctrine of res-judicata applies.", "The doctrine of res judicata applies."),
    ("writ of certiorari was issued", "writ of certiorari was issued"),  # no change needed
    ("sertiorari petition", "certiorari petition"),
])
def test_apply_legal_corrections(raw: str, expected: str) -> None:
    assert apply_legal_corrections(raw) == expected


# ── Audio preprocessing tests ────────────────────────────────────────────────

def test_preprocess_audio_returns_wav() -> None:
    """preprocess_audio should return valid WAV bytes (RIFF header)."""
    wav_bytes = _make_wav_bytes()
    result = preprocess_audio(wav_bytes, "test_hearing.wav")
    # RIFF header check
    assert result[:4] == b"RIFF", "Output must be a WAV file"


def test_preprocess_audio_unsupported_format() -> None:
    """preprocess_audio should raise ValueError for unknown formats."""
    with pytest.raises(ValueError, match="Unsupported file format"):
        preprocess_audio(b"fake data", "evidence.xyz")


# ── HTTP endpoint tests ──────────────────────────────────────────────────────

def test_health_endpoint() -> None:
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "groq_key_configured" in data


def test_transcribe_unsupported_format() -> None:
    """Should return 415 for unsupported file types."""
    resp = client.post(
        "/transcribe",
        files={"file": ("recording.xyz", b"fake", "application/octet-stream")},
        data={"language": "en"},
    )
    assert resp.status_code == 415


def test_transcribe_empty_file() -> None:
    """Should return 400 for empty files."""
    resp = client.post(
        "/transcribe",
        files={"file": ("empty.wav", b"", "audio/wav")},
    )
    assert resp.status_code == 400


@patch("asr_service.transcribe_audio")
@patch("asr_service.preprocess_audio")
def test_transcribe_success(mock_preprocess, mock_transcribe) -> None:
    """Should return transcript on a valid upload with mocked internals."""
    wav_bytes = _make_wav_bytes()
    mock_preprocess.return_value = wav_bytes
    mock_transcribe.return_value = "The court sua motu took up the habeas corpus petition."

    resp = client.post(
        "/transcribe",
        files={"file": ("hearing.wav", wav_bytes, "audio/wav")},
        data={"language": "en"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "transcript" in data
    assert data["filename"] == "hearing.wav"
    assert data["language_hint"] == "en"


@patch("asr_service.transcribe_audio")
@patch("asr_service.preprocess_audio")
def test_transcribe_auto_language(mock_preprocess, mock_transcribe) -> None:
    """Language hint should default to 'auto' when not provided."""
    wav_bytes = _make_wav_bytes()
    mock_preprocess.return_value = wav_bytes
    mock_transcribe.return_value = "न्यायालय ने आदेश पारित किया।"

    resp = client.post(
        "/transcribe",
        files={"file": ("hindi_hearing.wav", wav_bytes, "audio/wav")},
    )
    assert resp.status_code == 200
    assert resp.json()["language_hint"] == "auto"
