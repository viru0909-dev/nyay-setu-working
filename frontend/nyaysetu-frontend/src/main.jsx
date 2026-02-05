import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import './styles/responsive.css'
import App from './App.jsx'

/**
 * Register service worker and handle updates
 */
const registerServiceWorker = (callback) => {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                });
                console.log('Service Worker registered successfully:', registration);

                // Pass registration to callback
                if (callback) {
                    callback(registration);
                }

                // Check for updates periodically (every hour)
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000);

            } catch (error) {
                console.error('Service Worker registration failed:', error);
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
