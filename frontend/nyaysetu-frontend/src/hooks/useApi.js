import { useState, useEffect, useCallback, useRef } from 'react';
import { getErrorMessage } from '../utils/errorHandler';

/**
 * useApi — a reusable hook for managing API call lifecycle.
 *
 * @param {Function} apiFn  - A function that returns a Promise (e.g. () => caseAPI.list()).
 *                            Called on mount and whenever `deps` change.
 * @param {Array}    deps   - Dependency array that triggers a re-fetch when changed (default: []).
 *
 * @returns {{ data, loading, error, refetch }}
 *   - data     : response.data from the API (null until resolved)
 *   - loading  : true while the request is in-flight
 *   - error    : user-friendly error string, or null
 *   - refetch  : function to manually re-trigger the same API call
 *
 * Request cancellation: an AbortController is created per call; the previous
 * request is aborted if deps change before the prior fetch completes, and
 * the controller is cleaned up on component unmount.
 */
export function useApi(apiFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Store the latest apiFn ref so refetch always calls the current closure
  // without requiring it in the dep array (avoids infinite loops).
  const apiFnRef = useRef(apiFn);
  apiFnRef.current = apiFn;

  // Track the active AbortController so we can cancel in-flight requests.
  const abortRef = useRef(null);

  const fetchData = useCallback(async () => {
    // Cancel any in-flight request before starting a new one.
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    setLoading(true);
    setError(null);

    try {
      const result = await apiFnRef.current();

      // Guard: don't update state if this request was cancelled.
      if (signal.aborted) return;

      // Support both raw axios responses ({ data: ... }) and plain values.
      setData(result?.data !== undefined ? result.data : result);
      setError(null);
    } catch (err) {
      if (signal.aborted) return;
      // axios cancellation throws CanceledError — treat as silent abort.
      if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') return;
      setError(getErrorMessage(err));
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetchData();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
