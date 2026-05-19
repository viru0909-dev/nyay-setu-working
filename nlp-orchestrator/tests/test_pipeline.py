import pytest
import sys
import os
from unittest.mock import AsyncMock, patch

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import deep_research_pipeline


@pytest.mark.asyncio
@patch("main.build_kanoon_context", new_callable=AsyncMock)
@patch("main.synthesize_answers", new_callable=AsyncMock)
@patch("main.run_parallel_research", new_callable=AsyncMock)
@patch("main.decompose_query", new_callable=AsyncMock)
async def test_deep_research_pipeline_flow(
    mock_decompose,
    mock_research,
    mock_synthesize,
    mock_kanoon,
):

    mock_decompose.return_value = [
        "What is FIR?",
        "How to file FIR?"
    ]

    mock_research.return_value = [
        {"answer": "FIR means First Information Report"}
    ]

    mock_synthesize.return_value = "Final synthesized response"

    mock_kanoon.return_value = (
        "Mock kanoon context",
        [{"title": "Mock Case", "doc_id": "123"}]
    )

    events = []

    async for event in deep_research_pipeline(
        "Explain FIR process",
        "english"
    ):
        events.append(event)

    assert len(events) > 0

    joined_events = " ".join(events)

    assert "stage" in joined_events
    assert "done" in joined_events

@pytest.mark.asyncio
@patch("main.build_kanoon_context", new_callable=AsyncMock)
async def test_pipeline_error_handling(mock_kanoon):

    mock_kanoon.side_effect = Exception("Mock API failure")

    events = []

    async for event in deep_research_pipeline(
        "Test query",
        "english"
    ):
        events.append(event)

    joined_events = " ".join(events)

    assert "error" in joined_events
    assert "done" in joined_events