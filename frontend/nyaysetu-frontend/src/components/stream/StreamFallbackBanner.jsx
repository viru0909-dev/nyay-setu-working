import { AlertTriangle, RotateCcw, Save } from 'lucide-react';

export default function StreamFallbackBanner({
    state,
    onRetry,
    onSavePartial,
    hasPartialContent = false,
}) {
    if (!state || ['idle', 'streaming', 'completed'].includes(state.status)) {
        return null;
    }

    const isFailed = state.status === 'failed';
    const isReconnecting = state.status === 'reconnecting';

    return (
        <div
            role="status"
            style={{
                marginBottom: '0.9rem',
                padding: '0.85rem 1rem',
                borderRadius: '0.85rem',
                border: isFailed
                    ? '1px solid rgba(239, 68, 68, 0.35)'
                    : '1px solid rgba(245, 158, 11, 0.35)',
                background: isFailed
                    ? 'rgba(239, 68, 68, 0.08)'
                    : 'rgba(245, 158, 11, 0.08)',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                flexWrap: 'wrap',
            }}
        >
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                <AlertTriangle
                    size={18}
                    color={isFailed ? '#ef4444' : '#f59e0b'}
                    style={{ marginTop: '0.1rem', flexShrink: 0 }}
                />

                <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                        {isFailed ? 'AI connection failed' : 'AI connection degraded'}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {isReconnecting
                            ? `Retrying automatically. Attempt ${state.attempt}.`
                            : 'Your current work is preserved. Retry or save partial content.'}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {hasPartialContent && (
                    <button
                        type="button"
                        onClick={onSavePartial}
                        style={{
                            border: 'var(--border-glass)',
                            background: 'var(--bg-glass)',
                            color: 'var(--text-main)',
                            borderRadius: '0.55rem',
                            padding: '0.45rem 0.7rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.8rem',
                        }}
                    >
                        <Save size={14} />
                        Save partial
                    </button>
                )}

                {isFailed && (
                    <button
                        type="button"
                        onClick={onRetry}
                        style={{
                            border: 'none',
                            background: 'var(--color-accent, var(--color-primary))',
                            color: 'white',
                            borderRadius: '0.55rem',
                            padding: '0.45rem 0.7rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.8rem',
                        }}
                    >
                        <RotateCcw size={14} />
                        Retry
                    </button>
                )}
            </div>
        </div>
    );
}