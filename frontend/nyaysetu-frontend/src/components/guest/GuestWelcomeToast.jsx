import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, X } from 'lucide-react';
export default function GuestWelcomeToast() {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('Browse freely — create an account when you are ready to file cases.');

    useEffect(() => {
        const show = (text) => {
            setMessage(text);
            setVisible(true);
            window.setTimeout(() => setVisible(false), 6000);
        };

        const onGuestStarted = () =>
            show('Public pages are open. Sign up anytime to file cases and access your dashboard.');
        const onGuestRestored = () => show('Welcome back — your guest session is still active.');
        const onSessionExpired = () =>
            show('Your guest session ended. Explore again or sign up to save your progress.');

        window.addEventListener('guest:started', onGuestStarted);
        window.addEventListener('guest:restored', onGuestRestored);
        window.addEventListener('guest:session-expired', onSessionExpired);
        return () => {
            window.removeEventListener('guest:started', onGuestStarted);
            window.removeEventListener('guest:restored', onGuestRestored);
            window.removeEventListener('guest:session-expired', onSessionExpired);
        };
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    role="status"
                    aria-live="polite"
                    className="guest-toast"
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                >
                    <div className="guest-toast__inner">
                        <div className="guest-toast__icon" aria-hidden>
                            <Compass size={20} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p className="guest-toast__title">Explore as Guest</p>
                            <p className="guest-toast__message">{message}</p>
                        </div>
                        <div className="guest-toast__actions">
                            <Link to="/signup" className="guest-btn-primary">
                                Sign up
                            </Link>
                            <button
                                type="button"
                                className="guest-btn-ghost"
                                onClick={() => setVisible(false)}
                                aria-label="Dismiss"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
