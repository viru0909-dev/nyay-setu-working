import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import './styles/responsive.css'
import './i18n' // Initialize i18n before app
import App from './App.jsx'

/**
 * Register service worker and handle updates
 * Only runs on production builds (preview/production), not on dev server
 */
const registerServiceWorker = (callback) => {
    // Skip service worker registration on dev server (port 5173)
    // Only register on production builds (preview/production)
    const isDev = import.meta.env.DEV;

    if (isDev) {
        console.log('🔧 Dev mode detected - Service Worker registration skipped');
        return;
    }

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                });
                console.log('✅ Service Worker registered successfully:', registration);

                // Pass registration to callback
                if (callback) {
                    callback(registration);
                }

                // Check for updates periodically (every hour)
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000);

            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        });
    }
};

const Root = () => {
    const [swRegistration, setSwRegistration] = useState(null);

    useEffect(() => {
        registerServiceWorker(setSwRegistration);
    }, []);

    return (
        <StrictMode>
            <App swRegistration={swRegistration} />
        </StrictMode>
    );
};

createRoot(document.getElementById('root')).render(<Root />);
