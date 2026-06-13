import React from 'react';
import LoadingSpinner from '../LoadingSpinner';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';

const ApiStateWrapper = ({
  loading,
  error,
  data,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  emptyMessage,
  emptyTitle,
  onRetry,
  showEmptyState = true
}) => {
  // Loading state
  if (loading) {
    if (loadingComponent) {
      return loadingComponent;
    }
    return <LoadingSpinner />;
  }

  // Error state
  if (error) {
    if (errorComponent) {
      return errorComponent;
    }
    return (
      <ErrorState
        message={error.message || error}
        onRetry={onRetry}
        error={error}
      />
    );
  }

  // Empty state
  if (showEmptyState && (!data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0))) {
    if (emptyComponent) {
      return emptyComponent;
    }
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
      />
    );
  }

  // Data loaded successfully
  return children;
};

export default ApiStateWrapper;
