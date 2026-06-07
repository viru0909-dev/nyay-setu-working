"""
Redis-backed TTL Cache for NLP Responses and Embeddings
Replaces the old in-memory dict with Redis persistence.
Falls back gracefully to in-memory if Redis is unavailable.
"""

import time
import hashlib
import json
import logging
import os
from typing import Optional, Any

logger = logging.getLogger("nlp-cache")

# ─── TTL Config ───────────────────────────────────────────────────────────────
CACHE_TTL = int(os.getenv("CACHE_TTL_SECONDS", "86400"))       # 24h for LLM responses
EMBEDDING_CACHE_TTL = int(os.getenv("EMBEDDING_CACHE_TTL_SECONDS", "604800"))  # 7 days for embeddings
CACHE_ENABLED = os.getenv("CACHE_ENABLED", "true").lower() in {"1", "true", "yes", "on"}
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CACHE_KEY_PREFIX = "nyay"

# ─── Fallback In-Memory Store (used when Redis is unavailable) ────────────────
_memory_store: dict = {}

# ─── Redis Client (lazy-initialized) ─────────────────────────────────────────
_redis_client = None
_redis_available = False


def _get_redis():
    """Lazily connect to Redis. Returns client or None if unavailable."""
    global _redis_client, _redis_available

    if not CACHE_ENABLED:
        return None

    if _redis_client is not None:
        return _redis_client if _redis_available else None

    try:
        import redis
        client = redis.from_url(REDIS_URL, decode_responses=True, socket_connect_timeout=2)
        client.ping()
        _redis_client = client
        _redis_available = True
        logger.info(f"[Cache] Redis connected at {REDIS_URL}")
        return _redis_client
    except ImportError:
        logger.warning("[Cache] redis package not installed. Run: pip install redis[asyncio]. Using in-memory fallback.")
        _redis_available = False
        return None
    except Exception as e:
        logger.warning(f"[Cache] Redis unavailable ({e}). Using in-memory fallback.")
        _redis_available = False
        return None


def _full_key(cache_key: str) -> str:
    return f"{CACHE_KEY_PREFIX}:{cache_key}"


# ─── Key Generation ───────────────────────────────────────────────────────────

def generate_cache_key(
    provider: str,
    prompt: str,
    model: str = "",
    **kwargs
) -> str:
    """Generate a deterministic MD5 cache key from provider + prompt + model."""
    normalized_prompt = prompt.strip().lower()

    key_parts = [provider, normalized_prompt, model]

    for k, v in sorted(kwargs.items()):
        if k not in ["temperature", "max_tokens"]:
            key_parts.append(f"{k}:{v}")

    key_string = "|".join(key_parts)

    return hashlib.md5(key_string.encode()).hexdigest()


def generate_embedding_cache_key(text: str) -> str:
    """Generate a SHA-256 cache key for an embedding query."""
    h = hashlib.sha256(text.strip().lower().encode()).hexdigest()
    return f"emb:{h}"


# ─── Core Get/Set (sync, used by existing main.py calls) ─────────────────────

def get_cached_response(cache_key: str) -> Optional[str]:
    """
    Fetch a cached LLM response string.
    Tries Redis first, falls back to in-memory dict.
    """
    if not CACHE_ENABLED:
        return None

    full_key = _full_key(cache_key)
    r = _get_redis()

    if r is not None:
        try:
            val = r.get(full_key)
            if val is not None:
                logger.info(f"[Cache] Redis HIT: {cache_key[:16]}...")
                return val
            return None
        except Exception as e:
            logger.warning(f"[Cache] Redis get failed ({e}), trying memory fallback")

    # In-memory fallback
    data = _memory_store.get(full_key)
    if data is None:
        return None
    if time.time() > data["expires_at"]:
        logger.info(f"[Cache] Memory EXPIRED: {cache_key[:16]}...")
        del _memory_store[full_key]
        return None

    logger.info(f"[Cache] Memory HIT: {cache_key[:16]}...")
    return data["response"]


