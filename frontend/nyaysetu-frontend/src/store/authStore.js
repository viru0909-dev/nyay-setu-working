import { create } from 'zustand';
import { GUEST_SESSION_MAX_AGE_MS, GUEST_STORAGE_KEYS } from '../lib/guest';

const {
    user: GUEST_USER_KEY,
    sessionId: GUEST_SESSION_ID_KEY,
    createdAt: GUEST_CREATED_AT_KEY,
    modalShown: GUEST_MODAL_SHOWN_KEY,
    prefs: GUEST_PREFS_KEY,
    intent: GUEST_INTENT_KEY,
    onboarding: GUEST_ONBOARDING_KEY,
} = GUEST_STORAGE_KEYS;

const isTokenExpired = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        if (!payload.exp) return true;

        const currentTime = Date.now() / 1000;

        return payload.exp < currentTime;
    } catch (error) {
        return true;
    }
};

const createGuestSessionId = () => `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const readJson = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key);
        if (!raw || raw === 'null' || raw === 'undefined') return fallback;
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
};

const writeJson = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

const clearGuestStorage = () => {
    localStorage.removeItem(GUEST_USER_KEY);
    localStorage.removeItem(GUEST_SESSION_ID_KEY);
    localStorage.removeItem(GUEST_CREATED_AT_KEY);
    localStorage.removeItem(GUEST_MODAL_SHOWN_KEY);
    localStorage.removeItem(GUEST_PREFS_KEY);
    localStorage.removeItem(GUEST_ONBOARDING_KEY);
};

const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isGuest: false,

    setAuth: (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        clearGuestStorage();
        localStorage.removeItem(GUEST_INTENT_KEY);
        set({ user, token, isAuthenticated: true, isGuest: false });
    },

    setGuest: () => {
        const sessionId = createGuestSessionId();
        const guestUser = {
            id: sessionId,
            name: 'Guest',
            email: null,
            role: 'GUEST',
            isGuest: true,
            sessionId,
        };

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.setItem(GUEST_SESSION_ID_KEY, sessionId);
        localStorage.setItem(GUEST_USER_KEY, JSON.stringify(guestUser));
        localStorage.setItem(GUEST_CREATED_AT_KEY, new Date().toISOString());
        localStorage.removeItem(GUEST_MODAL_SHOWN_KEY);

        if (!localStorage.getItem(GUEST_PREFS_KEY)) {
            writeJson(GUEST_PREFS_KEY, { theme: null, language: null, visitedConstitution: false });
        }

        set({ user: guestUser, token: null, isAuthenticated: false, isGuest: true });
        try {
            window.dispatchEvent(new CustomEvent('guest:started', { detail: { sessionId } }));
        } catch {
            // Ignore environments without CustomEvent support
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        clearGuestStorage();
        localStorage.removeItem(GUEST_INTENT_KEY);
        set({ user: null, token: null, isAuthenticated: false, isGuest: false });
    },

    hasSeenGuestModal: () => localStorage.getItem(GUEST_MODAL_SHOWN_KEY) === 'true',

    markGuestModalShown: () => {
        localStorage.setItem(GUEST_MODAL_SHOWN_KEY, 'true');
    },

    clearGuestModalShown: () => {
        localStorage.removeItem(GUEST_MODAL_SHOWN_KEY);
    },

    setGuestIntent: (intent) => {
        if (!intent?.path) return;
        writeJson(GUEST_INTENT_KEY, {
            path: intent.path,
            label: intent.label || null,
            feature: intent.feature || null,
            savedAt: new Date().toISOString(),
        });
    },

    getGuestIntent: () => readJson(GUEST_INTENT_KEY, null),

    clearGuestIntent: () => {
        localStorage.removeItem(GUEST_INTENT_KEY);
    },

    getGuestPrefs: () => readJson(GUEST_PREFS_KEY, {}),

    updateGuestPrefs: (patch) => {
        const next = { ...get().getGuestPrefs(), ...patch };
        writeJson(GUEST_PREFS_KEY, next);
        return next;
    },

    hasDismissedOnboarding: () => localStorage.getItem(GUEST_ONBOARDING_KEY) === 'true',

    dismissOnboarding: () => {
        localStorage.setItem(GUEST_ONBOARDING_KEY, 'true');
    },

    initAuth: () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr && token !== 'null' && userStr !== 'null' && token !== 'undefined' && userStr !== 'undefined') {
            try {
                if (isTokenExpired(token)) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');

                    set({
                        token: null,
                        user: null,
                        isAuthenticated: false
                    });

                    return;
                }
                const user = JSON.parse(userStr);
                set({ token, user, isAuthenticated: true, isGuest: false });
            } catch (error) {
                console.error('Failed to parse user from localStorage:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
            return;
        }

        const guestUserStr = localStorage.getItem(GUEST_USER_KEY);
        const guestSessionId = localStorage.getItem(GUEST_SESSION_ID_KEY);
        const guestCreatedAt = localStorage.getItem(GUEST_CREATED_AT_KEY);

        if (guestUserStr && guestSessionId && guestUserStr !== 'null' && guestUserStr !== 'undefined') {
            try {
                if (guestCreatedAt) {
                    const createdAtMs = new Date(guestCreatedAt).getTime();
                    const sessionAge = Number.isFinite(createdAtMs) ? Date.now() - createdAtMs : Infinity;

                    if (sessionAge > GUEST_SESSION_MAX_AGE_MS) {
                        clearGuestStorage();
                        localStorage.removeItem(GUEST_INTENT_KEY);
                        try {
                            window.dispatchEvent(new CustomEvent('guest:session-expired'));
                        } catch {
                            // ignore
                        }
                        set({ user: null, token: null, isAuthenticated: false, isGuest: false });
                        return;
                    }
                } else {
                    clearGuestStorage();
                    set({ user: null, token: null, isAuthenticated: false, isGuest: false });
                    return;
                }

                const guestUser = JSON.parse(guestUserStr);
                set({ user: guestUser, token: null, isAuthenticated: false, isGuest: true });
                try {
                    window.dispatchEvent(new CustomEvent('guest:restored', { detail: { sessionId: guestSessionId } }));
                } catch {
                    // ignore
                }
            } catch (error) {
                console.error('Failed to parse guest user from localStorage:', error);
                clearGuestStorage();
                set({ user: null, token: null, isAuthenticated: false, isGuest: false });
            }
        } else {
            // No guest session and no auth token
            set({ user: null, token: null, isAuthenticated: false, isGuest: false });
        }
    },
}));

export default useAuthStore;
