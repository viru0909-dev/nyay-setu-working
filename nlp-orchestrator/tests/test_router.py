from router import classify_question


def test_complex_query_routes_to_gemini():
    query = (
        "Explain the constitutional validity and judicial review "
        "in a supreme court precedent"
    )
    assert classify_question(query) == "gemini"


def test_simple_query_routes_to_groq():
    query = "What is the penalty under IPC section 420?"
    assert classify_question(query) == "groq"


def test_short_query_routes_to_groq():
    query = "What is bail?"
    assert classify_question(query) == "groq"


def test_long_query_routes_to_gemini():
    query = (
        "Can you explain the historical development of constitutional "
        "jurisprudence in India and how judicial interpretation evolved "
        "through landmark amendments and doctrines?"
    )
    assert classify_question(query) == "gemini"


def test_empty_query_routes_to_groq():
    query = ""
    assert classify_question(query) == "groq"


def test_mixed_query_prefers_gemini_when_complex_keywords_dominate():
    query = (
        "Explain supreme court precedent and constitutional interpretation "
        "for bail procedure"
    )
    assert classify_question(query) == "gemini"


def test_medium_length_without_keywords_defaults_to_groq():
    query = "Tell me details regarding filing documents before district court"
    assert classify_question(query) == "groq"