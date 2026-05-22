import React from 'react';

const SessionWarningBanner = ({ onRefresh, onDismiss }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            backgroundColor: '#ffcc00',
            color: '#333',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 9999,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <div>
                <strong>Warning:</strong> Your session will expire in 5 minutes. Unsaved work may be lost.
            </div>
            <div>
                <button
                    onClick={onRefresh}
                    style={{ marginRight: '10px', padding: '6px 12px', cursor: 'pointer' }}
                >
                    Stay Logged In
                </button>
                <button
                    onClick={onDismiss}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default SessionWarningBanner;