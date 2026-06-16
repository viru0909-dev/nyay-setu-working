from fastapi import FastAPI
from fastapi.testclient import TestClient

from routers.contradictions import router as contradictions_router

app = FastAPI()
app.include_router(contradictions_router)

client = TestClient(app)


def test_contradiction_analyze_endpoint_and_status_update():
    response = client.post(
        "/api/contradictions/analyze",
        json={
            "case_id": "CASE-API-001",
            "documents": [
                {
                    "id": "fir-1",
                    "name": "FIR",
                    "type": "FIR",
                    "text": "The incident occurred at 8:00 PM near City Mall.",
                },
                {
                    "id": "witness-1",
                    "name": "Witness Statement",
                    "type": "Witness Statement",
                    "text": "The incident occurred at 11:00 PM near City Mall.",
                },
            ],
        },
    )

    assert response.status_code == 200
    body = response.json()

    assert body["case_id"] == "CASE-API-001"
    assert body["summary"]["total_contradictions"] >= 1

    report_id = body["report_id"]
    contradiction_id = body["contradictions"][0]["id"]

    status_url = (
        f"/api/contradictions/reports/{report_id}"
        f"/contradictions/{contradiction_id}/status"
    )

    update_response = client.patch(
        status_url,
        json={"status": "confirmed"},
    )

    assert update_response.status_code == 200
    assert update_response.json()["status"] == "confirmed"
