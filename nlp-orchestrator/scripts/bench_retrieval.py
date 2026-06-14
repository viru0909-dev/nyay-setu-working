"""
Retrieval benchmark: compare legacy vs new context for a fixed query set.

Runs the same set of queries through:
  (a) the legacy whole-doc concatenation path, and
  (b) the new chunk + embed + rerank path

then prints side-by-side statistics:
  * context length (chars + approx tokens)
  * doc-id overlap
  * top-1 doc title
  * which source ("indian_kanoon" live vs "seed" cached)

Usage from `nlp-orchestrator/`:
    python -m scripts.bench_retrieval [path/to/queries.txt]

If no query file is supplied, a small built-in set of representative legal
questions is used.
"""

import asyncio
import logging
import sys
from pathlib import Path

# Allow running as a script: orchestrator root on sys.path.
_ORCH = Path(__file__).resolve().parents[1]
if str(_ORCH) not in sys.path:
    sys.path.insert(0, str(_ORCH))

import config  # noqa: E402
from services import kanoon_search  # noqa: E402
from services.retrieval import chunker  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")
logger = logging.getLogger("bench")

# Silence HF Hub's chatty download progress; we want to see retrieval logs only.
logging.getLogger("huggingface_hub").setLevel(logging.WARNING)
logging.getLogger("sentence_transformers").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)

DEFAULT_QUERIES = [
    "What is the punishment under BNS Section 103 for murder?",
    "How do I claim compensation under the Motor Vehicles Act after an accident?",
    "What does Article 21 of the Constitution protect?",
    "What is the procedure to file a writ petition in the Supreme Court?",
    "What are my rights if I am arrested without a warrant?",
    "How do I recover a security deposit that my landlord is refusing to return?",
    "What is the limitation period for filing a consumer complaint?",
    "What is the difference between cognizable and non-cognizable offences?",
    "When can the right to free speech under Article 19 be restricted?",
    "What is the role of Section 63(4) of the Bharatiya Sakshya Adhiniyam?",
]


def load_queries(path: str | None) -> list[str]:
    if path is None:
        return DEFAULT_QUERIES
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(p)
    return [line.strip() for line in p.read_text().splitlines() if line.strip()]


async def run_one(query: str) -> dict:
    """Run both paths for a single query and return a stats dict."""
    # Force legacy path.
    config.RETRIEVAL_ENABLED = False
    legacy_ctx, legacy_meta = await kanoon_search.build_kanoon_context(
        query, max_results=3
    )

    # Force new path.
    config.RETRIEVAL_ENABLED = True
    new_ctx, new_meta = await kanoon_search.build_kanoon_context(query, max_results=3)

    legacy_ids = {m["doc_id"] for m in legacy_meta}
    new_ids = {m["doc_id"] for m in new_meta}

    return {
        "query": query,
        "legacy_chars": len(legacy_ctx),
        "legacy_tokens": chunker.count_tokens(legacy_ctx),
        "new_chars": len(new_ctx),
        "new_tokens": chunker.count_tokens(new_ctx),
        "legacy_top1": legacy_meta[0]["title"] if legacy_meta else "—",
        "new_top1": new_meta[0]["title"] if new_meta else "—",
        "new_top1_score": new_meta[0].get("score") if new_meta else None,
        "id_overlap": len(legacy_ids & new_ids),
        "legacy_n": len(legacy_meta),
        "new_n": len(new_meta),
    }


def fmt_row(s: dict) -> str:
    score = f"{s['new_top1_score']:.3f}" if s["new_top1_score"] is not None else "  —  "
    return (
        f"  Q: {s['query'][:78]!r}\n"
        f"    legacy: {s['legacy_n']} docs, {s['legacy_chars']:>6} chars, "
        f"~{s['legacy_tokens']:>5} tok   top1={s['legacy_top1'][:50]!r}\n"
        f"    new   : {s['new_n']} docs, {s['new_chars']:>6} chars, "
        f"~{s['new_tokens']:>5} tok   top1={s['new_top1'][:50]!r} (score {score})\n"
        f"    overlap of top doc IDs: {s['id_overlap']}\n"
    )


async def main():
    query_file = sys.argv[1] if len(sys.argv) > 1 else None
    queries = load_queries(query_file)

    print(f"\nBenchmark: {len(queries)} queries\n" + "─" * 80)

    stats: list[dict] = []
    for q in queries:
        s = await run_one(q)
        stats.append(s)
        print(fmt_row(s))

    # Aggregate.
    n = len(stats)
    if n == 0:
        return

    legacy_tok = sum(s["legacy_tokens"] for s in stats) / n
    new_tok = sum(s["new_tokens"] for s in stats) / n
    overlap = sum(s["id_overlap"] for s in stats) / n

    print("─" * 80)
    print("Aggregate:")
    print(f"  avg context tokens — legacy: ~{legacy_tok:.0f}   new: ~{new_tok:.0f}")
    print(f"  avg top-doc overlap (out of 3): {overlap:.2f}")
    print(
        "  Lower context tokens with same/better top docs = "
        "tighter grounding, smaller prompt, lower LLM cost.\n"
    )


if __name__ == "__main__":
    asyncio.run(main())
