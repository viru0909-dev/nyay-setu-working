import { create } from 'zustand';

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

const persistAuth = ({ user, token, refreshToken }) => {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }

    if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    }

    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(USER_KEY);
    }
};

const useAuthStore = create((set) => ({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,

    setAuth: (user, token, refreshToken = null) => {
        persistAuth({ user, token, refreshToken });
        set({ user, token, refreshToken, isAuthenticated: true });
    },

    updateTokens: (token, refreshToken = null) => {
        const currentUser = useAuthStore.getState().user;
        persistAuth({ user: currentUser, token, refreshToken });
        set((state) => ({
            ...state,
            token,
            refreshToken,
            isAuthenticated: Boolean(token && currentUser),
        }));
    },

    logout: () => {
        persistAuth({ user: null, token: null, refreshToken: null });
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
    },

    initAuth: () => {
        const token = localStorage.getItem(TOKEN_KEY);
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const userStr = localStorage.getItem(USER_KEY);

        // Only parse if both exist and user is valid JSON
        if (token && userStr && token !== 'null' && userStr !== 'null' && token !== 'undefined' && userStr !== 'undefined') {
            try {
                const user = JSON.parse(userStr);
                set({ token, refreshToken, user, isAuthenticated: true });
            } catch (error) {
                console.error('Failed to parse user from localStorage:', error);
                // Clear invalid data
                persistAuth({ user: null, token: null, refreshToken: null });
            }
        }
    },
}));

export default useAuthStore;
