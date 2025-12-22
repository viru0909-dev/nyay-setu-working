import { useState } from 'react';
import { X, Mail, Loader2, CheckCircle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/Biometrics.css';

export default function ForgotPasswordModal({ isOpen, onClose }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to send reset email');
            }

            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="biometric-modal-overlay"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="biometric-modal-content"
                    onClick={(e) => e.stopPropagation()}
                    style={{ maxWidth: '480px' }}
                >
                    <div className="biometric-header-decor"></div>

                    <button onClick={onClose} className="biometric-close-btn">
                        <X size={20} />
                    </button>

                    <div className="biometric-body" style={{ padding: '3rem 2rem' }}>
                        <div className="biometric-title-section">
                            <div className="biometric-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
                                <ShieldAlert size={32} />
                            </div>
                            <h2 className="biometric-title">Recovery Protocol</h2>
                            <p className="biometric-subtitle">Initialize secure password reset sequence</p>
                        </div>

                        {!success ? (
                            <form onSubmit={handleSubmit} className="biometric-input-group">
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Identification Email"
                                        className="biometric-input"
                                        required
                                        autoFocus
                                    />
                                    <Mail size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="biometric-error-msg"
                                        style={{ marginTop: '0', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || !email}
                                    className="biometric-btn btn-primary-bio"
                                    style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        'TRANSMIT RESET LINK'
                                    )}
                                </button>

                                <p className="biometric-subtitle bio-text-center" style={{ marginTop: '1.5rem', opacity: 0.6 }}>
                                    Systems will verify your identity and transmit encrypted instructions.
                                </p>
                            </form>
                        ) : (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                style={{ textAlign: 'center' }}
                            >
                                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', marginBottom: '1.5rem' }}>
                                    <CheckCircle size={40} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10b981', marginBottom: '1rem', textTransform: 'uppercase' }}>Transmission Complete</h3>
                                <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: '1.6' }}>
                                    Recovery instructions has been dispatched to <br />
                                    <span style={{ color: 'white', fontWeight: '700' }}>{email}</span>
                                </p>
                                <button
                                    onClick={onClose}
                                    className="biometric-btn btn-secondary-bio"
                                    style={{ margin: '0 auto' }}
                                >
                                    RETURN TO AUTHENTICATION
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
