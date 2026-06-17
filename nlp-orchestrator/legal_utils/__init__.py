import asyncio
import logging
from functools import wraps

logger = logging.getLogger(__name__)


def async_retry(max_attempts: int = 3, delay: float = 1.0):
    """Async retry decorator with exponential backoff."""

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            attempt = 1
            while True:
                try:
                    return await func(*args, **kwargs)
                except Exception as exc:
                    if attempt >= max_attempts:
                        raise
                    logger.warning(
                        f"Retry attempt {attempt} failed due to: {exc}. "
                        f"Retrying in {delay * attempt} seconds..."
                    )
                    await asyncio.sleep(delay * attempt)
                    attempt += 1

        return wrapper

    return decorator
