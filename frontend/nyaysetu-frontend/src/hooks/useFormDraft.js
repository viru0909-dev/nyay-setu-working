import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * useFormDraft — Persist form data to LocalStorage as a recoverable draft.
 *
 * Features:
 *  - Debounced writes (default 500ms) to avoid excessive LocalStorage churn
 *  - Validates draft structure before restore (guards against stale/corrupt data)
 *  - Gracefully handles corrupted JSON or missing keys
 *  - Stores a timestamp for "draft saved X minutes ago" display
 *  - Skips non-serializable fields (e.g. File objects) via a configurable exclude list
 *
 * @param {string}   storageKey          Unique LocalStorage key for this draft
 * @param {string[]} [excludeFields=[]]  Field names to strip before saving (e.g. ['documents'])
 * @param {number}   [debounceMs=500]    Milliseconds to debounce writes
 * @returns {{ hasDraft: boolean, draftTimestamp: number|null, saveDraft: Function, restoreDraft: Function, clearDraft: Function }}
 */
export default function useFormDraft(storageKey, excludeFields = [], debounceMs = 500) {
  const [hasDraft, setHasDraft] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' && parsed._data !== undefined;
    } catch {
      // Corrupted data — remove it silently
      localStorage.removeItem(storageKey);
      return false;
    }
  });

  const [draftTimestamp, setDraftTimestamp] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?._savedAt || null;
    } catch {
      return null;
    }
  });

  // Debounce timer ref — cleared on unmount to prevent leaks
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  /**
   * Save form data to LocalStorage (debounced).
   * Strips excluded fields and wraps with metadata.
   */
  const saveDraft = useCallback(
    (data) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        try {
          // Strip non-serializable / excluded fields
          const cleanData = { ...data };
          for (const field of excludeFields) {
            delete cleanData[field];
          }

          const envelope = {
            _data: cleanData,
            _savedAt: Date.now(),
            _version: 1, // For future schema migration
          };

          localStorage.setItem(storageKey, JSON.stringify(envelope));
          setHasDraft(true);
          setDraftTimestamp(envelope._savedAt);
        } catch (err) {
          // LocalStorage full or other write error — fail silently
        }
      }, debounceMs);
    },
    [storageKey, excludeFields, debounceMs]
  );

  /**
   * Restore saved draft data.
   * Returns the saved data object, or null if no valid draft exists.
   * @param {string[]} requiredKeys  Keys the draft must contain to be considered valid
   */
  const restoreDraft = useCallback(
    (requiredKeys = []) => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || !parsed._data) {
          // Invalid structure
          localStorage.removeItem(storageKey);
          setHasDraft(false);
          setDraftTimestamp(null);
          return null;
        }

        // Validate that all required keys exist in the draft
        for (const key of requiredKeys) {
          if (!(key in parsed._data)) {
            // Schema mismatch — draft is stale
            localStorage.removeItem(storageKey);
            setHasDraft(false);
            setDraftTimestamp(null);
            return null;
          }
        }

        return parsed._data;
      } catch {
        // Corrupted JSON
        localStorage.removeItem(storageKey);
        setHasDraft(false);
        setDraftTimestamp(null);
        return null;
      }
    },
    [storageKey]
  );

  /**
   * Clear the draft from LocalStorage.
   */
  const clearDraft = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    localStorage.removeItem(storageKey);
    setHasDraft(false);
    setDraftTimestamp(null);
  }, [storageKey]);

  return { hasDraft, draftTimestamp, saveDraft, restoreDraft, clearDraft };
}
