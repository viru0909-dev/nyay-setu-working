import { useState, useEffect } from 'react';

const ScrollProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percentage = totalHeight > 0 ? (scrollY / totalHeight) * 100 : 0;
      setProgress(percentage);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '3px',
        width: `${progress}%`,
        background: 'linear-gradient(to right, #8b5cf6, #6366f1)',
        zIndex: 9999,
        transition: 'width 0.1s ease',
        borderRadius: '0 2px 2px 0',
      }}
    />
  );
};

export default ScrollProgressBar;