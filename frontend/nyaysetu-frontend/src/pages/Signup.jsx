import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { Mail, Lock, Eye, EyeOff, User as UserIcon, Briefcase, Scale, Gavel, CheckCircle2, Shield, Camera, ArrowRight, ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import Header from '../components/landing/Header';
import FaceCapture from '../components/auth/FaceCapture';
import { useFaceRecognition } from '../hooks/useFaceRecognition';
import '../styles/Biometrics.css';

export default function Signup() {
    const { t } = useTranslation('auth');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'LITIGANT'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Form, 2: Face Registration
    const [registeredUser, setRegisteredUser] = useState(null);
    const [registeredToken, setRegisteredToken] = useState(null);
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const { enrollFace } = useFaceRecognition();

    const handleGoogleLogin = () => {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const PROD_BACKEND = 'https://nyaysetubackend.onrender.com';
        const backendUrl = import.meta.env.VITE_API_BASE_URL ||
            import.meta.env.VITE_API_URL ||
            (isLocalhost ? 'http://localhost:8080' : PROD_BACKEND);

        window.location.href = `${backendUrl}/oauth2/authorization/google`;
    };

    // Mobile detection
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const roles = [
        { value: 'LITIGANT', label: t('auth:login.roles.litigant'), icon: <Briefcase size={18} />, color: '#3b82f6', desc: t('auth:signup.features.instantFilings') },
        { value: 'LAWYER', label: t('auth:login.roles.lawyer'), icon: <Scale size={18} />, color: '#8b5cf6', desc: t('auth:signup.features.aiAssistance') },
        { value: 'JUDGE', label: t('auth:login.roles.judge'), icon: <Gavel size={18} />, color: '#ec4899', desc: t('auth:signup.features.virtualCourts') }
    ];

    const getPasswordStrength = (pass) => {
        if (pass.length < 6) return { label: t('auth:signup.passwordStrength.tooShort', 'Too Short'), color: '#f87171', width: '25%' };
        if (pass.length < 8) return { label: t('auth:signup.passwordStrength.weak', 'Weak'), color: '#fb923c', width: '50%' };
        if (!/[A-Z]/.test(pass) || !/[0-9]/.test(pass)) return { label: t('auth:signup.passwordStrength.fair', 'Fair'), color: '#fbbf24', width: '75%' };
        return { label: t('auth:signup.passwordStrength.strong', 'Strong'), color: '#10b981', width: '100%' };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError(t('auth:signup.errors.passwordMismatch'));
            return;
        }

        if (formData.password.length < 6) {
            setError(t('auth:signup.errors.passwordTooShort', 'Password must be at least 6 characters'));
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
            setRegisteredUser(user);
            setRegisteredToken(token);
            setStep(2); // Move to face registration
        } catch (err) {
            setError(err.response?.data?.message || t('auth:signup.errors.registrationFailed', 'Registration failed'));
        } finally {
            setLoading(false);
        }
    };

    const handleFaceCapture = async (descriptor) => {
        setLoading(true);
        try {
            await enrollFace(descriptor, registeredToken);
            completeSignup();
        } catch (err) {
            setError(t('auth:signup.errors.faceRegistrationFailed', 'Face registration failed. You can skip this for now or try again.'));
        } finally {
            setLoading(false);
        }
    };

    const completeSignup = () => {
        setAuth(registeredUser, registeredToken);
        const roleRoutes = {
            ADMIN: '/admin',
            JUDGE: '/judge',
            LAWYER: '/lawyer',
            LITIGANT: '/litigant'
        };
        navigate(roleRoutes[registeredUser.role] || '/');
    };

    const strength = formData.password ? getPasswordStrength(formData.password) : null;

    return (
        <div style={{ minHeight: '100vh', background: 'transparent' }}>
            {/* Header */}
            <Header hideAuthButtons={true} />

            <div style={{
                minHeight: '100vh',
                paddingTop: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isMobile ? '80px 1rem 1rem 1rem' : '100px 2rem 2rem 2rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Animated Background - hidden on mobile */}
                {!isMobile && (
                    <>
                        <div style={{
                            position: 'absolute',
                            width: '800px',
                            height: '800px',
                            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
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
                    </>
                )}

                <div style={{
                    width: '100%',
                    maxWidth: isMobile ? '100%' : '1200px',
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: isMobile ? '1.5rem' : '4rem',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1
                }}>
                    {/* Left Side - Benefits (hidden on mobile) */}
                    {!isMobile && (
                        <div style={{ color: 'var(--text-main)' }}>
                            <div style={{ marginBottom: '3rem' }}>
                                <h1 style={{
                                    fontSize: '3.5rem',
                                    fontWeight: '900',
                                    marginBottom: '1rem',
                                    background: 'linear-gradient(135deg, var(--color-accent) 0%, #c084fc 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    lineHeight: '1.2'
                                }}>
                                    {t('auth:signup.pageTitle')}
                                </h1>
                                <p style={{
                                    fontSize: '1.25rem',
                                    color: 'var(--text-secondary)',
                                    lineHeight: '1.8',
                                    maxWidth: '500px'
                                }}>
                                    {t('auth:signup.pageSubtitle')}
                                </p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {[
                                    { icon: <CheckCircle2 size={24} />, text: t('auth:signup.features.aiAssistance'), color: '#10b981' },
                                    { icon: <Shield size={24} />, text: t('auth:signup.features.instantFilings'), color: '#3b82f6' },
                                    { icon: <Scale size={24} />, text: t('auth:signup.features.virtualCourts'), color: '#8b5cf6' },
                                    { icon: <CheckCircle2 size={24} />, text: t('auth:signup.features.multilingual'), color: '#ec4899' }
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
                                        <span style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: '500' }}>
                                            {item.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Right Side - Form */}
                    <div style={{
                        background: 'var(--bg-glass-strong)',
                        backdropFilter: 'var(--glass-blur)',
                        borderRadius: isMobile ? '1rem' : '2rem',
                        border: 'var(--border-glass-strong)',
                        padding: isMobile ? '1.5rem' : '3rem',
                        boxShadow: 'var(--shadow-glass)',
                        width: '100%'
                    }}>
                        {step === 1 ? (
                            <>
                                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                                    <h2 style={{
                                        fontSize: '2rem',
                                        fontWeight: '800',
                                        color: 'var(--text-main)',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {t('auth:signup.title')}
                                    </h2>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                        {t('auth:signup.subtitle')}
                                    </p>
                                </div>

                                {error && (
                                    <div style={{
                                        padding: '1rem',
                                        marginBottom: '1.5rem',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: '#ef4444',
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
                                            color: 'var(--text-main)',
                                            fontSize: '0.875rem'
                                        }}>
                                            {t('auth:signup.fullName')}
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <UserIcon size={18} style={{
                                                position: 'absolute',
                                                left: '1rem',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: 'var(--color-accent)'
                                            }} />
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder={t('auth:signup.fullNamePlaceholder')}
                                                required
                                                style={{
                                                    width: '100%',
                                                    padding: '0.875rem 1rem 0.875rem 3rem',
                                                    background: 'var(--bg-glass)',
                                                    border: 'var(--border-glass)',
                                                    borderRadius: '0.75rem',
                                                    color: 'var(--text-main)',
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
                                            color: 'var(--text-main)',
                                            fontSize: '0.875rem'
                                        }}>
                                            {t('auth:signup.email')}
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={18} style={{
                                                position: 'absolute',
                                                left: '1rem',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: 'var(--color-accent)'
                                            }} />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder={t('auth:signup.emailPlaceholder')}
                                                required
                                                style={{
                                                    width: '100%',
                                                    padding: '0.875rem 1rem 0.875rem 3rem',
                                                    background: 'var(--bg-glass)',
                                                    border: 'var(--border-glass)',
                                                    borderRadius: '0.75rem',
                                                    color: 'var(--text-main)',
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
                                            color: 'var(--text-main)',
                                            fontSize: '0.875rem'
                                        }}>
                                            {t('auth:signup.selectRole')}
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
                                                            ? `${role.color}15`
                                                            : 'var(--bg-glass)',
                                                        border: formData.role === role.value
                                                            ? `2px solid ${role.color}`
                                                            : 'var(--border-glass)',
                                                        borderRadius: '0.75rem',
                                                        color: formData.role === role.value ? role.color : 'var(--text-secondary)',
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
                                            color: 'var(--text-main)',
                                            fontSize: '0.875rem'
                                        }}>
                                            {t('auth:signup.password')}
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={18} style={{
                                                position: 'absolute',
                                                left: '1rem',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: 'var(--color-accent)'
                                            }} />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                placeholder={t('auth:signup.passwordPlaceholder')}
                                                required
                                                style={{
                                                    width: '100%',
                                                    padding: '0.875rem 3rem',
                                                    background: 'var(--bg-glass)',
                                                    border: 'var(--border-glass)',
                                                    borderRadius: '0.75rem',
                                                    color: 'var(--text-main)',
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
                                                    color: 'var(--text-secondary)'
                                                }}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {strength && (
                                            <div style={{ marginTop: '0.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('auth:signup.strengthLabel', 'Strength')}:</span>
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
                                            color: 'var(--text-main)',
                                            fontSize: '0.875rem'
                                        }}>
                                            {t('auth:signup.confirmPassword')}
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={18} style={{
                                                position: 'absolute',
                                                left: '1rem',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: 'var(--color-accent)'
                                            }} />
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                placeholder={t('auth:signup.confirmPasswordPlaceholder')}
                                                required
                                                style={{
                                                    width: '100%',
                                                    padding: '0.875rem 3rem',
                                                    background: 'var(--bg-glass)',
                                                    border: 'var(--border-glass)',
                                                    borderRadius: '0.75rem',
                                                    color: 'var(--text-main)',
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
                                                    color: 'var(--text-secondary)'
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
                                                : 'linear-gradient(135deg, var(--color-accent) 0%, #6366f1 100%)',
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
                                        {loading ? t('auth:signup.signingUp') : t('auth:signup.signUp')}
                                    </button>

                                    {/* Separator */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        margin: '1.25rem 0',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.15)' }} />
                                        <span style={{ padding: '0 10px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                                            or
                                        </span>
                                        <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.15)' }} />
                                    </div>

                                    {/* Google SSO Button */}
                                    <button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        style={{
                                            width: '100%',
                                            padding: '0.85rem',
                                            background: 'var(--bg-glass)',
                                            border: 'var(--border-glass)',
                                            borderRadius: '0.75rem',
                                            color: 'var(--text-main)',
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
                                            e.currentTarget.style.background = 'var(--bg-glass-hover)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = 'var(--bg-glass)';
                                        }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                        </svg>
                                        Continue with Google
                                    </button>
                                </form>

                                <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        {t('auth:signup.hasAccount')}{' '}
                                        <Link to="/login" style={{
                                            color: 'var(--color-accent)',
                                            fontWeight: '600',
                                            textDecoration: 'none'
                                        }}>
                                            {t('auth:signup.loginLink')}
                                        </Link>
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <div className="biometric-icon-wrapper" style={{ margin: '0 auto 1.5rem auto' }}>
                                    <Shield size={32} />
                                </div>
                                <h2 className="biometric-title" style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                                    {t('auth:signup.biometricTitle', 'Biometric Identity Link')}
                                </h2>
                                <p className="biometric-subtitle" style={{ fontSize: '0.95rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                                    {t('auth:signup.biometricSubtitle', 'Establish your digital biometric signature for rapid, ultra-secure access')}
                                </p>

                                {error && (
                                    <div style={{
                                        padding: '1rem',
                                        marginBottom: '1.5rem',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: '#ef4444',
                                        borderRadius: '0.75rem',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        fontSize: '0.875rem',
                                        textAlign: 'center'
                                    }}>
                                        {error}
                                    </div>
                                )}

                                <FaceCapture onCapture={handleFaceCapture} />

                                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={completeSignup}
                                        style={{
                                            flex: 1,
                                            padding: '1rem',
                                            background: 'rgba(148, 163, 184, 0.1)',
                                            border: '1px solid rgba(148, 163, 184, 0.2)',
                                            borderRadius: '0.75rem',
                                            color: 'var(--text-secondary)',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {t('auth:signup.skipForNow', 'Skip for now')}
                                    </button>
                                </div>
                            </div>
                        )}
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
