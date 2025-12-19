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
        <header style={{
            height: '80px',
            minHeight: '80px',
            maxHeight: '80px',
            flexShrink: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
            padding: '0 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 100
        }}>
            {/* Page Title */}
            <div>
                <h1 style={{
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '0.25rem'
                }}>
                    {user?.role?.replace('_', ' ')} Dashboard
                </h1>
                <p style={{
                    fontSize: '0.875rem',
                    color: '#94a3b8'
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
                            background: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            color: '#e2e8f0',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                        }}
                    >
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '0.875rem'
                        }}>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                                {user?.name || 'User'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
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
                            background: 'rgba(30, 41, 59, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            borderRadius: '12px',
                            padding: '0.5rem',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
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
                                    color: '#e2e8f0',
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
                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
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
                                background: 'rgba(148, 163, 184, 0.1)',
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
                                    color: '#f87171',
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
