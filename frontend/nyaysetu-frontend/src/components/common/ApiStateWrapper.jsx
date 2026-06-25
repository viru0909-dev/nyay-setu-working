import React from 'react';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';

/**
 * ApiStateWrapper — eliminates duplicated loading/error/empty logic across pages.
 *
 * Priority order: loading → error → empty → children.
 *
 * @param {boolean}     loading          - True while the API request is in-flight.
 * @param {string|null} error            - User-friendly error string, or null.
 * @param {*}           data             - The resolved API payload used to detect emptiness.
 * @param {Function}    onRetry          - Optional callback wired to the ErrorState retry button.
 * @param {boolean}     isEmpty          - Override auto-detection of empty state.
 *                                         Defaults to: Array.isArray(data) && data.length === 0.
 * @param {string}      loadingMessage   - Custom text shown during loading.
 * @param {string}      loadingMinHeight - CSS min-height for the LoadingState container.
 * @param {string}      emptyTitle       - Title text for EmptyState.
 * @param {string}      emptyDescription - Body text for EmptyState.
 * @param {*}           emptyIcon        - Lucide icon component (class) for EmptyState.
 * @param {JSX.Element} emptyAction      - Optional JSX rendered as an action in EmptyState.
 * @param {JSX.Element} children         - Content rendered when data is available.
 *
 * @example
 * <ApiStateWrapper loading={loading} error={error} data={cases} onRetry={refetch}>
 *   <CaseList cases={cases} />
 * </ApiStateWrapper>
 */
export default function ApiStateWrapper({
  loading,
  error,
  data,
  onRetry,
  isEmpty,
  loadingMessage,
  loadingMinHeight,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyAction,
  children,
}) {
  if (loading) {
    return (
      <LoadingState
        message={loadingMessage}
        minHeight={loadingMinHeight}
      />
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  // Determine emptiness: use the explicit override when provided, otherwise
  // treat an empty array as empty and anything else (objects, strings, etc.)
  // as non-empty so the children are rendered.
  const isDataEmpty =
    isEmpty !== undefined
      ? isEmpty
      : Array.isArray(data) && data.length === 0;

  if (isDataEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={emptyIcon}
        action={emptyAction}
      />
    );
  }

  return children;
}
