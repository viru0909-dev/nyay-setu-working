import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) {
            try {
                // Safely escape the hash selector if CSS.escape exists, otherwise fallback to standard hash
                const safeHash = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(hash) : hash;
                const element = document.querySelector(safeHash);
                
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    return;
                }
            } catch (error) {
                console.warn(`ScrollToTop: Invalid selector found for hash "${hash}"`, error);
            }

            // Fallback: If element isn't immediately found due to component loading delays,
            // watch the DOM using a MutationObserver instead of a brittle setTimeout.
            const observer = new MutationObserver((_, obs) => {
                try {
                    const safeHash = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(hash) : hash;
                    const element = document.querySelector(safeHash);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        obs.disconnect();
                    }
                } catch {
                    obs.disconnect();
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            return () => observer.disconnect();
        } else {
            // Smooth scroll to top on normal route transitions
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        }
    }, [pathname, hash]);

    return null;
}