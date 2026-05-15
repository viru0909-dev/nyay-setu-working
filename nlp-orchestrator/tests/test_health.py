from starlette.testclient import TestClient
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