import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, User } from 'lucide-react';
import useAuthStore from '../store/authStore';
import NotificationBell from '../components/NotificationBell';

export default function DashboardHeader({ user }) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const { logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header
            className="navbar"
            style={{
                height: '80px',
                minHeight: '80px',
                maxHeight: '80px',
                flexShrink: 0,
                padding: '0 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                zIndex: 100
            }}
        >
            {/* Page Title */}
            <div>
                <h1 style={{
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    color: 'var(--color-primary)',
                    marginBottom: '0.25rem'
                }}>
                    {user?.role?.replace('_', ' ')} Dashboard
                </h1>
                <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                }}>
                    Welcome back, {user?.name || 'User'}!
                </p>
            </div>

            {/* Right Side Actions */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
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
                            gap: '0.75rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '12px',
                            background: 'var(--bg-glass-strong)',
                            border: 'var(--border-glass)',
                            color: 'var(--text-main)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'var(--bg-glass-hover)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'var(--bg-glass-strong)';
                        }}
                    >
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '0.875rem',
                            color: 'white'
                        }}>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                                {user?.name || 'User'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                {user?.role?.replace('_', ' ')}
                            </div>
                        </div>
                        <ChevronDown size={16} />
                    </button>

                    {/* Dropdown Menu */}
                    {showProfileMenu && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '0.5rem',
                            width: '220px',
                            background: 'var(--bg-white)', /* Solid/opaque for readability */
                            backdropFilter: 'var(--glass-blur)',
                            border: 'var(--border-glass)',
                            borderRadius: '12px',
                            padding: '0.5rem',
                            boxShadow: 'var(--shadow-glass)'
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
                                    color: 'var(--text-main)',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    transition: 'all 0.2s',
                                    marginBottom: '0.25rem'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'var(--bg-glass-hover)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <User size={16} />
                                View Profile
                            </button>

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
