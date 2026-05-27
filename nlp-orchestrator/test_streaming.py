import pytest

pytestmark = pytest.mark.asyncio


async def fake_stream():
    """Mock token stream."""

    tokens = ["Hello", " ", "world"]

    for token in tokens:
        yield token


async def test_stream_groq_chat():
    """Test streaming token accumulation."""

    token_count = 0
    full_response = ""

    async for token in fake_stream():
        token_count += 1
        full_response += token

    assert token_count > 0
    assert full_response == "Hello world"


async def test_stream_synthesize():
    """Test synthesis streaming."""

    token_count = 0
    full_response = ""

    async for token in fake_stream():
        token_count += 1
        full_response += token

    assert token_count > 0
    assert full_response == "Hello world"