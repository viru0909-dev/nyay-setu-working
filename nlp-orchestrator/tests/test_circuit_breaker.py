"""
Unit tests for CircuitBreaker in utils.py
"""
import time
import pytest
from utils import CircuitBreaker


def test_initial_state_is_closed():
    breaker = CircuitBreaker()
    assert breaker.state == "CLOSED"
    assert breaker.is_available() is True


def test_opens_after_threshold():
    breaker = CircuitBreaker(failure_threshold=3)
    for _ in range(3):
        breaker.call_failed()
    assert breaker.state == "OPEN"
    assert breaker.is_available() is False


def test_resets_on_success():
    breaker = CircuitBreaker(failure_threshold=3)
    for _ in range(2):
        breaker.call_failed()
    breaker.call_succeeded()
    assert breaker.state == "CLOSED"
    assert breaker.failure_count == 0


def test_half_open_after_recovery_timeout():
    breaker = CircuitBreaker(failure_threshold=3, recovery_timeout=1)
    for _ in range(3):
        breaker.call_failed()
    assert breaker.state == "OPEN"
    breaker.last_failure_time = time.time() - 2
    assert breaker.is_available() is True
    assert breaker.state == "HALF_OPEN"


def test_still_open_before_recovery_timeout():
    breaker = CircuitBreaker(failure_threshold=3, recovery_timeout=60)
    for _ in range(3):
        breaker.call_failed()
    assert breaker.is_available() is False
    assert breaker.state == "OPEN"