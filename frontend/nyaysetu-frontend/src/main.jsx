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

    // 1. Grab the user's token from local storage
    const token = localStorage.getItem('token');

    // 2. Start the background monitor engine
    const { showWarning, setShowWarning } = useSessionMonitor(token);

    // 3. The temporary function for the "Stay Logged In" button
    const handleRefresh = () => {
        console.log("User wants to stay logged in!");
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
