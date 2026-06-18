import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollProgressBar = () => {
    const [scrollProgress, setScrollProgress] = useState(0);
    const location = useLocation();

    useEffect(() => {
        let ticking = false;

        const updateScrollProgress = () => {
            const totalScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            
            // Handle edge-case where page content fits entirely within view heights
            if (totalScroll <= 0) {
                setScrollProgress(0);
                ticking = false;
                return;
            }

            const currentScroll = window.scrollY;
            const percentage = (currentScroll / totalScroll) * 100;
            
            // Keep value safely clamped between 0 and 100
            setScrollProgress(Math.min(Math.max(percentage, 0), 100));
            ticking = false;
        };

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateScrollProgress);
                ticking = true;
            }
        };

        // Passive configuration prevents scroll-blocking lag on mobile browsers
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Execute initial computation on page mount / route transformation
        updateScrollProgress();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [location]); 

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                width: `${scrollProgress}%`,
                backgroundColor: '#2563eb', // Clean production primary blue
                zIndex: 99999,              // Mounts directly above absolute headers, modals, and toasts
                transition: 'width 0.1s ease-out',
                pointerEvents: 'none'       // Guarantees zero element click obstructions
            }}
            aria-hidden="true"
        />
    );
};

export default ScrollProgressBar;