import logging
import json
import os
from typing import List, Optional
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

# We reuse the LLM helper from document router to keep configurations unified
from routers.document import _get_doc_llm

load_dotenv()
logger = logging.getLogger("lawgpt")

router = APIRouter()

class SummarizeRequest(BaseModel):
    text: str
    language: str = "en"

class SummarizeResponse(BaseModel):
    case_context: str
    petitioner_arguments: List[str]
    respondent_arguments: List[str]
    ratio_decidendi: List[str]
    verdict: str

def chunk_text(text: str, max_chars: int = 6000) -> List[str]:
    """Split text into manageable chunks to respect token limits."""
    chunks = []
    current_chunk = []
    current_len = 0
    for line in text.split("\n"):
        line = line.strip()
        if not line:
            continue
        if current_len + len(line) + 1 > max_chars:
            if current_chunk:
                chunks.append("\n".join(current_chunk))
            current_chunk = [line]
            current_len = len(line)
        else:
            current_chunk.append(line)
            current_len += len(line) + 1
    if current_chunk:
        chunks.append("\n".join(current_chunk))
    return chunks

@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_document(request: SummarizeRequest) -> SummarizeResponse:
    """
    Summarize a legal document, extracting case context, arguments, ratio decidendi, and verdict.
    Uses chunking and map-reduce if the document is excessively long.
    """
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Document text is empty")

    llm, label = _get_doc_llm()
    chunks = chunk_text(text)

    # 1. Map phase: Summarize chunks if document is large
    if len(chunks) > 1:
        logger.info("📄 Document is large (%d characters), splitting into %d chunks", len(text), len(chunks))
        chunk_summaries = []
        for i, chunk in enumerate(chunks):
            prompt = f"Analyze and summarize the following section of a legal document. Extract key facts, arguments, and decisions:\n\n{chunk}"
            try:
                ans = llm.invoke(prompt)
                content = ans.content if hasattr(ans, "content") else str(ans)
                chunk_summaries.append(content)
            except Exception as e:
                logger.error("Failed to summarize chunk %d: %s", i, e)
                # Keep moving
                chunk_summaries.append(chunk[:1000])
        combined_text = "\n\n=== SECTION ===\n\n".join(chunk_summaries)
    else:
        combined_text = text

    # 2. Reduce phase: Produce structured summary JSON
    prompt = f"""You are an expert Indian legal analyst. Analyze the provided legal document details/sections and extract a structured summary.
Document details:
{combined_text}

Please respond with ONLY a JSON object containing EXACTLY the following keys (ensure all lists are proper JSON arrays of strings):
- "case_context": a concise summary of the case facts and background context.
- "petitioner_arguments": a JSON array (list of strings) of key arguments/points presented by the petitioner/plaintiff.
- "respondent_arguments": a JSON array (list of strings) of key arguments/points presented by the respondent/defendant.
- "ratio_decidendi": a JSON array (list of strings) of legal reasoning/principles (Ratio Decidendi) used by the court to reach the decision.
- "verdict": the final judgment, order, or verdict of the court.

Respond with valid JSON only. Do not add markdown backticks outside the JSON."""

    try:
        ans = llm.invoke(prompt)
        content = ans.content if hasattr(ans, "content") else str(ans)
        
        # Clean potential markdown JSON fences
        clean_json = content.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.startswith("```"):
            clean_json = clean_json[3:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
        clean_json = clean_json.strip()

        data = json.loads(clean_json)
        
        # Normalize fields to guarantee types
        def to_list(val):
            if isinstance(val, list):
                return [str(x) for x in val]
            if isinstance(val, str):
                return [val]
            return []

        return SummarizeResponse(
            case_context=str(data.get("case_context", "N/A")),
            petitioner_arguments=to_list(data.get("petitioner_arguments", [])),
            respondent_arguments=to_list(data.get("respondent_arguments", [])),
            ratio_decidendi=to_list(data.get("ratio_decidendi", [])),
            verdict=str(data.get("verdict", "N/A"))
        )
    except Exception as e:
        logger.error("Summarization reduction failed: %s", e, exc_info=True)
        # Fallback response
        return SummarizeResponse(
            case_context="Analysis failed to complete.",
            petitioner_arguments=["Failed to extract arguments due to LLM error."],
            respondent_arguments=[],
            ratio_decidendi=[],
            verdict="Error"
        )
