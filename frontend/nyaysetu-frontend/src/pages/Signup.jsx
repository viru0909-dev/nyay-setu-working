import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { Mail, Lock, Eye, EyeOff, User as UserIcon, Briefcase, Scale, Gavel, CheckCircle2, Shield } from 'lucide-react';
import Header from '../components/landing/Header';

export default function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'CLIENT'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();

    const roles = [
        { value: 'CLIENT', label: 'Client', icon: <Briefcase size={18} />, color: '#3b82f6', desc: 'File cases & track progress' },
        { value: 'LAWYER', label: 'Lawyer', icon: <Scale size={18} />, color: '#8b5cf6', desc: 'Represent clients' },
        { value: 'JUDGE', label: 'Judge', icon: <Gavel size={18} />, color: '#ec4899', desc: 'Conduct hearings' }
    ];

    const getPasswordStrength = (pass) => {
        if (pass.length < 6) return { label: 'Too Short', color: '#f87171', width: '25%' };
        if (pass.length < 8) return { label: 'Weak', color: '#fb923c', width: '50%' };
        if (!/[A-Z]/.test(pass) || !/[0-9]/.test(pass)) return { label: 'Fair', color: '#fbbf24', width: '75%' };
        return { label: 'Strong', color: '#10b981', width: '100%' };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await authAPI.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });

            const { token, user } = response.data;
            setAuth(user, token);

            const roleRoutes = {
                ADMIN: '/admin',
                JUDGE: '/judge',
                LAWYER: '/lawyer',
                CLIENT: '/client'
            };

            navigate(roleRoutes[user.role] || '/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const strength = formData.password ? getPasswordStrength(formData.password) : null;

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)' }}>
            {/* Header */}
            <Header hideAuthButtons={true} />

            <div style={{
                minHeight: '100vh',
                paddingTop: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '100px 2rem 2rem 2rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Animated Background */}
                <div style={{
                    position: 'absolute',
                    width: '800px',
                    height: '800px',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
                    top: '-200px',
                    right: '-200px',
                    borderRadius: '50%',
                    animation: 'pulse 8s ease-in-out infinite'
                }} />
                <div style={{
                    position: 'absolute',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
                    bottom: '-150px',
                    left: '-150px',
                    borderRadius: '50%',
                    animation: 'pulse 6s ease-in-out infinite'
                }} />

                <div style={{
                    width: '100%',
                    maxWidth: '1200px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '4rem',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1
                }}>
                    {/* Left Side - Benefits */}
                    <div style={{ color: 'white' }}>
                        <div style={{ marginBottom: '3rem' }}>
                            <h1 style={{
                                fontSize: '3.5rem',
                                fontWeight: '900',
                                marginBottom: '1rem',
                                background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                lineHeight: '1.2'
                            }}>
                                Join NyaySetu
                            </h1>
                            <p style={{
                                fontSize: '1.25rem',
                                color: '#94a3b8',
                                lineHeight: '1.8',
                                maxWidth: '500px'
                            }}>
                                Create your account and get instant access to India's most advanced virtual judiciary platform
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {[
                                { icon: <CheckCircle2 size={24} />, text: 'Free account with full access', color: '#10b981' },
                                { icon: <Shield size={24} />, text: 'Secure blockchain document storage', color: '#3b82f6' },
                                { icon: <Scale size={24} />, text: 'AI-powered case analysis', color: '#8b5cf6' },
                                { icon: <CheckCircle2 size={24} />, text: '24/7 virtual hearing support', color: '#ec4899' }
                            ].map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: `${item.color}20`,
                                        border: `2px solid ${item.color}40`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: item.color
                                    }}>
                                        {item.icon}
                                    </div>
                                    <span style={{ fontSize: '1.05rem', color: '#e2e8f0', fontWeight: '500' }}>
                                        {item.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.8)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '2rem',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        padding: '3rem',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                            <h2 style={{
                                fontSize: '2rem',
                                fontWeight: '800',
                                color: 'white',
                                marginBottom: '0.5rem'
                            }}>
                                Create Account
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                                Fill in your details to get started
                            </p>
                        </div>

                        {error && (
                            <div style={{
                                padding: '1rem',
                                marginBottom: '1.5rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#f87171',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                fontSize: '0.875rem',
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Full Name */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#e2e8f0',
                                    fontSize: '0.875rem'
                                }}>
                                    Full Name
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <UserIcon size={18} style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#8b5cf6'
                                    }} />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.875rem 1rem 0.875rem 3rem',
                                            background: 'rgba(15, 23, 42, 0.6)',
                                            border: '2px solid rgba(139, 92, 246, 0.2)',
                                            borderRadius: '0.75rem',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#e2e8f0',
                                    fontSize: '0.875rem'
                                }}>
                                    Email Address
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#8b5cf6'
                                    }} />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="your.email@example.com"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.875rem 1rem 0.875rem 3rem',
                                            background: 'rgba(15, 23, 42, 0.6)',
                                            border: '2px solid rgba(139, 92, 246, 0.2)',
                                            borderRadius: '0.75rem',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Role Selection - Tabs */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.75rem',
                                    fontWeight: '600',
                                    color: '#e2e8f0',
                                    fontSize: '0.875rem'
                                }}>
                                    Select Your Role
                                </label>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '0.75rem'
                                }}>
                                    {roles.map(role => (
                                        <button
                                            key={role.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: role.value })}
                                            style={{
                                                padding: '0.875rem 0.5rem',
                                                background: formData.role === role.value
                                                    ? `linear-gradient(135deg, ${role.color}40 0%, ${role.color}20 100%)`
                                                    : 'rgba(15, 23, 42, 0.6)',
                                                border: formData.role === role.value
                                                    ? `2px solid ${role.color}`
                                                    : '2px solid rgba(139, 92, 246, 0.2)',
                                                borderRadius: '0.75rem',
                                                color: formData.role === role.value ? role.color : '#94a3b8',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '0.25rem'
                                            }}
                                        >
                                            {role.icon}
                                            <span>{role.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#e2e8f0',
                                    fontSize: '0.875rem'
                                }}>
                                    Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#8b5cf6'
                                    }} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.875rem 3rem',
                                            background: 'rgba(15, 23, 42, 0.6)',
                                            border: '2px solid rgba(139, 92, 246, 0.2)',
                                            borderRadius: '0.75rem',
                                            color: 'white',
                                            fontSize: '1rem'
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
                                            color: '#8b5cf6'
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {strength && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Strength:</span>
                                            <span style={{ fontSize: '0.75rem', color: strength.color, fontWeight: '600' }}>{strength.label}</span>
                                        </div>
                                        <div style={{ height: '4px', background: 'rgba(148, 163, 184, 0.2)', borderRadius: '2px' }}>
                                            <div style={{ width: strength.width, height: '100%', background: strength.color, borderRadius: '2px', transition: 'width 0.3s' }} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#e2e8f0',
                                    fontSize: '0.875rem'
                                }}>
                                    Confirm Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#8b5cf6'
                                    }} />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        placeholder="••••••••"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.875rem 3rem',
                                            background: 'rgba(15, 23, 42, 0.6)',
                                            border: '2px solid rgba(139, 92, 246, 0.2)',
                                            borderRadius: '0.75rem',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#8b5cf6'
                                        }}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Create Account Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: loading
                                        ? 'rgba(139, 92, 246, 0.5)'
                                        : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    color: 'white',
                                    fontSize: '1.05rem',
                                    fontWeight: '700',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>

                        <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                Already have an account?{' '}
                                <Link to="/login" style={{
                                    color: '#8b5cf6',
                                    fontWeight: '600',
                                    textDecoration: 'none'
                                }}>
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); opacity: 0.8; }
                        50% { transform: scale(1.1); opacity: 1; }
                    }
                `}</style>
            </div>
        </div>
    );
}
