import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/landing/Header';
import '../styles/Biometrics.css';
import { API_BASE_URL } from '../config/apiConfig';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setError('Invalid reset link.');
                setVerifying(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/verify-reset-token?token=${token}`);
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Token verification failed');
                }
                setVerifying(false);
            } catch (err) {
                setError(err.message || 'The reset link is invalid or has expired.');
                setVerifying(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Security protocol requires at least 8 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    newPassword: formData.password
                })
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Failed to recalibrate security credentials');
            }
        } catch (err) {
            setError(err.message || 'Internal transmission error during reset');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div className="biometric-modal-content" style={{ maxWidth: '500px', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(20px)' }}>
                    <div className="biometric-header-decor"></div>

                    <div className="biometric-body" style={{ padding: '3.5rem 2.5rem' }}>
                        <div className="biometric-title-section">
                            <div className="biometric-icon-wrapper" style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)' }}>
                                <ShieldCheck size={32} />
                            </div>
                            <h2 className="biometric-title">Credential Reset</h2>
                            <p className="biometric-subtitle">Update your secure encryption keys</p>
                        </div>

                        {verifying ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <Loader2 className="animate-spin" size={40} style={{ color: '#3b82f6', margin: '0 auto 1rem ease' }} />
                                <p className="biometric-subtitle">Authenticating reset token...</p>
                            </div>
                        ) : error ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ textAlign: 'center' }}
                            >
                                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', marginBottom: '1.5rem', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                                    <AlertCircle size={32} />
                                </div>
                                <h3 style={{ color: '#fb7185', fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem' }}>RECOVERY FAILED</h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem' }}>{error}</p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="biometric-btn btn-secondary-bio"
                                    style={{ margin: '0 auto' }}
                                >
                                    <ArrowLeft size={18} />
                                    RETURN TO LOGIN
                                </button>
                            </motion.div>
                        ) : success ? (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                style={{ textAlign: 'center' }}
                            >
                                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', marginBottom: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    <CheckCircle size={32} />
                                </div>
                                <h3 style={{ color: '#4ade80', fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem' }}>RECALIBRATION SUCCESSFUL</h3>
                                <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Your security credentials have been updated. <br /> Redirecting to secure login portal...</p>
                                <div className="scanner-line" style={{ position: 'relative', height: '2px', animationDuration: '1.5s' }}></div>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="biometric-input-group">
                                <div>
                                    <label className="biometric-subtitle" style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        New Neural Passphrase
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="biometric-input"
                                            required
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="biometric-subtitle" style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Confirm Passphrase
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="biometric-input"
                                            required
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="biometric-btn btn-primary-bio"
                                    style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            REPLACE CREDENTIALS
                                            <ArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
