"""
Indian Kanoon API Integration — Legal Case Search
Searches for relevant judgments, IPC/BNS/MVA sections, and case precedents.
Uses the Indian Kanoon REST API with token authentication.
"""

import asyncio
import aiohttp
import logging
from config import INDIAN_KANOON_TOKEN, INDIAN_KANOON_API_URL
from utils import CircuitBreaker, retry_transient

logger = logging.getLogger("kanoon-search")
DEFAULT_TIMEOUT = aiohttp.ClientTimeout(total=10)

# Module-level circuit breaker
kanoon_breaker = CircuitBreaker(failure_threshold=5, recovery_timeout=60)

@retry_transient
async def _search_kanoon_with_retry(query: str, url: str, params: dict, headers: dict, max_results: int = 3) -> list[dict]:
    async with aiohttp.ClientSession(timeout=DEFAULT_TIMEOUT) as session:
        async with session.post(url, data=params, headers=headers) as resp:
            if resp.status != 200:
                body = await resp.text()
                logger.error("Indian Kanoon API returned status %s: %s", resp.status, body[:200])
                raise aiohttp.ClientResponseError(
                    resp.request_info,
                    resp.history,
                    status=resp.status
                )
            data = await resp.json(content_type=None)
            docs = data.get("docs", [])
            results = []
            for doc in docs[:max_results]:
                results.append({
                    "title": doc.get("title", "Untitled"),
                    "doc_id": str(doc.get("tid", "")),
                    "snippet": _clean_snippet(doc.get("headline", "")),
                })
            logger.info("Indian Kanoon returned %s results for: %s...", len(results), query[:50])
            return results


async def search_kanoon(query: str, max_results: int = 3) -> list[dict]:
    """
    Search Indian Kanoon for relevant legal documents.
    Returns a list of {title, doc_id, snippet} dicts.
    """
    if not INDIAN_KANOON_TOKEN:
        logger.warning("Indian Kanoon API token not set. Skipping search.")
        return []
    
    if not kanoon_breaker.is_available():
        logger.warning("[CircuitBreaker/Kanoon] OPEN — skipping search")
        return []

    url = f"{INDIAN_KANOON_API_URL}/search/"
    params = {"formInput": query, "pagenum": 0}
    headers = {
        "Authorization": f"Token {INDIAN_KANOON_TOKEN}",
        "Accept": "application/json",
    }

    try:
        result = await _search_kanoon_with_retry(query, url, params, headers, max_results)
        kanoon_breaker.call_succeeded()
        return result
    except Exception as e:
        kanoon_breaker.call_failed()
        logger.error(f"Indian Kanoon search error: {e}")
        return []


@retry_transient
async def _fetch_doc(active_session: aiohttp.ClientSession, url: str, headers: dict, max_chars: int) -> str:
    async with active_session.post(url, headers=headers) as resp:
        if resp.status != 200:
            body = await resp.text()
            logger.error("Indian Kanoon doc fetch failed %s: %s", resp.status, body[:200])
            raise aiohttp.ClientResponseError(
                resp.request_info,
                resp.history,
                status=resp.status
            )
        data = await resp.json(content_type=None)
        text = data.get("doc", "")
        # Strip HTML tags
        text = _strip_html(text)
        return text[:max_chars]


async def get_kanoon_doc(
    doc_id: str,
    max_chars: int = 2000,
    session: aiohttp.ClientSession | None = None
) -> str:
    """
    Fetch the full text of a specific Indian Kanoon document.
    Returns truncated text suitable for RAG context injection.
    """
    if not INDIAN_KANOON_TOKEN or not doc_id:
        return ""
    
    if not kanoon_breaker.is_available():
        logger.warning("[CircuitBreaker/Kanoon] OPEN — skipping doc fetch")
        return ""

    url = f"{INDIAN_KANOON_API_URL}/doc/{doc_id}/"
    headers = {
        "Authorization": f"Token {INDIAN_KANOON_TOKEN}",
        "Accept": "application/json",
    }
    try:
        if session is not None:
            result = await _fetch_doc(session, url, headers, max_chars)
        else :
            async with aiohttp.ClientSession(timeout=DEFAULT_TIMEOUT) as new_session:
                result = await _fetch_doc(new_session, url, headers, max_chars)
        kanoon_breaker.call_succeeded()
        return result

    except Exception as e:
        kanoon_breaker.call_failed()
        logger.error(f"Indian Kanoon doc fetch error: {e}")
        return ""


async def build_kanoon_context(query: str, max_results: int = 3) -> tuple[str, list[dict]]:
    """
    Search Indian Kanoon, fetch top document texts, and compose a context string.
    Returns: (context_string, results_metadata)
    """
    results = await search_kanoon(query, max_results)
    if not results:
        return "", []

    context_parts = []
    async with aiohttp.ClientSession(timeout=DEFAULT_TIMEOUT) as session:
        tasks = [
            get_kanoon_doc(r["doc_id"], max_chars=1500, session=session)
            for r in results
        ]
        doc_texts = await asyncio.gather(*tasks, return_exceptions=True)

    for r, doc_text in zip(results, doc_texts):
        if isinstance(doc_text, BaseException):
            logger.error("Indian Kanoon doc fetch error for %s: %s", r.get("doc_id"), doc_text)
            doc_text = ""

        if doc_text:
            context_parts.append(f"=== {r['title']} ===\n{doc_text}\n")
        else:
            # Fallback to snippet
            context_parts.append(f"=== {r['title']} ===\n{r['snippet']}\n")

    context = "\n".join(context_parts)
    return context, results


def _clean_snippet(html_text: str) -> str:
    """Remove HTML tags from Indian Kanoon snippets."""
    return _strip_html(html_text).strip()


def _strip_html(text: str) -> str:
    """Simple HTML tag stripper."""
    import re
    clean = re.sub(r'<[^>]+>', '', text)
    # Collapse whitespace
    clean = re.sub(r'\s+', ' ', clean)
    return clean.strip()
