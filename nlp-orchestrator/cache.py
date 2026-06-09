"""
Simple In-Memory TTL Cache for NLP Responses
"""

from functools import wraps
import time
import hashlib
import logging
import asyncio

logger = logging.getLogger("nlp-cache")

CACHE_TTL = 300  # 5 minutes
MAX_CACHE_SIZE = 10000

try:
    from cachetools import TTLCache
    cache_store: TTLCache = TTLCache(maxsize=MAX_CACHE_SIZE, ttl=CACHE_TTL)
except ImportError:
    cache_store = {}

_in_flight: dict[str, asyncio.Future] = {}


def generate_cache_key(provider: str, prompt: str, model: str = "", **kwargs) -> str:

    normalized_prompt = prompt.strip().lower()

    key_parts = [provider, normalized_prompt, model]

    for k, v in sorted(kwargs.items()):
        if k not in ["temperature", "max_tokens"]:
            key_parts.append(f"{k}:{v}")

    key_string = "|".join(key_parts)

    return hashlib.md5(key_string.encode()).hexdigest()


def get_cached_response(cache_key: str) -> str | None:

    data = cache_store.get(cache_key)
    if data is None:
        return None

    if time.time() > data["expires_at"]:
        logger.info(f"Cache EXPIRED for key: {cache_key}")
        try:
            del cache_store[cache_key]
        except KeyError:
            pass
        return None

    logger.info(f"Cache HIT for key: {cache_key}")
    return data["response"]


def set_cached_response(cache_key: str, response: str, ttl: int = CACHE_TTL) -> None:

    cache_store[cache_key] = {
        "response": response,
        "expires_at": time.time() + ttl,
        "created_at": time.time(),
    }

    logger.info(f"Cache STORED for key: {cache_key}")


def clear_expired_cache() -> int:

    count = 0
    current_time = time.time()
    expired_keys = [
        k for k, v in list(cache_store.items()) if current_time > v["expires_at"]
    ]
    for k in expired_keys:
        try:
            del cache_store[k]
            count += 1
        except KeyError:
            pass
    return count


def get_cache_stats() -> dict:

    total_entries = len(cache_store)

    current_time = time.time()

    valid_entries = sum(
        1 for data in cache_store.values() if current_time <= data["expires_at"]
    )

    return {
        "total_entries": total_entries,
        "valid_entries": valid_entries,
        "expired_entries": total_entries - valid_entries,
    }


def cache_decorator(ttl: int = CACHE_TTL):
    """Decorator to cache asynchronous function results based on arguments."""

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Create a cache key from function name and arguments
            arg_str = "-".join([str(arg) for arg in args])
            kwarg_str = "-".join([f"{k}:{v}" for k, v in sorted(kwargs.items())])
            raw_key = f"{func.__name__}-{arg_str}-{kwarg_str}"
            cache_key = hashlib.md5(raw_key.encode()).hexdigest()

            cached = get_cached_response(cache_key)
            if cached is not None:
                return cached

            # Deduplicate concurrent identical in-flight requests
            if cache_key in _in_flight:
                return await _in_flight[cache_key]

            future = asyncio.get_event_loop().create_future()
            _in_flight[cache_key] = future
            try:
                result = await func(*args, **kwargs)
                set_cached_response(cache_key, result, ttl)
                future.set_result(result)
                return result
            except Exception as e:
                future.set_exception(e)
                raise
            finally:
                _in_flight.pop(cache_key, None)

        return wrapper

    return decorator
