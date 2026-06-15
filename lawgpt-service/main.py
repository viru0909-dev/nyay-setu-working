"""
main.py — Nyay Setu LawGPT Service entrypoint.

A standalone FastAPI microservice providing RAG retrieval over Indian
legal documents. Spring Boot's RagService.java calls POST /context
to get relevant chunks; the LLM call remains in VakilFriendService.java.

Usage:
    uvicorn main:app --reload --port 8001
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

import jwt
import os

security = HTTPBearer(auto_error=False)

JWT_SECRET: str = os.getenv("JWT_SECRET", "")
JWT_ALGORITHM: str = "HS256"

def require_auth(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    token = credentials.credentials
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    try:
        jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

from lawgpt.retriever import load_vectorstore, is_index_loaded, get_chunk_count
from routers.context import router as context_router
from routers.document import router as document_router

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(levelname)-7s │ %(name)s │ %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("lawgpt")


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Attempt to load the FAISS index at startup."""
    try:
        load_vectorstore()
        count = get_chunk_count()
        logger.info("✅ FAISS index loaded — RAG ready (%s vectors)", count)
    except FileNotFoundError:
        logger.warning("⚠️ FAISS index not found — run ingest.py")
    except Exception as e:
        logger.error("❌ Failed to load FAISS index: %s", e)

    yield  # application runs here

    logger.info("🛑 LawGPT service shutting down")


# ── App ────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Nyay Setu LawGPT Service",
    version="0.1.0",
    description="RAG microservice for Vakil Friend legal AI",
    lifespan=lifespan,
)

# Mount protected routers with JWT auth
app.include_router(context_router, dependencies=[Depends(require_auth)])
app.include_router(document_router, dependencies=[Depends(require_auth)])


# ── Open health endpoint (no auth required) ─────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "lawgpt"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
