import React from 'react';
import { Inbox } from 'lucide-react';

const glassCard = {
  background: 'var(--bg-glass-strong)',
  backdropFilter: 'var(--glass-blur)',
  border: 'var(--border-glass-strong)',
  borderRadius: '1.5rem',
  boxShadow: 'var(--shadow-glass)',
};

/**
 * EmptyState — shown when an API returns an empty result set.
 *
 * @param {string}      title        - Primary heading (e.g. "No cases found").
 * @param {string}      description  - Supporting text with guidance for the user.
 * @param {JSX.Element} icon         - Optional Lucide icon element to display.
 * @param {JSX.Element} action       - Optional action button rendered below the text.
 */
export default function EmptyState({
  title = 'No data found',
  description = 'There is nothing to show here yet.',
  icon,
  action,
}) {
  const Icon = icon || Inbox;

  return (
    <div
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
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(100, 116, 139, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Support both a Lucide component class and a pre-rendered element */}
        {React.isValidElement(Icon) ? (
          Icon
        ) : (
          <Icon size={36} color="var(--text-secondary)" style={{ opacity: 0.6 }} />
        )}
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
          {title}
        </h3>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            margin: 0,
            maxWidth: '400px',
          }}
        >
          {description}
        </p>
      </div>

      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  );
}
