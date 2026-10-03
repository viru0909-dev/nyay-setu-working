import { useEffect, useRef } from 'react';

/**
 * Warn users before they accidentally lose local form data.
 *
 * The hook covers browser refresh/close through beforeunload and same-window
 * in-app link clicks through a capture-phase click listener.
 *
 * @param {boolean} isDirty Whether the form has unsaved modifications.
 * @param {string} message Confirmation text for in-app navigation.
 */
export default function useUnsavedChanges(isDirty, message = 'You have unsaved changes. Leave this page?') {
  const beforeUnloadHandlerRef = useRef(null);
  const clickHandlerRef = useRef(null);

  useEffect(() => {
    const beforeUnloadHandler = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    const clickHandler = (event) => {
      const anchor = event.target?.closest?.('a[href]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const target = anchor.getAttribute('target');
      const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

      if (!href || href.startsWith('#') || target === '_blank' || isModifiedClick) {
        return;
      }

      if (!window.confirm(message)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    if (isDirty) {
      if (!beforeUnloadHandlerRef.current) {
        window.addEventListener('beforeunload', beforeUnloadHandler);
        beforeUnloadHandlerRef.current = beforeUnloadHandler;
      }

      if (!clickHandlerRef.current) {
        document.addEventListener('click', clickHandler, true);
        clickHandlerRef.current = clickHandler;
      }
    } else {
      if (beforeUnloadHandlerRef.current) {
        window.removeEventListener('beforeunload', beforeUnloadHandlerRef.current);
        beforeUnloadHandlerRef.current = null;
      }

      if (clickHandlerRef.current) {
        document.removeEventListener('click', clickHandlerRef.current, true);
        clickHandlerRef.current = null;
      }
    }

    return () => {
      if (beforeUnloadHandlerRef.current) {
        window.removeEventListener('beforeunload', beforeUnloadHandlerRef.current);
        beforeUnloadHandlerRef.current = null;
      }

      if (clickHandlerRef.current) {
        document.removeEventListener('click', clickHandlerRef.current, true);
        clickHandlerRef.current = null;
      }
    };
  }, [isDirty, message]);
}
