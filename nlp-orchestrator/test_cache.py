#!/usr/bin/env python3
"""
Test script for validating NLP cache functionality.
"""

import sys
import os
import time

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

from cache import (
    generate_cache_key,
    get_cached_response,
    set_cached_response,
    get_cache_stats,
    clear_expired_cache
)


def test_cache():
    print("Testing NLP cache implementation")
    print("-" * 50)

    # Test 1: Cache key generation
    print("\n1. Testing cache key generation")

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

    print(f"Key1: {key1[:16]}...")
    print(f"Key2: {key2[:16]}...")
    print(f"Key3: {key3[:16]}...")

    assert key1 == key2, \
        "Same inputs should generate identical cache keys"

    assert key1 != key3, \
        "Different inputs should generate different cache keys"

    print("Cache key generation verified")

    # Test 2: Cache set/get
    print("\n2. Testing cache storage and retrieval")

    test_response = (
        "IPC Section 420 deals with cheating and dishonesty."
    )

    set_cached_response(key1, test_response)

    cached = get_cached_response(key1)

    assert cached == test_response, \
        "Cached response retrieval failed"

    print("Cache storage and retrieval verified")

    # Test 3: Cache miss handling
    print("\n3. Testing cache miss handling")

    miss = get_cached_response("nonexistent_key")

    assert miss is None, \
        "Nonexistent keys should return None"

    print("Cache miss handling verified")

    # Test 4: Cache statistics
    print("\n4. Testing cache statistics")

    stats = get_cache_stats()

    print(f"Cache stats: {stats}")

    assert stats["total_entries"] >= 1, \
        "Expected at least one cache entry"

    print("Cache statistics verified")

    # Test 5: Expired cache cleanup
    print("\n5. Testing expired cache cleanup")

    cleared = clear_expired_cache()

    print(f"Expired entries cleared: {cleared}")

    print("Expired cache cleanup verified")

    # Test 6: TTL expiry
    print("\n6. Testing TTL expiration")

    key_ttl = generate_cache_key(
        "groq",
        "TTL test question",
        "llama3-8b"
    )

    set_cached_response(
        key_ttl,
        "This cache entry should expire"
    )

    # Verify immediate retrieval
    cached_immediate = get_cached_response(key_ttl)

    assert cached_immediate == \
        "This cache entry should expire", \
        "Cache entry should exist immediately after storage"

    print("Waiting for cache expiration...")
    time.sleep(11)

    # Verify expiration
    cached_expired = get_cached_response(key_ttl)

    assert cached_expired is None, \
        "Cache entry should expire after TTL duration"

    cleared = clear_expired_cache()

    print(f"Expired entries cleared: {cleared}")

    print("TTL expiration verified")

    print("\nAll cache tests completed successfully")


if __name__ == "__main__":
    test_cache()