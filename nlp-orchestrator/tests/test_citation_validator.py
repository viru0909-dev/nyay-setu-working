from validators.citation_validator import validate_citation, validate_citations_from_text
from utils.citation_extractor import extract_legal_citations


def test_extract_ipc_section_simple():
    result = extract_legal_citations("Please explain IPC Section 420 and its consequences.")
    assert result == [{"raw": "IPC Section 420", "act": "IPC", "section": "420"}]


def test_extract_various_formats():
    text = "Under u/s 420 IPC and Section 376 of CrPC, please advise."
    result = extract_legal_citations(text)
    assert {tuple(item.values()) for item in result} == {
        ("u/s 420 IPC", "IPC", "420"),
        ("Section 376 of CrPC", "CrPC", "376"),
    }


def test_validate_known_ipc_section():
    result = validate_citation("IPC", "420")
    assert result["valid"] is True
    assert result["act"] == "IPC"
    assert result["section"] == "420"


def test_validate_unknown_ipc_section():
    result = validate_citation("IPC", "999")
    assert result["valid"] is False
    assert "out of range" in result["message"].lower()


def test_validate_malformed_citation():
    result = validate_citation("IPC", "abc")
    assert result["valid"] is False
    assert "malformed" in result["message"].lower()


def test_validate_citations_from_text_with_invalid_reference():
    text = "The answer cites IPC Section 999 and Article 21."
    results = validate_citations_from_text(text)
    assert any(item["valid"] for item in results)
    assert any(item["valid"] is False for item in results)
    assert {item["citation"] for item in results} == {"IPC Section 999", "Article 21"}
