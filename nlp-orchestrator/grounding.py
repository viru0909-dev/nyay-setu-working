"""
Corpus grounding for the legal-reasoning pipeline (Phase 2 — issue #674).

This module turns a user query into ready-to-inject **grounded context** by
calling the reusable retrieval facade from Phase 1 (#673) and assembling the
retrieved passages into a single, citation-preserving, token-budgeted string.

How this differs from `services.kanoon_search.build_kanoon_context`
-------------------------------------------------------------------
`build_kanoon_context` always performs a *live Indian Kanoon HTTP search*
first, then vector-searches over the (live + seed) corpus. It is therefore
gated by an API token and a circuit breaker, and it labels everything it
returns as "Indian Kanoon" context even when the served chunks actually came
from the local seed corpus.

`build_grounded_context` is **Kanoon-independent**: it grounds purely against
the persistent local corpus via `retriever.retrieve()`. No network, no token,
no circuit breaker. That makes grounding available even when the live Kanoon
search is unavailable or disabled, and it is the path the reasoning pipeline
uses by default.

The two are complementary. `merge_contexts` lets the pipeline combine local
corpus grounding with any live-Kanoon context into one de-duplicated block.

Public API
----------
    await build_grounded_context(query, *, top_k=..., min_score=...,
                                 max_context_tokens=...)
        -> (context_str, sources)
    merge_contexts(*contexts) -> str
"""

import logging
import re

from services.retrieval import chunker, retriever

logger = logging.getLogger("grounding")

# Default token budget for the assembled context block. Kept comfortably below
# typical model context windows so the grounded passages never crowd out the
# system prompt, the question, and the model's own answer.
DEFAULT_MAX_CONTEXT_TOKENS = 3000


# ─── Building grounded context ────────────────────────────────────────────────


async def build_grounded_context(
    query: str,
    *,
    top_k: int | None = None,
    min_score: float = 0.0,
    max_context_tokens: int = DEFAULT_MAX_CONTEXT_TOKENS,
) -> tuple[str, list[dict]]:
    """
    Retrieve and assemble grounded legal context for `query`.

    Uses the Phase 1 retrieval facade to fetch the most relevant corpus
    passages, then concatenates them into a single citation-friendly string
    (one ``=== Title [doc_id=...] ===`` block per passage), stopping before the
    assembled text exceeds ``max_context_tokens``. The first passage is always
    included even if it alone exceeds the budget, so a relevant-but-long top hit
    is never silently dropped.

    Args:
        query:              the user's legal question.
        top_k:              max passages to retrieve (default: facade/config).
        min_score:          drop passages below this effective score.
        max_context_tokens: soft cap on the assembled context size.

    Returns:
        ``(context_str, sources)`` where ``sources`` is a list of provenance
        dicts (``doc_id``, ``title``, ``source``, ``score``, ``chunk_index``)
        for exactly the passages included in ``context_str``. Returns
        ``("", [])`` when retrieval yields nothing or is unavailable — callers
        can treat grounding as best-effort.
    """
    chunks = await retriever.retrieve(query, top_k=top_k, min_score=min_score)
    if not chunks:
        return "", []

    blocks: list[str] = []
    sources: list[dict] = []
    used_tokens = 0

    for ch in chunks:
        block = ch.as_context_block()
        block_tokens = chunker.count_tokens(block)
        # Respect the budget, but guarantee at least the top passage.
        if blocks and used_tokens + block_tokens > max_context_tokens:
            break
        blocks.append(block)
        used_tokens += block_tokens
        sources.append(
            {
                "doc_id": ch.doc_id,
                "title": ch.title,
                "source": ch.source,
                "score": round(ch.score, 4),
                "chunk_index": ch.chunk_index,
            }
        )

    context = "\n\n".join(blocks)
    logger.info(
        "build_grounded_context: query=%r | served=%d/%d chunks | tokens~%d",
        query[:40],
        len(blocks),
        len(chunks),
        used_tokens,
    )
    return context, sources


# ─── Merging contexts ─────────────────────────────────────────────────────────


# A context block starts at a line of the form "=== ... ===".
_BLOCK_BOUNDARY = re.compile(r"(?m)(?=^=== )")


def _split_blocks(context: str) -> list[str]:
    """Split a formatted context string into individual ``=== ... ===`` blocks.

    Works for both the grounding format produced here and the kanoon_search
    format, since both delimit passages with a leading ``=== `` header line. A
    context with no such header is returned as a single block.
    """
    if not context or not context.strip():
        return []
    return [b.strip() for b in _BLOCK_BOUNDARY.split(context) if b.strip()]


def _block_body_key(block: str) -> str:
    """Normalized de-dup key for a block, based on its body (header ignored).

    Two passages with identical text but different headers (e.g. an "excerpt 2"
    suffix) collapse to the same key, which is what lets us drop the seed-corpus
    chunks that appear in both a local-grounding context and a live-Kanoon
    context.
    """
    lines = block.splitlines()
    body = "\n".join(lines[1:]) if lines and lines[0].startswith("=== ") else block
    return " ".join(body.split()).lower()


def merge_contexts(*contexts: str) -> str:
    """
    Merge several formatted context strings into one, de-duplicating passages.

    Empty / whitespace-only inputs are ignored. A single non-empty input is
    returned unchanged (aside from trimming). When two or more inputs are
    present, their blocks are concatenated in order with duplicates removed
    (first occurrence wins, compared by normalized body text), so overlapping
    seed chunks are not repeated.
    """
    present = [c for c in contexts if c and c.strip()]
    if not present:
        return ""
    if len(present) == 1:
        return present[0].strip()

    merged: list[str] = []
    seen: set[str] = set()
    for ctx in present:
        for block in _split_blocks(ctx):
            key = _block_body_key(block)
            if not key or key in seen:
                continue
            seen.add(key)
            merged.append(block)
    return "\n\n".join(merged)
