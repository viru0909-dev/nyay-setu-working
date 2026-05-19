import time
import logging
import aiohttp
import httpx
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log
)

# for async retry
from functools import wraps
import asyncio

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

# Retry Decorator 
retry_transient = retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=4),
    retry=retry_if_exception_type((
        httpx.TimeoutException,
        httpx.ConnectError,
        aiohttp.ClientTimeout,
        aiohttp.ClientConnectorError,
        aiohttp.ServerDisconnectedError,
    )),
    before_sleep=before_sleep_log(logger, logging.WARNING),
    reraise=True
)

# Circuit Breaker 
class CircuitBreaker:
    def __init__(self, failure_threshold=5, recovery_timeout=60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "CLOSED"

    def call_succeeded(self):
        self.failure_count = 0
        self.state = "CLOSED"
        logger.info("[CircuitBreaker] State → CLOSED")

    def call_failed(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"
            logger.warning(
                f"[CircuitBreaker] State → OPEN after {self.failure_count} failures"
            )

    def is_available(self):
        if self.state == "CLOSED":
            return True
        if self.state == "OPEN":
            if time.time() - self.last_failure_time >= self.recovery_timeout:
                self.state = "HALF_OPEN"
                logger.info("[CircuitBreaker] State → HALF_OPEN, sending probe")
                return True
            return False
        if self.state == "HALF_OPEN":
            return True
