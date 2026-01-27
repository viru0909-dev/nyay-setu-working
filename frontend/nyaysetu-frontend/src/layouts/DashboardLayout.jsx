import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import AIBrainWidget from '../components/ai/AIBrainWidget';

export default function DashboardLayout() {
    const { user, token } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Pages where we want to hide the global AI brain widget to avoid clashes
    const hideAIBrainPaths = [
        '/client/vakil-friend',
        '/litigant/vakil-friend',
        '/lawyer/chat',
        '/lawyer/ai-assistant',
        '/ai-review'
    ];

    const searchParams = new URLSearchParams(location.search);
    const isChatTab = searchParams.get('tab') === 'chat' || searchParams.get('tab') === 'CHAT';

    // Check if we show hide based on path OR specific tab parameters
    const shouldHideBrain = hideAIBrainPaths.some(path => location.pathname.includes(path)) ||
        (location.pathname.includes('/lawyer/case/') && isChatTab);

    // Listen for window resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsMobileSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!token || !user) {
            navigate('/login');
        }
    }, [token, user, navigate]);

    const handleMobileMenuToggle = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    const handleMobileClose = () => {
        setIsMobileSidebarOpen(false);
    };

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            background: 'transparent', /* Allow body background to show */
            display: 'flex',
            gap: isMobile ? 0 : '1rem',
            overflow: 'hidden',
            position: 'fixed',
            top: 0,
            left: 0
        }}>


            {/* Sidebar - Fixed Height */}
            <Sidebar
                userRole={user?.role}
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={handleMobileClose}
            />

            {/* Main Content Area */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 1,
                width: '100%'
            }}>
                {/* Header - Fixed Height */}
                <DashboardHeader
                    user={user}
                    isMobile={isMobile}
                    onMobileMenuToggle={handleMobileMenuToggle}
                />

                {/* Scrollable Content Area */}
                <main style={{
                    flex: 1,
                    padding: isMobile ? '1rem' : '2rem',
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
