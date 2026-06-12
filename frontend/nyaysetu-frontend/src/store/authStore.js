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

const readJson = (storage, key, fallback) => {
    try {
        const raw = storage.getItem(key);
        if (!raw || raw === 'null' || raw === 'undefined') return fallback;
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
};

const writeJson = (storage, key, value) => {
    storage.setItem(key, JSON.stringify(value));
};

const clearGuestStorage = (storage) => {
    storage.removeItem(GUEST_USER_KEY);
    storage.removeItem(GUEST_SESSION_ID_KEY);
    storage.removeItem(GUEST_CREATED_AT_KEY);
    storage.removeItem(GUEST_MODAL_SHOWN_KEY);
    storage.removeItem(GUEST_PREFS_KEY);
    storage.removeItem(GUEST_ONBOARDING_KEY);
};

let storage = typeof window !== 'undefined' ? window.localStorage : {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
};

export const configureStorage = (customStorage) => {
    storage = customStorage;
};

export const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isGuest: false,

    setAuth: (user, token) => {
        storage.setItem('token', token);
        storage.setItem('user', JSON.stringify(user));
        clearGuestStorage(storage);
        storage.removeItem(GUEST_INTENT_KEY);
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

        storage.removeItem('token');
        storage.removeItem('user');
        storage.setItem(GUEST_SESSION_ID_KEY, sessionId);
        storage.setItem(GUEST_USER_KEY, JSON.stringify(guestUser));
        storage.setItem(GUEST_CREATED_AT_KEY, new Date().toISOString());
        storage.removeItem(GUEST_MODAL_SHOWN_KEY);

        if (!storage.getItem(GUEST_PREFS_KEY)) {
            writeJson(storage, GUEST_PREFS_KEY, { theme: null, language: null, visitedConstitution: false });
        }

        set({ user: guestUser, token: null, isAuthenticated: false, isGuest: true });
        try {
            window.dispatchEvent(new CustomEvent('guest:started', { detail: { sessionId } }));
        } catch {
            // Ignore environments without CustomEvent support
        }
    },

    logout: () => {
        storage.removeItem('token');
        storage.removeItem('user');
        clearGuestStorage(storage);
        storage.removeItem(GUEST_INTENT_KEY);
        set({ user: null, token: null, isAuthenticated: false, isGuest: false });
    },

    hasSeenGuestModal: () => storage.getItem(GUEST_MODAL_SHOWN_KEY) === 'true',

    markGuestModalShown: () => {
        storage.setItem(GUEST_MODAL_SHOWN_KEY, 'true');
    },

    clearGuestModalShown: () => {
        storage.removeItem(GUEST_MODAL_SHOWN_KEY);
    },

    setGuestIntent: (intent) => {
        if (!intent?.path) return;
        writeJson(storage, GUEST_INTENT_KEY, {
            path: intent.path,
            label: intent.label || null,
            feature: intent.feature || null,
            savedAt: new Date().toISOString(),
        });
    },

    getGuestIntent: () => readJson(storage, GUEST_INTENT_KEY, null),

    clearGuestIntent: () => {
        storage.removeItem(GUEST_INTENT_KEY);
    },

    getGuestPrefs: () => readJson(storage, GUEST_PREFS_KEY, {}),

    updateGuestPrefs: (patch) => {
        const next = { ...get().getGuestPrefs(), ...patch };
        writeJson(storage, GUEST_PREFS_KEY, next);
        return next;
    },

    hasDismissedOnboarding: () => storage.getItem(GUEST_ONBOARDING_KEY) === 'true',

    dismissOnboarding: () => {
        storage.setItem(GUEST_ONBOARDING_KEY, 'true');
    },

    initAuth: () => {
        const token = storage.getItem('token');
        const userStr = storage.getItem('user');

        if (token && userStr && token !== 'null' && userStr !== 'null' && token !== 'undefined' && userStr !== 'undefined') {
            try {
                if (isTokenExpired(token)) {
                    storage.removeItem('token');
                    storage.removeItem('user');

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
                storage.removeItem('token');
                storage.removeItem('user');
            }
            return;
        }

        const guestUserStr = storage.getItem(GUEST_USER_KEY);
        const guestSessionId = storage.getItem(GUEST_SESSION_ID_KEY);
        const guestCreatedAt = storage.getItem(GUEST_CREATED_AT_KEY);

        if (guestUserStr && guestSessionId && guestUserStr !== 'null' && guestUserStr !== 'undefined') {
            try {
                if (guestCreatedAt) {
                    const createdAtMs = new Date(guestCreatedAt).getTime();
                    const sessionAge = Number.isFinite(createdAtMs) ? Date.now() - createdAtMs : Infinity;

                    if (sessionAge > GUEST_SESSION_MAX_AGE_MS) {
                        clearGuestStorage(storage);
                        storage.removeItem(GUEST_INTENT_KEY);
                        try {
                            window.dispatchEvent(new CustomEvent('guest:session-expired'));
                        } catch {
                            // ignore
                        }
                        set({ user: null, token: null, isAuthenticated: false, isGuest: false });
                        return;
                    }
                } else {
                    clearGuestStorage(storage);
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
                clearGuestStorage(storage);
                set({ user: null, token: null, isAuthenticated: false, isGuest: false });
            }
        } else {
            // No guest session and no auth token
            set({ user: null, token: null, isAuthenticated: false, isGuest: false });
        }
    },
}));

export default useAuthStore;
