import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Check } from 'lucide-react';
import { isPWAInstalled } from '../utils/pwaHelpers';
import './PWAStyles.css';

/**
 * PWAInstallPrompt Component - Custom CSS Version
 * Prompts users to install the app when it's installable
 * Uses the NyaySetu design system (not Tailwind)
 */
const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);

    useEffect(() => {
        if (isPWAInstalled()) {
            return;
        }

        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed === ' true') {
            return;
        }

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);

            setTimeout(() => {
                setShowPrompt(true);
            }, 3000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

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
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            console.log(`Install prompt outcome: ${outcome}`);

            setDeferredPrompt(null);
            setShowPrompt(false);

            if (outcome === 'accepted') {
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
                className="pwa-install-prompt"
                role="dialog"
                aria-label="Install app prompt"
            >
                <div className="pwa-prompt-card">
                    <button
                        onClick={handleDismiss}
                        className="pwa-close-btn"
                        aria-label="Dismiss install prompt"
                    >
                        <X size={20} />
                    </button>

                    <div className="pwa-prompt-content">
                        <div className="pwa-header">
                            <div className="pwa-icon">
                                <Smartphone size={24} />
                            </div>

                            <div className="pwa-header-text">
                                <h3>Install NyaySetu</h3>
                                <p>Get quick access and work offline</p>
                            </div>
                        </div>

                        <div className="pwa-benefits">
                            {[
                                'Offline Access',
                                'Instant Launch',
                                'No App Store',
                                'Auto Updates'
                            ].map((benefit) => (
                                <div key={benefit} className="pwa-benefit-item">
                                    <div className="pwa-check-icon">
                                        <Check size={14} />
                                    </div>
                                    <span>{benefit}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pwa-actions">
                            <button
                                onClick={handleInstall}
                                disabled={isInstalling}
                                className="btn btn-primary pwa-install-btn"
                            >
                                <Download size={18} className={isInstalling ? 'pwa-installing' : ''} />
                                {isInstalling ? 'Installing...' : 'Install App'}
                            </button>

                            <button
                                onClick={handleDismiss}
                                className="btn btn-ghost pwa-dismiss-btn"
                            >
                                Later
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PWAInstallPrompt;
