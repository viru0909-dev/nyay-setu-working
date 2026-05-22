import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const useSessionMonitor = (token) => {
    const [showWarning, setShowWarning] = useState(false);


    useEffect(() => {
        if (!token) return;

        try {
            const decoded = jwtDecode(token);
            const expiryTime = decoded.exp * 1000;
            const currentTime = Date.now();

            const warningTime = expiryTime - (5 * 60 * 1000);

            const timeUntilWarning = warningTime - currentTime;
            const timeUntilExpiry = expiryTime - currentTime;

            if (timeUntilExpiry <= 0) {
                handleLogout();
                return;
            }

            const warningTimer = setTimeout(() => {
                setShowWarning(true);
            }, timeUntilWarning > 0 ? timeUntilWarning : 0);

            const expiryTimer = setTimeout(() => {
                handleLogout();
            }, timeUntilExpiry);

            return () => {
                clearTimeout(warningTimer);
                clearTimeout(expiryTimer);
            };
        } catch (error) {
            console.error("Invalid token format", error);
        }
    }, [token]);
    const handleLogout = () => {
        localStorage.removeItem('token');
        setShowWarning(false);
        // Redirects to login with a special parameter so we can show a nice message later
        window.location.href = '/login?reason=session_expired';
    };

    return { showWarning, setShowWarning };
};