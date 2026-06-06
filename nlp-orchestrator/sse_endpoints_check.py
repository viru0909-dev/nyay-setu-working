import pytest
import httpx
import json

API_BASE = "http://localhost:8001"

pytestmark = pytest.mark.asyncio


async def test_deep_research_stream():
    """Test /research/deep SSE endpoint."""

    query = {
        "query": "What is IPC Section 304A?",
        "language": "en",
    }

    event_count = 0
    token_count = 0

    async with httpx.AsyncClient(timeout=60.0) as client:

        async with client.stream(
            "POST",
            f"{API_BASE}/research/deep",
            json=query,
        ) as response:

            assert response.status_code == 200

            async for line in response.aiter_lines():

                if line.startswith("data: "):

                    event_count += 1

                    try:
                        event_data = json.loads(line[6:])
                        event_type = event_data.get("type")

                        if event_type == "reasoning":
                            token_count += 1

                    except json.JSONDecodeError:
                        pass

    assert event_count > 0
    assert token_count > 0


async def test_analyze_stream():
    """Test /api/legal/analyze-stream SSE endpoint."""

    query = {
        "query": "What are my legal rights if accused of theft?",
        "language": "en",
    }

    event_count = 0
    token_count = 0

    async with httpx.AsyncClient(timeout=120.0) as client:

        async with client.stream(
            "POST",
            f"{API_BASE}/api/legal/analyze-stream",
            json=query,
        ) as response:

            assert response.status_code == 200

            async for line in response.aiter_lines():

                if line.startswith("data: "):

                    event_count += 1

                    try:
                        event_data = json.loads(line[6:])
                        event_type = event_data.get("type")

                        if event_type == "synthesis_token":
                            token_count += 1

                    except json.JSONDecodeError:
                        pass

    assert event_count > 0
    assert token_count > 0