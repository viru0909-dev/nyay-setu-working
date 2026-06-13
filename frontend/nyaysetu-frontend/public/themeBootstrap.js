const STORAGE_KEY = 'nyaysetu_theme';

const getSystemTheme = () => {
    if (typeof window === 'undefined' || !window.matchMedia) {
        return 'light';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const preference = ['light', 'dark', 'system'].includes(stored) ? stored : 'system';
    const theme = preference === 'system' ? getSystemTheme() : preference;
    const root = document.documentElement;

    if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
    } else {
        root.removeAttribute('data-theme');
    }

    root.style.colorScheme = theme;
} catch {
    // Best-effort bootstrap only.
}
