"""
Seed-corpus ingestion script.

Reads .txt files from `nlp-orchestrator/data/seed/` and embeds them into the
vector store. Filenames must follow the convention:

    <doc_id>__<title_with_underscores>.txt

Examples:
    bns_section_103__BNS_Section_103_Punishment_for_Murder.txt
    constitution_article_21__Article_21_Right_to_Life_and_Personal_Liberty.txt
    sc_kesavananda_bharati_1973__Kesavananda_Bharati_v_State_of_Kerala_1973.txt

Usage (from the nlp-orchestrator directory):

    python -m services.retrieval.seed_ingest

Re-running is safe: docs already present in the store are skipped.
"""

import asyncio
import logging
import sys
from pathlib import Path

# Allow running as a script: prepend the orchestrator dir to sys.path so
# `from config import ...` and `from services.retrieval import ...` resolve.
_ORCHESTRATOR_DIR = Path(__file__).resolve().parents[2]
if str(_ORCHESTRATOR_DIR) not in sys.path:
    sys.path.insert(0, str(_ORCHESTRATOR_DIR))

from config import EMBEDDING_MODEL, CHROMA_PATH  # noqa: E402
from services.retrieval import chunker, embedder, vectorstore  # noqa: E402

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(message)s",
)
logger = logging.getLogger("seed-ingest")

SEED_DIR = _ORCHESTRATOR_DIR / "data" / "seed"


def _parse_filename(path: Path) -> tuple[str, str]:
    """Extract (doc_id, human-readable title) from the filename stem."""
    stem = path.stem
    if "__" in stem:
        doc_id, _, title_part = stem.partition("__")
        title = title_part.replace("_", " ")
    else:
        doc_id = stem
        title = stem.replace("_", " ")
    return doc_id, title


async def ingest_file(path: Path) -> int:
    """Embed and store one seed file. Returns the number of chunks added."""
    doc_id, title = _parse_filename(path)

    if vectorstore.has_doc(doc_id, CHROMA_PATH):
        logger.info(f"[skip] {doc_id}: already in store")
        return 0

    text = path.read_text(encoding="utf-8", errors="ignore")
    chunks = chunker.chunk_text(text, max_tokens=512, overlap_tokens=64)
    if not chunks:
        logger.warning(f"[skip] {doc_id}: produced no chunks")
        return 0

    embeddings = await embedder.embed_async(chunks, EMBEDDING_MODEL)
    if not embeddings:
        logger.error(f"[fail] {doc_id}: embedder unavailable")
        return 0

    added = vectorstore.upsert_chunks(
        doc_id=doc_id,
        chunks=chunks,
        embeddings=embeddings,
        base_metadata={"title": title, "source": "seed"},
        persist_dir=CHROMA_PATH,
    )
    logger.info(f"[ok]   {doc_id}: {added} chunks ({title!r})")
    return added


async def main() -> None:
    if not SEED_DIR.exists():
        logger.error(f"Seed directory missing: {SEED_DIR}")
        logger.error(
            "Create it and drop .txt files named <doc_id>__<title>.txt. "
            "See data/seed/README.md for the conventions."
        )
        return

    files = sorted(SEED_DIR.glob("*.txt"))
    if not files:
        logger.warning(f"No .txt files found in {SEED_DIR}")
        return

    logger.info(f"Ingesting {len(files)} seed files into {CHROMA_PATH}")
    total = 0
    for f in files:
        total += await ingest_file(f)

    final_count = vectorstore.count(CHROMA_PATH)
    logger.info(f"Done. {total} new chunks. Store size: {final_count}")


if __name__ == "__main__":
    asyncio.run(main())
