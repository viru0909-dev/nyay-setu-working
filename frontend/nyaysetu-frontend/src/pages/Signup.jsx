import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { User, Mail, Lock, Eye, EyeOff, UserCircle, Shield, CheckCircle } from 'lucide-react';

export default function Signup() {
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: '',
        confirmPassword: '',
        role: 'CLIENT'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const roles = [
        { value: 'CLIENT', label: 'Client/Citizen', desc: 'File cases & track progress', icon: <User size={20} />, color: '#3b82f6' },
        { value: 'LAWYER', label: 'Lawyer/Advocate', desc: 'Represent clients & manage cases', icon: <UserCircle size={20} />, color: '#8b5cf6' },
        { value: 'JUDGE', label: 'Judge', desc: 'Conduct hearings & make rulings', icon: <Shield size={20} />, color: '#ec4899' }
    ];

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
            await authAPI.register({
                email: formData.email,
                name: formData.name,
                password: formData.password,
                role: formData.role
            });

            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
                        Join NyaySetu
                    </h1>
                    <p style={{ fontSize: '1.125rem', color: '#94a3b8', marginBottom: '2rem', lineHeight: '1.6' }}>
                        Create your account and get instant access to India's most advanced virtual judiciary platform
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {[
                            { icon: <CheckCircle size={24} color="#10b981" />, text: 'Free account with full access' },
                            { icon: <CheckCircle size={24} color="#10b981" />, text: 'Secure blockchain document storage' },
                            { icon: <CheckCircle size={24} color="#10b981" />, text: 'AI-powered case analysis' },
                            { icon: <CheckCircle size={24} color="#10b981" />, text: '24/7 virtual hearing support' }
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
                            Create Account
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
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
                            fontSize: '0.875rem'
                        }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{
                            padding: '1rem',
                            marginBottom: '1.5rem',
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: '#34d399',
                            borderRadius: '0.75rem',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            fontSize: '0.875rem'
                        }}>
                            ✓ Account created! Redirecting to login...
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Name */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#e2e8f0', fontSize: '0.875rem' }}>
                                Full Name
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#94a3b8'
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
                                        background: 'rgba(15, 23, 42, 0.5)',
                                        border: '2px solid rgba(148, 163, 184, 0.2)',
                                        borderRadius: '0.75rem',
                                        color: 'white',
                                        fontSize: '0.95rem'
                                    }}
                                />
                            </div>
                        </div>

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
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="your.email@example.com"
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

                        {/* Role Selection */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', color: '#e2e8f0', fontSize: '0.875rem' }}>
                                Select Your Role
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {roles.map((role) => (
                                    <button
                                        key={role.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: role.value })}
                                        style={{
                                            padding: '1rem',
                                            background: formData.role === role.value
                                                ? `linear-gradient(135deg, ${role.color}30 0%, ${role.color}15 100%)`
                                                : 'rgba(30, 41, 59, 0.5)',
                                            border: `2px solid ${formData.role === role.value ? role.color : 'rgba(148, 163, 184, 0.1)'}`,
                                            borderRadius: '0.75rem',
                                            color: formData.role === role.value ? role.color : '#94a3b8',
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
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                        </div>

                        {/* Confirm Password */}
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
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                            disabled={loading || success}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                marginBottom: '1rem',
                                background: loading || success ? 'rgba(129, 140, 248, 0.5)' : 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
                                border: 'none',
                                borderRadius: '0.75rem',
                                color: 'white',
                                fontSize: '1.05rem',
                                fontWeight: '700',
                                cursor: loading || success ? 'not-allowed' : 'pointer',
                                boxShadow: '0 8px 24px rgba(129, 140, 248, 0.3)',
                                transition: 'all 0.3s'
                            }}
                        >
                            {loading ? 'Creating Account...' : success ? '✓ Account Created!' : 'Create Account'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: '#818cf8', fontWeight: '600', textDecoration: 'none' }}>
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
