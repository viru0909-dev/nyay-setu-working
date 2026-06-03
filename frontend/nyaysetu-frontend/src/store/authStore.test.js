import { describe, it, expect, beforeEach } from 'vitest';
import useAuthStore from './authStore';

describe('authStore', () => {

  beforeEach(() => {
    localStorage.clear();

    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isGuest: false,
    });
  });

  it('should have default state', () => {
    const state = useAuthStore.getState();

    expect(state.user).toBe(null);
    expect(state.token).toBe(null);
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set authentication correctly', () => {
    const user = { id: 1, name: 'Kriti' };
    const token = 'abc123';

    useAuthStore.getState().setAuth(user, token);

    const state = useAuthStore.getState();

    expect(state.user).toEqual(user);
    expect(state.token).toBe(token);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should logout correctly', () => {
    const user = { id: 1, name: 'Kriti' };
    const token = 'abc123';

    useAuthStore.getState().setAuth(user, token);
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();

    expect(state.user).toBe(null);
    expect(state.token).toBe(null);
    expect(state.isAuthenticated).toBe(false);
  });

  describe('Guest Mode functionality', () => {
    it('should set guest state correctly', () => {
      useAuthStore.getState().setGuest();
      const state = useAuthStore.getState();

      expect(state.isGuest).toBe(true);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).not.toBeNull();
      expect(state.user.role).toBe('GUEST');
      expect(state.user.isGuest).toBe(true);
      expect(state.token).toBeNull();

      expect(localStorage.getItem('guest_session_id')).toBe(state.user.sessionId);
    });

    it('should clear guest session on logout', () => {
      useAuthStore.getState().setGuest();
      useAuthStore.getState().logout();
      const state = useAuthStore.getState();

      expect(state.isGuest).toBe(false);
      expect(state.user).toBeNull();
      expect(localStorage.getItem('guest_session_id')).toBeNull();
    });

    it('should clear guest session when setting auth', () => {
      useAuthStore.getState().setGuest();
      useAuthStore.getState().setAuth({ id: 1, name: 'User' }, 'dummy-token');
      const state = useAuthStore.getState();

      expect(state.isGuest).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.token).toBe('dummy-token');
      expect(localStorage.getItem('guest_session_id')).toBeNull();
    });

    it('should initialize with active guest session if present in localStorage', () => {
      const sessionId = 'guest_123';
      const guestUser = { id: sessionId, name: 'Guest', role: 'GUEST', isGuest: true, sessionId };
      localStorage.setItem('guest_session_id', sessionId);
      localStorage.setItem('guest_user', JSON.stringify(guestUser));
      localStorage.setItem('guest_created_at', new Date().toISOString());

      useAuthStore.getState().initAuth();
      const state = useAuthStore.getState();

      expect(state.isGuest).toBe(true);
      expect(state.user.sessionId).toBe(sessionId);
    });

    it('should expire guest session if session age exceeds GUEST_SESSION_MAX_AGE_MS', () => {
      const sessionId = 'guest_123';
      const guestUser = { id: sessionId, name: 'Guest', role: 'GUEST', isGuest: true, sessionId };
      localStorage.setItem('guest_session_id', sessionId);
      localStorage.setItem('guest_user', JSON.stringify(guestUser));
      
      // Set created_at to 10 days ago (expired)
      const tenDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString();
      localStorage.setItem('guest_created_at', tenDaysAgo);

      useAuthStore.getState().initAuth();
      const state = useAuthStore.getState();

      expect(state.isGuest).toBe(false);
      expect(state.user).toBeNull();
      expect(localStorage.getItem('guest_session_id')).toBeNull();
    });
  });

});