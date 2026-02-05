import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';
import toast from 'react-hot-toast';
import { isOnline } from '../utils/pwaHelpers';

/**
 * OfflineIndicator Component - Enhanced Version
 * Shows a prominent visual indicator when the user is offline
 * Displays toast notifications on status changes
 */
const OfflineIndicator = () => {
    const [online, setOnline] = useState(isOnline());
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setOnline(true);
            setShowBanner(false);
            toast.success('You\'re back online!', {
                duration: 3000,
                icon: '🌐',
                style: {
                    borderRadius: '12px',
                    background: '#10b981',
                    color: '#fff',
                }
            });
        };

        const handleOffline = () => {
            setOnline(false);
            setShowBanner(true);
            toast.error('You\'re working offline', {
                duration: 5000,
                icon: '📡',
                style: {
                    borderRadius: '12px',
                    background: '#f97316',
                    color: '#fff',
                }
            });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Check initial state
        if (!navigator.onLine) {
            setShowBanner(true);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {showBanner && !online && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 25,
                        duration: 0.3
                    }}
                    className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none"
                >
                    {/* Enhanced gradient banner */}
                    <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 text-white py-3.5 px-4 shadow-2xl border-b-2 border-red-600/50">
                        <div className="container mx-auto flex items-center justify-center gap-3">
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [1, 0.7, 1]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <WifiOff className="w-5 h-5" />
                            </motion.div>
                            <p className="text-sm font-semibold">
                                You're working offline. Some features may be limited.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OfflineIndicator;
