"""
main.py — Nyay Setu LawGPT Service entrypoint (ChromaDB backend).

Persistent RAG microservice over Indian legal documents with
instant startup and statute-scoped metadata filtering.

Usage:
    uvicorn main:app --reload --port 8001
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI

from lawgpt.retriever import load_vectorstore, is_index_loaded, get_chunk_count
from routers.context import router as context_router
from routers.document import router as document_router
from routers.summarize import router as summarize_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("lawgpt")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Load ChromaDB index at startup (instant due to disk persistence)."""
    try:
        load_vectorstore()
        count = get_chunk_count()
        logger.info("ChromaDB index loaded - RAG ready (%s vectors)", count)
    except FileNotFoundError:
        logger.warning("ChromaDB not found - run ingest.py")
    except Exception as e:
        logger.error("Failed to load ChromaDB index: %s", e)
    yield
    logger.info("LawGPT service shutting down")


app = FastAPI(
    title="Nyay Setu LawGPT Service",
    version="0.2.0",
    description="RAG microservice for Vakil Friend legal AI (ChromaDB backend)",
    lifespan=lifespan,
)

app.include_router(context_router)
app.include_router(document_router)
app.include_router(summarize_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
