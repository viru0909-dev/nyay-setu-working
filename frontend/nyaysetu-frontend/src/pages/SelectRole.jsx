
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authAPI } from '../services/api';


const ROLES = [
    {
        key: 'LITIGANT',
        label: 'Litigant',
        description: 'File cases, track hearings, connect with lawyers',
        icon: '⚖️',
        path: '/litigant',
    },
    {
        key: 'LAWYER',
        label: 'Lawyer',
        description: 'Manage clients, prepare cases, access AI tools',
        icon: '👨‍⚖️',
        path: '/lawyer',
    },
    {
        key: 'JUDGE',
        label: 'Judge',
        description: 'Review cases, conduct hearings, deliver verdicts',
        icon: '🏛️',
        path: '/judge',
    },
    {
        key: 'POLICE',
        label: 'Police',
        description: 'Upload FIRs, manage investigations',
        icon: '🚔',
        path: '/police',
    },
    {
        key: 'ADMIN',
        label: 'Admin',
        description: 'System administration and user management',
        icon: '🛡️',
        path: '/admin',
    },
];

export default function SelectRole() {
    const navigate = useNavigate();
    const { user, updateRole } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRoleSelect = async (roleKey, rolePath) => {
        // Don't do anything if user clicks their current role
        if (roleKey === user?.role) {
            navigate(rolePath);
            return;
        }

        setLoading(true);
        setError('');

        try {

            const response = await authAPI.switchRole(roleKey);
            const { token, user: updatedUser } = response.data;


            updateRole(updatedUser, token);


            navigate(rolePath);
        } catch (err) {
            console.error('Role switch failed:', err);
            setError(err.response?.data?.message || 'Failed to switch role. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-base, #f8fafc)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
        }}>

            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '800',
                    color: 'var(--color-primary, #1e2a44)',
                    marginBottom: '0.5rem',
                    letterSpacing: '-0.02em',
                }}>
                    Switch Role
                </h1>
                <p style={{
                    fontSize: '1rem',
                    color: 'var(--text-secondary, #64748b)',
                    fontWeight: '500',
                }}>
                    Currently signed in as <strong>{user?.role}</strong>. Select a new role below.
                </p>
            </div>


            {error && (
                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    padding: '0.75rem 1.25rem',
                    color: 'var(--color-error, #ef4444)',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    marginBottom: '1.5rem',
                    maxWidth: '480px',
                    width: '100%',
                    textAlign: 'center',
                }}>
                    {error}
                </div>
            )}


            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                maxWidth: '900px',
                width: '100%',
            }}>
                {ROLES.map((role) => {
                    const isCurrent = role.key === user?.role;
                    return (
                        <button
                            key={role.key}
                            onClick={() => handleRoleSelect(role.key, role.path)}
                            disabled={loading}
                            style={{
                                padding: '1.5rem 1rem',
                                background: isCurrent
                                    ? 'rgba(63, 93, 204, 0.08)'
                                    : 'var(--bg-surface, #ffffff)',
                                border: isCurrent
                                    ? '2px solid var(--color-secondary, #3f5dcc)'
                                    : '1px solid var(--border-light, #e2e8f0)',
                                borderRadius: '14px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.2s',
                                opacity: loading ? 0.6 : 1,
                                boxShadow: isCurrent
                                    ? '0 0 0 3px rgba(63, 93, 204, 0.15)'
                                    : '0 2px 8px rgba(30, 42, 68, 0.06)',
                            }}
                            onMouseOver={(e) => {
                                if (!loading && !isCurrent) {
                                    e.currentTarget.style.borderColor = 'var(--color-secondary, #3f5dcc)';
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(63, 93, 204, 0.15)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!isCurrent) {
                                    e.currentTarget.style.borderColor = 'var(--border-light, #e2e8f0)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(30, 42, 68, 0.06)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
                                {role.icon}
                            </div>
                            <div style={{
                                fontSize: '1rem',
                                fontWeight: '700',
                                color: isCurrent
                                    ? 'var(--color-secondary, #3f5dcc)'
                                    : 'var(--color-primary, #1e2a44)',
                                marginBottom: '0.4rem',
                            }}>
                                {role.label}
                                {isCurrent && (
                                    <span style={{
                                        display: 'block',
                                        fontSize: '0.7rem',
                                        fontWeight: '600',
                                        color: 'var(--color-secondary, #3f5dcc)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        marginTop: '0.2rem',
                                    }}>
                                        Current
                                    </span>
                                )}
                            </div>
                            <div style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-secondary, #64748b)',
                                fontWeight: '500',
                                lineHeight: '1.4',
                            }}>
                                {role.description}
                            </div>
                        </button>
                    );
                })}
            </div>


            {loading && (
                <p style={{
                    marginTop: '1.5rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary, #64748b)',
                    fontWeight: '500',
                }}>
                    Switching role...
                </p>
            )}


            <button
                onClick={() => navigate(-1)}
                style={{
                    marginTop: '2rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary, #64748b)',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                }}
            >
                Cancel
            </button>
        </div>
    );
}