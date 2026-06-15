import os
from starlette.testclient import TestClient

os.environ.setdefault("GROQ_API_KEY", "test")
os.environ.setdefault("GOOGLE_GEMINI_API_KEY", "test")

from main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
    "status": "ok",
    "service": "nlp-orchestrator",
    "port": 8001
}