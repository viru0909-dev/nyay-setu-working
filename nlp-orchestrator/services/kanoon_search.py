"""
Indian Kanoon API Integration — Legal Case Search
Searches for relevant judgments, IPC/BNS/MVA sections, and case precedents.
Uses the Indian Kanoon REST API with token authentication.
"""

import aiohttp
import logging
from config import INDIAN_KANOON_TOKEN, INDIAN_KANOON_API_URL

logger = logging.getLogger("kanoon-search")


async def search_kanoon(query: str, max_results: int = 3) -> list[dict]:
    """
    Search Indian Kanoon for relevant legal documents.
    Returns a list of {title, doc_id, snippet} dicts.
    """
    if not INDIAN_KANOON_TOKEN:
        logger.warning("Indian Kanoon API token not set. Skipping search.")
        return []

    url = f"{INDIAN_KANOON_API_URL}/search/"
    params = {"formInput": query, "pagenum": 0}
    headers = {
        "Authorization": f"Token {INDIAN_KANOON_TOKEN}",
        "Accept": "application/json",
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, data=params, headers=headers, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status != 200:
                    logger.error(f"Indian Kanoon API returned status {resp.status}")
                    return []

                data = await resp.json(content_type=None)
                docs = data.get("docs", [])

                results = []
                for doc in docs[:max_results]:
                    results.append({
                        "title": doc.get("title", "Untitled"),
                        "doc_id": str(doc.get("tid", "")),
                        "snippet": _clean_snippet(doc.get("headline", "")),
                    })

                logger.info(f"Indian Kanoon returned {len(results)} results for: {query[:50]}...")
                return results

    except Exception as e:
        logger.error(f"Indian Kanoon search error: {e}")
        return []


async def get_kanoon_doc(doc_id: str, max_chars: int = 2000) -> str:
    """
    Fetch the full text of a specific Indian Kanoon document.
    Returns truncated text suitable for RAG context injection.
    """
    if not INDIAN_KANOON_TOKEN or not doc_id:
        return ""

    url = f"{INDIAN_KANOON_API_URL}/doc/{doc_id}/"
    headers = {
        "Authorization": f"Token {INDIAN_KANOON_TOKEN}",
        "Accept": "application/json",
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status != 200:
                    return ""
                data = await resp.json(content_type=None)
                text = data.get("doc", "")
                # Strip HTML tags
                text = _strip_html(text)
                return text[:max_chars]

    except Exception as e:
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

    # Fetch full text for each result (in parallel-ish via sequential awaits)
    context_parts = []
    for r in results:
        doc_text = await get_kanoon_doc(r["doc_id"], max_chars=1500)
        if doc_text:
            context_parts.append(
                f"=== {r['title']} ===\n{doc_text}\n"
            )
        else:
            # Fallback to snippet
            context_parts.append(
                f"=== {r['title']} ===\n{r['snippet']}\n"
            )

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
