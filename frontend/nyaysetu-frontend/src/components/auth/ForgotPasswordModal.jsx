import { useState } from 'react';
import { X, Mail, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForgotPasswordModal({ isOpen, onClose }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                throw new Error('Failed to send reset email');
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setEmail('');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '2rem'
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '450px',
                            width: '100%',
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            border: '2px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '1.5rem',
                            padding: '2rem',
                            position: 'relative'
                        }}
                    >
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'rgba(139, 92, 246, 0.2)',
                                border: '2px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '0.5rem',
                                width: '2.5rem',
                                height: '2.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'white'
                            }}
                        >
                            <X size={20} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{
                                display: 'inline-block',
                                padding: '1rem',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                borderRadius: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <Mail size={32} color="white" />
                            </div>
                            <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>
                                Forgot Password?
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                                Enter your email to receive a reset link
                            </p>
                        </div>

                        {!success ? (
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your.email@example.com"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.875rem',
                                            background: 'rgba(15, 23, 42, 0.5)',
                                            border: '2px solid rgba(148, 163, 184, 0.2)',
                                            borderRadius: '0.75rem',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                {error && (
                                    <div style={{
                                        padding: '0.75rem',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '0.5rem',
                                        color: '#f87171',
                                        fontSize: '0.875rem',
                                        marginBottom: '1rem'
                                    }}>
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        background: loading
                                            ? 'rgba(139, 92, 246, 0.3)'
                                            : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        color: 'white',
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {loading && <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />}
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </form>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <CheckCircle size={64} color="#10b981" style={{ marginBottom: '1rem' }} />
                                <h3 style={{ color: '#10b981', fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                                    Email Sent!
                                </h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                                    Check your inbox for the password reset link
                                </p>
                            </div>
                        )}

                        <style>{`
                            @keyframes spin {
                                from { transform: rotate(0deg); }
                                to { transform: rotate(360deg); }
                            }
                        `}</style>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
