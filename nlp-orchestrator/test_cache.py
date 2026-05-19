import time

from cache import (
    generate_cache_key,
    get_cached_response,
    set_cached_response,
    get_cache_stats,
    clear_expired_cache
)


def test_cache():

    key1 = generate_cache_key(
        "groq",
        "What is IPC section 420?",
        "llama3-8b"
    )

    key2 = generate_cache_key(
        "groq",
        "What is IPC section 420?",
        "llama3-8b"
    )

    key3 = generate_cache_key(
        "groq",
        "What is IPC section 421?",
        "llama3-8b"
    )

    assert key1 == key2
    assert key1 != key3

    test_response = (
        "IPC Section 420 deals with cheating and dishonesty."
    )

    set_cached_response(key1, test_response)

    cached = get_cached_response(key1)

    assert cached == test_response

    miss = get_cached_response("nonexistent_key")

    assert miss is None

    stats = get_cache_stats()

    assert stats["total_entries"] >= 1

    clear_expired_cache()

    key_ttl = generate_cache_key(
        "groq",
        "TTL test question",
        "llama3-8b"
    )

    set_cached_response(
        key_ttl,
        "This cache entry should expire",
        ttl=2
    )

    cached_immediate = get_cached_response(key_ttl)

    assert cached_immediate is not None

    time.sleep(3)

    cached_expired = get_cached_response(key_ttl)

    assert cached_expired is None