def set_cached_response(
    cache_key: str,
    response: str,
    ttl: int = CACHE_TTL
) -> None:
    """
    Store an LLM response string.
    Writes to Redis if available, always writes to in-memory fallback.
    """
    if not CACHE_ENABLED:
        return

    full_key = _full_key(cache_key)
    r = _get_redis()

    if r is not None:
        try:
            r.setex(full_key, ttl, response)
            logger.info(f"[Cache] Redis SET: {cache_key[:16]}... (TTL={ttl}s)")
            return
        except Exception as e:
            logger.warning(f"[Cache] Redis set failed ({e}), writing to memory fallback")

    # In-memory fallback
    _memory_store[full_key] = {
        "response": response,
        "expires_at": time.time() + ttl,
        "created_at": time.time()
    }
    logger.info(f"[Cache] Memory SET: {cache_key[:16]}... (TTL={ttl}s)")


# ─── Embedding Cache (stores list[list[float]]) ───────────────────────────────

def get_cached_embedding(text: str) -> Optional[list]:
    """Fetch a cached embedding vector for a query string."""
    if not CACHE_ENABLED:
        return None

    cache_key = generate_embedding_cache_key(text)
    full_key = _full_key(cache_key)
    r = _get_redis()

    if r is not None:
        try:
            val = r.get(full_key)
            if val is not None:
                logger.info(f"[Cache] Embedding Redis HIT for: {text[:40]!r}")
                return json.loads(val)
            return None
        except Exception as e:
            logger.warning(f"[Cache] Embedding Redis get failed ({e})")

    # In-memory fallback
    data = _memory_store.get(full_key)
    if data is None:
        return None
    if time.time() > data["expires_at"]:
        del _memory_store[full_key]
        return None

    logger.info(f"[Cache] Embedding Memory HIT for: {text[:40]!r}")
    return data["response"]


def set_cached_embedding(text: str, embedding: list, ttl: int = EMBEDDING_CACHE_TTL) -> None:
    """Store an embedding vector (list[list[float]]) keyed by the source text."""
    if not CACHE_ENABLED:
        return

    cache_key = generate_embedding_cache_key(text)
    full_key = _full_key(cache_key)
    r = _get_redis()

    serialized = json.dumps(embedding)

    if r is not None:
        try:
            r.setex(full_key, ttl, serialized)
            logger.info(f"[Cache] Embedding Redis SET for: {text[:40]!r} (TTL={ttl}s)")
            return
        except Exception as e:
            logger.warning(f"[Cache] Embedding Redis set failed ({e}), using memory fallback")

    _memory_store[full_key] = {
        "response": embedding,
        "expires_at": time.time() + ttl,
        "created_at": time.time()
    }


# ─── Stats & Maintenance ─────────────────────────────────────────────────────

def clear_expired_cache() -> int:
    """Clear expired entries from in-memory fallback store. Redis handles its own TTLs."""
    current_time = time.time()
    expired_keys = [
        key for key, data in _memory_store.items()
        if current_time > data["expires_at"]
    ]
    for key in expired_keys:
        del _memory_store[key]
    return len(expired_keys)


def get_cache_stats() -> dict:
    """Return current cache stats from Redis (if available) and in-memory fallback."""
    r = _get_redis()
    redis_info = {}

    if r is not None:
        try:
            info = r.info("memory")
            keyspace = r.info("keyspace")
            db_info = keyspace.get("db0", {})
            redis_info = {
                "backend": "redis",
                "redis_url": REDIS_URL,
                "used_memory_human": info.get("used_memory_human"),
                "total_keys": db_info.get("keys", 0),
            }
        except Exception as e:
            redis_info = {"backend": "redis", "error": str(e)}
    else:
        redis_info = {"backend": "in-memory (Redis unavailable)"}

    current_time = time.time()
    valid_memory = sum(1 for d in _memory_store.values() if current_time <= d["expires_at"])
    total_memory = len(_memory_store)

    return {
        **redis_info,
        "cache_enabled": CACHE_ENABLED,
        "memory_fallback": {
            "total_entries": total_memory,
            "valid_entries": valid_memory,
            "expired_entries": total_memory - valid_memory,
        }
    }
