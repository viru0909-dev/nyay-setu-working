import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        // If there is a hash, attempt to scroll to the element smoothly
        if (hash) {
            // Valid HTML5 ids cannot start with a number or contain certain characters without escaping, 
            // CSS.escape ensures querySelector doesn't crash on invalid selectors.
            try {
                const element = document.querySelector(CSS.escape(hash));
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    return;
                }
            } catch (error) {
                console.warn(`ScrollToTop: Invalid selector found for hash "${hash}"`, error);
            }

            // Fallback: If element isn't immediately found (e.g., due to mounting delays),
            // use MutationObserver to watch for it, avoiding fixed/arbitrary setTimeout delays.
            const observer = new MutationObserver((_, obs) => {
                try {
                    const element = document.querySelector(CSS.escape(hash));
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        obs.disconnect();
                    }
                } catch {
                    obs.disconnect();
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            // Cleanup observer on unmount or dependency change to prevent memory leaks
            return () => observer.disconnect();
        } else {
            // Fallback for standard route changes without a hash: scroll smoothly to the top
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        }
    }, [pathname, hash]);

    return null;
}