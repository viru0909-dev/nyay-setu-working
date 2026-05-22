"""
Token-aware chunking for legal documents.

Strategy:
  1. Split into paragraphs on double-newlines.
  2. Greedy-pack paragraphs up to `max_tokens` per chunk.
  3. If a single paragraph exceeds `max_tokens`, fall back to sentence splitting.
  4. Maintain ~`overlap_tokens` of trailing context between adjacent chunks so
     that a section number or party name introduced at the end of one chunk
     is still visible at the start of the next.

Token counting uses tiktoken's `cl100k_base`, which is close enough to the
tokenizers used by Llama-3.x and Gemini for budgeting purposes (we don't need
exact parity, just consistent sizing).
"""

import re
import logging

logger = logging.getLogger("retrieval-chunker")

try:
    import tiktoken
    _ENCODING = tiktoken.get_encoding("cl100k_base")

    def count_tokens(text: str) -> int:
        return len(_ENCODING.encode(text))
except ImportError:
    logger.warning("tiktoken not installed; falling back to whitespace token counting")

    def count_tokens(text: str) -> int:
        # Rough approximation: ~0.75 tokens per word for English/legal prose.
        return max(1, int(len(text.split()) / 0.75))


_PARAGRAPH_RE = re.compile(r"\n\s*\n")
# Conservative sentence boundary: period/!/? followed by whitespace and a capital.
# Avoids splitting on "Sec. 304A" or "v." citations.
_SENTENCE_RE = re.compile(r"(?<=[.!?])\s+(?=[A-Z(])")


def split_paragraphs(text: str) -> list[str]:
    return [p.strip() for p in _PARAGRAPH_RE.split(text) if p.strip()]


def split_sentences(text: str) -> list[str]:
    return [s.strip() for s in _SENTENCE_RE.split(text) if s.strip()]


def chunk_text(
    text: str,
    max_tokens: int = 512,
    overlap_tokens: int = 64,
) -> list[str]:
    """
    Split `text` into overlapping chunks, each at most ~max_tokens tokens.

    Returns an empty list for empty input.
    """
    if not text or not text.strip():
        return []

    paragraphs = split_paragraphs(text)
    if not paragraphs:
        return []

    chunks: list[str] = []
    buffer: list[str] = []
    buffer_tokens = 0

    for para in paragraphs:
        para_tokens = count_tokens(para)

        # Case 1: paragraph itself exceeds the budget — flush, then sentence-split.
        if para_tokens > max_tokens:
            if buffer:
                chunks.append("\n\n".join(buffer))
                buffer, buffer_tokens = _tail_overlap(buffer, overlap_tokens)

            sent_buf: list[str] = []
            sent_tokens = 0
            for sentence in split_sentences(para):
                s_tokens = count_tokens(sentence)
                if sent_tokens + s_tokens > max_tokens and sent_buf:
                    chunks.append(" ".join(sent_buf))
                    sent_buf, sent_tokens = _tail_overlap(sent_buf, overlap_tokens)
                sent_buf.append(sentence)
                sent_tokens += s_tokens
            if sent_buf:
                # Merge sentence-tail into the paragraph buffer so the next paragraph
                # joins naturally rather than starting a fresh chunk.
                buffer = [" ".join(sent_buf)]
                buffer_tokens = sent_tokens
            continue

        # Case 2: adding this paragraph would overflow — flush buffer first.
        if buffer_tokens + para_tokens > max_tokens and buffer:
            chunks.append("\n\n".join(buffer))
            buffer, buffer_tokens = _tail_overlap(buffer, overlap_tokens)

        buffer.append(para)
        buffer_tokens += para_tokens

    if buffer:
        chunks.append("\n\n".join(buffer))

    return chunks


def _tail_overlap(items: list[str], overlap_tokens: int) -> tuple[list[str], int]:
    """
    Return the trailing items of `items` whose combined token count is in the
    range [overlap_tokens, 2*overlap_tokens], along with that token count.

    Used to seed the next chunk with context from the previous one. The 2x
    upper bound is important: without it, a single oversized item (a long
    "Provided that..." subclause, say) would carry forward across every
    subsequent flush and inflate every following chunk.

    If the next item to consider would push us past 2x overlap, we stop —
    even if it means returning an empty tail. Losing some overlap is
    strictly better than emitting duplicate content.
    """
    if overlap_tokens <= 0 or not items:
        return [], 0

    out: list[str] = []
    tok = 0
    cap = 2 * overlap_tokens

    for item in reversed(items):
        item_tok = count_tokens(item)
        if tok + item_tok > cap:
            break
        out.insert(0, item)
        tok += item_tok
        if tok >= overlap_tokens:
            break
    return out, tok
