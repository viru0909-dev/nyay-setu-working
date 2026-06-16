import sys
from unittest.mock import Mock

import pytest

sys.modules.setdefault("cv2", Mock())
sys.modules.setdefault("aiohttp", Mock())

import services.video_processor as vp
from services.video_processor import extract_frames


class DummyCap:
    def __init__(self, frame_count):
        self.remaining = frame_count

    def get(self, prop):
        return 25

    def read(self):
        if self.remaining > 0:
            self.remaining -= 1
            return True, b"image"
        return False, None

    def release(self):
        pass


@pytest.mark.asyncio
async def test_extract_frames_frame_interval_controls_frequency(monkeypatch, tmp_path):
    monkeypatch.setattr(vp, "UPLOAD_DIR", str(tmp_path))
    monkeypatch.setattr(vp.cv2, "VideoCapture", lambda path: DummyCap(61))
    monkeypatch.setattr(vp.cv2, "resize", lambda image, size: image)
    monkeypatch.setattr(vp.cv2, "imwrite", lambda path, image: True)

    results = [
        len(await extract_frames("/tmp/fake.mp4", "job", frame_interval=interval))
        for interval in (1, 10, 30)
    ]

    assert results[0] > results[1] > results[2]
    assert results == [50, 7, 3]
