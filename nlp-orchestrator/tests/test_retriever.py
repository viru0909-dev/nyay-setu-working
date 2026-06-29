"""
Unit tests for the reusable retrieval facade (services/retrieval/retriever.py).

These tests mock the heavy primitives (embedder, vector store, reranker) so the
facade's orchestration logic — candidate fetching, source filtering, rerank
toggling, top-k limiting, score thresholding, ingestion, and graceful
degradation — is exercised without any model downloads or a live Chroma store.

Run with: python -m pytest tests/test_retriever.py -v
"""

import os
import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

import pytest

# Ensure the orchestrator root is importable and config does not sys.exit when
# GROQ_API_KEY is absent in the test environment (CI sets a real key).
_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))
os.environ.setdefault("GROQ_API_KEY", "test-key")

from services.retrieval import retriever  # noqa: E402
from services.retrieval.retriever import RetrievedChunk  # noqa: E402

# ─── Helpers ──────────────────────────────────────────────────────────────────


def _raw(chunk, score, *, doc_id="d1", title="Doc 1", source="seed", idx=0):
    """Build a raw vectorstore.query row."""
    return {
        "chunk": chunk,
        "score": score,
        "metadata": {
            "doc_id": doc_id,
            "title": title,
            "source": source,
            "chunk_index": idx,
        },
    }


@pytest.fixture
def mocked_primitives(monkeypatch):
    """Patch embedder / vectorstore / reranker on the retriever module."""
    fake_embedder = MagicMock()
    fake_embedder.embed_async = AsyncMock(return_value=[[0.1, 0.2, 0.3]])
    fake_embedder.embed_sync = MagicMock(return_value=[[0.1, 0.2, 0.3]])

    fake_vectorstore = MagicMock()
    fake_vectorstore.query = MagicMock(return_value=[])
    fake_vectorstore.count = MagicMock(return_value=0)
    fake_vectorstore.has_doc = MagicMock(return_value=False)
    fake_vectorstore.upsert_chunks = MagicMock(return_value=0)

    fake_reranker = MagicMock()
    fake_reranker.rerank_async = AsyncMock(side_effect=lambda q, c, k, m: c[:k])
    fake_reranker.rerank_sync = MagicMock(side_effect=lambda q, c, k, m: c[:k])

    fake_chunker = MagicMock()
    fake_chunker.chunk_text = MagicMock(return_value=["chunk-a", "chunk-b"])

    monkeypatch.setattr(retriever, "embedder", fake_embedder)
    monkeypatch.setattr(retriever, "vectorstore", fake_vectorstore)
    monkeypatch.setattr(retriever, "rr", fake_reranker)
    monkeypatch.setattr(retriever, "chunker", fake_chunker)
    monkeypatch.setattr(retriever, "RETRIEVAL_ENABLED", True)
    return {
        "embedder": fake_embedder,
        "vectorstore": fake_vectorstore,
        "reranker": fake_reranker,
        "chunker": fake_chunker,
    }


# ─── RetrievedChunk ───────────────────────────────────────────────────────────


def test_retrieved_chunk_from_raw_bi_encoder():
    rc = RetrievedChunk.from_raw(_raw("hello", 0.87, doc_id="abc", title="T", idx=3))
    assert rc.text == "hello"
    assert rc.similarity == pytest.approx(0.87)
    assert rc.rerank_score is None
    assert rc.score == pytest.approx(0.87)  # effective == similarity when no rerank
    assert rc.doc_id == "abc"
    assert rc.title == "T"
    assert rc.source == "seed"
    assert rc.chunk_index == 3


def test_retrieved_chunk_effective_score_uses_rerank():
    raw = _raw("x", 0.40)
    raw["rerank_score"] = 9.5
    rc = RetrievedChunk.from_raw(raw)
    assert rc.similarity == pytest.approx(0.40)
    assert rc.rerank_score == pytest.approx(9.5)
    assert rc.score == pytest.approx(9.5)  # effective switches to rerank score


def test_retrieved_chunk_defaults_for_missing_metadata():
    rc = RetrievedChunk.from_raw({"chunk": "body", "score": 0.5})
    assert rc.title == "Untitled"
    assert rc.doc_id == ""
    assert rc.chunk_index == -1


