import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import useAuthStore from '../store/authStore';

export default function OAuth2Callback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token && token !== 'null' && token !== 'undefined') {
            try {
                // Decode user details from JWT claims
                const decoded = jwtDecode(token);
                
                const user = {
                    id: decoded.id,
                    name: decoded.name,
                    email: decoded.email,
                    role: decoded.role || 'LITIGANT'
                };

                // Store in Zustand store and localStorage
                setAuth(user, token);

                // Redirect to correct dashboard based on role
                const roleRoutes = {
                    ADMIN: '/admin',
                    JUDGE: '/judge',
                    LAWYER: '/lawyer',
                    LITIGANT: '/litigant',
                    POLICE: '/police',
                    TECH_ADMIN: '/admin',
                    TECHNICAL_TEAM: '/admin',
                    SUPER_JUDGE: '/admin'
                };

                navigate(roleRoutes[user.role] || '/');
            } catch (error) {
                console.error('Failed to decode OAuth2 token:', error);
                navigate('/login?error=oauth_failed');
            }
        } else {
            console.error('No token found in OAuth2 callback');
            navigate('/login?error=oauth_failed');
        }
    }, [searchParams, setAuth, navigate]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'var(--bg-glass-strong)',
            color: 'var(--text-main)',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                padding: '2.5rem',
                borderRadius: '1.5rem',
                background: 'var(--bg-glass)',
                border: 'var(--border-glass)',
                textAlign: 'center',
                boxShadow: 'var(--shadow-glass)',
                maxWidth: '400px',
                width: '90%'
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                    Authenticating with Google
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                    Establishing secure digital identity link...
                </p>
                <div style={{
                    width: '36px',
                    height: '36px',
                    border: '4px solid rgba(37, 99, 235, 0.1)',
                    borderTopColor: 'var(--color-primary)',
                    borderRadius: '50%',
                    margin: '0 auto',
                    animation: 'spin 1s linear infinite'
                }} />
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
