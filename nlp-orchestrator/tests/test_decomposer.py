"""Unit tests for ``decomposer.decompose_query``.

These tests exercise the Layer-1 query decomposition logic in complete
isolation from the Groq LPU by mocking the async chat-completion call.
They cover the happy path, the 5-sub-question cap, the domain guardrail
(empty array), and every fallback branch (malformed JSON, wrong JSON
shape, and transport-level exceptions), as well as verifying that the
request is built with the expected model and sampling parameters.

Resolves #852.
"""

import os

# decomposer.py imports config.py, which calls sys.exit(1) when GROQ_API_KEY
# is unset. Provide a dummy key BEFORE importing so the suite is runnable
# standalone (no real credentials, no network — every call is mocked).
os.environ.setdefault("GROQ_API_KEY", "test-key-decomposer")

from unittest.mock import AsyncMock, MagicMock, patch  # noqa: E402

import pytest  # noqa: E402

from config import GROQ_MODEL_FAST  # noqa: E402
from decomposer import DECOMPOSE_PROMPT, decompose_query  # noqa: E402

PATCH_TARGET = "decomposer.client.chat.completions.create"


def _mock_completion(content):
    """Build a fake Groq chat-completion whose first choice carries ``content``.

    Mirrors the real shape consumed by the decomposer:
    ``response.choices[0].message.content``.
    """
    message = MagicMock()
    message.content = content
    choice = MagicMock()
    choice.message = message
    response = MagicMock()
    response.choices = [choice]
    return response


# --------------------------------------------------------------------------- #
# Happy path
# --------------------------------------------------------------------------- #
@pytest.mark.asyncio
@patch(PATCH_TARGET, new_callable=AsyncMock)
async def test_returns_parsed_sub_questions(mock_create):
    mock_create.return_value = _mock_completion(
        '["What does Section 304A IPC say?", "What is the penalty?"]'
    )

    result = await decompose_query("Explain rash and negligent driving")

    assert result == [
        "What does Section 304A IPC say?",
        "What is the penalty?",
    ]


@pytest.mark.asyncio
@patch(PATCH_TARGET, new_callable=AsyncMock)
async def test_result_is_list_of_strings(mock_create):
    mock_create.return_value = _mock_completion('["What is IPC?", "What is BNS?"]')

    result = await decompose_query("Explain IPC and BNS")

    assert isinstance(result, list)
    assert result and all(isinstance(q, str) for q in result)


@pytest.mark.asyncio
@patch(PATCH_TARGET, new_callable=AsyncMock)
async def test_single_sub_question_preserved(mock_create):
    mock_create.return_value = _mock_completion('["Only one focused question?"]')

    result = await decompose_query("A narrow question")

    assert result == ["Only one focused question?"]


@pytest.mark.asyncio
@patch(PATCH_TARGET, new_callable=AsyncMock)
async def test_surrounding_whitespace_is_stripped(mock_create):
    mock_create.return_value = _mock_completion('\n\n  ["Q1", "Q2"]  \n')

    result = await decompose_query("Query with whitespace in response")

    assert result == ["Q1", "Q2"]


# --------------------------------------------------------------------------- #
# Cap at five
# --------------------------------------------------------------------------- #
@pytest.mark.asyncio
@patch(PATCH_TARGET, new_callable=AsyncMock)
async def test_caps_at_five_sub_questions(mock_create):
    mock_create.return_value = _mock_completion(
        '["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7"]'
    )

    result = await decompose_query("A very broad legal query")

    assert result == ["Q1", "Q2", "Q3", "Q4", "Q5"]


@pytest.mark.asyncio
@patch(PATCH_TARGET, new_callable=AsyncMock)
async def test_exactly_five_sub_questions_unchanged(mock_create):
    mock_create.return_value = _mock_completion('["Q1", "Q2", "Q3", "Q4", "Q5"]')

    result = await decompose_query("Query yielding exactly five")

    assert len(result) == 5


# --------------------------------------------------------------------------- #
# Domain guardrail: non-legal queries -> empty array
# --------------------------------------------------------------------------- #
@pytest.mark.asyncio
@patch(PATCH_TARGET, new_callable=AsyncMock)
async def test_non_legal_query_returns_empty_list(mock_create):
    # Per the prompt's guardrail the model returns [] for off-domain queries.
    mock_create.return_value = _mock_completion("[]")

    result = await decompose_query("What is the boiling point of water?")

    assert result == []


