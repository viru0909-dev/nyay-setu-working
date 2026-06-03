import asyncio
import pytest
from unittest.mock import AsyncMock, patch, Mock

from research import execute_with_fallback


@pytest.mark.asyncio
async def test_primary_provider_success():
    success = {
        "question": "Q",
        "answer": "A",
        "source": "gemini",
        "error": None,
        "is_fallback": False,
    }

    with patch("research.build_provider_queue", return_value=["gemini"]), \
         patch("research._attempt_provider", AsyncMock(return_value=success)):
        res = await execute_with_fallback("Q", "", primary_provider="gemini")
        assert res["source"] == "gemini"
        assert res["answer"] == "A"


@pytest.mark.asyncio
async def test_retry_then_success(monkeypatch):
    transient = Exception("timeout")
    success = {
        "question": "Q2",
        "answer": "A2",
        "source": "groq",
        "error": None,
        "is_fallback": False,
    }

    mock_attempt = AsyncMock(side_effect=[transient, success])

    with patch("research.build_provider_queue", return_value=["groq"]), \
         patch("research._attempt_provider", mock_attempt), \
         patch("research.RETRY_DELAY_SECONDS", 0), \
         patch("research.RETRY_MAX_ATTEMPTS", 1), \
         patch("research.is_retryable_exception", return_value=True), \
         patch("asyncio.sleep", AsyncMock()):
        res = await execute_with_fallback("Q2", "", primary_provider="groq")
        assert res["source"] == "groq"
        assert mock_attempt.call_count == 2


@pytest.mark.asyncio
async def test_circuit_breaker_provider_skipped():
    # Ensure that when the primary provider's circuit breaker is open, Gemini is skipped
    ok = {"question":"Q6","answer":"ok","source":"groq","error":None,"is_fallback":False}

    with patch("research.build_provider_queue", return_value=["gemini","groq"]), \
         patch("research.gemini_client", True), \
         patch("research.gemini_breaker.is_available", return_value=False), \
         patch("research._call_gemini_once", AsyncMock(side_effect=AssertionError("Gemini should not be called when breaker is open"))), \
         patch("research._call_groq_once", AsyncMock(return_value=ok)):
        res = await execute_with_fallback("Q6", "", primary_provider="gemini")
        assert res["source"] == "groq"
        assert res["answer"] == "ok"


@pytest.mark.asyncio
async def test_fallback_to_secondary_provider():
    # Primary returns fallback-shaped response
    fb = {"question":"Q3","answer":"unavail","source":"gemini","error":"err","is_fallback":True}
    ok = {"question":"Q3","answer":"ok","source":"groq","error":None,"is_fallback":False}

    with patch("research.build_provider_queue", return_value=["gemini","groq"]), \
         patch("research._attempt_provider", side_effect=[fb, ok]):
        res = await execute_with_fallback("Q3", "", primary_provider="gemini")
        assert res["source"] == "groq"
        assert res["answer"] == "ok"


@pytest.mark.asyncio
async def test_all_providers_fail():
    fb = {"question":"Q4","answer":"unavail","source":"groq","error":"err","is_fallback":True}
    with patch("research.build_provider_queue", return_value=["gemini","groq"]), \
         patch("research._attempt_provider", side_effect=[fb, fb]):
        res = await execute_with_fallback("Q4", "", primary_provider="gemini")
        assert res["is_fallback"] is True
        assert res["source"] == "all_providers_failed"


def test_non_retryable_error(monkeypatch):
    exc = Exception("bad request")
    mock_attempt = AsyncMock(side_effect=exc)
    with patch("research.build_provider_queue", return_value=["groq"]), \
         patch("research._attempt_provider", mock_attempt), \
         patch("research.is_retryable_exception", return_value=False), \
         patch("research.RETRY_DELAY_SECONDS", 0):
        # Run the coroutine
        res = asyncio.get_event_loop().run_until_complete(execute_with_fallback("Q5", "", primary_provider="groq"))
        assert res["is_fallback"] is True
        assert mock_attempt.call_count == 1
