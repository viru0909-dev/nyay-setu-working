import io
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from main import app


class FakeLLM:
    def invoke(self, prompt):
        return "FAKE GENERATED DOCUMENT CONTENT"


@pytest.fixture(autouse=True)
def patch_retriever_and_llm(monkeypatch):
    def fake_retrieve(query, k=3):
        return [SimpleNamespace(page_content="Section: IPC 379 — Theft", metadata={"source": "IPC", "page": 1})]

    monkeypatch.setattr("routers.document.retrieve", fake_retrieve)

    def fake_get_doc_llm():
        return FakeLLM(), "fake"

    monkeypatch.setattr("routers.document._get_doc_llm", fake_get_doc_llm)
    # Patch PDF/DOCX creation helpers to avoid heavy dependencies in tests
    def fake_create_pdf(response, petitioner_name):
        return io.BytesIO(b"%PDF\n" + response.content.encode("utf-8"))

    def fake_create_docx(response, petitioner_name):
        return io.BytesIO(b"PK" + response.content.encode("utf-8"))

    monkeypatch.setattr("routers.document._create_pdf", fake_create_pdf)
    monkeypatch.setattr("routers.document._create_docx", fake_create_docx)


def client():
    return TestClient(app)


def base_fields():
    return {
        "petitioner_name": "Asha",
        "petitioner_address": "123 Main St",
        "respondent_name": "XYZ Ltd",
        "respondent_address": "456 Market",
        "case_description": "Non-payment of salary",
        "incident_date": "2026-05-01",
        "relief_sought": "Payment of outstanding salary",
    }


def test_generate_pdf_success():
    c = client()
    payload = {"doc_type": "notice", "fields": base_fields()}
    resp = c.post("/generate/pdf", json=payload)
    assert resp.status_code == 200, resp.text
    assert resp.headers.get("content-type", "").startswith("application/pdf")
    cd = resp.headers.get("content-disposition", "")
    assert "attachment" in cd and payload["doc_type"] in cd
    data = resp.content
    assert data.startswith(b"%PDF")
    assert b"FAKE GENERATED DOCUMENT CONTENT" in data


def test_generate_docx_success():
    c = client()
    payload = {"doc_type": "complaint", "fields": base_fields()}
    resp = c.post("/generate/docx", json=payload)
    assert resp.status_code == 200, resp.text
    assert resp.headers.get("content-type", "") == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    cd = resp.headers.get("content-disposition", "")
    assert "attachment" in cd and payload["doc_type"] in cd
    data = resp.content
    # DOCX is a ZIP archive starting with PK
    assert data.startswith(b"PK")
    assert b"FAKE GENERATED DOCUMENT CONTENT" in data


def test_export_invalid_input_missing_field():
    c = client()
    fields = base_fields()
    # remove petitioner_name to trigger pydantic validation error
    fields.pop("petitioner_name")
    payload = {"doc_type": "notice", "fields": fields}
    resp = c.post("/generate/pdf", json=payload)
    assert resp.status_code == 422


def test_export_empty_required_field_triggers_validation():
    c = client()
    fields = base_fields()
    # make required field empty so our custom validator kicks in
    fields["petitioner_address"] = ""
    payload = {"doc_type": "affidavit", "fields": fields}
    resp = c.post("/generate/docx", json=payload)
    assert resp.status_code == 422 or resp.status_code == 400
