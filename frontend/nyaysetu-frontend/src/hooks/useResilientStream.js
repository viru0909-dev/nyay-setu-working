import { useCallback, useEffect, useRef, useState } from 'react';
import { consumeSSEStream, isAbortError } from '../utils/streamResilience';

const initialState = {
    status: 'idle',
    attempt: 0,
    error: null,
    lastRetryDelay: 0,
};

const activeStatuses = new Set(['connecting', 'streaming', 'reconnecting']);

export function useResilientStream({
    breakerKey,
    maxRetries = 3,
} = {}) {
    const abortRef = useRef(null);
    const [streamState, setStreamState] = useState(initialState);

    const cancel = useCallback(() => {
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }

        setStreamState((prev) =>
            activeStatuses.has(prev.status) ? { ...prev, status: 'idle' } : prev
        );
    }, []);

    const start = useCallback(
        async ({ request, onEvent, onComplete, onFailure, onRetry }) => {
            cancel();

            const controller = new AbortController();
            abortRef.current = controller;

            setStreamState({
                status: 'connecting',
                attempt: 0,
                error: null,
                lastRetryDelay: 0,
            });

            try {
                await consumeSSEStream({
                    request,
                    signal: controller.signal,
                    breakerKey,
                    maxRetries,
                    onOpen: ({ attempt }) => {
                        setStreamState({
                            status: 'streaming',
                            attempt,
                            error: null,
                            lastRetryDelay: 0,
                        });
                    },
                    onRetry: ({ attempt, delay, error }) => {
                        setStreamState({
                            status: 'reconnecting',
                            attempt,
                            error,
                            lastRetryDelay: delay,
                        });

                        onRetry?.({ attempt, delay, error });
                    },
                    onEvent,
                    onComplete: () => {
                        setStreamState({
                            status: 'completed',
                            attempt: 0,
                            error: null,
                            lastRetryDelay: 0,
                        });

                        onComplete?.();
                    },
                });
            } catch (error) {
                if (isAbortError(error)) {
                    setStreamState({
                        status: 'idle',
                        attempt: 0,
                        error: null,
                        lastRetryDelay: 0,
                    });
                    return;
                }

                setStreamState({
                    status: 'failed',
                    attempt: maxRetries,
                    error,
                    lastRetryDelay: 0,
                });

                onFailure?.(error);
            } finally {
                abortRef.current = null;
            }
        },
        [breakerKey, cancel, maxRetries]
    );

    useEffect(() => cancel, [cancel]);

    return {
        streamState,
        start,
        cancel,
        isStreaming: activeStatuses.has(streamState.status),
    };
}