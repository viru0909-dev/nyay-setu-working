import json
import pytest
from fastapi.testclient import TestClient
from main import app

class FakeLLM:
    def invoke(self, prompt):
        # We simulate the structured JSON response requested by the prompt
        return json.dumps({
            "case_context": "The petitioner filed for relief from theft.",
            "petitioner_arguments": ["Petitioner was robbed of property."],
            "respondent_arguments": ["Respondent claims innocence."],
            "ratio_decidendi": ["Theft requires taking property without consent."],
            "verdict": "Petition allowed."
        })

@pytest.fixture(autouse=True)
def patch_llm(monkeypatch):
    def fake_get_doc_llm():
        return FakeLLM(), "fake"
    monkeypatch.setattr("routers.summarize._get_doc_llm", fake_get_doc_llm)

def test_summarize_success():
    client = TestClient(app)
    payload = {
        "text": "This is a judgment text about a theft case. The petitioner argues theft. The respondent denies it.",
        "language": "en"
    }
    resp = client.post("/summarize", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "theft" in data["case_context"].lower()
    assert len(data["petitioner_arguments"]) == 1
    assert data["verdict"] == "Petition allowed."

def test_summarize_empty_text():
    client = TestClient(app)
    payload = {
        "text": "",
        "language": "en"
    }
    resp = client.post("/summarize", json=payload)
    assert resp.status_code == 400