# --------------------------------------------------------------------------- #
# Fallback: malformed / wrong-shape JSON -> [query]
# --------------------------------------------------------------------------- #
@pytest.mark.asyncio
@patch(PATCH_TARGET, new_callable=AsyncMock)
async def test_invalid_json_falls_back_to_original_query(mock_create):
    mock_create.return_value = _mock_completion("this is not json at all")
    query = "What happens in a road accident case?"

    result = await decompose_query(query)

    assert result == [query]


@pytest.mark.asyncio
@patch(PATCH_TARGET, new_callable=AsyncMock)
async def test_markdown_fenced_json_falls_back(mock_create):
    # The decomposer does not strip ``` fences, so fenced output is not
    # valid JSON and must fall back to the original query.
    mock_create.return_value = _mock_completion('```json\n["Q1", "Q2"]\n```')
    query = "Explain bail provisions under BNSS"

    result = await decompose_query(query)

    assert result == [query]


@pytest.mark.asyncio
@patch(PATCH_TARGET, new_callable=AsyncMock)
async def test_json_object_instead_of_list_falls_back(mock_create):
    mock_create.return_value = _mock_completion('{"question": "What is IPC?"}')
    query = "Explain the Indian Penal Code"

    result = await decompose_query(query)

    assert result == [query]


@pytest.mark.asyncio
@patch(PATCH_TARGET, new_callable=AsyncMock)
async def test_json_scalar_string_falls_back(mock_create):
    mock_create.return_value = _mock_completion('"just a single string"')
    query = "Define mens rea"

    result = await decompose_query(query)

    assert result == [query]


@pytest.mark.asyncio
@patch(PATCH_TARGET, new_callable=AsyncMock)
async def test_list_with_non_string_items_falls_back(mock_create):
    mock_create.return_value = _mock_completion("[1, 2, 3]")
    query = "List the fundamental rights"

    result = await decompose_query(query)

    assert result == [query]


@pytest.mark.asyncio
@patch(PATCH_TARGET, new_callable=AsyncMock)
async def test_list_with_mixed_types_falls_back(mock_create):
    mock_create.return_value = _mock_completion('["valid question?", 42]')
    query = "Explain Article 21"

    result = await decompose_query(query)

    assert result == [query]


# --------------------------------------------------------------------------- #
# Fallback: transport-level failures -> [query]
# --------------------------------------------------------------------------- #
@pytest.mark.asyncio
@patch(PATCH_TARGET, new_callable=AsyncMock)
async def test_api_exception_falls_back_to_original_query(mock_create):
    mock_create.side_effect = Exception("Groq API unavailable")
    query = "What is Article 21?"

    result = await decompose_query(query)

    assert result == [query]


@pytest.mark.asyncio
@patch(PATCH_TARGET, new_callable=AsyncMock)
async def test_timeout_error_falls_back_to_original_query(mock_create):
    mock_create.side_effect = TimeoutError("request timed out")
    query = "What is the procedure for filing an FIR?"

    result = await decompose_query(query)

    assert result == [query]


@pytest.mark.asyncio
@patch(PATCH_TARGET, new_callable=AsyncMock)
async def test_result_is_always_a_list_on_failure(mock_create):
    mock_create.side_effect = RuntimeError("boom")

    result = await decompose_query("anything")

    assert isinstance(result, list)


# --------------------------------------------------------------------------- #
# Request construction
# --------------------------------------------------------------------------- #
@pytest.mark.asyncio
@patch(PATCH_TARGET, new_callable=AsyncMock)
async def test_calls_groq_once_with_expected_parameters(mock_create):
    mock_create.return_value = _mock_completion('["Q1"]')

    await decompose_query("Some legal query")

    mock_create.assert_awaited_once()
    kwargs = mock_create.call_args.kwargs
    assert kwargs["model"] == GROQ_MODEL_FAST
    assert kwargs["temperature"] == 0.3
    assert kwargs["max_tokens"] == 512


@pytest.mark.asyncio
@patch(PATCH_TARGET, new_callable=AsyncMock)
async def test_user_query_is_embedded_in_prompt(mock_create):
    mock_create.return_value = _mock_completion('["Q1"]')
    query = "What is the punishment under Section 302 IPC?"

    await decompose_query(query)

    kwargs = mock_create.call_args.kwargs
    sent = kwargs["messages"][0]["content"]
    assert query in sent
    assert sent == DECOMPOSE_PROMPT.format(query=query)


@pytest.mark.asyncio
@patch(PATCH_TARGET, new_callable=AsyncMock)
async def test_message_uses_user_role(mock_create):
    mock_create.return_value = _mock_completion('["Q1"]')

    await decompose_query("Query")

    kwargs = mock_create.call_args.kwargs
    assert kwargs["messages"][0]["role"] == "user"
