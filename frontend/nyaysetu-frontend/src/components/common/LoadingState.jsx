import React from 'react';
import { Loader2 } from 'lucide-react';

const spinKeyframes = `
@keyframes ns-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
`;

/**
 * LoadingState — full-area spinner used while API data is being fetched.
 *
 * @param {string} message     - Optional status message shown below the spinner.
 * @param {string} minHeight   - CSS min-height for the container (default '300px').
 */
export default function LoadingState({ message = 'Loading…', minHeight = '300px' }) {
  return (
    <>
      <style>{spinKeyframes}</style>
      <div
        role="status"
        aria-live="polite"
        aria-label={message}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight,
          gap: '1rem',
          padding: '2rem',
        }}
      >
        <Loader2
          size={40}
          style={{
            color: 'var(--color-accent, #3F5DCC)',
            animation: 'ns-spin 1s linear infinite',
          }}
        />
        {message && (
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              margin: 0,
            }}
          >
            {message}
          </p>
        )}
      </div>
    </>
  );
}
