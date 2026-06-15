import pytest
from unittest.mock import AsyncMock, patch

from decomposer import decompose_query


@pytest.mark.asyncio
@patch("decomposer.client.chat.completions.create", new_callable=AsyncMock)
async def test_returns_list_of_strings(mock_create):
    mock_create.return_value.choices = [
        type(
            "obj",
            (),
            {
                "message": type(
                    "obj",
                    (),
                    {
                        "content": '["What is IPC?", "What is BNS?"]'
                    }
                )()
            }
        )
    ]

    result = await decompose_query("Explain IPC and BNS")

    assert isinstance(result, list)
    assert all(isinstance(q, str) for q in result)


@pytest.mark.asyncio
@patch("decomposer.client.chat.completions.create", new_callable=AsyncMock)
async def test_maximum_five_subquestions(mock_create):
    mock_create.return_value.choices = [
        type(
            "obj",
            (),
            {
                "message": type(
                    "obj",
                    (),
                    {
                        "content": '["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"]'
                    }
                )()
            }
        )
    ]

    result = await decompose_query("Complex legal query")

    assert len(result) == 5


@pytest.mark.asyncio
@patch("decomposer.client.chat.completions.create", new_callable=AsyncMock)
async def test_json_parsing_failure_returns_original_query(mock_create):
    mock_create.return_value.choices = [
        type(
            "obj",
            (),
            {
                "message": type(
                    "obj",
                    (),
                    {
                        "content": "INVALID JSON"
                    }
                )()
            }
        )
    ]

    query = "What happens in a road accident case?"

    result = await decompose_query(query)

    assert result == [query]


@pytest.mark.asyncio
@patch("decomposer.client.chat.completions.create", new_callable=AsyncMock)
async def test_api_failure_returns_original_query(mock_create):
    mock_create.side_effect = Exception("API failure")

    query = "What is Article 21?"

    result = await decompose_query(query)

    assert result == [query]

