import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home, FileText, FolderOpen, Upload, Brain,
    Archive, Video, User, Users, Briefcase,
    Gavel, BarChart3, Settings, Menu, X,
    Scale, MessageSquare, Calendar, Bot
} from 'lucide-react';

const roleMenuItems = {
    CLIENT: [
        { icon: Home, label: 'Dashboard', path: '/client' },
        { icon: Bot, label: 'Vakil-Friend AI', path: '/client/vakil-friend' },
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
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved === 'true';
    });

    const location = useLocation();
    const menuItems = roleMenuItems[userRole] || roleMenuItems.CLIENT;

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
    }, [isCollapsed]);

    const sidebarWidth = isCollapsed ? '80px' : '280px';

    return (
        <aside
            className="sidebar"
            style={{
                width: sidebarWidth,
                minWidth: sidebarWidth,
                maxWidth: sidebarWidth,
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s, min-width 0.3s, max-width 0.3s',
                position: 'relative',
                zIndex: 100,
                flexShrink: 0
            }}
        >
            {/* Logo Section - Fixed at top */}
            <div style={{
                padding: '1.5rem',
                borderBottom: 'var(--border-glass)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexShrink: 0
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    minWidth: '40px',
                    background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Scale size={24} color="white" />
                </div>
                {!isCollapsed && (
                    <span style={{
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        color: 'var(--color-primary)',
                        whiteSpace: 'nowrap'
                    }}>
                        NyaySetu
                    </span>
                )}
            </div>

            {/* Navigation Menu - Scrollable */}
            <nav style={{
                flex: 1,
                padding: '1rem',
                overflowY: 'auto',
                overflowX: 'hidden'
            }}>
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
                                    ? 'var(--bg-glass-strong)'
                                    : 'transparent',
                                border: isActive
                                    ? 'var(--border-glass-strong)'
                                    : '1px solid transparent',
                                color: isActive ? 'var(--color-accent)' : 'var(--text-secondary)',
                                textDecoration: 'none',
                                fontSize: '0.95rem',
                                fontWeight: isActive ? '600' : '500',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseOver={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'var(--bg-glass-hover)';
                                    e.currentTarget.style.color = 'var(--text-main)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }
                            }}
                        >
                            <Icon size={20} style={{ flexShrink: 0, minWidth: '20px' }} />
                            {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse Button - Fixed at bottom */}
            <div style={{
                padding: '1rem',
                borderTop: 'var(--border-glass)',
                flexShrink: 0
            }}>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'var(--bg-glass-strong)',
                        border: 'var(--border-glass)',
                        borderRadius: '0.5rem',
                        color: 'var(--color-accent)',
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
                        e.currentTarget.style.background = 'var(--bg-glass-hover)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'var(--bg-glass-strong)';
                    }}
                >
                    {isCollapsed ? (
                        <Menu size={20} />
                    ) : (
                        <>
                            <X size={16} />
                            <span>Collapse Sidebar</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}
