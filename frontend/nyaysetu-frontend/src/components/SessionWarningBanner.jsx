import React from 'react';

const SessionWarningBanner = ({ onRefresh, onDismiss, refreshing = false, errorMessage = '' }) => {
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
                {errorMessage && (
                    <div style={{ marginTop: '6px', fontSize: '14px', color: '#8a1c1c' }}>
                        {errorMessage}
                    </div>
                )}
            </div>
            <div>
                <button
                    onClick={onRefresh}
                    disabled={refreshing}
                    style={{ marginRight: '10px', padding: '6px 12px', cursor: refreshing ? 'not-allowed' : 'pointer' }}
                >
                    {refreshing ? 'Refreshing...' : 'Stay Logged In'}
                </button>
                <button
                    onClick={onDismiss}
                    disabled={refreshing}
                    style={{ background: 'transparent', border: 'none', cursor: refreshing ? 'not-allowed' : 'pointer', fontSize: '16px' }}
                >
                    x
                </button>
            </div>
        </div>
    );
};

export default SessionWarningBanner;
