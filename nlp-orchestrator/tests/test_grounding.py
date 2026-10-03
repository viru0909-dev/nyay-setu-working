"""
Unit tests for the Phase 2 grounding module (issue #674).

The retrieval facade is mocked, so these tests need no models, no vector store,
and no network. `chunker.count_tokens` is patched where a deterministic token
budget is required, so the suite does not depend on whether tiktoken is
installed.
"""

import os
import sys
from pathlib import Path

import pytest

# Ensure the orchestrator root is importable and config does not sys.exit when
# GROQ_API_KEY is absent in the test environment (CI sets a real key).
_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))
os.environ.setdefault("GROQ_API_KEY", "test-key")

import grounding  # noqa: E402
from services.retrieval.retriever import RetrievedChunk  # noqa: E402


def _chunk(text, *, score=0.9, doc_id="d1", title="Some Act", source="seed", idx=0):
    return RetrievedChunk(
        text=text,
        score=score,
        similarity=score,
        rerank_score=None,
        doc_id=doc_id,
        title=title,
        source=source,
        chunk_index=idx,
        metadata={"doc_id": doc_id, "title": title, "source": source},
    )


# ─── build_grounded_context ───────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_build_grounded_context_happy_path(mocker):
    chunks = [
        _chunk("Section 300 defines murder.", doc_id="bns", title="BNS", idx=0),
        _chunk("Section 103 prescribes punishment.", doc_id="bns", title="BNS", idx=1),
    ]
    retrieve = mocker.patch.object(
        grounding.retriever, "retrieve", new=mocker.AsyncMock(return_value=chunks)
    )
    mocker.patch.object(grounding.chunker, "count_tokens", return_value=10)

    context, sources = await grounding.build_grounded_context("what is murder")

    retrieve.assert_awaited_once()
    # Both passages present, each rendered as a citation block.
    assert "Section 300 defines murder." in context
    assert "Section 103 prescribes punishment." in context
    assert context.count("=== ") == 2
    assert "[doc_id=bns]" in context
    # Sources mirror exactly the included passages, in order.
    assert [s["chunk_index"] for s in sources] == [0, 1]
    assert sources[0]["doc_id"] == "bns"
    assert sources[0]["title"] == "BNS"
    assert sources[0]["source"] == "seed"
    assert sources[0]["score"] == pytest.approx(0.9)


@pytest.mark.asyncio
async def test_build_grounded_context_empty_when_no_hits(mocker):
    mocker.patch.object(
        grounding.retriever, "retrieve", new=mocker.AsyncMock(return_value=[])
    )
    context, sources = await grounding.build_grounded_context("nothing matches")
    assert context == ""
    assert sources == []


@pytest.mark.asyncio
async def test_build_grounded_context_forwards_top_k_and_min_score(mocker):
    retrieve = mocker.patch.object(
        grounding.retriever, "retrieve", new=mocker.AsyncMock(return_value=[])
    )
    await grounding.build_grounded_context("q", top_k=7, min_score=0.5)
    retrieve.assert_awaited_once_with("q", top_k=7, min_score=0.5)


@pytest.mark.asyncio
async def test_build_grounded_context_respects_token_budget(mocker):
    chunks = [
        _chunk("first passage", idx=0),
        _chunk("second passage", idx=1),
        _chunk("third passage", idx=2),
    ]
    mocker.patch.object(
        grounding.retriever, "retrieve", new=mocker.AsyncMock(return_value=chunks)
    )
    # Each block "costs" 1000 tokens; budget admits only the first two.
    mocker.patch.object(grounding.chunker, "count_tokens", return_value=1000)

    context, sources = await grounding.build_grounded_context(
        "q", max_context_tokens=2500
    )

    assert "first passage" in context
    assert "second passage" in context
    assert "third passage" not in context
    assert len(sources) == 2


@pytest.mark.asyncio
async def test_build_grounded_context_always_keeps_first_passage(mocker):
    chunks = [_chunk("a very long but highly relevant passage", idx=0)]
    mocker.patch.object(
        grounding.retriever, "retrieve", new=mocker.AsyncMock(return_value=chunks)
    )
    # First block alone exceeds the budget, but must still be included.
    mocker.patch.object(grounding.chunker, "count_tokens", return_value=5000)

    context, sources = await grounding.build_grounded_context(
        "q", max_context_tokens=100
    )

    assert "a very long but highly relevant passage" in context
    assert len(sources) == 1


# ─── merge_contexts ───────────────────────────────────────────────────────────


def test_merge_contexts_all_empty_returns_empty():
    assert grounding.merge_contexts("", "   ", None) == ""
    assert grounding.merge_contexts() == ""


def test_merge_contexts_single_input_returned_trimmed():
    ctx = "=== BNS [doc_id=bns] ===\nSection 300 text"
    assert grounding.merge_contexts("", ctx, "  ") == ctx


def test_merge_contexts_deduplicates_shared_blocks():
    local = (
        "=== BNS [doc_id=bns] ===\nSection 300 defines murder.\n\n"
        "=== Constitution [doc_id=coi] ===\nArticle 21 protects life."
    )
    kanoon = (
        "=== BNS (excerpt 2) [doc_id=bns] ===\nSection 300 defines murder.\n\n"
        "=== Judgment [doc_id=sc1] ===\nThe court held that intent matters."
    )
    merged = grounding.merge_contexts(local, kanoon)

    # The shared Section 300 body appears once despite different headers.
    assert merged.count("Section 300 defines murder.") == 1
    # The unique blocks from both contexts survive.
    assert "Article 21 protects life." in merged
    assert "The court held that intent matters." in merged
    # Three distinct passages remain.
    assert merged.count("=== ") == 3


def test_merge_contexts_preserves_first_occurrence_order():
    a = "=== A [doc_id=a] ===\nalpha body"
    b = "=== B [doc_id=b] ===\nbeta body"
    merged = grounding.merge_contexts(a, b)
    assert merged.index("alpha body") < merged.index("beta body")


def test_merge_contexts_handles_unheadered_text():
    # A plain string with no "=== " header is treated as one block.
    merged = grounding.merge_contexts("plain context one", "plain context two")
    assert "plain context one" in merged
    assert "plain context two" in merged
