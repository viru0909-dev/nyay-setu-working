"""
Simple In-Memory TTL Cache for NLP Responses
"""

import time
import hashlib
import logging

logger = logging.getLogger("nlp-cache")

# Cache configuration
CACHE_TTL = 300  # 5 minutes
cache_store = {}

def generate_cache_key(provider: str, prompt: str, model: str = "", **kwargs) -> str:
    """
    Generate a deterministic cache key from provider, prompt, and optional parameters.
    """
    # Normalize the prompt
    normalized_prompt = prompt.strip().lower()

    # Create key components
    key_parts = [provider, normalized_prompt, model]

    # Add any additional parameters that might affect the response
    for k, v in sorted(kwargs.items()):
        if k not in ['temperature', 'max_tokens']:  # Skip non-deterministic params
            key_parts.append(f"{k}:{v}")

    # Create hash for consistent key
    key_string = "|".join(key_parts)
    cache_key = hashlib.md5(key_string.encode()).hexdigest()

    return cache_key

def get_cached_response(cache_key: str) -> str | None:
    """
    Retrieve cached response if valid and not expired.
    Returns the response text or None if not cached/expired.
    """
    if cache_key not in cache_store:
        return None

    data = cache_store[cache_key]

    # Check expiration
    if time.time() > data["expires_at"]:
        logger.info(f"Cache EXPIRED for key: {cache_key}")
        del cache_store[cache_key]
        return None

    logger.info(f"Cache HIT for key: {cache_key}")
    return data["response"]

def set_cached_response(
    cache_key: str,
    response: str,
    ttl: int = CACHE_TTL
) -> None:
    """
    Store response in cache with TTL.
    """
    cache_store[cache_key] = {
        "response": response,
        "expires_at": time.time() + ttl,
        "created_at": time.time()
    }

    logger.info(f"Cache STORED for key: {cache_key}")

def clear_expired_cache() -> int:
    """
    Remove expired entries from cache.
    Returns number of entries removed.
    """
    current_time = time.time()
    expired_keys = [
        key for key, data in cache_store.items()
        if current_time > data["expires_at"]
    ]

    for key in expired_keys:
        del cache_store[key]

    if expired_keys:
        logger.info(f"Cleaned {len(expired_keys)} expired cache entries")

    return len(expired_keys)

def get_cache_stats() -> dict:
    """
    Get cache statistics for monitoring.
    """
    total_entries = len(cache_store)
    current_time = time.time()
    valid_entries = sum(1 for data in cache_store.values() if current_time <= data["expires_at"])

    return {
        "total_entries": total_entries,
        "valid_entries": valid_entries,
        "expired_entries": total_entries - valid_entries
    }