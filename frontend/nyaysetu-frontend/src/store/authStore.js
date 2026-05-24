import { create } from 'zustand';
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
const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,

    setAuth: (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
    },

    initAuth: () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        // Only parse if both exist and user is valid JSON
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
                set({ token, user, isAuthenticated: true });
            } catch (error) {
                console.error('Failed to parse user from localStorage:', error);
                // Clear invalid data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
    },
}));

export default useAuthStore;
