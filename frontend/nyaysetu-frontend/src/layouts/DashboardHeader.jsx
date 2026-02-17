import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, User, Menu, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/authStore';
import NotificationBell from '../components/NotificationBell';

export default function DashboardHeader({ user, isMobile, onMobileMenuToggle }) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const { logout } = useAuthStore();
    const navigate = useNavigate();
    const { i18n } = useTranslation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header
            className="navbar"
            style={{
                height: isMobile ? '70px' : '80px',
                minHeight: isMobile ? '70px' : '80px',
                maxHeight: isMobile ? '70px' : '80px',
                flexShrink: 0,
                padding: isMobile ? '0 1rem' : '0 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                zIndex: 100,
                background: '#FFFFFF',
                borderBottom: '1px solid #E5E7EB',
                gap: '0.75rem'
            }}
        >
            {/* Left side: Hamburger + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                {/* Mobile hamburger menu */}
                {isMobile && (
                    <button
                        onClick={onMobileMenuToggle}
                        style={{
                            background: '#F8FAFC',
                            border: '1px solid #E5E7EB',
                            borderRadius: '10px',
                            padding: '0.625rem',
                            cursor: 'pointer',
                            color: 'var(--color-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}
                    >
                        <Menu size={22} />
                    </button>
                )}

                {/* Page Title */}
                <div style={{ minWidth: 0 }}>
                    <h1 style={{
                        fontSize: isMobile ? '1.15rem' : '1.5rem',
                        fontWeight: '800',
                        color: 'var(--color-primary)',
                        marginBottom: isMobile ? 0 : '0.1rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        letterSpacing: '-0.02em'
                    }}>
                        {isMobile ? 'Dashboard' : `${user?.role?.replace('_', ' ')} Dashboard`}
                    </h1>
                    {!isMobile && (
                        <p style={{
                            fontSize: '0.825rem',
                            color: 'var(--text-secondary)',
                            fontWeight: '500'
                        }}>
                            Welcome back, {user?.name || 'User'}!
                        </p>
                    )}
                </div>
            </div>

            {/* Right Side Actions */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '0.5rem' : '1rem',
                flexShrink: 0
            }}>
                {/* Notifications */}
                <NotificationBell />

                {/* Profile Dropdown */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: isMobile ? '0.5rem' : '0.75rem',
                            padding: isMobile ? '0.25rem' : '0.5rem 0.75rem',
                            borderRadius: '12px',
                            background: '#F8FAFC',
                            border: '1px solid #E5E7EB',
                            color: 'var(--color-primary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontWeight: '700'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = '#F1F5F9';
                            e.currentTarget.style.borderColor = '#CBD5E1';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = '#F8FAFC';
                            e.currentTarget.style.borderColor = '#E5E7EB';
                        }}
                    >
                        <div style={{
                            width: isMobile ? '32px' : '36px',
                            height: isMobile ? '32px' : '36px',
                            borderRadius: '50%',
                            background: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: isMobile ? '0.75rem' : '0.85rem',
                            color: 'white',
                            boxShadow: '0 2px 8px rgba(30, 42, 68, 0.2)'
                        }}>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        {!isMobile && (
                            <>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                                        {user?.name || 'User'}
                                    </div>
                                </div>
                                <ChevronDown size={14} color="#64748B" />
                            </>
                        )}
                    </button>

                    {/* Dropdown Menu */}
                    {showProfileMenu && (
                        <div style={{
                            position: 'absolute',
                            top: '110%',
                            right: 0,
                            width: '220px',
                            background: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '12px',
                            padding: '0.5rem',
                            boxShadow: '0 10px 25px rgba(30, 42, 68, 0.1)',
                            zIndex: 200
                        }}>
                            <button
                                onClick={() => {
                                    setShowProfileMenu(false);
                                    navigate(`/${user?.role?.toLowerCase()}/profile`);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    background: 'transparent',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'var(--color-primary)',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    transition: 'all 0.2s',
                                    marginBottom: '0.25rem'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = '#F8FAFC';
                                    e.currentTarget.style.color = 'var(--color-secondary)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--color-primary)';
                                }}
                            >
                                <User size={16} />
                                View Profile
                            </button>

                            {/* Language Selector */}
                            <div style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.75rem',
                                color: '#64748B',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Language
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '0.5rem',
                                padding: '0 0.5rem'
                            }}>
                                <button
                                    onClick={() => {
                                        i18n.changeLanguage('en');
                                        setShowProfileMenu(false);
                                    }}
                                    style={{
                                        padding: '0.5rem',
                                        background: i18n.language === 'en' ? 'rgba(63, 93, 204, 0.1)' : 'transparent',
                                        border: i18n.language === 'en' ? '1px solid var(--color-secondary)' : '1px solid #E5E7EB',
                                        borderRadius: '6px',
                                        color: i18n.language === 'en' ? 'var(--color-secondary)' : 'var(--color-primary)',
                                        fontSize: '0.8rem',
                                        fontWeight: i18n.language === 'en' ? '700' : '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.25rem'
                                    }}
                                    onMouseOver={(e) => {
                                        if (i18n.language !== 'en') {
                                            e.currentTarget.style.background = '#F8FAFC';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (i18n.language !== 'en') {
                                            e.currentTarget.style.background = 'transparent';
                                        }
                                    }}
                                >
                                    EN
                                </button>
                                <button
                                    onClick={() => {
                                        i18n.changeLanguage('hi');
                                        setShowProfileMenu(false);
                                    }}
                                    style={{
                                        padding: '0.5rem',
                                        background: i18n.language === 'hi' ? 'rgba(63, 93, 204, 0.1)' : 'transparent',
                                        border: i18n.language === 'hi' ? '1px solid var(--color-secondary)' : '1px solid #E5E7EB',
                                        borderRadius: '6px',
                                        color: i18n.language === 'hi' ? 'var(--color-secondary)' : 'var(--color-primary)',
                                        fontSize: '0.8rem',
                                        fontWeight: i18n.language === 'hi' ? '700' : '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.25rem'
                                    }}
                                    onMouseOver={(e) => {
                                        if (i18n.language !== 'hi') {
                                            e.currentTarget.style.background = '#F8FAFC';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (i18n.language !== 'hi') {
                                            e.currentTarget.style.background = 'transparent';
                                        }
                                    }}
                                >
                                    हिंदी
                                </button>
                            </div>

                            <div style={{
                                height: '1px',
                                background: 'var(--border-glass)',
                                margin: '0.5rem 0'
                            }} />

                            <button
                                onClick={handleLogout}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    background: 'transparent',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'var(--color-error)',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
