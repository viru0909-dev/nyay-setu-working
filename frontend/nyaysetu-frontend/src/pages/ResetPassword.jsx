import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        verifyToken();
    }, [token]);

    const verifyToken = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/auth/verify-reset-token?token=${token}`);
            const data = await response.json();

            if (data.valid) {
                setTokenValid(true);
            } else {
                setError(data.message || 'Invalid or expired token');
            }
        } catch (err) {
            setError('Failed to verify token');
        } finally {
            setValidating(false);
        }
    };

    const getPasswordStrength = (pass) => {
        if (pass.length < 6) return { label: 'Too Short', color: '#f87171', width: '25%' };
        if (pass.length < 8) return { label: 'Weak', color: '#fb923c', width: '50%' };
        if (!/[A-Z]/.test(pass) || !/[0-9]/.test(pass)) return { label: 'Fair', color: '#fbbf24', width: '75%' };
        return { label: 'Strong', color: '#10b981', width: '100%' };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Password reset failed');
            }

            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const strength = password ? getPasswordStrength(password) : null;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{
                maxWidth: '450px',
                width: '100%',
                background: 'rgba(30, 41, 59, 0.6)',
                backdropFilter: 'blur(20px)',
                borderRadius: '1.5rem',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                padding: '3rem'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-block',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                        borderRadius: '1rem',
                        marginBottom: '1rem'
                    }}>
                        <Lock size={32} color="white" />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white', marginBottom: '0.5rem' }}>
                        Reset Password
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        Enter your new password
                    </p>
                </div>

                {validating && (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <Loader2 size={40} style={{ color: '#8b5cf6', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                        <p style={{ color: '#94a3b8' }}>Verifying reset token...</p>
                    </div>
                )}

                {!validating && !tokenValid && (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <AlertCircle size={64} color="#f87171" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ color: '#f87171', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                            {error}
                        </h3>
                        <Link to="/login" style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: '600' }}>
                            Back to Login
                        </Link>
                    </div>
                )}

                {!validating && tokenValid && !success && (
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                padding: '1rem',
                                marginBottom: '1.5rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#f87171',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                fontSize: '0.875rem'
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#e2e8f0', fontSize: '0.875rem' }}>
                                New Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#94a3b8'
                                }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 3rem',
                                        background: 'rgba(15, 23, 42, 0.5)',
                                        border: '2px solid rgba(148, 163, 184, 0.2)',
                                        borderRadius: '0.75rem',
                                        color: 'white',
                                        fontSize: '0.95rem'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#94a3b8'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {password && strength && (
                                <div style={{ marginTop: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Password Strength:</span>
                                        <span style={{ fontSize: '0.75rem', color: strength.color, fontWeight: '600' }}>{strength.label}</span>
                                    </div>
                                    <div style={{ height: '4px', background: 'rgba(148, 163, 184, 0.2)', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{ width: strength.width, height: '100%', background: strength.color, transition: 'width 0.3s' }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#e2e8f0', fontSize: '0.875rem' }}>
                                Confirm Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#94a3b8'
                                }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem 0.875rem 3rem',
                                        background: 'rgba(15, 23, 42, 0.5)',
                                        border: '2px solid rgba(148, 163, 184, 0.2)',
                                        borderRadius: '0.75rem',
                                        color: 'white',
                                        fontSize: '0.95rem'
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: loading ? 'rgba(129, 140, 248, 0.5)' : 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
                                border: 'none',
                                borderRadius: '0.75rem',
                                color: 'white',
                                fontSize: '1.05rem',
                                fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 8px 24px rgba(129, 140, 248, 0.3)'
                            }}
                        >
                            {loading ? 'Resetting Password...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                {success && (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <CheckCircle size={64} color="#10b981" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ color: '#10b981', fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                            Password Reset Successful!
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            Redirecting to login...
                        </p>
                    </div>
                )}

                <style>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
}
