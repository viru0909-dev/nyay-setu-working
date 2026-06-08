import pytest


@pytest.fixture(autouse=True)
def _set_test_env_vars(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "test-dummy-key")
    monkeypatch.setenv("GOOGLE_GEMINI_API_KEY", "test-dummy-gemini-key")