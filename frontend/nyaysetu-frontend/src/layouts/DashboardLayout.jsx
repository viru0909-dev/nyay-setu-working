import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';

export default function DashboardLayout() {
    const { user, token } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token || !user) {
            navigate('/login');
        }
    }, [token, user, navigate]);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
            display: 'flex',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated Background Orbs */}
            <div style={{
                position: 'absolute',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
                top: '-200px',
                right: '-200px',
                borderRadius: '50%',
                animation: 'pulse 8s ease-in-out infinite',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
                bottom: '-150px',
                left: '-150px',
                borderRadius: '50%',
                animation: 'pulse 6s ease-in-out infinite',
                pointerEvents: 'none'
            }} />

            {/* Sidebar */}
            <Sidebar userRole={user?.role} />

            {/* Main Content */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Header */}
                <DashboardHeader user={user} />

                {/* Content Area */}
                <main style={{
                    flex: 1,
                    padding: '2rem',
                    overflowY: 'auto'
                }}>
                    <Outlet />
                </main>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
