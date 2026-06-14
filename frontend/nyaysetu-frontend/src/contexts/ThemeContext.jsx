// global theme context — handles light/dark mode for the whole app
// stores preference in localStorage, reads system pref on first visit

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'nyaysetu_theme';
const OVERLAY_Z_INDEX = '999999';

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return saved;
        // fallback to OS preference on first load
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    const isAnimating = useRef(false);

    // set data-theme on <html> so CSS variables switch automatically
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
        } else {
            root.removeAttribute('data-theme');
        }
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    // follow OS changes only if user hasn't picked manually
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e) => {
            if (!localStorage.getItem(STORAGE_KEY)) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const toggleTheme = (e) => {
        if (isAnimating.current) return;
        isAnimating.current = true;

        const isDark = theme === 'dark';
        const nextTheme = isDark ? 'light' : 'dark';
        
        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2;
        
        if (e && e.clientX !== undefined && e.clientY !== undefined) {
            x = e.clientX;
            y = e.clientY;
        }

        const color = nextTheme === 'dark' ? '#0C0E14' : '#F7F8FA';

        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = color;
        overlay.style.zIndex = OVERLAY_Z_INDEX;
        overlay.style.pointerEvents = 'none';
        
        // Calculate max radius needed to cover the screen
        const radius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
        document.body.appendChild(overlay);

        gsap.to(overlay, {
            duration: 0.6,
            clipPath: `circle(${radius}px at ${x}px ${y}px)`,
            ease: 'power2.inOut',
            onComplete: () => {
                setTheme(nextTheme);
                
                // Slight delay to ensure React commits the theme change
                setTimeout(() => {
                    gsap.to(overlay, {
                        opacity: 0,
                        duration: 0.4,
                        ease: 'power2.inOut',
                        onComplete: () => {
                            if (document.body.contains(overlay)) {
                                document.body.removeChild(overlay);
                            }
                            isAnimating.current = false;
                        }
                    });
                }, 50);
            }
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
