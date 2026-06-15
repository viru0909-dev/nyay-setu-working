import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Home, FileText, FolderOpen, Upload, Brain,
    Archive, Video, User, Users, Briefcase,
    Gavel, BarChart3, Settings, Menu, X,
    Scale, MessageSquare, Calendar, Bot, TrendingUp, Search,
    WifiOff, Sun, Moon
} from 'lucide-react';

import { useTheme } from '../contexts/ThemeContext';

const getRoleMenuItems = (t) => ({
    LITIGANT: [
        { icon: Home, label: t('dashboard:sidebar.litigant.dashboard'), path: '/litigant' },
        { icon: Bot, label: t('dashboard:sidebar.litigant.vakilFriendAI'), path: '/litigant/vakil-friend' },
        { icon: FileText, label: t('dashboard:sidebar.litigant.fileCaseFIR'), path: '/litigant/file' },
        { icon: FolderOpen, label: t('dashboard:sidebar.litigant.caseDiary'), path: '/litigant/case-diary' },
        { icon: Video, label: t('dashboard:sidebar.litigant.hearings'), path: '/litigant/hearings' },
        { icon: MessageSquare, label: t('dashboard:sidebar.litigant.lawyerChat'), path: '/litigant/chat' },
        { icon: FileText, label: t('dashboard:sidebar.litigant.generateDocument'), path: '/litigant/generate-document' },
        { icon: User, label: t('dashboard:sidebar.litigant.profile'), path: '/litigant/profile' }
    ],
    LAWYER: [
        { icon: Home, label: t('dashboard:sidebar.lawyer.dashboard'), path: '/lawyer' },
        { icon: Users, label: t('dashboard:sidebar.lawyer.litigantDirectory'), path: '/lawyer/clients' },
        { icon: Briefcase, label: t('dashboard:sidebar.lawyer.activeCases'), path: '/lawyer/cases' },
        { icon: Brain, label: t('dashboard:sidebar.lawyer.aiLegalAssistant'), path: '/lawyer/ai-assistant' },
        { icon: Video, label: t('dashboard:sidebar.lawyer.hearings'), path: '/lawyer/hearings' },
        { icon: BarChart3, label: t('dashboard:sidebar.lawyer.analytics'), path: '/lawyer/analytics' },
        { icon: User, label: t('dashboard:sidebar.lawyer.profile'), path: '/lawyer/profile' }
    ],
    JUDGE: [
        { icon: Home, label: t('dashboard:sidebar.judge.judicialOverview'), path: '/judge' },
        { icon: Briefcase, label: t('dashboard:sidebar.judge.myDocket'), path: '/judge/docket' },
        { icon: FolderOpen, label: t('dashboard:sidebar.judge.unassignedPool'), path: '/judge/unassigned' },
        { icon: Video, label: t('dashboard:sidebar.judge.liveHearing'), path: '/judge/live-hearing' },
        { icon: BarChart3, label: t('dashboard:sidebar.judge.courtAnalytics'), path: '/judge/analytics' },
        { icon: User, label: t('dashboard:sidebar.judge.profile'), path: '/judge/profile' }
    ],
    ADMIN: [
        { icon: Home, label: t('dashboard:sidebar.admin.dashboard'), path: '/admin' }
    ],
    TECH_ADMIN: [
        { icon: Home, label: t('dashboard:sidebar.techAdmin.dashboard'), path: '/tech-admin' },
        { icon: Brain, label: t('dashboard:sidebar.techAdmin.aiModels'), path: '/tech-admin/ai' },
        { icon: Video, label: t('dashboard:sidebar.techAdmin.videoSystem'), path: '/tech-admin/video' },
        { icon: BarChart3, label: t('dashboard:sidebar.techAdmin.logs'), path: '/tech-admin/logs' },
        { icon: Settings, label: t('dashboard:sidebar.techAdmin.configuration'), path: '/tech-admin/config' },
        { icon: User, label: t('dashboard:sidebar.techAdmin.profile'), path: '/tech-admin/profile' }
    ],
    POLICE: [
        { icon: Home, label: t('dashboard:sidebar.police.dashboard'), path: '/police' },
        { icon: TrendingUp, label: t('dashboard:sidebar.police.investigationUnit'), path: '/police/investigations' },
        { icon: Upload, label: t('dashboard:sidebar.police.uploadFIR'), path: '/police/upload' },
        { icon: FolderOpen, label: t('dashboard:sidebar.police.myFIRs'), path: '/police/firs' },
        { icon: User, label: t('dashboard:sidebar.police.profile'), path: '/police/profile' }
    ]
});

export default function Sidebar({ userRole, isMobileOpen, onMobileClose }) {
    const { t } = useTranslation('dashboard');
    const { theme, toggleTheme } = useTheme();
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved === 'true';
    });
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const location = useLocation();
    const roleMenuItems = getRoleMenuItems(t);
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
                    background: 'var(--bg-sidebar)',
                    borderRight: '1px solid var(--border-light)',
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
                            background: 'var(--color-primary)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(30, 42, 68, 0.2)'
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
                                        ? 'var(--bg-glass-hover)'
                                        : 'transparent',
                                    color: isActive ? 'var(--color-secondary)' : 'var(--text-secondary)',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: isActive ? '700' : '600',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    border: '1px solid transparent',
                                    borderColor: isActive ? 'var(--border-glass)' : 'transparent'
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
                        borderTop: '1px solid var(--border-light)',
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                    }}>
                        <button
                            onClick={toggleTheme}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-light)',
                                borderRadius: '0.5rem',
                                color: 'var(--text-secondary)',
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
                                e.currentTarget.style.background = 'var(--bg-hover)';
                                e.currentTarget.style.color = 'var(--color-secondary)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'var(--bg-surface)';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            {!isCollapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
                        </button>
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-light)',
                                borderRadius: '0.5rem',
                                color: 'var(--text-secondary)',
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
                                e.currentTarget.style.background = 'var(--bg-hover)';
                                e.currentTarget.style.color = 'var(--color-secondary)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'var(--bg-surface)';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                        >
                            {isCollapsed ? (
                                <Menu size={20} />
                            ) : (
                                <>
                                    <X size={16} />
                                    <span>{t('dashboard:sidebar.collapseSidebar')}</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
}
