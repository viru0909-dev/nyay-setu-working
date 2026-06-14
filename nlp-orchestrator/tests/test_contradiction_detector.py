from services.contradiction_detector import detect_contradictions


def test_detects_time_contradiction_between_documents():
    documents = [
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
    ]

    report = detect_contradictions(documents, case_id="CASE-001")

    assert report["summary"]["total_contradictions"] >= 1
    assert any(item["field"] == "time" for item in report["contradictions"])


def test_no_time_contradiction_for_same_normalized_time():
    documents = [
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
            "text": "The incident occurred at 8 PM near City Mall.",
        },
    ]

    report = detect_contradictions(documents, case_id="CASE-002")

    time_contradictions = [
        item for item in report["contradictions"] if item["field"] == "time"
    ]

    assert time_contradictions == []


def test_detects_date_contradiction_between_documents():
    documents = [
        {
            "id": "affidavit-1",
            "name": "Affidavit",
            "type": "Affidavit",
            "text": "The incident happened on 12/05/2026.",
        },
        {
            "id": "statement-1",
            "name": "Witness Statement",
            "type": "Witness Statement",
            "text": "The incident happened on 13/05/2026.",
        },
    ]

    report = detect_contradictions(documents, case_id="CASE-003")

    assert any(item["field"] == "date" for item in report["contradictions"])
