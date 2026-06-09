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


def is_retryable_exception(exc: Exception) -> bool:
    """Return True for exceptions that are transient and worth retrying.

    Retry for network/connectivity/timeouts and server 5xx/429 errors.
    Do not retry for client errors like 400/401/403/404.
    """
    # Network/timeouts
    if isinstance(exc, (
        httpx.TimeoutException,
        httpx.ConnectError,
        aiohttp.ClientTimeout,
        aiohttp.ClientConnectorError,
        aiohttp.ServerDisconnectedError,
    )):
        return True

    # Inspect HTTP status codes when available
    status_code = None
    if isinstance(exc, httpx.HTTPStatusError):
        response = exc.response
        status_code = getattr(response, "status_code", None)
    else:
        response = getattr(exc, "response", None)
        if response is not None:
            status_code = getattr(response, "status_code", None)

    if status_code is not None:
        return status_code in {429, 500, 502, 503, 504}

    return False

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
