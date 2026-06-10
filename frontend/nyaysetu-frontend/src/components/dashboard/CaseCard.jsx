/**
 * CaseCard — Reusable card component for displaying a legal case summary.
 *
 * Props:
 *   id       {string}   Short display ID (e.g. "CS-a1b2c3")
 *   title    {string}   Case title
 *   status   {string}   Case status: "PENDING" | "OPEN" | "CLOSED" | "DRAFT_PENDING_CLIENT" | etc.
 *   date     {string}   Filed date formatted as a locale string
 *   onClick  {function} Called when the card is clicked
 *   filedLabel {string} Label text for the date row (e.g. "Filed")
 */

import { useState } from 'react';
import { FolderOpen } from 'lucide-react';

// Map each status to its colour palette using CSS-variable-safe values so
// the card automatically adapts to light/dark mode via ThemeContext.
const STATUS_STYLES = {
    PENDING: {
        background: 'rgba(245, 158, 11, 0.1)',
        color: '#f59e0b',
        border: 'rgba(245, 158, 11, 0.25)',
    },
    OPEN: {
        background: 'rgba(59, 130, 246, 0.1)',
        color: '#3b82f6',
        border: 'rgba(59, 130, 246, 0.25)',
    },
    CLOSED: {
        background: 'rgba(16, 185, 129, 0.1)',
        color: '#10b981',
        border: 'rgba(16, 185, 129, 0.25)',
    },
    DRAFT_PENDING_CLIENT: {
        background: 'rgba(139, 92, 246, 0.1)',
        color: '#8b5cf6',
        border: 'rgba(139, 92, 246, 0.25)',
    },
};

// Fallback for any unrecognised status value
const DEFAULT_STATUS_STYLE = {
    background: 'rgba(100, 116, 139, 0.1)',
    color: '#64748b',
    border: 'rgba(100, 116, 139, 0.25)',
};

export default function CaseCard({ id, title, status, date, onClick, filedLabel = 'Filed', children }) {
    const [isHovered, setIsHovered] = useState(false);

    const statusStyle = STATUS_STYLES[status] || DEFAULT_STATUS_STYLE;

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                padding: '1rem',
                background: 'var(--bg-glass)',
                borderRadius: '0.75rem',
                border: isHovered
                    ? `1px solid var(--color-primary)`
                    : 'var(--border-glass)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: isHovered
                    ? '0 6px 20px rgba(30, 42, 68, 0.1)'
                    : 'none',
                outline: 'none',
            }}
        >
            {/* Top row — case ID + status badge */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                    gap: '0.5rem',
                }}
            >
                {/* Case ID */}
                <span
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.75rem',
                        color: 'var(--color-primary)',
                        fontWeight: '600',
                        flexShrink: 0,
                    }}
                >
                    <FolderOpen size={13} />
                    {id}
                </span>

                {/* Status pill */}
                <span
                    style={{
                        fontSize: '0.7rem',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '9999px',
                        background: statusStyle.background,
                        color: statusStyle.color,
                        border: `1px solid ${statusStyle.border}`,
                        fontWeight: '700',
                        letterSpacing: '0.02em',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {status}
                </span>
            </div>

            {/* Case title */}
            <h4
                style={{
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: 'var(--text-main)',
                    marginBottom: '0.5rem',
                    lineHeight: '1.4',
                    // Truncate long titles gracefully
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                }}
            >
                {title}
            </h4>

            {/* Filed date */}
            <p
                style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    margin: 0,
                }}
            >
                {filedLabel}: {date}
            </p>

            {/* Extra content (e.g. CaseStepper) */}
            {children && (
                <div style={{ marginTop: '0.5rem' }}>
                    {children}
                </div>
            )}
        </div>
    );
}