def test_as_context_block_includes_citation_header():
    rc = RetrievedChunk.from_raw(_raw("the body", 0.5, doc_id="42", title="BNS 103"))
    block = rc.as_context_block()
    assert "BNS 103" in block
    assert "doc_id=42" in block
    assert "the body" in block


# ─── retrieve() ───────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_retrieve_happy_path_orders_and_types(mocked_primitives):
    mocked_primitives["vectorstore"].query.return_value = [
        _raw("first", 0.9, doc_id="a"),
        _raw("second", 0.7, doc_id="b"),
    ]
    out = await retriever.retrieve("murder punishment", top_k=2, rerank=False)
    assert len(out) == 2
    assert all(isinstance(c, RetrievedChunk) for c in out)
    assert out[0].text == "first"
    assert out[1].doc_id == "b"


@pytest.mark.asyncio
async def test_retrieve_empty_query_returns_empty(mocked_primitives):
    assert await retriever.retrieve("   ") == []
    mocked_primitives["embedder"].embed_async.assert_not_called()


@pytest.mark.asyncio
async def test_retrieve_disabled_flag_returns_empty(monkeypatch, mocked_primitives):
    monkeypatch.setattr(retriever, "RETRIEVAL_ENABLED", False)
    assert await retriever.retrieve("anything") == []
    mocked_primitives["embedder"].embed_async.assert_not_called()


@pytest.mark.asyncio
async def test_retrieve_embedder_unavailable_returns_empty(mocked_primitives):
    mocked_primitives["embedder"].embed_async.return_value = None
    assert await retriever.retrieve("query") == []
    mocked_primitives["vectorstore"].query.assert_not_called()


@pytest.mark.asyncio
async def test_retrieve_no_candidates_returns_empty(mocked_primitives):
    mocked_primitives["vectorstore"].query.return_value = []
    assert await retriever.retrieve("query") == []


@pytest.mark.asyncio
async def test_retrieve_top_k_limits_results(mocked_primitives):
    mocked_primitives["vectorstore"].query.return_value = [
        _raw(f"c{i}", 1.0 - i * 0.1, doc_id=str(i)) for i in range(10)
    ]
    out = await retriever.retrieve("q", top_k=3, rerank=False)
    assert len(out) == 3


@pytest.mark.asyncio
async def test_retrieve_fetch_k_never_below_top_k(mocked_primitives):
    mocked_primitives["vectorstore"].query.return_value = [_raw("c", 0.5)]
    await retriever.retrieve("q", top_k=8, fetch_k=2, rerank=False)
    # fetch_k passed to the store must be clamped up to top_k (8), not 2.
    _, kwargs = mocked_primitives["vectorstore"].query.call_args
    assert kwargs["top_k"] == 8


@pytest.mark.asyncio
async def test_retrieve_source_filter(mocked_primitives):
    mocked_primitives["vectorstore"].query.return_value = [
        _raw("seed-chunk", 0.9, source="seed"),
        _raw("kanoon-chunk", 0.8, source="indian_kanoon"),
    ]
    out = await retriever.retrieve("q", source="seed", rerank=False)
    assert len(out) == 1
    assert out[0].source == "seed"


@pytest.mark.asyncio
async def test_retrieve_min_score_threshold(mocked_primitives):
    mocked_primitives["vectorstore"].query.return_value = [
        _raw("strong", 0.92),
        _raw("weak", 0.31),
    ]
    out = await retriever.retrieve("q", min_score=0.5, rerank=False)
    assert [c.text for c in out] == ["strong"]


@pytest.mark.asyncio
async def test_retrieve_runs_reranker_when_enabled(mocked_primitives):
    cands = [_raw("a", 0.5), _raw("b", 0.6), _raw("c", 0.7)]
    mocked_primitives["vectorstore"].query.return_value = cands
    out = await retriever.retrieve("q", top_k=2, rerank=True)
    mocked_primitives["reranker"].rerank_async.assert_awaited_once()
    assert len(out) == 2


@pytest.mark.asyncio
async def test_retrieve_skips_reranker_when_disabled(mocked_primitives):
    mocked_primitives["vectorstore"].query.return_value = [_raw("a", 0.5)]
    await retriever.retrieve("q", rerank=False)
    mocked_primitives["reranker"].rerank_async.assert_not_called()


