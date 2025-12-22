import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import AIBrainWidget from '../components/ai/AIBrainWidget';

export default function DashboardLayout() {
    const { user, token } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    // Pages where we want to hide the global AI brain widget to avoid clashes
    const hideAIBrainPaths = [
        '/client/vakil-friend',
        '/lawyer/chat',
        '/lawyer/ai-assistant',
        '/ai-review'
    ];

    const shouldHideBrain = hideAIBrainPaths.some(path => location.pathname.includes(path));

    useEffect(() => {
        if (!token || !user) {
            navigate('/login');
        }
    }, [token, user, navigate]);

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
            display: 'flex',
            overflow: 'hidden',
            position: 'fixed',
            top: 0,
            left: 0
        }}>
            {/* Background Orbs */}
            <div style={{
                position: 'absolute',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
                top: '-200px',
                right: '-200px',
                borderRadius: '50%',
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
                pointerEvents: 'none'
            }} />

            {/* Sidebar - Fixed Height */}
            <Sidebar userRole={user?.role} />

            {/* Main Content Area */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Header - Fixed Height */}
                <DashboardHeader user={user} />

                {/* Scrollable Content Area */}
                <main style={{
                    flex: 1,
                    padding: '2rem',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }}>
                    <Outlet />
                </main>

                {/* Global AI Brain Assistant - Hidden on chat pages to avoid UI clashes */}
                {!shouldHideBrain && <AIBrainWidget user={user} />}
            </div>
        </div>
    );
}
