import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Check } from 'lucide-react';
import { isPWAInstalled } from '../utils/pwaHelpers';

/**
 * PWAInstallPrompt Component - Enhanced Version
 * Prompts users to install the app when it's installable
 * Remembers user preference and handles errors gracefully
 */
const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);

    useEffect(() => {
        // Don't show if already installed
        if (isPWAInstalled()) {
            return;
        }

        // Check if user previously dismissed
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed === 'true') {
            return;
        }

        const handleBeforeInstallPrompt = (e) => {
            // Prevent the default mini-infobar from appearing
            e.preventDefault();

            // Store the event for later use
            setDeferredPrompt(e);

            // Show our custom prompt after a delay
            setTimeout(() => {
                setShowPrompt(true);
            }, 3000); // Show after 3 seconds
        };

        // Listen for install prompt event
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Cleanup
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) {
            console.warn('Install prompt not available');
            return;
        }

        try {
            setIsInstalling(true);

            // Show the browser's install prompt
            await deferredPrompt.prompt();

            // Wait for user response
            const { outcome } = await deferredPrompt.userChoice;

            console.log(`Install prompt outcome: ${outcome}`);

            // Clear the deferred prompt
            setDeferredPrompt(null);
            setShowPrompt(false);

            if (outcome === 'accepted') {
                console.log('✅ User installed the app');
                localStorage.setItem('pwa-installed', 'true');
            }
        } catch (error) {
            console.error('Error during install:', error);
        } finally {
            setIsInstalling(false);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    if (!showPrompt) return null;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ y: 100, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 100, opacity: 0, scale: 0.95 }}
                transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    duration: 0.4
                }}
                className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-[99999]"
                role="dialog"
                aria-label="Install app prompt"
            >
                {/* Main card with enhanced gradient */}
                <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl overflow-hidden border border-white/10">

                    {/* Glass overlay effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/5 to-transparent backdrop-blur-sm" />

                    {/* Animated shimmer */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        animate={{
                            x: ['-100%', '100%']
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'linear'
                        }}
                    />

                    <div className="relative p-6">
                        {/* Close button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                            aria-label="Dismiss install prompt"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Content */}
                        <div className="space-y-4">
                            {/* Header with icon */}
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
                                        <Smartphone className="w-6 h-6 text-white" />
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                                        Install NyaySetu
                                    </h3>
                                    <p className="text-white/90 text-sm leading-relaxed">
                                        Get quick access and work offline
                                    </p>
                                </div>
                            </div>

                            {/* Benefits grid with checkmarks */}
                            <div className="grid grid-cols-2 gap-2.5 py-2">
                                {[
                                    'Offline Access',
                                    'Instant Launch',
                                    'No App Store',
                                    'Auto Updates'
                                ].map((benefit) => (
                                    <div key={benefit} className="flex items-center gap-2 text-white/95 text-xs font-medium">
                                        <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                        <span>{benefit}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleInstall}
                                    disabled={isInstalling}
                                    className="flex-1 bg-white hover:bg-white/95 text-purple-700 font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                                >
                                    <Download className={`w-4 h-4 ${isInstalling ? 'animate-bounce' : ''}`} />
                                    {isInstalling ? 'Installing...' : 'Install App'}
                                </button>

                                <button
                                    onClick={handleDismiss}
                                    className="px-4 py-3 text-white/95 hover:text-white font-semibold text-sm transition-colors hover:bg-white/10 rounded-xl"
                                >
                                    Later
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom glow line */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PWAInstallPrompt;
