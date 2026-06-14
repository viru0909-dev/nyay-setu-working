import LoadingSpinner, { SkeletonLoader } from '../LoadingSpinner';
import { AlertTriangle, RefreshCw, InboxIcon } from 'lucide-react';

/**
 * ApiStateWrapper - Wraps any API-driven content with consistent
 * loading, error, and empty state UI.
 *
 * Props:
 *   loading    - bool
 *   error      - string | null
 *   isEmpty    - bool
 *   onRetry    - function (optional)
 *   emptyMsg   - string (optional)
 *   skeleton   - 'card' | null (optional, use skeleton instead of spinner)
 *   skeletonCount - number (default 3)
 *   children   - content to render when data is ready
 */
export default function ApiStateWrapper({
    loading,
    error,
    isEmpty,
    onRetry,
    emptyMsg = 'No data available.',
    skeleton = null,
    skeletonCount = 3,
    children
}) {
    if (loading) {
        if (skeleton) {
            return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    <SkeletonLoader type={skeleton} count={skeletonCount} />
                </div>
            );
        }
        return (
            <div style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}>
                <LoadingSpinner size="medium" message="Loading..." />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                background: 'rgba(239, 68, 68, 0.05)',
                borderRadius: '1rem',
                border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
                <AlertTriangle size={40} style={{ color: '#ef4444', marginBottom: '1rem' }} />
                <p style={{ color: '#ef4444', fontWeight: '600', fontSize: '1rem', marginBottom: '0.5rem' }}>
                    Failed to load data
                </p>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    {error}
                </p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        style={{
                            padding: '0.625rem 1.5rem',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            border: 'none',
                            borderRadius: '0.75rem',
                            color: 'white',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <RefreshCw size={16} />
                        Retry
                    </button>
                )}
            </div>
        );
    }

    if (isEmpty) {
        return (
            <div style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                background: 'rgba(139, 92, 246, 0.05)',
                borderRadius: '1rem',
                border: '1px solid rgba(139, 92, 246, 0.1)'
            }}>
                <InboxIcon size={40} style={{ color: '#8b5cf6', marginBottom: '1rem' }} />
                <p style={{ color: '#94a3b8', fontSize: '1rem' }}>{emptyMsg}</p>
            </div>
        );
    }

    return children;
}
