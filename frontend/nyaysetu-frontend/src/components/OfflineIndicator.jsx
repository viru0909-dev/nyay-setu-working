import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './PWAStyles.css';

/**
 * OfflineIndicator Component - Custom CSS Version
 * Shows when the app is working offline
 * Uses the NyaySetu design system (not Tailwind)
 */
const OfflineIndicator = () => {
    const [isOnline, setOnline] = useState(navigator.onLine);
    const [showBanner, setShowBanner] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setOnline(true);
            setShowBanner(false);
            toast.success("You're back online!", {
                duration: 3000,
                position: 'top-center',
                style: {
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#fff',
                    fontWeight: '600',
                    padding: '1rem 1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
                },
                icon: '✅',
            });
        };

        const handleOffline = () => {
            setOnline(false);
            setShowBanner(true);
            toast.error("You're working offline", {
                duration: 5000,
                position: 'top-center',
                style: {
                    background: 'linear-gradient(90deg, #f97316 0%, #ef4444 100%)',
                    color: '#fff',
                    fontWeight: '600',
                    padding: '1rem 1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)',
                },
                icon: '⚠️',
            });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <div className="offline-indicator">
            <AnimatePresence>
                {!isOnline && showBanner && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="offline-banner"
                        role="alert"
                        aria-live="assertive"
                    >
                        <div className="offline-banner-content">
                            <WifiOff size={20} className="offline-icon" />
                            <p className="offline-banner-text">
                                You're currently offline. Some features may be limited.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OfflineIndicator;
