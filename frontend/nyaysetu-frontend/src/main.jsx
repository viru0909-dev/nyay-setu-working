import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import './styles/responsive.css'
import './i18n' // Initialize i18n before app
import App from './App.jsx'
import { useSessionMonitor } from './hooks/useSessionMonitor';
import SessionWarningBanner from './components/SessionWarningBanner';
import { refreshSession } from './services/api';
import useAuthStore from './store/authStore';

/**
 * Register service worker and handle updates
 * Only runs on production builds (preview/production), not on dev server
 */
const registerServiceWorker = (callback) => {
    // Skip service worker registration on dev server (port 5173)
    // Only register on production builds (preview/production)
    const isDev = import.meta.env.DEV;

    if (isDev) {
        //  console.log('🔧 Dev mode detected - Service Worker registration skipped');
        return;
    }

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                });
                //   console.log('✅ Service Worker registered successfully:', registration);

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
    const [refreshing, setRefreshing] = useState(false);
    const [refreshError, setRefreshError] = useState('');

    // 1. Subscribe to the current access token so monitor timers reset after refresh
    const token = useAuthStore((state) => state.token);

    // 2. Start the background monitor engine
    const { showWarning, setShowWarning } = useSessionMonitor(token);

    // 3. Refresh the user's session and restart warning/expiry timers
    const handleRefresh = async () => {
        if (refreshing) {
            return;
        }

        setRefreshing(true);
        setRefreshError('');

        try {
            await refreshSession();
            setShowWarning(false);
        } catch (error) {
            console.error('Session refresh failed', error);
            setRefreshError(error.response?.data?.message || 'Unable to extend your session. Please sign in again.');
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        registerServiceWorker(setSwRegistration);
    }, []);

    return (
        <StrictMode>
            {/* 4. The Session Banner renders here when showWarning is true */}
            {showWarning && (
                <SessionWarningBanner
                    onRefresh={handleRefresh}
                    onDismiss={() => setShowWarning(false)}
                    refreshing={refreshing}
                    errorMessage={refreshError}
                />
            )}

            <App swRegistration={swRegistration} />
        </StrictMode>
    );
};

createRoot(document.getElementById('root')).render(<Root />);
