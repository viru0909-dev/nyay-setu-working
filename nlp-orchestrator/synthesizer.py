"""
Layer 4: Answer Synthesizer
Combines all sub-answers into one structured, clean final legal answer.
Includes relevant IPC / BNS / MVA section references.
"""

import asyncio
import json
import re
from groq import AsyncGroq
from config import GROQ_API_KEY, GROQ_MODEL_FAST
from legal_utils.citation_extractor import extract_legal_citations
from models.schemas import SynthesisResult

client = AsyncGroq(api_key=GROQ_API_KEY)

STRUCTURED_SYNTHESIS_PROMPT = """You are a senior Indian legal expert writing a final comprehensive legal opinion.

You have received research results from multiple focused legal sub-queries.
Synthesize these into a single, clear, well-structured answer for an Indian citizen.

Research Results:
{research_results}

Original User Question: {original_query}

Return ONLY a valid JSON object (no markdown fences, no commentary) with EXACTLY these two keys:
  "answer_markdown": a string containing the full answer in clean markdown. It must:
      1. Start with a clear, direct answer to the main question (2-3 sentences)
      2. Provide key legal provisions with exact section numbers (IPC/BNS/CPC/CrPC/MVA as applicable)
      3. Outline practical steps the user can take
      4. Mention any important deadlines or limitations
      5. Include a brief disclaimer that this is AI-generated legal information and a lawyer should be consulted
      Use ## headers and - bullets where appropriate. Write in simple, accessible English.
  "cited_laws": an array of strings listing every distinct statutory provision you cited,
      each in the form "<ACT> Sec <NUMBER>" or "Article <NUMBER>"
      (e.g. ["IPC Sec 302", "CrPC Sec 144", "Article 21"]). Use an empty array [] if none.

Example:
{{"answer_markdown": "## Answer\\n...", "cited_laws": ["IPC Sec 304A", "MVA Sec 166"]}}
"""

_ACT_DISPLAY = {
    "IPC": "IPC",
    "CrPC": "CrPC",
    "CPC": "CPC",
    "MVA": "MVA",
    "BNS": "BNS",
    "BNSS": "BNSS",
    "Article": "Article",
}

SYNTHESIS_PROMPT = """You are a senior Indian legal expert writing a final comprehensive legal opinion.

You have received research results from multiple focused legal sub-queries. 
Synthesize these into a single, clear, well-structured answer for an Indian citizen.

Research Results:
{research_results}

Original User Question: {original_query}

Your synthesis must:
1. Start with a clear, direct answer to the main question (2-3 sentences)
2. Provide key legal provisions with exact section numbers (IPC/BNS/CPC/MVA as applicable)
3. Outline practical steps the user can take
4. Mention any important deadlines or limitations
5. Include a brief disclaimer that this is AI-generated legal information and a lawyer should be consulted for specific cases

Format your response in clear markdown with headers (##) and bullet points (-) where appropriate.
Write in simple, accessible English. Avoid heavy legal jargon.
"""

def format_research_for_synthesis(research_results: list[dict]) -> str:
    """Format the research results into a readable block for the synthesis prompt."""
    formatted = []
    for i, result in enumerate(research_results, 1):
        if result.get("answer"):
            formatted.append(
                f"Sub-Question {i}: {result['question']}\n"
                f"Source: {result['source'].upper()}\n"
                f"Answer: {result['answer']}\n"
            )
    return "\n---\n".join(formatted)

