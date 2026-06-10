import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    CircuitBreaker,
    CIRCUIT_STATE,
    executeWithResilience,
    getBackoffDelay,
    isRetryableError,
    resetCircuitBreaker,
} from './streamResilience';

describe('streamResilience utilities', () => {
    beforeEach(() => {
        resetCircuitBreaker();
        vi.restoreAllMocks();
    });

    it('calculates exponential backoff with max delay', () => {
        expect(
            getBackoffDelay(0, {
                baseDelayMs: 1000,
                maxDelayMs: 10000,
                jitter: false,
            })
        ).toBe(1000);

        expect(
            getBackoffDelay(2, {
                baseDelayMs: 1000,
                maxDelayMs: 10000,
                jitter: false,
            })
        ).toBe(4000);

        expect(
            getBackoffDelay(5, {
                baseDelayMs: 1000,
                maxDelayMs: 8000,
                jitter: false,
            })
        ).toBe(8000);
    });

    it('marks network and server errors as retryable', () => {
        expect(isRetryableError(new Error('Network failed'))).toBe(true);
        expect(isRetryableError({ status: 429 })).toBe(true);
        expect(isRetryableError({ status: 503 })).toBe(true);
        expect(isRetryableError({ status: 400 })).toBe(false);
        expect(isRetryableError({ name: 'AbortError' })).toBe(false);
    });

    it('opens the circuit after repeated failures', () => {
        const breaker = new CircuitBreaker({
            failureThreshold: 2,
            cooldownMs: 30000,
        });

        expect(breaker.canRequest()).toBe(true);

        breaker.recordFailure();
        expect(breaker.state).toBe(CIRCUIT_STATE.CLOSED);

        breaker.recordFailure();
        expect(breaker.state).toBe(CIRCUIT_STATE.OPEN);
        expect(breaker.canRequest()).toBe(false);
    });

    it('retries retryable operations before succeeding', async () => {
        const operation = vi
            .fn()
            .mockRejectedValueOnce({ status: 503 })
            .mockResolvedValueOnce('ok');

        await expect(
            executeWithResilience(operation, {
                breakerKey: 'retry-test',
                maxRetries: 1,
                baseDelayMs: 0,
                maxDelayMs: 0,
                jitter: false,
            })
        ).resolves.toBe('ok');

        expect(operation).toHaveBeenCalledTimes(2);
    });

    it('does not retry non-retryable client errors', async () => {
        const operation = vi.fn().mockRejectedValue({ status: 400 });

        await expect(
            executeWithResilience(operation, {
                breakerKey: 'client-error-test',
                maxRetries: 2,
                baseDelayMs: 0,
                maxDelayMs: 0,
                jitter: false,
            })
        ).rejects.toEqual({ status: 400 });

        expect(operation).toHaveBeenCalledTimes(1);
    });
});
