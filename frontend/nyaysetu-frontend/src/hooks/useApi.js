import { useState, useEffect, useCallback } from 'react';

/**
 * useApi - Generic hook for API calls with loading, error, and empty state handling.
 * @param {Function} apiFn - Async function that performs the API call
 * @param {Array} deps - Dependency array (like useEffect)
 * @param {Object} options - { immediate: bool, defaultData: any }
 */
export default function useApi(apiFn, deps = [], options = {}) {
    const { immediate = true, defaultData = null } = options;

    const [data, setData] = useState(defaultData);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiFn(...args);
            setData(result);
            return result;
        } catch (err) {
            setError(err?.message || 'Something went wrong. Please try again.');
            return null;
        } finally {
            setLoading(false);
        }
    }, deps);

    useEffect(() => {
        if (immediate) execute();
    }, [execute]);

    const isEmpty = !loading && !error && (
        data === null ||
        data === undefined ||
        (Array.isArray(data) && data.length === 0)
    );

    return { data, loading, error, isEmpty, refetch: execute };
}