async def synthesize_answers(original_query: str, research_results: list[dict]) -> str:
    """
    Synthesize multiple sub-answers into one final structured legal response.
    """
    try:
        formatted_research = format_research_for_synthesis(research_results)
        
        response = await client.chat.completions.create(
            model=GROQ_MODEL_FAST,
            messages=[
                {
                    "role": "user",
                    "content": SYNTHESIS_PROMPT.format(
                        research_results=formatted_research,
                        original_query=original_query
                    )
                }
            ],
            temperature=0.3,
            max_tokens=2048
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        print(f"[Synthesizer] Error: {e}")
        parts = [f"**{r['question']}**\n{r['answer']}" for r in research_results if r.get("answer")]
        return "\n\n".join(parts)

async def stream_synthesize_answers(query, research_results):
    """
    Standard text streaming fallback.
    Fixed the AsyncAPIResponse iteration bug.
    """
    messages = [
        {
            "role": "system",
            "content": "You are a legal synthesis assistant."
        },
        {
            "role": "user",
            "content": f"Query: {query}\n\nResearch Results:\n{research_results}"
        }
    ]

    try:
        stream = await client.chat.completions.create(
            model=GROQ_MODEL_FAST,
            messages=messages,
            temperature=0.3,
            max_tokens=1024,
            stream=True
        )

        async for chunk in stream:
            content = chunk.choices[0].delta.content
            if content:
                yield content

    except Exception as e:
        print(f"[Stream Synthesizer] Standard stream failed: {e}")

# ─── Structured synthesis with explicit cited-law extraction (issue #851) ─────
_CITED_LAW_RE = re.compile(r"^[A-Za-z]")

_FENCE_MARKER = "`" * 3

_JSON_FENCE_START_RE = re.compile(r"^" + _FENCE_MARKER + r"(?:json)?\s*", re.IGNORECASE)
_JSON_FENCE_END_RE = re.compile(r"\s*" + _FENCE_MARKER + r"$")

def _strip_json_fence(raw: str) -> str:
    """Remove a leading/trailing markdown fence if the model added one."""
    text = raw.strip()
    if text.startswith(_FENCE_MARKER):
        # Strip the top fence, then strip the bottom fence
        text = _JSON_FENCE_START_RE.sub("", text)
        text = _JSON_FENCE_END_RE.sub("", text)
    return text.strip()

def _normalize_cited_law(item: str) -> str:
    if not item or not isinstance(item, str):
        return ""
    citations = extract_legal_citations(item)
    if citations:
        c = citations[0]
        act = _ACT_DISPLAY.get(c["act"], c["act"])
        if act == "Article":
            return f"Article {c['section']}"
        return f"{act} Sec {c['section']}"
    return item.strip()

def _dedupe_cited_laws(items: list) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for item in items or []:
        normalized = _normalize_cited_law(item)
        key = normalized.lower()
        if normalized and key not in seen:
            seen.add(key)
            out.append(normalized)
    return out

def extract_cited_laws_from_markdown(markdown: str) -> list[str]:
    citations = extract_legal_citations(markdown or "")
    formatted = []
    for c in citations:
        act = _ACT_DISPLAY.get(c["act"], c["act"])
        formatted.append(f"Article {c['section']}" if act == "Article" else f"{act} Sec {c['section']}")
    return _dedupe_cited_laws(formatted)

async def synthesize_answers_structured(
    original_query: str,
    research_results: list[dict],
) -> SynthesisResult:
    formatted_research = format_research_for_synthesis(research_results)

    try:
        response = await client.chat.completions.create(
            model=GROQ_MODEL_FAST,
            messages=[
                {
                    "role": "user",
                    "content": STRUCTURED_SYNTHESIS_PROMPT.format(
                        research_results=formatted_research,
                        original_query=original_query,
                    ),
                }
            ],
            temperature=0.3,
            max_tokens=2048,
        )
        raw = response.choices[0].message.content.strip()
        payload = json.loads(_strip_json_fence(raw), strict=False)

        if not isinstance(payload, dict):
            raise ValueError("structured synthesis did not return a JSON object")

        markdown = (payload.get("answer_markdown") or "").strip()
        if not markdown:
            raise ValueError("structured synthesis returned empty answer_markdown")

        cited = payload.get("cited_laws", [])
        if not isinstance(cited, list):
            cited = []
        cited_laws = _dedupe_cited_laws(cited)

        if not cited_laws:
            cited_laws = extract_cited_laws_from_markdown(markdown)

        return SynthesisResult(answer_markdown=markdown, cited_laws=cited_laws)

    except Exception as e:
        print(f"[Synthesizer] Structured synthesis failed, falling back: {e}")
        markdown = await synthesize_answers(original_query, research_results)
        return SynthesisResult(
            answer_markdown=markdown,
            cited_laws=extract_cited_laws_from_markdown(markdown),
        )

async def stream_synthesize_answers_structured(original_query: str, research_results: list):
    """
    Streams the synthesis answer text token-by-token while parsing out 
    the structured JSON formatting on the fly, emitting citations at the end.
    """
    formatted_research = format_research_for_synthesis(research_results)
    prompt = STRUCTURED_SYNTHESIS_PROMPT.format(
        research_results=formatted_research,
        original_query=original_query,
    )

    try:
        response = await client.chat.completions.create(
            model=GROQ_MODEL_FAST,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=2048,
            stream=True,
        )
    except Exception as e:
        print(f"[Stream Synthesizer] Structured API call failed, falling back: {e}")
        async for chunk in stream_synthesize_answers(original_query, research_results):
            yield {"text": chunk, "citations": []}
        return

    buffer = ""
    in_markdown = False
    markdown_done = False
    citations_buffer = ""

    async for chunk in response:
        token = chunk.choices[0].delta.content or ""
        buffer += token

        # STATE 1: Look for the opening of the markdown string
        if not in_markdown and not markdown_done:
            match = re.search(r'"answer_markdown"\s*:\s*"', buffer)
            if match:
                in_markdown = True
                buffer = buffer[match.end():]

        # STATE 2: Actively streaming markdown content
        elif in_markdown:
            end_match = re.search(r'(?<!\\)"\s*(?:,|\})', buffer)
            if end_match:
                in_markdown = False
                markdown_done = True
                text_payload = buffer[:end_match.start()]
                if text_payload:
                    yield {"text": text_payload.replace('\\n', '\n').replace('\\t', '\t').replace('\\"', '"'), "citations": []}
                buffer = buffer[end_match.end():]
            else:
                if buffer.endswith('\\'):
                    text_to_send = buffer[:-1]
                    buffer = '\\'
                else:
                    text_to_send = buffer
                    buffer = ""

                if text_to_send:
                    yield {"text": text_to_send.replace('\\n', '\n').replace('\\t', '\t').replace('\\"', '"'), "citations": []}

        # STATE 3: Markdown finished, gather remaining tokens for the citations array
        elif markdown_done:
            citations_buffer += token

    # POST-STREAM processing: Extract citations from the tail buffer
    try:
        combined_tail = buffer + citations_buffer
        array_match = re.search(r'"cited_laws"\s*:\s*(\[[^\]]*\])', combined_tail)
        if array_match:
            cited = json.loads(array_match.group(1))
            if isinstance(cited, list):
                yield {"text": "", "citations": _dedupe_cited_laws(cited)}
                return
    except Exception as e:
        print(f"[Stream Synthesizer] Failed parsing citations from stream tail: {e}")

    yield {"text": "", "citations": []}