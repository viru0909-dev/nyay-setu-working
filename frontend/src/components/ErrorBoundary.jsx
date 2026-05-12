import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e293b 100%)',
                    padding: '2rem'
                }}>
                    <div style={{
                        maxWidth: '600px',
                        width: '100%',
                        padding: '3rem',
                        background: 'rgba(30, 41, 59, 0.8)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '2rem',
                        border: '2px solid rgba(239, 68, 68, 0.3)',
                        textAlign: 'center'
                    }}>
                        {/* Icon */}
                        <div style={{
                            width: '100px',
                            height: '100px',
                            margin: '0 auto 2rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '3px solid rgba(239, 68, 68, 0.3)'
                        }}>
                            <AlertTriangle size={48} style={{ color: '#ef4444' }} />
                        </div>

                        {/* Title */}
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: '900',
                            color: 'white',
                            marginBottom: '1rem'
                        }}>
                            Oops! Something went wrong
                        </h1>

                        {/* Description */}
                        <p style={{
                            color: '#94a3b8',
                            fontSize: '1.125rem',
                            lineHeight: '1.6',
                            marginBottom: '2rem'
                        }}>
                            We're sorry for the inconvenience. An unexpected error has occurred.
                            Please try refreshing the page.
                        </p>

                        {/* Error Details (in development) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details style={{
                                marginBottom: '2rem',
                                textAlign: 'left',
                                padding: '1rem',
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(239, 68, 68, 0.2)'
                            }}>
                                <summary style={{
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    marginBottom: '0.5rem'
                                }}>
                                    Error Details (Development Only)
                                </summary>
                                <pre style={{
                                    color: '#cbd5e1',
                                    fontSize: '0.875rem',
                                    overflow: 'auto',
                                    whiteSpace: 'pre-wrap',
                                    wordWrap: 'break-word'
                                }}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                onClick={this.handleReset}
                                style={{
                                    padding: '1rem 2rem',
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                            >
                                <RefreshCw size={20} />
                                Refresh Page
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                style={{
                                    padding: '1rem 2rem',
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    border: '2px solid rgba(139, 92, 246, 0.3)',
                                    borderRadius: '0.75rem',
                                    color: '#8b5cf6',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(139, 92, 246, 0.2)';
                                    e.target.style.borderColor = '#8b5cf6';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(139, 92, 246, 0.1)';
                                    e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                                }}
                            >
                                Go to Homepage
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
