import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home, FileText, FolderOpen, Upload, Brain,
    Archive, Video, User, Users, Briefcase,
    Gavel, BarChart3, Settings, Menu, X,
    Scale, MessageSquare, Calendar, Bot, TrendingUp,
    WifiOff
} from 'lucide-react';

const roleMenuItems = {
    LITIGANT: [
        { icon: Home, label: 'Dashboard', path: '/litigant' },
        { icon: Bot, label: 'Vakil Friend AI', path: '/litigant/vakil-friend' },
        { icon: FileText, label: 'File Case / FIR', path: '/litigant/file' },
        { icon: FolderOpen, label: 'Case Diary', path: '/litigant/case-diary' },
        { icon: Video, label: 'Hearings', path: '/litigant/hearings' },
        { icon: MessageSquare, label: 'Lawyer Chat', path: '/litigant/chat' },
        { icon: User, label: 'Profile', path: '/litigant/profile' }
    ],
    LAWYER: [
        { icon: Home, label: 'Dashboard', path: '/lawyer' },
        { icon: Users, label: 'Litigant Directory', path: '/lawyer/clients' },
        { icon: Briefcase, label: 'Active Cases', path: '/lawyer/cases' },
        { icon: Brain, label: 'AI Legal Assistant', path: '/lawyer/ai-assistant' },
        { icon: Video, label: 'Hearings', path: '/lawyer/hearings' },
        { icon: BarChart3, label: 'Analytics', path: '/lawyer/analytics' },
        { icon: User, label: 'Profile', path: '/lawyer/profile' }
    ],
    JUDGE: [
        { icon: Home, label: 'Judicial Overview', path: '/judge' },
        { icon: Briefcase, label: 'My Docket', path: '/judge/docket' },
        { icon: FolderOpen, label: 'Unassigned Pool', path: '/judge/unassigned' },
        { icon: Video, label: 'Live Hearing', path: '/judge/live-hearing' },
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
    ],
    POLICE: [
        { icon: Home, label: 'Dashboard', path: '/police' },
        { icon: TrendingUp, label: 'Investigation Unit', path: '/police/investigations' },
        { icon: Upload, label: 'Upload FIR', path: '/police/upload' },
        { icon: FolderOpen, label: 'My FIRs', path: '/police/firs' },
        { icon: User, label: 'Profile', path: '/police/profile' }
    ]
};

export default function Sidebar({ userRole, isMobileOpen, onMobileClose }) {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved === 'true';
    });
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const location = useLocation();
    const menuItems = roleMenuItems[userRole] || roleMenuItems.LITIGANT;

    // Listen for window resize to detect mobile/desktop
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
    }, [isCollapsed]);

    // Close mobile sidebar on navigation
    useEffect(() => {
        if (isMobile && isMobileOpen) {
            onMobileClose?.();
        }
    }, [location.pathname]);

    const sidebarWidth = isCollapsed ? '80px' : '280px';

    // Mobile: hidden unless isMobileOpen, shown as overlay
    // Desktop: always visible
    const shouldShow = isMobile ? isMobileOpen : true;

    if (!shouldShow && isMobile) {
        return null;
    }

    return (
        <>
            {/* Mobile backdrop overlay */}
            {isMobile && isMobileOpen && (
                <div
                    onClick={onMobileClose}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 998,
                        backdropFilter: 'blur(4px)'
                    }}
                />
            )}

            <aside
                className="sidebar"
                style={{
                    width: isMobile ? '280px' : sidebarWidth,
                    minWidth: isMobile ? '280px' : sidebarWidth,
                    maxWidth: isMobile ? '280px' : sidebarWidth,
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: isMobile ? 'fixed' : 'relative',
                    top: 0,
                    left: 0,
                    zIndex: isMobile ? 999 : 100,
                    flexShrink: 0,
                    background: '#FFFFFF',
                    borderRight: '1px solid #E5E7EB',
                    transform: isMobile && !isMobileOpen ? 'translateX(-100%)' : 'translateX(0)',
                    boxShadow: isMobile ? '4px 0 24px rgba(0, 0, 0, 0.08)' : 'none'
                }}
            >
                {/* Logo Section */}
                <div style={{
                    padding: '2rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            minWidth: '40px',
                            background: 'linear-gradient(135deg, #3F5DCC 0%, #7C5CFF 100%)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(63, 93, 204, 0.2)'
                        }}>
                            <Scale size={24} color="white" />
                        </div>
                        {(!isCollapsed || isMobile) && (
                            <span style={{
                                fontSize: '1.4rem',
                                fontWeight: '800',
                                color: 'var(--color-primary)',
                                whiteSpace: 'nowrap',
                                letterSpacing: '-0.02em'
                            }}>
                                NyaySetu
                            </span>
                        )}
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav style={{
                    flex: 1,
                    padding: '0.75rem',
                    overflowY: 'auto'
                }}>
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={index}
                                to={item.path}
                                onClick={isMobile ? onMobileClose : undefined}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.875rem',
                                    padding: '0.875rem 1rem',
                                    marginBottom: '0.25rem',
                                    borderRadius: '0.75rem',
                                    background: isActive
                                        ? 'rgba(63, 93, 204, 0.06)'
                                        : 'transparent',
                                    color: isActive ? 'var(--color-secondary)' : '#64748B',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: isActive ? '700' : '600',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    border: '1px solid transparent',
                                    borderColor: isActive ? 'rgba(63, 93, 204, 0.1)' : 'transparent'
                                }}
                            >
                                <Icon size={20} style={{
                                    flexShrink: 0,
                                    minWidth: '20px',
                                    color: isActive ? 'var(--color-secondary)' : 'inherit'
                                }} />
                                {(!isCollapsed || isMobile) && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {!isMobile && (
                    <div style={{
                        padding: '1rem',
                        borderTop: '1px solid #E5E7EB',
                        flexShrink: 0
                    }}>
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#F8FAFC',
                                border: '1px solid #E5E7EB',
                                borderRadius: '0.5rem',
                                color: '#64748B',
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#F1F5F9';
                                e.currentTarget.style.color = 'var(--color-secondary)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = '#F8FAFC';
                                e.currentTarget.style.color = '#64748B';
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
                )}
            </aside>
        </>
    );
}
