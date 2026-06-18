import pytest

"""
Unit tests for CircuitBreaker in utils.py
"""

import time
from utils import CircuitBreaker


@pytest.mark.asyncio
async def test_initial_state_is_closed():
    breaker = CircuitBreaker()
    assert breaker.state == "CLOSED"
    assert await breaker.is_available() is True


@pytest.mark.asyncio
async def test_opens_after_threshold():
    breaker = CircuitBreaker(failure_threshold=3)
    for _ in range(3):
        await breaker.call_failed()
    assert breaker.state == "OPEN"
    assert await breaker.is_available() is False


@pytest.mark.asyncio
async def test_resets_on_success():
    breaker = CircuitBreaker(failure_threshold=3)
    for _ in range(2):
        await breaker.call_failed()
    await breaker.call_succeeded()
    assert breaker.state == "CLOSED"
    assert breaker.failure_count == 0


@pytest.mark.asyncio
async def test_half_open_after_recovery_timeout():
    breaker = CircuitBreaker(failure_threshold=3, recovery_timeout=1)
    for _ in range(3):
        await breaker.call_failed()
    assert breaker.state == "OPEN"
    breaker.last_failure_time = time.time() - 2
    assert await breaker.is_available() is True
    assert breaker.state == "HALF_OPEN"


@pytest.mark.asyncio
async def test_still_open_before_recovery_timeout():
    breaker = CircuitBreaker(failure_threshold=3, recovery_timeout=60)
    for _ in range(3):
        await breaker.call_failed()
    assert await breaker.is_available() is False
    assert breaker.state == "OPEN"
