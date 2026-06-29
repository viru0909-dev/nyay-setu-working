import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const glassCard = {
  background: 'var(--bg-glass-strong)',
  backdropFilter: 'var(--glass-blur)',
  border: 'var(--border-glass-strong)',
  borderRadius: '1.5rem',
  boxShadow: 'var(--shadow-glass)',
};

/**
 * ErrorState — shown when an API call fails.
 *
 * @param {string}   message  - User-friendly error message.
 * @param {Function} onRetry  - Optional callback triggered by the Retry button.
 */
export default function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}) {
  return (
    <div
      role="alert"
      style={{
        ...glassCard,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        textAlign: 'center',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AlertCircle size={32} color="#ef4444" />
      </div>

      <div>
        <h3
          style={{
            color: 'var(--text-main)',
            fontSize: '1.1rem',
            fontWeight: '700',
            margin: '0 0 0.5rem 0',
          }}
        >
          Something went wrong
        </h3>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            margin: 0,
            maxWidth: '400px',
          }}
        >
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '0.5rem',
            padding: '0.65rem 1.5rem',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <RefreshCw size={16} />
          Retry
        </button>
      )}
    </div>
  );
}
