import React from 'react';

const ErrorState = ({ message, onRetry, error }) => {
  return (
    <div className="error-state-container">
      <div className="error-state-content">
        <div className="error-icon">⚠️</div>
        <h3 className="error-title">Something went wrong</h3>
        <p className="error-message">
          {message || "Unable to load the requested data. Please try again."}
        </p>
        {error && process.env.NODE_ENV === 'development' && (
          <details className="error-details">
            <summary>Technical Details</summary>
            <pre>{error.message || JSON.stringify(error, null, 2)}</pre>
          </details>
        )}
        {onRetry && (
          <button className="error-retry-button" onClick={onRetry}>
            🔄 Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
