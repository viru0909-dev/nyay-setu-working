import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/**
 * @param {string} featureName - Human label for the blocked action
 * @param {{ pattern?: 'modal' | 'inline' | 'redirect' | 'tooltip', intentPath?: string }} [options]
 */
export default function useProtectedFeature(featureName = 'this feature', options = {}) {
    const { pattern = 'modal', intentPath } = options;
    const navigate = useNavigate();
    const {
        isAuthenticated,
        isGuest,
        hasSeenGuestModal,
        markGuestModalShown,
        setGuestIntent,
    } = useAuthStore();
    const [showDeniedModal, setShowDeniedModal] = useState(false);
    const [inlineMessage, setInlineMessage] = useState(null);

    const canAccess = useMemo(() => isAuthenticated && !isGuest, [isAuthenticated, isGuest]);

    const saveIntent = useCallback(() => {
        const path = intentPath || (typeof window !== 'undefined' ? window.location.pathname : '/');
        setGuestIntent({
            path,
            feature: featureName,
            label: `Continue to ${featureName}`,
        });
    }, [featureName, intentPath, setGuestIntent]);

    const goToSignup = useCallback(() => {
        saveIntent();
        navigate('/signup', { state: { from: { pathname: intentPath || window.location.pathname } } });
    }, [navigate, saveIntent, intentPath]);

    const goToLogin = useCallback(() => {
        saveIntent();
        navigate('/login', { state: { from: { pathname: intentPath || window.location.pathname } } });
    }, [navigate, saveIntent, intentPath]);

    const tryAccess = useCallback(() => {
        if (canAccess) {
            return true;
        }

        saveIntent();

        if (isGuest && !hasSeenGuestModal() && pattern === 'modal') {
            markGuestModalShown();
            setShowDeniedModal(true);
            return false;
        }

        if (pattern === 'redirect') {
            goToLogin();
            return false;
        }

        if (pattern === 'inline' || (isGuest && hasSeenGuestModal())) {
            setInlineMessage(`Create an account to ${featureName}.`);
            window.setTimeout(() => setInlineMessage(null), 4000);
            return false;
        }

        if (pattern === 'tooltip') {
            setInlineMessage(`Sign in to ${featureName}.`);
            window.setTimeout(() => setInlineMessage(null), 3000);
            return false;
        }

        goToLogin();
        return false;
    }, [
        canAccess,
        featureName,
        goToLogin,
        hasSeenGuestModal,
        isGuest,
        markGuestModalShown,
        pattern,
        saveIntent,
    ]);

    const tryAccessAsync = async (action) => {
        if (!tryAccess()) {
            return null;
        }
        return await action();
    };

    return {
        canAccess,
        isGuest,
        hasSeenGuestModal,
        showDeniedModal,
        setShowDeniedModal,
        inlineMessage,
        setInlineMessage,
        tryAccess,
        tryAccessAsync,
        goToSignup,
        goToLogin,
        saveIntent,
    };
}
