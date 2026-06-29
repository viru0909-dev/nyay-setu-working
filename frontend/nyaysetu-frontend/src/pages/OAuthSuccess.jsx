import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { resolvePostAuthPath } from '../utils/authRedirect';

/**
 * OAuthSuccess
 *
 * Landing page for the Google OAuth redirect. The backend (OAuth2LoginSuccessHandler)
 * redirects here with ?token=...&email=...&name=...&role=... query params after a
 * successful Google sign-in.
 *
 * Responsibilities:
 *  1. Parse token + user info from query params.
 *  2. Persist them to the auth store.
 *  3. Navigate to the correct role-based dashboard via resolvePostAuthPath.
 *  4. Show a user-friendly error if anything goes wrong.
 */
export default function OAuthSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            // No token — the backend may have redirected with an error param instead.
            const backendError = searchParams.get('error');
            setErrorMsg(backendError || 'Google sign-in failed. Please try again.');
            const timer = setTimeout(() => {
                navigate(`/login${backendError ? `?error=${encodeURIComponent(backendError)}` : ''}`);
            }, 3000);
            return () => clearTimeout(timer);
        }

        try {
            const email = searchParams.get('email');
            const role = searchParams.get('role');
            const name = searchParams.get('name');

            // Strip the "ROLE_" prefix added by Spring Security if present
            const cleanRole = role?.replace('ROLE_', '') ?? 'LITIGANT';

            const user = { email, role: cleanRole, name };

            setAuth(user, token);

            // Use the shared utility to determine the correct dashboard path,
            // keeping navigation logic in one place (same as Login.jsx).
            navigate(resolvePostAuthPath(cleanRole, null), { replace: true });
        } catch (error) {
            console.error('OAuthSuccess: failed to process token', error);
            setErrorMsg('Something went wrong during sign-in. Redirecting back to login...');
            const timer = setTimeout(() => navigate('/login'), 3000);
            return () => clearTimeout(timer);
        }
    }, [searchParams, navigate, setAuth]);

    // ── Loading / Error UI ──────────────────────────────────────────────────
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-main, #f8fafc)',
                gap: '1.5rem',
                padding: '2rem',
            }}
        >
            {errorMsg ? (
                /* Error state */
                <div
                    style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '1rem',
                        padding: '2rem 2.5rem',
                        textAlign: 'center',
                        maxWidth: '420px',
                    }}
                >
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
                    <p
                        style={{
                            color: '#ef4444',
                            fontSize: '1rem',
                            fontWeight: '600',
                            margin: 0,
                        }}
                    >
                        {errorMsg}
                    </p>
                    <p
                        style={{
                            color: 'var(--text-secondary, #64748b)',
                            fontSize: '0.875rem',
                            marginTop: '0.5rem',
                        }}
                    >
                        Redirecting you back to login…
                    </p>
                </div>
            ) : (
                /* Loading state */
                <>
                    {/* Spinner */}
                    <div
                        style={{
                            width: '56px',
                            height: '56px',
                            border: '4px solid rgba(30, 42, 68, 0.15)',
                            borderTop: '4px solid var(--color-primary, #1E2A44)',
                            borderRadius: '50%',
                            animation: 'oauth-spin 0.8s linear infinite',
                        }}
                    />

                    {/* Google logo + text */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                            style={{ width: '24px', height: '24px' }}
                        />
                        <span
                            style={{
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                color: 'var(--text-main, #1e293b)',
                            }}
                        >
                            Signing you in with Google…
                        </span>
                    </div>

                    <p
                        style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary, #64748b)',
                            margin: 0,
                        }}
                    >
                        Please wait while we set up your session.
                    </p>
                </>
            )}

            <style>{`
                @keyframes oauth-spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}