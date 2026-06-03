import { useState, useEffect } from 'react';

/**
 * Hook to monitor session expiry.
 * With HttpOnly cookies, we rely on the backend to enforce session expiry
 * and the frontend to handle 401 responses.
 */
export const useSessionMonitor = () => {
    const [showWarning, setShowWarning] = useState(false);

    // Client-side monitoring disabled for secure HttpOnly cookies
    // Session expiry is now handled via 401 intercepts in services/api.js

    return { showWarning, setShowWarning };
};