// global theme context — handles light/dark mode for the whole app
// stores the user's preference in localStorage and resolves "system" via OS settings

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'nyaysetu_theme';
const VALID_PREFERENCES = new Set(['light', 'dark', 'system']);

const getSystemTheme = () => {
    if (typeof window === 'undefined' || !window.matchMedia) {
        return 'light';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const normalizePreference = (value) => (VALID_PREFERENCES.has(value) ? value : 'system');

const resolveTheme = (preference, systemTheme) => (preference === 'system' ? systemTheme : preference);

const getStoredPreference = () => {
    try {
        return normalizePreference(localStorage.getItem(STORAGE_KEY));
    } catch {
        return 'system';
    }
};

export function ThemeProvider({ children }) {
    const [themePreference, setThemePreferenceState] = useState(getStoredPreference);
    const [systemTheme, setSystemTheme] = useState(getSystemTheme);
    const theme = resolveTheme(themePreference, systemTheme);

    const setThemePreference = useCallback((nextPreference) => {
        const normalized = normalizePreference(nextPreference);
        setThemePreferenceState(normalized);

        if (normalized === 'system') {
            setSystemTheme(getSystemTheme());
        }
    }, []);

    // set data-theme on <html> so CSS variables switch automatically
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
        } else {
            root.removeAttribute('data-theme');
        }
        root.style.colorScheme = theme;

        try {
            localStorage.setItem(STORAGE_KEY, themePreference);
        } catch {
            // ignore storage write failures
        }
    }, [theme, themePreference]);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) {
            return undefined;
        }

        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e) => {
            setSystemTheme(e.matches ? 'dark' : 'light');
        };

        setSystemTheme(mq.matches ? 'dark' : 'light');
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const toggleTheme = useCallback(() => setThemePreference(theme === 'dark' ? 'light' : 'dark'), [setThemePreference, theme]);

    const contextValue = useMemo(() => ({
        theme,
        themePreference,
        setThemePreference,
        toggleTheme,
    }), [theme, themePreference, setThemePreference, toggleTheme]);

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
}

// throws if used outside ThemeProvider — easier to catch mistakes early
export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
    return ctx;
}
