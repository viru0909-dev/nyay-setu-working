import { describe, it, expect, beforeEach } from 'vitest';
import useAuthStore from './authStore';

describe('authStore', () => {

  beforeEach(() => {
    localStorage.clear();

    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  });

  it('should have default state', () => {
    const state = useAuthStore.getState();

    expect(state.user).toBe(null);
    expect(state.token).toBe(null);
    expect(state.refreshToken).toBe(null);
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set authentication correctly', () => {
    const user = { id: 1, name: 'Kriti' };
    const token = 'abc123';
    const refreshToken = 'refresh-123';

    useAuthStore.getState().setAuth(user, token, refreshToken);

    const state = useAuthStore.getState();

    expect(state.user).toEqual(user);
    expect(state.token).toBe(token);
    expect(state.refreshToken).toBe(refreshToken);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should update tokens without clearing the user', () => {
    const user = { id: 1, name: 'Kriti' };

    useAuthStore.getState().setAuth(user, 'old-token', 'old-refresh');
    useAuthStore.getState().updateTokens('new-token', 'new-refresh');

    const state = useAuthStore.getState();

    expect(state.user).toEqual(user);
    expect(state.token).toBe('new-token');
    expect(state.refreshToken).toBe('new-refresh');
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
    expect(state.refreshToken).toBe(null);
    expect(state.isAuthenticated).toBe(false);
  });

});
