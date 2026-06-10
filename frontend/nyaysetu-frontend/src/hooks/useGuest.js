import useAuthStore from '../store/authStore';

/**
 * Central guest/auth helpers — prefer this over scattered isGuest checks.
 */
export default function useGuest() {
    const isGuest = useAuthStore((s) => s.isGuest);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const user = useAuthStore((s) => s.user);
    const setGuestIntent = useAuthStore((s) => s.setGuestIntent);
    const getGuestIntent = useAuthStore((s) => s.getGuestIntent);
    const clearGuestIntent = useAuthStore((s) => s.clearGuestIntent);
    const getGuestPrefs = useAuthStore((s) => s.getGuestPrefs);
    const updateGuestPrefs = useAuthStore((s) => s.updateGuestPrefs);
    const hasDismissedOnboarding = useAuthStore((s) => s.hasDismissedOnboarding);
    const dismissOnboarding = useAuthStore((s) => s.dismissOnboarding);

    return {
        isGuest,
        isAuthenticated,
        user,
        canAccessProtected: isAuthenticated && !isGuest,
        isExploring: isGuest,
        setGuestIntent,
        getGuestIntent,
        clearGuestIntent,
        getGuestPrefs,
        updateGuestPrefs,
        hasDismissedOnboarding,
        dismissOnboarding,
    };
}
