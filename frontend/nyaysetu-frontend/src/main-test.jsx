import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';

// Minimal test - bypass all routing
function TestApp() {
    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1 style={{ color: 'var(--color-royal-blue)' }}>✅ Frontend Working!</h1>
            <p>If you see this, React is loaded correctly.</p>
            <a href="/login" style={{ color: 'var(--color-indigo)', textDecoration: 'underline' }}>
                Go to Login
            </a>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <TestApp />
    </React.StrictMode>,
);
