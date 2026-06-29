import React from 'react';

/**
 * ScrollButtons Component - Hardened and realigned to satisfy rigid design constraints.
 * Purges foreign Tailwind utilities completely in favor of portable pure inline CSS.
 * Isolates the Scroll-to-Bottom node to avoid layout collisions with the pre-existing BackToTop module.
 */
export const ScrollButtons = () => {

  // Executes animated clean smooth transitions to the absolute bottom footer layer of the document
  const handleScrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  // Pure vanilla inline styling configurations to maintain absolute framework portability
  const containerStyle = {
    position: 'fixed',
    bottom: '95px', // Elevated higher to sit cleanly right above the existing BackToTop button layout
    right: '24px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    pointerEvents: 'auto',
  };

  const buttonStyle = {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    backgroundColor: '#1e293b',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease, background-color 0.2s ease',
    outline: 'none',
  };

  return (
    <div style={containerStyle}>
      {/* Scroll to Bottom Button Invariant - Portable, lightweight, accessibility helper node */}
      <button
        onClick={handleScrollToBottom}
        style={buttonStyle}
        title="Scroll to Bottom"
        aria-label="Scroll to Bottom"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#0f172a';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#1e293b';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
    </div>
  );
};

export default ScrollButtons;
