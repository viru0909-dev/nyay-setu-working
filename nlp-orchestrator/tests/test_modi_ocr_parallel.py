"""
Unit tests for concurrent multi-page OCR (issue #848).

These exercise services.modi_ocr.recognize_modi_pages, which fans page images
out to recognize_modi_image concurrently under a semaphore. The per-page worker
is mocked, so no model/cv2 inference actually runs — we verify orchestration:
ordering, batch completeness, concurrency bounding, real parallelism, and
per-page error isolation.
"""

import os

os.environ.setdefault("GROQ_API_KEY", "test-key-not-used")

# The OCR service imports cv2/Pillow at module load. Skip cleanly if absent.
import pytest

pytest.importorskip("cv2")
pytest.importorskip("PIL")

import asyncio
import time
from unittest.mock import patch

import services.modi_ocr as modi_ocr
from services.modi_ocr import recognize_modi_pages, ModiOCRServiceError


@pytest.mark.asyncio
async def test_empty_input_returns_empty_list():
    assert await recognize_modi_pages([]) == []


@pytest.mark.asyncio
async def test_all_pages_processed_in_order():
    pages = [f"page-{i}".encode() for i in range(6)]

    async def fake(image_bytes: bytes) -> str:
        return image_bytes.decode().upper()

    with patch.object(modi_ocr, "recognize_modi_image", side_effect=fake):
        results = await recognize_modi_pages(pages)

    assert [r["page"] for r in results] == [1, 2, 3, 4, 5, 6]
    assert all(r["status"] == "success" for r in results)
    assert [r["predicted_text"] for r in results] == [f"PAGE-{i}" for i in range(6)]


@pytest.mark.asyncio
async def test_concurrency_is_bounded_by_limit():
    pages = [b"x"] * 12
    limit = 4
    state = {"current": 0, "peak": 0}
    lock = asyncio.Lock()

    async def fake(image_bytes: bytes) -> str:
        async with lock:
            state["current"] += 1
            state["peak"] = max(state["peak"], state["current"])
        await asyncio.sleep(0.02)
        async with lock:
            state["current"] -= 1
        return "ok"

    with patch.object(modi_ocr, "recognize_modi_image", side_effect=fake):
        results = await recognize_modi_pages(pages, max_concurrency=limit)

    assert len(results) == 12
    assert state["peak"] <= limit, f"peak {state['peak']} exceeded limit {limit}"
    # With 12 pages and a limit of 4, the limit should actually be reached.
    assert state["peak"] == limit


@pytest.mark.asyncio
async def test_pages_run_in_parallel_not_sequentially():
    pages = [b"x"] * 8
    per_page = 0.05

    async def fake(image_bytes: bytes) -> str:
        await asyncio.sleep(per_page)
        return "ok"

    with patch.object(modi_ocr, "recognize_modi_image", side_effect=fake):
        start = time.perf_counter()
        await recognize_modi_pages(pages, max_concurrency=8)
        elapsed = time.perf_counter() - start

    # Sequential would be ~8 * 0.05 = 0.4s; parallel (limit 8) should be ~0.05s.
    assert elapsed < per_page * len(pages) * 0.6


@pytest.mark.asyncio
async def test_one_failing_page_does_not_sink_the_batch():
    pages = [b"good1", b"bad", b"good2"]

    async def fake(image_bytes: bytes) -> str:
        if image_bytes == b"bad":
            raise ModiOCRServiceError("inference blew up")
        return image_bytes.decode()

    with patch.object(modi_ocr, "recognize_modi_image", side_effect=fake):
        results = await recognize_modi_pages(pages)

    assert results[0]["status"] == "success" and results[0]["predicted_text"] == "good1"
    assert (
        results[1]["status"] == "error" and "inference blew up" in results[1]["error"]
    )
    assert results[2]["status"] == "success" and results[2]["predicted_text"] == "good2"


@pytest.mark.asyncio
async def test_unexpected_exception_is_isolated_per_page():
    pages = [b"ok", b"boom"]

    async def fake(image_bytes: bytes) -> str:
        if image_bytes == b"boom":
            raise RuntimeError("totally unexpected")
        return "fine"

    with patch.object(modi_ocr, "recognize_modi_image", side_effect=fake):
        results = await recognize_modi_pages(pages)

    assert results[0]["status"] == "success"
    assert results[1]["status"] == "error"
    assert "Unexpected error" in results[1]["error"]
