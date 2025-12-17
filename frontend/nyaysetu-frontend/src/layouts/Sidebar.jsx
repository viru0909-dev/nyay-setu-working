import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home, FileText, FolderOpen, Upload, Brain,
    Archive, Video, User, Users, Briefcase,
    Gavel, BarChart3, Settings, Menu, X,
    Scale, MessageSquare, Calendar
} from 'lucide-react';

const roleMenuItems = {
    CLIENT: [
        { icon: Home, label: 'Dashboard', path: '/client' },
        { icon: FileText, label: 'File New Case', path: '/client/file-case' },
        { icon: FolderOpen, label: 'My Cases', path: '/client/cases' },
        { icon: Upload, label: 'Documents', path: '/client/documents' },
        { icon: Brain, label: 'AI Document Review', path: '/client/ai-review' },
        { icon: Archive, label: 'Evidence Manager', path: '/client/evidence' },
        { icon: Video, label: 'Hearings', path: '/client/hearings' },
        { icon: User, label: 'Profile', path: '/client/profile' }
    ],
    LAWYER: [
        { icon: Home, label: 'Dashboard', path: '/lawyer' },
        { icon: Users, label: 'My Clients', path: '/lawyer/clients' },
        { icon: Briefcase, label: 'Active Cases', path: '/lawyer/cases' },
        { icon: FileText, label: 'Case Preparation', path: '/lawyer/preparation' },
        { icon: Archive, label: 'Evidence Vault', path: '/lawyer/evidence' },
        { icon: Brain, label: 'AI Legal Assistant', path: '/lawyer/ai-assistant' },
        { icon: Video, label: 'Hearings', path: '/lawyer/hearings' },
        { icon: BarChart3, label: 'Analytics', path: '/lawyer/analytics' },
        { icon: MessageSquare, label: 'Client Chat', path: '/lawyer/chat' },
        { icon: User, label: 'Profile', path: '/lawyer/profile' }
    ],
    JUDGE: [
        { icon: Home, label: 'Dashboard', path: '/judge' },
        { icon: FolderOpen, label: 'Pending Cases', path: '/judge/pending' },
        { icon: Brain, label: 'AI Case Summary', path: '/judge/ai-summary' },
        { icon: Calendar, label: 'Assign Hearings', path: '/judge/assign' },
        { icon: Video, label: 'Conduct Hearing', path: '/judge/conduct' },
        { icon: Archive, label: 'Evidence Review', path: '/judge/evidence' },
        { icon: FileText, label: 'Draft Orders', path: '/judge/orders' },
        { icon: BarChart3, label: 'Court Analytics', path: '/judge/analytics' },
        { icon: User, label: 'Profile', path: '/judge/profile' }
    ],
    ADMIN: [
        { icon: Home, label: 'Dashboard', path: '/admin' },
        { icon: Users, label: 'User Management', path: '/admin/users' },
        { icon: Scale, label: 'Case Management', path: '/admin/cases' },
        { icon: Gavel, label: 'Judge Assignment', path: '/admin/judges' },
        { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
        { icon: User, label: 'Profile', path: '/admin/profile' }
    ],
    TECH_ADMIN: [
        { icon: Home, label: 'Dashboard', path: '/tech-admin' },
        { icon: Brain, label: 'AI Models', path: '/tech-admin/ai' },
        { icon: Video, label: 'Video System', path: '/tech-admin/video' },
        { icon: BarChart3, label: 'Logs', path: '/tech-admin/logs' },
        { icon: Settings, label: 'Configuration', path: '/tech-admin/config' },
        { icon: User, label: 'Profile', path: '/tech-admin/profile' }
    ]
};

export default function Sidebar({ userRole }) {
    // Initialize from localStorage with fallback to false
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved === 'true';
    });

    const location = useLocation();
    const menuItems = roleMenuItems[userRole] || roleMenuItems.CLIENT;

    // Persist collapse state to localStorage
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
    }, [isCollapsed]);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                style={{
                    position: 'fixed',
                    top: '1.5rem',
                    left: '1rem',
                    zIndex: 1000,
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '0.5rem',
                    padding: '0.5rem',
                    color: '#8b5cf6',
                    cursor: 'pointer',
                    display: 'none'
                }}
                className="mobile-menu-btn"
            >
                {isCollapsed ? <Menu size={24} /> : <X size={24} />}
            </button>

            {/* Sidebar */}
            <aside style={{
                width: isCollapsed ? '80px' : '280px',
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(139, 92, 246, 0.2)',
                padding: '2rem 0',
                transition: 'width 0.3s',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                zIndex: 10,
                overflowY: 'auto',
                overflowX: 'hidden'
            }}>
                {/* Logo */}
                <div style={{
                    padding: '0 1.5rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <Scale size={24} color="white" />
                    </div>
                    {!isCollapsed && (
                        <span style={{
                            fontSize: '1.5rem',
                            fontWeight: '800',
                            background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            NyaySetu
                        </span>
                    )}
                </div>

                {/* Menu Items */}
                <nav style={{ flex: 1, padding: '0 1rem' }}>
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={index}
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.875rem 1rem',
                                    marginBottom: '0.5rem',
                                    borderRadius: '0.75rem',
                                    background: isActive
                                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)'
                                        : 'transparent',
                                    border: isActive
                                        ? '1px solid rgba(139, 92, 246, 0.4)'
                                        : '1px solid transparent',
                                    color: isActive ? '#a78bfa' : '#94a3b8',
                                    textDecoration: 'none',
                                    fontSize: '0.95rem',
                                    fontWeight: isActive ? '600' : '500',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}
                                onMouseOver={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                        e.currentTarget.style.color = '#c4b5fd';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#94a3b8';
                                    }
                                }}
                            >
                                <Icon size={20} style={{ flexShrink: 0 }} />
                                {!isCollapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Collapse/Expand Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    style={{
                        margin: '0 1rem',
                        padding: isCollapsed ? '0.75rem' : '0.75rem',
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '0.5rem',
                        color: '#8b5cf6',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                    }}
                    title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                >
                    {isCollapsed ? (
                        <>
                            <Menu size={20} />
                        </>
                    ) : (
                        <>
                            <X size={16} />
                            <span>Collapse Sidebar</span>
                        </>
                    )}
                </button>
            </aside>

            <style>{`
                @media (max-width: 768px) {
                    .mobile-menu-btn {
                        display: block !important;
                    }
                }
            `}</style>
        </>
    );
}
