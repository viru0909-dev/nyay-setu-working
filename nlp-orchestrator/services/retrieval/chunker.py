"""
Token-aware, section-aware chunking for legal documents.

Strategy:
  0. Split the document into *legal sections* first. A new "Section 103",
     "Sec. 304A", "Article 21" or "§ 144" heading starts a new section block,
     even when it is not separated from the previous text by a blank line.
     Keeping a statutory section intact (and never letting one chunk straddle
     two sections) is what makes retrieval land on the right provision.
  1. Within each section block, split into paragraphs on double-newlines.
  2. Greedy-pack paragraphs up to `max_tokens` per chunk.
  3. If a single paragraph exceeds `max_tokens`, fall back to sentence splitting.
  4. Maintain ~`overlap_tokens` of trailing context between adjacent chunks of
     the *same* section so that a section number or party name introduced at
     the end of one chunk is still visible at the start of the next. Overlap is
     never carried across a section boundary.

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

# Legal-section heading detector.
#
# Matches the *start* of a statutory unit so we can break a long document into
# section-aligned blocks. Designed to fire on real headings while avoiding
# in-prose references like "...as held in Section 9 of that judgment".
#
# Recognised forms (case-insensitive on the keyword):
#   "Section 103", "Section 304A", "Sec. 144", "S. 302"
#   "Article 21", "Art. 14"
#   "§ 302", "§302"
#   "Order VII Rule 11", "Rule 11"   (CPC-style)
#
# A heading qualifies only when it sits at the beginning of a line (optionally
# after whitespace). The number may carry an alphabetic suffix (304A) and an
# optional sub-clause like "(1)" or "(2)(a)".
_SECTION_HEADING_RE = re.compile(
    r"""
    (?m)                                  # multiline: ^ matches each line start
    ^\s*
    (?:
        (?:Section|Sec\.?|S\.)\s*\d{1,4}[A-Za-z]?    |   # Section / Sec. / S.
        (?:Article|Art\.?)\s*\d{1,4}[A-Za-z]?        |   # Article / Art.
        §\s*\d{1,4}[A-Za-z]?                          |   # § symbol
        (?:Order\s+[IVXLC]+\s+)?Rule\s+\d{1,4}[A-Za-z]?  # (Order N) Rule N
    )
    """,
    re.IGNORECASE | re.VERBOSE,
)


def split_paragraphs(text: str) -> list[str]:
    return [p.strip() for p in _PARAGRAPH_RE.split(text) if p.strip()]


def split_sentences(text: str) -> list[str]:
    return [s.strip() for s in _SENTENCE_RE.split(text) if s.strip()]


def _split_long_sentence(
    sentence: str,
    max_tokens: int,
    overlap_tokens: int,
) -> list[str]:
    words = sentence.split()
    chunks: list[str] = []
    word_buf: list[str] = []

    for word in words:
        candidate_buf = word_buf + [word]
        if word_buf and count_tokens(" ".join(candidate_buf)) > max_tokens:
            chunks.append(" ".join(word_buf))
            word_buf, _ = _tail_overlap(word_buf, overlap_tokens)

        word_buf.append(word)

    if word_buf:
        chunks.append(" ".join(word_buf))

    return chunks


def split_legal_sections(text: str) -> list[str]:
    """
    Split `text` into section-aligned blocks at legal-section headings.

    Each returned block begins with its heading (e.g. "Section 304A ...") and
    runs up to — but not including — the next heading. Any preamble before the
    first heading is returned as its own leading block so no content is lost.

    If the text contains no recognisable headings, a single-element list with
    the whole (stripped) text is returned, which makes this a safe no-op for
    free-form prose.
    """
    if not text or not text.strip():
        return []

    starts = [m.start() for m in _SECTION_HEADING_RE.finditer(text)]
    if not starts:
        return [text.strip()]

    # Ensure the preamble (anything before the first heading) is preserved.
    boundaries = starts if starts[0] == 0 else [0, *starts]

    blocks: list[str] = []
    for idx, start in enumerate(boundaries):
        end = boundaries[idx + 1] if idx + 1 < len(boundaries) else len(text)
        block = text[start:end].strip()
        if block:
            blocks.append(block)
    return blocks


def chunk_text(
    text: str,
    max_tokens: int = 512,
    overlap_tokens: int = 64,
) -> list[str]:
    """
    Split `text` into section-aligned blocks at legal-section headings.

    Each returned block begins with its heading (e.g. "Section 304A ...") and
    runs up to — but not including — the next heading. Any preamble before the
    first heading is returned as its own leading block so no content is lost.

    If the text contains no recognisable headings, a single-element list with
    the whole (stripped) text is returned, which makes this a safe no-op for
    free-form prose.
    """
    if not text or not text.strip():
        return []

    starts = [m.start() for m in _SECTION_HEADING_RE.finditer(text)]
    if not starts:
        return [text.strip()]

    # Ensure the preamble (anything before the first heading) is preserved.
    boundaries = starts if starts[0] == 0 else [0, *starts]

    blocks: list[str] = []
    for idx, start in enumerate(boundaries):
        end = boundaries[idx + 1] if idx + 1 < len(boundaries) else len(text)
        block = text[start:end].strip()
        if block:
            blocks.append(block)
    return blocks


def _chunk_block(
    text: str,
    max_tokens: int,
    overlap_tokens: int,
) -> list[str]:
    """
    Paragraph/sentence packing for a single section block (no section logic).
    This is the original token-aware packing strategy.
    """
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
                if s_tokens > max_tokens:
                    if sent_buf:
                        chunks.append(" ".join(sent_buf))
                        sent_buf, sent_tokens = _tail_overlap(sent_buf, overlap_tokens)

                    chunks.extend(
                        _split_long_sentence(sentence, max_tokens, overlap_tokens)
                    )
                    sent_buf = []
                    sent_tokens = 0
                    continue

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


def chunk_text(
    text: str,
    max_tokens: int = 512,
    overlap_tokens: int = 64,
    respect_sections: bool = True,
) -> list[str]:
    """
    Split `text` into overlapping chunks, each at most ~max_tokens tokens.

    When `respect_sections` is True (default), the document is first split on
    legal-section headings so that no chunk spans two sections and every chunk
    is anchored to the section it belongs to. Set it to False to fall back to
    pure paragraph/sentence packing (the previous behaviour).

    Returns an empty list for empty input.
    """
    if not text or not text.strip():
        return []

    if not respect_sections:
        return _chunk_block(text, max_tokens, overlap_tokens)

    chunks: list[str] = []
    for block in split_legal_sections(text):
        # Each section is chunked independently; overlap never crosses a
        # section boundary, which keeps provisions cleanly separated.
        chunks.extend(_chunk_block(block, max_tokens, overlap_tokens))
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
