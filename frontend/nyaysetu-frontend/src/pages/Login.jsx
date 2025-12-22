import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { Mail, Lock, Eye, EyeOff, Camera, CheckCircle2, Scale, Shield, User, Briefcase, Gavel } from 'lucide-react';
import Header from '../components/landing/Header';
import FaceLoginModal from '../components/auth/FaceLoginModal';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showFaceLogin, setShowFaceLogin] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();

    const roles = [
        { value: '', label: 'All Roles', icon: <User size={18} />, color: '#64748b' },
        { value: 'CLIENT', label: 'Client', icon: <Briefcase size={18} />, color: '#3b82f6' },
        { value: 'LAWYER', label: 'Lawyer', icon: <Scale size={18} />, color: '#8b5cf6' },
        { value: 'JUDGE', label: 'Judge', icon: <Gavel size={18} />, color: '#ec4899' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login({ email, password });
            const { token, user } = response.data;

            if (selectedRole && user.role !== selectedRole) {
                setError(`Invalid credentials for ${roles.find(r => r.value === selectedRole)?.label}`);
                setLoading(false);
                return;
            }

            setAuth(user, token);

            const roleRoutes = {
                ADMIN: '/admin',
                JUDGE: '/judge',
                LAWYER: '/lawyer',
                CLIENT: '/client',
                TECH_ADMIN: '/admin',
                TECHNICAL_TEAM: '/admin',
                SUPER_JUDGE: '/admin'
            };

            navigate(roleRoutes[user.role] || '/');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

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
                {/* Animated Background Elements */}
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
                    {/* Left Side - Welcome */}
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
                                Welcome Back
                            </h1>
                            <p style={{
                                fontSize: '1.25rem',
                                color: '#94a3b8',
                                lineHeight: '1.8',
                                maxWidth: '500px'
                            }}>
                                Sign in to access your dashboard and manage your cases on India's most advanced virtual judiciary platform
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {[
                                { icon: <Shield size={24} />, text: 'Secure encrypted authentication', color: '#10b981' },
                                { icon: <CheckCircle2 size={24} />, text: 'Real-time case status updates', color: '#3b82f6' },
                                { icon: <Scale size={24} />, text: 'Instant access to hearings', color: '#8b5cf6' },
                                { icon: <Camera size={24} />, text: 'Face recognition login', color: '#ec4899' }
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
                                Sign In
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                                Enter your credentials to continue
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
                            {/* Email */}
                            <div style={{ marginBottom: '1.5rem' }}>
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
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your.email@example.com"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.875rem 1rem 0.875rem 3rem',
                                            background: 'rgba(15, 23, 42, 0.6)',
                                            border: '2px solid rgba(139, 92, 246, 0.2)',
                                            borderRadius: '0.75rem',
                                            color: 'white',
                                            fontSize: '1rem',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)'}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.2)'}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: '1.5rem' }}>
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
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.875rem 3rem',
                                            background: 'rgba(15, 23, 42, 0.6)',
                                            border: '2px solid rgba(139, 92, 246, 0.2)',
                                            borderRadius: '0.75rem',
                                            color: 'white',
                                            fontSize: '1rem',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)'}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.2)'}
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
                            </div>

                            {/* Role Selection - Tab Style */}
                            <div style={{ marginBottom: '1.5rem' }}>
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
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '0.75rem'
                                }}>
                                    {roles.map(role => (
                                        <button
                                            key={role.value}
                                            type="button"
                                            onClick={() => setSelectedRole(role.value)}
                                            style={{
                                                padding: '0.875rem 1rem',
                                                background: selectedRole === role.value
                                                    ? `linear-gradient(135deg, ${role.color}40 0%, ${role.color}20 100%)`
                                                    : 'rgba(15, 23, 42, 0.6)',
                                                border: selectedRole === role.value
                                                    ? `2px solid ${role.color}`
                                                    : '2px solid rgba(139, 92, 246, 0.2)',
                                                borderRadius: '0.75rem',
                                                color: selectedRole === role.value ? role.color : '#94a3b8',
                                                fontSize: '0.9rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem'
                                            }}
                                            onMouseOver={(e) => {
                                                if (selectedRole !== role.value) {
                                                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                                                }
                                            }}
                                            onMouseOut={(e) => {
                                                if (selectedRole !== role.value) {
                                                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                                                }
                                            }}
                                        >
                                            {role.icon}
                                            {role.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Remember & Forgot */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '2rem'
                            }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    color: '#94a3b8'
                                }}>
                                    <input type="checkbox" style={{ cursor: 'pointer' }} />
                                    Remember me
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#8b5cf6',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Forgot password?
                                </button>
                            </div>

                            {/* Sign In Button */}
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
                                    transition: 'all 0.3s',
                                    marginBottom: '1rem'
                                }}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>

                            {/* Face Login */}
                            <button
                                type="button"
                                onClick={() => setShowFaceLogin(true)}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    border: '1px solid rgba(139, 92, 246, 0.3)',
                                    borderRadius: '0.75rem',
                                    color: '#a78bfa',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    transition: 'all 0.3s'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                                }}
                            >
                                <Camera size={20} />
                                Login with Face
                            </button>
                        </form>

                        <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                Don't have an account?{' '}
                                <Link to="/signup" style={{
                                    color: '#8b5cf6',
                                    fontWeight: '600',
                                    textDecoration: 'none'
                                }}>
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <FaceLoginModal
                    isOpen={showFaceLogin}
                    onClose={() => setShowFaceLogin(false)}
                    onSuccess={({ token, user }) => {
                        setAuth(user, token);
                        const roleRoutes = {
                            ADMIN: '/admin',
                            JUDGE: '/judge',
                            LAWYER: '/lawyer',
                            CLIENT: '/client',
                            TECH_ADMIN: '/admin',
                            TECHNICAL_TEAM: '/admin',
                            SUPER_JUDGE: '/admin'
                        };
                        navigate(roleRoutes[user.role] || '/');
                    }}
                />

                <ForgotPasswordModal
                    isOpen={showForgotPassword}
                    onClose={() => setShowForgotPassword(false)}
                />

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
