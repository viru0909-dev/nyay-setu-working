const breakerRegistry = new Map();

export const CIRCUIT_STATE = {
    CLOSED: 'closed',
    OPEN: 'open',
    HALF_OPEN: 'half-open',
};

export class StreamResilienceError extends Error {
    constructor(message, options = {}) {
        super(message);
        this.name = 'StreamResilienceError';
        this.status = options.status;
        this.cause = options.cause;
        this.retryable = options.retryable ?? true;
    }
}

export class CircuitBreaker {
    constructor({ failureThreshold = 3, cooldownMs = 30000 } = {}) {
        this.failureThreshold = failureThreshold;
        this.cooldownMs = cooldownMs;
        this.state = CIRCUIT_STATE.CLOSED;
        this.failureCount = 0;
        this.openedAt = null;
    }

    canRequest() {
        if (this.state !== CIRCUIT_STATE.OPEN) return true;

        const elapsed = Date.now() - this.openedAt;
        if (elapsed >= this.cooldownMs) {
            this.state = CIRCUIT_STATE.HALF_OPEN;
            return true;
        }

        return false;
    }

    recordSuccess() {
        this.state = CIRCUIT_STATE.CLOSED;
        this.failureCount = 0;
        this.openedAt = null;
    }

    recordFailure() {
        this.failureCount += 1;

        if (this.failureCount >= this.failureThreshold) {
            this.state = CIRCUIT_STATE.OPEN;
            this.openedAt = Date.now();
        }
    }
}

export const getCircuitBreaker = (key = 'default-stream', options = {}) => {
    if (!breakerRegistry.has(key)) {
        breakerRegistry.set(key, new CircuitBreaker(options));
    }

    return breakerRegistry.get(key);
};

export const resetCircuitBreaker = (key) => {
    if (key) {
        breakerRegistry.delete(key);
        return;
    }

    breakerRegistry.clear();
};

export const sleep = (ms) =>
    new Promise((resolve) => globalThis.setTimeout(resolve, ms));

export const getBackoffDelay = (
    attempt,
    { baseDelayMs = 800, maxDelayMs = 8000, jitter = true } = {}
) => {
    const exponentialDelay = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
    const jitterAmount = jitter ? Math.floor(Math.random() * 250) : 0;
    return exponentialDelay + jitterAmount;
};

export const isAbortError = (error) => error?.name === 'AbortError';

export const isRetryableError = (error) => {
    if (!error || isAbortError(error)) return false;

    const status = error.status || error.response?.status;

    if (!status) return true;

    return status === 408 || status === 429 || status >= 500;
};

export async function executeWithResilience(
    operation,
    {
        breakerKey = 'default-operation',
        breakerOptions,
        maxRetries = 2,
        baseDelayMs = 800,
        maxDelayMs = 8000,
        jitter = true,
        onRetry,
        onCircuitOpen,
    } = {}
) {
    const breaker = getCircuitBreaker(breakerKey, breakerOptions);

    if (!breaker.canRequest()) {
        onCircuitOpen?.(breaker);

        throw new StreamResilienceError(
            'Circuit breaker is open. Please retry after a short cooldown.',
            { retryable: true }
        );
    }

    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
        try {
            const result = await operation({ attempt });
            breaker.recordSuccess();
            return result;
        } catch (error) {
            lastError = error;

            if (!isRetryableError(error) || attempt === maxRetries) {
                breaker.recordFailure();
                throw error;
            }

            const delay = getBackoffDelay(attempt, {
                baseDelayMs,
                maxDelayMs,
                jitter,
            });

            onRetry?.({ attempt: attempt + 1, delay, error });
            await sleep(delay);
        }
    }

    breaker.recordFailure();
    throw lastError;
}

const parseSseLine = (line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith(':')) return null;
    if (!trimmed.startsWith('data:')) return null;

    const payload = trimmed.replace(/^data:\s?/, '');

    if (!payload || payload === '[DONE]') return null;

    return JSON.parse(payload);
};

export async function consumeSSEStream({
    request,
    signal,
    breakerKey = 'default-sse-stream',
    maxRetries = 3,
    onOpen,
    onEvent,
    onRawChunk,
    onRetry,
    onComplete,
    onParseError,
}) {
    return executeWithResilience(
        async ({ attempt }) => {
            const response = await request({ signal, attempt });

            if (!response.ok) {
                throw new StreamResilienceError(
                    `Stream request failed with status ${response.status}`,
                    { status: response.status }
                );
            }

            if (!response.body) {
                throw new StreamResilienceError('Stream response body is empty');
            }

            onOpen?.({ attempt });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                if (signal?.aborted) {
                    throw new DOMException('Stream aborted', 'AbortError');
                }

                const { done, value } = await reader.read();

                if (done) break;

                onRawChunk?.(value);

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split(/\r?\n/);
                buffer = lines.pop() || '';

                for (const line of lines) {
                    try {
                        const event = parseSseLine(line);
                        if (event) onEvent?.(event);
                    } catch (error) {
                        onParseError?.({ line, error });
                    }
                }
            }

            if (buffer.trim()) {
                try {
                    const event = parseSseLine(buffer);
                    if (event) onEvent?.(event);
                } catch (error) {
                    onParseError?.({ line: buffer, error });
                }
            }

            onComplete?.();
            return true;
        },
        {
            breakerKey,
            maxRetries,
            onRetry,
        }
    );
}

export const downloadPartialStreamContent = (
    filename,
    content,
    mimeType = 'text/markdown'
) => {
    const blob = new Blob([content || 'No partial content available.'], {
        type: mimeType,
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    URL.revokeObjectURL(url);
};