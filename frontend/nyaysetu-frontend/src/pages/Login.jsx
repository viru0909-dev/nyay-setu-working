import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { Mail, Lock, Eye, EyeOff, User, UserCircle, Shield, CheckCircle } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();

    const roles = [
        { value: '', label: 'All Roles', desc: 'Login as any registered user', icon: <User size={20} />, color: '#64748b' },
        { value: 'CLIENT', label: 'Client/Citizen', desc: 'File cases & track progress', icon: <User size={20} />, color: '#3b82f6' },
        { value: 'LAWYER', label: 'Lawyer/Advocate', desc: 'Represent clients & manage cases', icon: <UserCircle size={20} />, color: '#8b5cf6' },
        { value: 'JUDGE', label: 'Judge', desc: 'Conduct hearings & make rulings', icon: <Shield size={20} />, color: '#ec4899' }
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
                TECH_ADMIN: '/admin'
            };

            navigate(roleRoutes[user.role] || '/');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Elements */}
            <div style={{
                position: 'absolute',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(129, 140, 248, 0.1) 0%, transparent 70%)',
                top: '-200px',
                left: '-200px',
                borderRadius: '50%'
            }}></div>

            <div style={{
                position: 'absolute',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(192, 132, 252, 0.08) 0%, transparent 70%)',
                bottom: '-150px',
                right: '-150px',
                borderRadius: '50%'
            }}></div>

            <div style={{
                width: '100%',
                maxWidth: '1000px',
                display: 'grid',
                gridTemplateColumns: '1fr 1.2fr',
                gap: '3rem',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Left Side - Info */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', color: 'white' }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '900',
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Welcome Back
                    </h1>
                    <p style={{ fontSize: '1.125rem', color: '#94a3b8', marginBottom: '2rem', lineHeight: '1.6' }}>
                        Sign in to access your dashboard and manage your cases on India's most advanced virtual judiciary platform
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {[
                            { icon: <CheckCircle size={24} color="#10b981" />, text: 'Secure encrypted authentication' },
                            { icon: <CheckCircle size={24} color="#10b981" />, text: 'Real-time case status updates' },
                            { icon: <CheckCircle size={24} color="#10b981" />, text: 'Instant access to hearings' },
                            { icon: <CheckCircle size={24} color="#10b981" />, text: 'Document management' }
                        ].map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {item.icon}
                                <span style={{ fontSize: '1rem', color: '#e2e8f0' }}>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side - Form */}
                <div style={{
                    padding: '3rem',
                    background: 'rgba(30, 41, 59, 0.6)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1.5rem',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white', marginBottom: '0.5rem' }}>
                            Sign In
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
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
                            fontSize: '0.875rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#e2e8f0', fontSize: '0.875rem' }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#94a3b8'
                                }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.email@example.com"
                                    autoComplete="email"
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

                        {/* Password */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#e2e8f0', fontSize: '0.875rem' }}>
                                Password
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
                                    autoComplete="current-password"
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
                        </div>

                        {/* Role Selection */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', color: '#e2e8f0', fontSize: '0.875rem' }}>
                                Select Your Role
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {roles.map((role) => (
                                    <button
                                        key={role.value}
                                        type="button"
                                        onClick={() => setSelectedRole(role.value)}
                                        style={{
                                            padding: '1rem',
                                            background: selectedRole === role.value
                                                ? `linear-gradient(135deg, ${role.color}30 0%, ${role.color}15 100%)`
                                                : 'rgba(30, 41, 59, 0.5)',
                                            border: `2px solid ${selectedRole === role.value ? role.color : 'rgba(148, 163, 184, 0.1)'}`,
                                            borderRadius: '0.75rem',
                                            color: selectedRole === role.value ? role.color : '#94a3b8',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            textAlign: 'left'
                                        }}
                                    >
                                        {role.icon}
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                                                {role.label}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                                {role.desc}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem'
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
                            <a href="#" style={{
                                color: '#818cf8',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                textDecoration: 'none'
                            }}>
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                marginBottom: '1rem',
                                background: loading ? 'rgba(129, 140, 248, 0.5)' : 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
                                border: 'none',
                                borderRadius: '0.75rem',
                                color: 'white',
                                fontSize: '1.05rem',
                                fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 8px 24px rgba(129, 140, 248, 0.3)',
                                transition: 'all 0.3s'
                            }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                            Don't have an account?{' '}
                            <Link to="/signup" style={{ color: '#818cf8', fontWeight: '600', textDecoration: 'none' }}>
                                Create Account
                            </Link>
                        </p>
                    </div>

                    {/* Test Credentials */}
                    <div style={{
                        marginTop: '2rem',
                        padding: '1rem',
                        background: 'rgba(15, 23, 42, 0.5)',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(148, 163, 184, 0.1)'
                    }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#818cf8', marginBottom: '0.75rem' }}>
                            🔑 Test Credentials:
                        </p>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.8' }}>
                            <div>admin@nyay.com / admin123</div>
                            <div>judge@nyay.com / judge123</div>
                            <div>lawyer@nyay.com / lawyer123</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
