"""
routers/context.py — API endpoints for Nyay Setu LawGPT microservice.

Provides:
    POST /context  — RAG retrieval (called by Java RagService proxy)
    POST /chat     — Standalone chat with LLM + RAG (for testing / future use)
    GET  /health   — Service health check
"""

import logging
import os
import uuid
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from lawgpt.retriever import retrieve, is_index_loaded, get_chunk_count

load_dotenv()
logger = logging.getLogger("lawgpt")

router = APIRouter()


# ── Request / Response models ──────────────────────────────────────────────────

class ContextRequest(BaseModel):
    question: str
    max_results: int = Field(default=3, ge=1, le=20)


class ContextResponse(BaseModel):
    context: str
    sources: List[str]


class ChatRequest(BaseModel):
    question: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    sources: List[str]
    session_id: str
    model_used: str


class HealthResponse(BaseModel):
    status: str
    index_loaded: bool
    model: str
    chunk_count: Optional[int]


# ── LLM resolution (lazy, for /chat only) ─────────────────────────────────────

_llm = None
_llm_label: str = "none"


def _resolve_llm_label() -> str:
    """Determine which LLM backend will be used, without instantiating it."""
    if os.getenv("GROQ_API_KEY"):
        return "groq"
    elif os.getenv("GEMINI_API_KEY"):
        return "gemini"
    else:
        return "ollama"


def get_llm():
    """Lazy-initialise and return the LLM instance."""
    global _llm, _llm_label

    if _llm is not None:
        return _llm

    groq_key: Optional[str] = os.getenv("GROQ_API_KEY")
    gemini_key: Optional[str] = os.getenv("GEMINI_API_KEY")

    if groq_key:
        from langchain_groq import ChatGroq
        _llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.2,
            groq_api_key=groq_key,
        )
        _llm_label = "groq"
        logger.info("🤖 LLM backend: Groq (llama-3.3-70b-versatile)")
    elif gemini_key:
        from langchain_google_genai import ChatGoogleGenerativeAI
        _llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-pro",
            temperature=0.2,
            google_api_key=gemini_key,
        )
        _llm_label = "gemini"
        logger.info("🤖 LLM backend: Google Gemini (gemini-1.5-pro)")
    else:
        from langchain_community.llms import Ollama
        _llm = Ollama(
            model="llama3",
            base_url="http://localhost:11434",
            temperature=0.2,
        )
        _llm_label = "ollama"
        logger.info("🤖 LLM backend: Ollama (llama3, local)")

    return _llm


# ── Legal prompt template ──────────────────────────────────────────────────────

LEGAL_PROMPT_TEMPLATE: str = """You are Vakil Friend, the AI legal assistant of Nyay Setu.
You help Indian citizens understand their legal rights and navigate the judiciary.

Use ONLY the context provided below to answer the question.
Always cite the specific Act name and Section number when available.
If the context does not contain a clear answer, respond with:
"I could not find this in my legal database. Please consult a qualified
lawyer or visit your nearest district court."
Never invent section numbers, act names, or case names.

Context:
{context}

Question: {question}

Answer:
"""


# ══════════════════════════════════════════════════════════════════════════════
# POST /context — PRIMARY endpoint (called by Java RagService proxy)
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/context", response_model=ContextResponse)
async def get_context(request: ContextRequest) -> ContextResponse:
    """
    Retrieve top-k relevant legal chunks from the FAISS vector store.
    Does NOT call any LLM — returns raw retrieved context.
    """
    try:
        results = retrieve(query=request.question, k=request.max_results)
    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail="Legal database not initialized. Run 'python lawgpt/ingest.py' first.",
        )
    except Exception as e:
        logger.error("Context retrieval error: %s", e, exc_info=True)
        raise HTTPException(status_code=502, detail=str(e))

    if not results:
        return ContextResponse(
            context="No specific legal context found.",
            sources=[],
        )

    context_parts: List[str] = []
    sources: List[str] = []

    for doc in results:
        context_parts.append(f"- {doc.page_content}")
        source_name: str = doc.metadata.get("source", "unknown")
        page_num: int = doc.metadata.get("page", 0)
        source_label: str = f"{source_name} — page {page_num}"
        if source_label not in sources:
            sources.append(source_label)

    context: str = "\n\n".join(context_parts)
    return ContextResponse(context=context, sources=sources)


# ══════════════════════════════════════════════════════════════════════════════
# POST /chat — STANDALONE endpoint (for direct testing / future use)
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Retrieve context from FAISS, call an LLM with the legal prompt,
    and return a grounded answer with citations.
    """
    session_id: str = request.session_id or str(uuid.uuid4())

    # Retrieve context
    try:
        results = retrieve(query=request.question, k=5)
    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail="Legal database not initialized. Run 'python lawgpt/ingest.py' first.",
        )
    except Exception as e:
        logger.error("Chat retrieval error: %s", e, exc_info=True)
        raise HTTPException(status_code=502, detail=str(e))

    # Build context string
    context_parts: List[str] = []
    sources: List[str] = []

    for doc in results:
        context_parts.append(f"- {doc.page_content}")
        source_name: str = doc.metadata.get("source", "unknown")
        page_num: int = doc.metadata.get("page", 0)
        source_label: str = f"{source_name} — page {page_num}"
        if source_label not in sources:
            sources.append(source_label)

    context: str = "\n\n".join(context_parts) if context_parts else "No context available."

    # Call LLM
    prompt: str = LEGAL_PROMPT_TEMPLATE.format(context=context, question=request.question)
    
    from utils.query_cache import get_cached_response, set_cached_response, is_static_query
    
    cached_answer = None
    if is_static_query(request.question):
        cached_answer = get_cached_response(request.question)
        if cached_answer:
            logger.info("Cache hit for legal query")
            answer = cached_answer
        else:
            logger.info("Cache miss for legal query")
            
    if not cached_answer:
        try:
            llm = get_llm()
            answer_raw = llm.invoke(prompt)
            # LangChain LLMs may return AIMessage or str
            if hasattr(answer_raw, "content"):
                answer = answer_raw.content
            else:
                answer = answer_raw
                
            if is_static_query(request.question):
                set_cached_response(request.question, answer)
        except Exception as e:
            logger.error("LLM invocation error: %s", e, exc_info=True)
            raise HTTPException(status_code=502, detail=f"LLM error: {e}")

    return ChatResponse(
        answer=str(answer),
        sources=sources,
        session_id=session_id,
        model_used=_llm_label,
    )


# ══════════════════════════════════════════════════════════════════════════════
# GET /health — Service health check
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """Return service status including index availability and LLM backend."""
    return HealthResponse(
        status="ok",
        index_loaded=is_index_loaded(),
        model=_resolve_llm_label(),
        chunk_count=get_chunk_count(),
    )
