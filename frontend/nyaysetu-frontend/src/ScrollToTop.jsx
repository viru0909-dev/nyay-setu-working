import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        // Safe check for browser environment
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return;
        }

        // 1. Handle standard top-of-page scrolling when no hash is present
        if (!hash) {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
            return;
        }

        // 2. Handle Hash-based Navigation
        // Convert '#my-id' to 'my-id' to safely look it up via getElementById.
        // This completely bypasses document.querySelector CSS selector parsing errors and build-time environment constraints.
        const targetId = hash.startsWith('#') ? hash.slice(1) : hash;

        const scrollToElement = (element) => {
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return true;
            }
            return false;
        };

        // Try to find the element immediately
        const immediateElement = document.getElementById(targetId);
        if (scrollToElement(immediateElement)) {
            return;
        }

        // 3. Fallback Observer: If the element isn't in the DOM yet due to client-side rendering delays
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver((_, obs) => {
                const currentElement = document.getElementById(targetId);
                if (currentElement) {
                    scrollToElement(currentElement);
                    obs.disconnect();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            return () => observer.disconnect();
        }
    }, [pathname, hash]);

    return null;
}