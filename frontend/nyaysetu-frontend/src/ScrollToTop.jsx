import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname, hash } = useLocation();
    useEffect(() => {
        if (hash) {
            setTimeout(() => {
            const element = document.querySelector(hash);
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                });
            }
        }, 300);
        } else {
            window.scrollTo(0, 0);
        }
    }, [pathname, hash]);
    return null;
}