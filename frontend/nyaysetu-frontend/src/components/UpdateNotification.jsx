import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';

/**
 * UpdateNotification Component
 * Notifies users when a new version of the app is available
 * Provides option to refresh and update
 */
const UpdateNotification = ({ registration }) => {
    const [showUpdate, setShowUpdate] = useState(false);
    const [waitingWorker, setWaitingWorker] = useState(null);

    useEffect(() => {
        if (!registration) return;

        // Check if there's already a waiting service worker
        if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setShowUpdate(true);
        }

        // Listen for updates
        const handleUpdateFound = () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New service worker available
                    setWaitingWorker(newWorker);
                    setShowUpdate(true);
                }
            });
        };

        registration.addEventListener('updatefound', handleUpdateFound);

        return () => {
            registration.removeEventListener('updatefound', handleUpdateFound);
        };
    }, [registration]);

    const handleUpdate = () => {
        if (!waitingWorker) return;

        // Send message to waiting service worker to skip waiting
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });

        // Reload the page when the new service worker takes control
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
    };

    const handleDismiss = () => {
        setShowUpdate(false);
    };

    return (
        <AnimatePresence>
            {showUpdate && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed bottom-6 right-6 z-[9999] max-w-md"
                >
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl border border-white/20">
                        {/* Glassmorphism overlay */}
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

                        <div className="relative p-6">
                            {/* Close button */}
                            <button
                                onClick={handleDismiss}
                                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                                aria-label="Dismiss update notification"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Content */}
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                    <RefreshCw className="w-6 h-6 text-white" />
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white mb-2">
                                        Update Available
                                    </h3>
                                    <p className="text-white/90 text-sm mb-4">
                                        A new version of NyaySetu is ready. Refresh to get the latest features and improvements.
                                    </p>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleUpdate}
                                            className="flex-1 bg-white text-blue-600 font-semibold py-2.5 px-4 rounded-lg hover:bg-white/90 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Refresh Now
                                        </button>

                                        <button
                                            onClick={handleDismiss}
                                            className="px-4 py-2.5 text-white/90 hover:text-white font-medium transition-colors"
                                        >
                                            Later
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UpdateNotification;
