import { describe, it, expect, beforeEach } from 'vitest';
import useAuthStore, { configureStorage } from './authStore';

const createMemoryStorage = () => {
    const store = {};
    return {
        getItem: (key) => store[key] ?? null,
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        get length() { return Object.keys(store).length; },
        key: (index) => Object.keys(store)[index] ?? null,
        clear: () => { for (const k of Object.keys(store)) delete store[k]; },
    };
};

describe('authStore', () => {
    let storage;
    let ls;

    beforeEach(() => {
        storage = createMemoryStorage();
        configureStorage(storage);
        ls = storage;

        useAuthStore.setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isGuest: false,
        });
    });

    describe('setAuth (login)', () => {
        it('should set authenticated state and persist user/token to localStorage', () => {
            const user = { id: 1, name: 'Kriti', email: 'kriti@example.com' };
            const token = 'valid-token';
            const refreshToken = 'refresh-123';

            useAuthStore.getState().setAuth(user, token, refreshToken);

            const state = useAuthStore.getState();

            expect(state.user).toEqual(user);
            expect(state.token).toBe(token);
            expect(state.isAuthenticated).toBe(true);
            expect(state.isGuest).toBe(false);

            expect(ls.getItem('token')).toBe(token);
            expect(ls.getItem('user')).toBe(JSON.stringify(user));
            expect(ls.getItem('refreshToken')).toBe(refreshToken);
        });

        it('should clear guest storage when logging in as authenticated user', () => {
            useAuthStore.getState().setGuest();
            expect(useAuthStore.getState().isGuest).toBe(true);

            const user = { id: 1, name: 'Kriti' };
            const token = 'valid-token';
            const refreshToken = 'refresh-456';
            useAuthStore.getState().setAuth(user, token, refreshToken);

            const state = useAuthStore.getState();

            expect(state.isGuest).toBe(false);
            expect(state.isAuthenticated).toBe(true);

            expect(ls.getItem('guest_session_id')).toBeNull();
            expect(ls.getItem('guest_user')).toBeNull();
            expect(ls.getItem('guest_created_at')).toBeNull();
            expect(ls.getItem('guest_post_auth_intent')).toBeNull();
        });
    });

    describe('logout', () => {
        it('should clear all state and localStorage', () => {
            const user = { id: 1, name: 'Kriti' };
            const token = 'valid-token';
            const refreshToken = 'refresh-789';

            useAuthStore.getState().setAuth(user, token, refreshToken);
            useAuthStore.getState().logout();

            const state = useAuthStore.getState();

            expect(state.user).toBe(null);
            expect(state.token).toBe(null);
            expect(state.isAuthenticated).toBe(false);
            expect(state.isGuest).toBe(false);

            expect(ls.getItem('token')).toBeNull();
            expect(ls.getItem('user')).toBeNull();
            expect(ls.getItem('refreshToken')).toBeNull();
        });

        it('should clear guest storage when logging out', () => {
            // Simulate an authenticated user and refresh token, then switch to guest
            const user = { id: 1, name: 'Kriti' };
            const token = 'valid-token';
            const refreshToken = 'refresh-guest-1';

            ls.setItem('token', token);
            ls.setItem('user', JSON.stringify(user));
            ls.setItem('refreshToken', refreshToken);

            useAuthStore.getState().setGuest();

            // Auth items should be cleared when a guest session is created
            expect(ls.getItem('token')).toBeNull();
            expect(ls.getItem('user')).toBeNull();
            expect(ls.getItem('refreshToken')).toBeNull();

            // Guest storage remains
            expect(ls.getItem('guest_session_id')).not.toBeNull();
            expect(ls.getItem('guest_user')).not.toBeNull();
            expect(ls.getItem('guest_created_at')).not.toBeNull();

            // Now call logout to ensure logout still clears guest storage
            ls.setItem('guest_modal_shown', 'true');
            ls.setItem('guest_post_auth_intent', JSON.stringify({ path: '/file-case' }));

            useAuthStore.getState().logout();

            const state = useAuthStore.getState();

            expect(state.isGuest).toBe(false);
            expect(state.user).toBe(null);
            expect(state.token).toBe(null);

            expect(ls.getItem('guest_session_id')).toBeNull();
            expect(ls.getItem('guest_user')).toBeNull();
            expect(ls.getItem('guest_created_at')).toBeNull();
            expect(ls.getItem('guest_modal_shown')).toBeNull();
            expect(ls.getItem('guest_post_auth_intent')).toBeNull();
        });
    });

    describe('setGuestIntent', () => {
        it('should not save intent if path is missing', () => {
            useAuthStore.getState().setGuestIntent({});
            useAuthStore.getState().setGuestIntent(null);

            expect(ls.getItem('guest_post_auth_intent')).toBeNull();
        });

        it('should save guest intent to localStorage with defaults', () => {
            useAuthStore.getState().setGuestIntent({ path: '/file-case', label: 'File a Case' });

            const raw = ls.getItem('guest_post_auth_intent');
            expect(raw).not.toBeNull();

            const stored = JSON.parse(raw);
            expect(stored.path).toBe('/file-case');
            expect(stored.label).toBe('File a Case');
            expect(stored.feature).toBeNull();
            expect(typeof stored.savedAt).toBe('string');
        });

        it('should clear existing intent when new intent is set', () => {
            ls.setItem('guest_post_auth_intent', JSON.stringify({ path: '/old-path', savedAt: new Date().toISOString() }));

            useAuthStore.getState().setGuestIntent({ path: '/new-path', label: 'New Label' });

            const stored = JSON.parse(ls.getItem('guest_post_auth_intent'));
            expect(stored.path).toBe('/new-path');
            expect(stored.label).toBe('New Label');
        });

        it('should not mutate application state', () => {
            const user = { id: 1, name: 'Kriti' };
            const token = 'valid-token';
            const refreshToken = 'refresh-000';

            useAuthStore.getState().setAuth(user, token, refreshToken);

            const prevUser = useAuthStore.getState().user;
            const prevToken = useAuthStore.getState().token;
            const prevIsAuthenticated = useAuthStore.getState().isAuthenticated;

            useAuthStore.getState().setGuestIntent({ path: '/file-case' });

            const state = useAuthStore.getState();

            expect(state.user).toBe(prevUser);
            expect(state.token).toBe(prevToken);
            expect(state.isAuthenticated).toBe(prevIsAuthenticated);
        });
    });
});
