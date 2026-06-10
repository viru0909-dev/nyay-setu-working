import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function ContinueAsGuestButton({ redirectTo = '/', showDivider = true }) {
    const { setGuest } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleContinueAsGuest = async () => {
        setLoading(true);
        try {
            setGuest();
            navigate(redirectTo, { replace: true });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {showDivider && (
                <div className="guest-continue-btn__divider" aria-hidden>
                    or
                </div>
            )}
            <button
                type="button"
                className="guest-continue-btn"
                onClick={handleContinueAsGuest}
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Loader2 size={18} className="spin" style={{ animation: 'spin 0.8s linear infinite' }} />
                        Starting session…
                    </>
                ) : (
                    <>
                        <Compass size={18} />
                        Explore as Guest
                    </>
                )}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
    );
}