# ─── retrieve_sync() ──────────────────────────────────────────────────────────


def test_retrieve_sync_happy_path(mocked_primitives):
    mocked_primitives["vectorstore"].query.return_value = [_raw("only", 0.8)]
    out = retriever.retrieve_sync("q", rerank=False)
    assert len(out) == 1
    assert out[0].text == "only"
    mocked_primitives["embedder"].embed_sync.assert_called_once()


def test_retrieve_sync_embedder_unavailable(mocked_primitives):
    mocked_primitives["embedder"].embed_sync.return_value = None
    assert retriever.retrieve_sync("q") == []


# ─── ingest_documents() ───────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_ingest_documents_chunks_embeds_and_upserts(mocked_primitives):
    mocked_primitives["embedder"].embed_async.return_value = [[0.0], [0.1]]
    mocked_primitives["vectorstore"].upsert_chunks.return_value = 2
    n = await retriever.ingest_documents(
        [{"doc_id": "bns_103", "text": "Section 103 ...", "title": "BNS 103"}]
    )
    assert n == 2
    mocked_primitives["chunker"].chunk_text.assert_called_once()
    args, kwargs = mocked_primitives["vectorstore"].upsert_chunks.call_args
    assert kwargs["doc_id"] == "bns_103"
    assert kwargs["base_metadata"]["source"] == "corpus"


@pytest.mark.asyncio
async def test_ingest_documents_skips_existing(mocked_primitives):
    mocked_primitives["vectorstore"].has_doc.return_value = True
    n = await retriever.ingest_documents([{"doc_id": "d", "text": "t"}])
    assert n == 0
    mocked_primitives["chunker"].chunk_text.assert_not_called()


@pytest.mark.asyncio
async def test_ingest_documents_skips_empty(mocked_primitives):
    n = await retriever.ingest_documents(
        [{"doc_id": "", "text": "t"}, {"doc_id": "d", "text": "   "}]
    )
    assert n == 0
    mocked_primitives["vectorstore"].upsert_chunks.assert_not_called()


@pytest.mark.asyncio
async def test_ingest_documents_respects_per_doc_source_and_metadata(mocked_primitives):
    mocked_primitives["embedder"].embed_async.return_value = [[0.0], [0.1]]
    mocked_primitives["vectorstore"].upsert_chunks.return_value = 2
    await retriever.ingest_documents(
        [
            {
                "doc_id": "x",
                "text": "body",
                "source": "indian_kanoon",
                "metadata": {"court": "SC"},
            }
        ]
    )
    _, kwargs = mocked_primitives["vectorstore"].upsert_chunks.call_args
    assert kwargs["base_metadata"]["source"] == "indian_kanoon"
    assert kwargs["base_metadata"]["court"] == "SC"


# ─── introspection ────────────────────────────────────────────────────────────


def test_corpus_size_delegates_to_store(mocked_primitives):
    mocked_primitives["vectorstore"].count.return_value = 1234
    assert retriever.corpus_size() == 1234


def test_is_available_true_when_enabled_and_populated(mocked_primitives):
    mocked_primitives["vectorstore"].count.return_value = 5
    assert retriever.is_available() is True


def test_is_available_false_when_empty(mocked_primitives):
    mocked_primitives["vectorstore"].count.return_value = 0
    assert retriever.is_available() is False


def test_is_available_false_when_disabled(monkeypatch, mocked_primitives):
    monkeypatch.setattr(retriever, "RETRIEVAL_ENABLED", False)
    mocked_primitives["vectorstore"].count.return_value = 5
    assert retriever.is_available() is False


# ─── package surface ──────────────────────────────────────────────────────────


def test_package_lazy_exports_resolve():
    import services.retrieval as pkg

    assert pkg.retrieve is retriever.retrieve
    assert pkg.RetrievedChunk is RetrievedChunk
    assert "ingest_documents" in dir(pkg)


def test_package_unknown_attribute_raises():
    import services.retrieval as pkg

    with pytest.raises(AttributeError):
        _ = pkg.does_not_exist
