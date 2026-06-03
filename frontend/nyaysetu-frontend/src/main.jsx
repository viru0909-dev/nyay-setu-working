import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import './styles/responsive.css'
import './styles/guest.css'
import './i18n' // Initialize i18n before app
import App from './App.jsx'
import { useSessionMonitor } from './hooks/useSessionMonitor';
import SessionWarningBanner from './components/SessionWarningBanner';
import { Toaster } from "react-hot-toast";
import { registerSW } from 'virtual:pwa-register';

const Root = () => {
    const [swRegistration, setSwRegistration] = useState(null);

    // 1. Start the background monitor engine (now relies on cookie validity)
    const { showWarning, setShowWarning } = useSessionMonitor();

    // 2. The temporary function for the "Stay Logged In" button
    const handleRefresh = () => {
        if (import.meta.env.DEV) {
            console.log("User wants to stay logged in!");
        }
        setShowWarning(false);
    };

    useEffect(() => {
        if (!import.meta.env.DEV) {
            const updateSW = registerSW({
                onNeedRefresh() {
                    console.log('🔄 New update found! Reloading to clear cache...');
                    updateSW(true);
                },
                onOfflineReady() {
                    console.log('✅ App is ready to work offline');
                },
            });
        }
    }, []);

    useEffect(() => {
        if (import.meta.env.DEV) {
            const user = localStorage.getItem('user');

            if (!user) {
                const devUser = {
                    id: 1,
                    name: 'Dev User',
                    role: 'LITIGANT',
                };

                localStorage.setItem('user', JSON.stringify(devUser));
                console.log('🔧 DEV auth bypass enabled for local QA: user profile seeded');
            }
        }
    }, []);

    return (
        <StrictMode>
            {showWarning && (
                <SessionWarningBanner
                    onRefresh={handleRefresh}
                    onDismiss={() => setShowWarning(false)}
                />
            )}

            <>
                <Toaster position="top-right" />
                <App swRegistration={swRegistration} />
            </>
        </StrictMode>
    );
};

createRoot(document.getElementById('root')).render(<Root />);
