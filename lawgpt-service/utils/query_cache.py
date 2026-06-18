from cachetools import TTLCache
from threading import Lock
import hashlib
import os
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger("lawgpt")

# Configurable cache
CACHE_MAX_SIZE = int(os.getenv("QUERY_CACHE_MAX_SIZE", 500))
CACHE_TTL_SECONDS = int(os.getenv("QUERY_CACHE_TTL", 3600))

_query_cache = TTLCache(maxsize=CACHE_MAX_SIZE, ttl=CACHE_TTL_SECONDS)
_cache_lock = Lock()


def _generate_cache_key(query: str) -> str:
    return hashlib.sha256(query.strip().lower().encode()).hexdigest()


def get_cached_response(query: str):
    key = _generate_cache_key(query)
    with _cache_lock:
        return _query_cache.get(key)


def set_cached_response(query: str, response):
    key = _generate_cache_key(query)
    with _cache_lock:
        _query_cache[key] = response

def is_static_query(query: str) -> bool:
    """
    Checks if a query is static and safe to cache.
    Avoids caching queries with personal pronouns or specific names.
    """
    normalized = f" {query.lower()} "
    personal_pronouns = [" i ", " my ", " me ", " we ", " our ", " mine ", " ours "]
    
    for pronoun in personal_pronouns:
        if pronoun in normalized:
            return False
            
    return True

