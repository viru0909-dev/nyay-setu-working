// redesigned header — dark mode toggle, portal dropdown, sticky scroll, mobile drawer
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scale, Menu, X, Globe, Sun, Moon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import AIAssistantModal from './AIAssistantModal';

// role links for the portal dropdown
const ROLES = [
    { id: 'litigant', label: 'Litigant', href: '/litigant' },
    { id: 'lawyer',   label: 'Lawyer',   href: '/lawyer' },
    { id: 'judge',    label: 'Judge',    href: '/judge' },
];

export default function Header({ hideAuthButtons = false }) {
    const [isScrolled, setIsScrolled]            = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showAIModal, setShowAIModal]            = useState(false);
    const [roleOpen, setRoleOpen]                  = useState(false);
    const { theme, toggleTheme }                   = useTheme();
    const { t, i18n }                              = useTranslation('common');
    const location                                 = useLocation();

    // add shadow to nav after scrolling 50px
    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close role dropdown on outside click
    useEffect(() => {
        if (!roleOpen) return;
        const close = (e) => {
            if (!e.target.closest('#role-selector')) setRoleOpen(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [roleOpen]);

    const navItems = [
        { labelKey: 'header.nav.home',        href: '/',            isRoute: true },
        { labelKey: 'header.nav.features',    href: '#features' },
        { labelKey: 'header.nav.constitution',href: '/constitution', isRoute: true },
        { labelKey: 'header.nav.aiAssistant', action: () => setShowAIModal(true) },
        { labelKey: 'header.nav.about',       href: '/about',       isRoute: true },
    ];

    const isDark = theme === 'dark';

    const navLinkStyle = (href) => ({
        color: location.pathname === href ? 'var(--color-primary)' : 'var(--text-secondary)',
        textDecoration: 'none',
        fontSize: '0.925rem',
        fontWeight: location.pathname === href ? '600' : '500',
        cursor: 'pointer',
        padding: '0.25rem 0',
        borderBottom: location.pathname === href
            ? '2px solid var(--color-primary)'
            : '2px solid transparent',
        transition: 'color 0.2s ease, border-color 0.2s ease',
        background: 'none',
        border: 'none',
        fontFamily: 'inherit',
    });

    const renderNavItem = (item) => {
        const baseStyle = navLinkStyle(item.href);
        if (item.action) {
            return (
                <button
                    key={item.labelKey}
                    onClick={item.action}
                    style={baseStyle}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                    {t(item.labelKey)}
                </button>
            );
        }
        if (item.isRoute) {
            return (
                <Link
                    key={item.labelKey}
                    to={item.href}
                    style={baseStyle}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = location.pathname === item.href ? 'var(--color-primary)' : 'var(--text-secondary)'}
                >
                    {t(item.labelKey)}
                </Link>
            );
        }
        return (
            <a
                key={item.labelKey}
                href={item.href}
                style={baseStyle}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
                {t(item.labelKey)}
            </a>
        );
    };

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0,
                    zIndex: 1000,
                    background: 'var(--bg-nav)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderBottom: '1px solid var(--border-light)',
                    boxShadow: isScrolled ? 'var(--shadow-nav)' : 'none',
                    transition: 'box-shadow 0.3s ease, background 0.25s ease',
                }}
            >
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: '0.7rem 2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                }}>
                    {/* Logo */}
                    <Link to="/" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        textDecoration: 'none',
                        flexShrink: 0,
                    }}>
                        <motion.div
                            whileHover={{ rotate: 12 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            style={{
                                background: 'var(--color-primary)',
                                borderRadius: '10px',
                                padding: '0.45rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Scale size={22} color="white" />
                        </motion.div>
                        <span style={{
                            fontSize: '1.2rem',
                            fontWeight: '800',
                            letterSpacing: '-0.03em',
                            color: 'var(--text-main)',
                            fontFamily: 'var(--font-heading)',
                        }}>
                            NyaySetu
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav
                        className="desktop-nav"
                        style={{ display: 'flex', gap: '2rem', alignItems: 'center', flex: 1, justifyContent: 'center' }}
                    >
                        {navItems.map(renderNavItem)}
                    </nav>

                    {/* Right Controls */}
                    <div className="desktop-cta" style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexShrink: 0 }}>
                        {/* Role Selector */}
                        <div id="role-selector" style={{ position: 'relative' }}>
                            <button
                                onClick={() => setRoleOpen(o => !o)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    padding: '0.5rem 0.9rem',
                                    background: 'transparent',
                                    border: '1px solid var(--border-medium)',
                                    borderRadius: '8px',
                                    color: 'var(--text-main)',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-medium)'; }}
                            >
                                Portal
                                <ChevronDown size={14} style={{ transform: roleOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                            </button>

                            <AnimatePresence>
                                {roleOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                                        transition={{ duration: 0.15 }}
                                        style={{
                                            position: 'absolute',
                                            top: 'calc(100% + 8px)',
                                            right: 0,
                                            background: 'var(--bg-surface)',
                                            border: '1px solid var(--border-light)',
                                            borderRadius: '10px',
                                            boxShadow: 'var(--shadow-hover)',
                                            minWidth: '150px',
                                            overflow: 'hidden',
                                            zIndex: 100,
                                        }}
                                    >
                                        {ROLES.map(role => (
                                            <Link
                                                key={role.id}
                                                to={role.href}
                                                onClick={() => setRoleOpen(false)}
                                                style={{
                                                    display: 'block',
                                                    padding: '0.65rem 1rem',
                                                    color: 'var(--text-main)',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '500',
                                                    textDecoration: 'none',
                                                    transition: 'background 0.15s ease',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                {role.label}
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Language Toggle */}
                        <button
                            onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.5rem 0.8rem',
                                background: 'transparent',
                                border: '1px solid var(--border-medium)',
                                borderRadius: '8px',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.8rem',
                                fontFamily: 'inherit',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-medium)'; }}
                        >
                            <Globe size={14} />
                            {i18n.language === 'en' ? 'हिंदी' : 'EN'}
                        </button>

                        {/* Dark Mode Toggle */}
                        <motion.button
                            className="theme-toggle"
                            onClick={toggleTheme}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.92 }}
                            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                            title={isDark ? 'Light mode' : 'Dark mode'}
                        >
                            <AnimatePresence mode="wait">
                                {isDark ? (
                                    <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                                        <Sun size={16} />
                                    </motion.span>
                                ) : (
                                    <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                                        <Moon size={16} />
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>

                        {!hideAuthButtons && (
                            <>
                                <Link
                                    to="/login"
                                    style={{
                                        padding: '0.55rem 1.1rem',
                                        color: 'var(--text-main)',
                                        border: '1px solid var(--border-medium)',
                                        background: 'transparent',
                                        textDecoration: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        fontSize: '0.875rem',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-medium)'; }}
                                >
                                    {t('header.cta.login')}
                                </Link>
                                <Link
                                    to="/signup"
                                    style={{
                                        padding: '0.55rem 1.25rem',
                                        background: 'var(--color-primary)',
                                        color: '#FFFFFF',
                                        textDecoration: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        fontSize: '0.875rem',
                                        transition: 'all 0.2s ease',
                                        boxShadow: 'var(--shadow-sm)',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    {t('header.cta.getStarted')}
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setIsMobileMenuOpen(o => !o)}
                        className="mobile-menu-btn"
                        style={{
                            display: 'none',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-main)',
                            cursor: 'pointer',
                            padding: '0.4rem',
                        }}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Drawer */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{
                                background: 'var(--bg-surface)',
                                borderTop: '1px solid var(--border-light)',
                                padding: '1.25rem 1.5rem',
                                boxShadow: 'var(--shadow-glass)',
                            }}
                        >
                            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
                                {navItems.map(item => {
                                    const sharedStyle = {
                                        display: 'block',
                                        padding: '0.75rem 0.5rem',
                                        color: 'var(--text-main)',
                                        textDecoration: 'none',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        background: 'none',
                                        borderTop: 'none',
                                        borderLeft: 'none',
                                        borderRight: 'none',
                                        borderBottom: '1px solid var(--border-light)',
                                        width: '100%',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                    };
                                    if (item.action) {
                                        return (
                                            <button key={item.labelKey} onClick={() => { item.action(); setIsMobileMenuOpen(false); }} style={sharedStyle}>
                                                {t(item.labelKey)}
                                            </button>
                                        );
                                    }
                                    if (item.isRoute) {
                                        return (
                                            <Link key={item.labelKey} to={item.href} onClick={() => setIsMobileMenuOpen(false)} style={sharedStyle}>
                                                {t(item.labelKey)}
                                            </Link>
                                        );
                                    }
                                    return (
                                        <a key={item.labelKey} href={item.href} onClick={() => setIsMobileMenuOpen(false)} style={sharedStyle}>
                                            {t(item.labelKey)}
                                        </a>
                                    );
                                })}
                            </nav>

                            {/* Role links mobile */}
                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.5rem' }}>
                                    Portal Access
                                </p>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {ROLES.map(role => (
                                        <Link
                                            key={role.id}
                                            to={role.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            style={{
                                                padding: '0.4rem 0.9rem',
                                                border: '1px solid var(--border-medium)',
                                                borderRadius: '6px',
                                                color: 'var(--text-main)',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                textDecoration: 'none',
                                            }}
                                        >
                                            {role.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <button
                                        onClick={toggleTheme}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.6rem 1rem',
                                            background: 'var(--bg-hover)',
                                            border: '1px solid var(--border-medium)',
                                            borderRadius: '8px',
                                            color: 'var(--text-main)',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            fontFamily: 'inherit',
                                        }}
                                    >
                                        {isDark ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
                                    </button>
                                    <button
                                        onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en')}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.35rem',
                                            padding: '0.6rem 1rem',
                                            background: 'transparent',
                                            border: '1px solid var(--border-medium)',
                                            borderRadius: '8px',
                                            color: 'var(--text-main)',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            fontFamily: 'inherit',
                                        }}
                                    >
                                        <Globe size={14} />
                                        {i18n.language === 'en' ? 'हिंदी' : 'EN'}
                                    </button>
                                </div>
                                {!hideAuthButtons && (
                                    <>
                                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-main)', textDecoration: 'none', border: '1px solid var(--border-medium)', borderRadius: '10px', fontWeight: '600', background: 'transparent' }}>
                                            {t('header.cta.login')}
                                        </Link>
                                        <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '0.75rem', textAlign: 'center', background: 'var(--color-primary)', color: 'white', textDecoration: 'none', borderRadius: '10px', fontWeight: '600' }}>
                                            {t('header.cta.getStarted')}
                                        </Link>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <style>{`
                    @media (max-width: 900px) {
                        .desktop-nav, .desktop-cta { display: none !important; }
                        .mobile-menu-btn { display: flex !important; }
                    }
                `}</style>
            </motion.header>

            <AIAssistantModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} />
        </>
    );
}
