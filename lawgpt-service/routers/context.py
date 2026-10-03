"""
routers/context.py — API endpoints for Nyay Setu LawGPT microservice.

Provides:
    POST /context        — RAG retrieval (called by Java RagService)
    POST /context/filter — Statute-scoped retrieval (NEW)
    POST /chat           — Standalone chat with LLM + RAG
    GET  /health         — Service health check with available statutes
"""

import logging
import os
import uuid
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from lawgpt.retriever import (
    retrieve,
    retrieve_by_statute,
    is_index_loaded,
    get_chunk_count,
    retrieve_with_scores,
    get_available_statutes,
)

load_dotenv()
logger = logging.getLogger("lawgpt")

router = APIRouter()


class ContextRequest(BaseModel):
    question: str
    max_results: int = Field(default=3, ge=1, le=20)


class FilteredContextRequest(BaseModel):
    question: str
    statute: str = Field(..., description="Statute code (e.g., 'BNS', 'Constitution', 'IPC')")
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
    available_statutes: List[str]


class SearchItem(BaseModel):
    page_content: str
    source: str
    page: int
    relevance: float


class SearchRequest(BaseModel):
    query: str
    k: int = Field(default=5, ge=1, le=20)


_llm = None
_llm_label: str = "none"


def _resolve_llm_label() -> str:
    if os.getenv("GROQ_API_KEY"):
        return "groq"
    elif os.getenv("GEMINI_API_KEY"):
        return "gemini"
    else:
        return "ollama"


def get_llm():
    global _llm, _llm_label
    if _llm is not None:
        return _llm

    groq_key = os.getenv("GROQ_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")

    if groq_key:
        from langchain_groq import ChatGroq
        _llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.2, groq_api_key=groq_key)
        _llm_label = "groq"
        logger.info("LLM backend: Groq (llama-3.3-70b-versatile)")
    elif gemini_key:
        from langchain_google_genai import ChatGoogleGenerativeAI
        _llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0.2, google_api_key=gemini_key)
        _llm_label = "gemini"
        logger.info("LLM backend: Google Gemini (gemini-1.5-pro)")
    else:
        from langchain_community.llms import Ollama
        _llm = Ollama(model="llama3", base_url="http://localhost:11434", temperature=0.2)
        _llm_label = "ollama"
        logger.info("LLM backend: Ollama (llama3, local)")

    return _llm


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


@router.post("/context", response_model=ContextResponse)
async def get_context(request: ContextRequest) -> ContextResponse:
    """Retrieve top-k relevant legal chunks from ChromaDB."""
    try:
        results = retrieve(query=request.question, k=request.max_results)
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="Legal database not initialized. Run 'python lawgpt/ingest.py' first.")
    except Exception as e:
        logger.error("Context retrieval error: %s", e, exc_info=True)
        raise HTTPException(status_code=502, detail=str(e))

    if not results:
        return ContextResponse(context="No specific legal context found.", sources=[])

    context_parts = []
    sources = []
    for doc in results:
        context_parts.append(f"- {doc.page_content}")
        source_name = doc.metadata.get("source", "unknown")
        page_num = doc.metadata.get("page", 0)
        source_label = f"{source_name} - page {page_num}"
        if source_label not in sources:
            sources.append(source_label)

    return ContextResponse(context="\n\n".join(context_parts), sources=sources)


@router.post("/context/filter", response_model=ContextResponse)
async def get_filtered_context(request: FilteredContextRequest) -> ContextResponse:
    """Retrieve context filtered to a specific statute (e.g., 'BNS', 'Constitution')."""
    try:
        results = retrieve_by_statute(query=request.question, statute=request.statute, k=request.max_results)
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="Legal database not initialized. Run 'python lawgpt/ingest.py' first.")
    except Exception as e:
        logger.error("Filtered retrieval error: %s", e, exc_info=True)
        raise HTTPException(status_code=502, detail=str(e))

    if not results:
        return ContextResponse(context=f"No results found in {request.statute}.", sources=[])

    context_parts = []
    sources = []
    for doc in results:
        context_parts.append(f"- {doc.page_content}")
        source_name = doc.metadata.get("source", "unknown")
        page_num = doc.metadata.get("page", 0)
        source_label = f"{source_name} - page {page_num}"
        if source_label not in sources:
            sources.append(source_label)

    return ContextResponse(context="\n\n".join(context_parts), sources=sources)


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """Retrieve context from ChromaDB, call LLM with legal prompt, return grounded answer."""
    session_id = request.session_id or str(uuid.uuid4())

    try:
        results = retrieve(query=request.question, k=5)
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="Legal database not initialized. Run 'python lawgpt/ingest.py' first.")
    except Exception as e:
        logger.error("Chat retrieval error: %s", e, exc_info=True)
        raise HTTPException(status_code=502, detail=str(e))

    context_parts = []
    sources = []
    for doc in results:
        context_parts.append(f"- {doc.page_content}")
        source_name = doc.metadata.get("source", "unknown")
        page_num = doc.metadata.get("page", 0)
        source_label = f"{source_name} - page {page_num}"
        if source_label not in sources:
            sources.append(source_label)

    context = "\n\n".join(context_parts) if context_parts else "No context available."
    prompt = LEGAL_PROMPT_TEMPLATE.format(context=context, question=request.question)

    try:
        llm = get_llm()
        answer_raw = llm.invoke(prompt)
        answer = answer_raw.content if hasattr(answer_raw, "content") else answer_raw
    except Exception as e:
        logger.error("LLM invocation error: %s", e, exc_info=True)
        raise HTTPException(status_code=502, detail=f"LLM error: {e}")

    return ChatResponse(answer=str(answer), sources=sources, session_id=session_id, model_used=_llm_label)


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """Return service status including index availability and available statutes."""
    return HealthResponse(
        status="ok",
        index_loaded=is_index_loaded(),
        model=_resolve_llm_label(),
        chunk_count=get_chunk_count(),
        available_statutes=get_available_statutes(),
    )


@router.post("/search", response_model=List[SearchItem])
async def search_precedents(request: SearchRequest) -> List[SearchItem]:
    """Perform advanced semantic search over legal precedents with relevance scores."""
    try:
        results = retrieve_with_scores(query=request.query, k=request.k)
        return [SearchItem(**item) for item in results]
    except Exception as e:
        logger.error("Semantic search error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
