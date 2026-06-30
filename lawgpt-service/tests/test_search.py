import pytest
from fastapi.testclient import TestClient
from types import SimpleNamespace
from main import app

@pytest.fixture(autouse=True)
def patch_search(monkeypatch):
    # Patch retrieve_with_scores to return predictable results
    def fake_retrieve_with_scores(query, k=5):
        return [
            {
                "page_content": "Section: IPC 302 — Punishment for murder",
                "source": "IPC",
                "page": 10,
                "relevance": 95.5
            }
        ]
    monkeypatch.setattr("routers.context.retrieve_with_scores", fake_retrieve_with_scores)

def test_search_success():
    client = TestClient(app)
    payload = {
        "query": "punishment for murder",
        "k": 5
    }
    resp = client.post("/search", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["source"] == "IPC"
    assert data[0]["relevance"] == 95.5
    assert "murder" in data[0]["page_content"].lower()

def test_search_empty_query():
    # FastAPI automatically handles missing fields or incorrect types due to pydantic validation
    client = TestClient(app)
    payload = {
        "k": 5
    }
    resp = client.post("/search", json=payload)
    assert resp.status_code == 422
