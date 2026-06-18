// redesigned header — dark mode toggle, portal dropdown, sticky scroll, mobile drawer
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Scale, Menu, X, Globe, Sun, Moon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import useAuthStore from '../../store/authStore';
import AIAssistantModal from './AIAssistantModal';

// role links for the portal dropdown
const ROLES = [
    { id: 'litigant', label:'header.nav.roles.litigant', href: '/litigant' },
    { id: 'lawyer', label: 'header.nav.roles.lawyer', href: '/lawyer' },
    { id: 'judge', label: 'header.nav.roles.judge', href: '/judge' },
];

const LANGUAGES = [
    { code: 'en', label: 'English', flag: 'EN' },
    { code: 'hi', label: 'हिंदी', flag: 'HI' },
    { code: 'mr', label: 'मराठी', flag: 'MR' },
    { code: 'ta', label: 'தமிழ்', flag: 'TA' },
    { code: 'te', label: 'తెలుగు', flag: 'TE' }
];

export default function Header({ hideAuthButtons = false }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation('common');
    const [showAIModal, setShowAIModal] = useState(false);
    const [roleOpen, setRoleOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const { isGuest } = useAuthStore();

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflowX = 'hidden';
        } else {
            document.body.style.overflowX = 'unset';
        }

        return () => {
            document.body.style.overflowX = 'unset';
        };
    }, [isMobileMenuOpen]);

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

    // Close language dropdown on outside click
    useEffect(() => {
        if (!langOpen) return;
        const close = (e) => {
            if (!e.target.closest('#lang-selector')) setLangOpen(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [langOpen]);

    const navItems = [
        { labelKey: 'header.nav.home', href: '/', isRoute: true },
        { labelKey: 'header.nav.features', href: '/#features' },
        { labelKey: 'header.nav.upcomingFeatures', href: '/upcoming-features', isRoute: true },
        { labelKey: 'header.nav.constitution', href: '/constitution', isRoute: true },
        { labelKey: 'header.nav.aiAssistant', action: () => setShowAIModal(true) },
        { labelKey: 'header.nav.about', href: '/about', isRoute: true },
        { labelKey: 'FAQ', href: '/faq', isRoute: true },
    ];

    const isDark = theme === 'dark';

    const navLinkStyle = (isActive) => ({
        color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
        textDecoration: 'none',
        fontSize: '0.925rem',
        fontWeight: isActive ? '600' : '500',
        cursor: 'pointer',
        padding: '0.25rem 0',
        background: 'none',
        border: 'none',
        fontFamily: 'inherit',
        transition: 'color 0.3s ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: '1',
    });

    const renderNavItem = (item) => {
        const currentPathWithHash = location.pathname + location.hash;

        let isActive = false;

        if (item.href === '/') {
            isActive = location.pathname === '/' && !location.hash;
        } else if (item.href) {
            isActive =
                currentPathWithHash === item.href ||
                location.pathname === item.href;
        }

        const baseStyle = navLinkStyle(isActive);

        const displayLabel =
            t(item.labelKey) === item.labelKey
                ? item.labelKey
                : t(item.labelKey);

        const underline = (
            <span
                className="nav-underline"
                style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: '-4px',
                    width: '72%',
                    height: '3px',
                    borderRadius: '999px',
                    background: 'var(--color-primary)',
                    transform: isActive
                        ? 'translateX(-50%) scaleX(1)'
                        : 'translateX(-50%) scaleX(0)',
                    transformOrigin: 'center',
                    transition: 'transform 0.3s ease',
                }}
            />
        );

        const sharedProps = {
            style: baseStyle,
            onMouseEnter: e => {
                e.currentTarget.style.color = 'var(--color-primary)';
                const underline =
                    e.currentTarget.querySelector('.nav-underline');

                if (underline) {
                    underline.style.transform =
                        'translateX(-50%) scaleX(1)';
                }
            },

            onMouseLeave: e => {
                e.currentTarget.style.color =
                    location.pathname === item.href
                        ? 'var(--color-primary)'
                        : 'var(--text-secondary)';

                const underline =
                    e.currentTarget.querySelector('.nav-underline');

                if (
                    underline &&
                    location.pathname !== item.href
                ) {
                    underline.style.transform =
                        'translateX(-50%) scaleX(0)';
                }
            },
        };
        const currentPathWithHash = location.pathname + location.hash;
        let isActive = false;
        if (item.href === '/') {
            // Home is only active if we are on '/' AND there is no hash
            isActive = location.pathname === '/' && !location.hash;
        } else if (item.href) {
            // Other tabs are active if they match the exact path+hash OR just the path
            isActive = currentPathWithHash === item.href || location.pathname === item.href;
        }
        // -------------------------------------------------------------

        if (item.action) {
            return (
                <button
                    key={item.labelKey}
                    onClick={item.action}
                    {...sharedProps}
                    className="header-nav-link"
                    data-active={isActive ? 'true' : undefined}
                    style={baseStyle}
                >
                    {displayLabel}
                    {underline}
                </button>
            );
        }

        if (item.isRoute) {
            return (
                <Link
                    key={item.labelKey}
                    to={item.href}
                    {...sharedProps}
                    className="header-nav-link"
                    data-active={isActive ? 'true' : undefined}
                    style={baseStyle}
                >
                    {displayLabel}
                    {underline}
                </Link>
            );
        }

        return (
            <a
                key={item.labelKey}
                href={item.href}
                {...sharedProps}
                className="header-nav-link"
                data-active={isActive ? 'true' : undefined}
                style={baseStyle}
            >
                {displayLabel}
                {underline}
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
                <div className="header-container" style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
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
                    <div className="desktop-cta" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
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
                                {t('header.nav.portal')}
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
                                                {t(role.label)}
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {isGuest && (
    <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.42rem 0.75rem',
            borderRadius: '999px',
            background: isDark
                ? 'rgba(245, 158, 11, 0.08)'
                : 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.18)',
            color: 'var(--text-main)',
            fontSize: '0.78rem',
            fontWeight: '600',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
        }}
    >
        <span
            style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#f59e0b',
                boxShadow: '0 0 10px rgba(245, 158, 11, 0.45)',
                flexShrink: 0,
            }}
        />

        <span style={{ letterSpacing: '0.01em' }}>
            Guest Session
        </span>
    </motion.div>
)}

                        {/* Language Toggle */}
                        <div style={{ position: 'relative' }} id="lang-selector">
                            <button
                                onClick={() => setLangOpen(o => !o)}
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
                                {LANGUAGES.find(l => l.code === i18n.language)?.label ?? 'EN'}
                                <ChevronDown size={12} style={{ transform: langOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                            </button>

                            <AnimatePresence>
                                {langOpen && (
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
                                            minWidth: '130px',
                                            overflow: 'hidden',
                                            zIndex: 100,
                                        }}
                                    >
                                        {LANGUAGES.map(lang => (
                                            <button
                                                key={lang.code}
                                                onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false); }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    width: '100%',
                                                    padding: '0.65rem 1rem',
                                                    background: i18n.language === lang.code ? 'var(--bg-hover)' : 'transparent',
                                                    border: 'none',
                                                    color: i18n.language === lang.code ? 'var(--color-primary)' : 'var(--text-main)',
                                                    fontSize: '0.875rem',
                                                    fontWeight: i18n.language === lang.code ? '700' : '500',
                                                    cursor: 'pointer',
                                                    fontFamily: 'inherit',
                                                    textAlign: 'left',
                                                    transition: 'background 0.15s ease',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                                onMouseLeave={e => e.currentTarget.style.background = i18n.language === lang.code ? 'var(--bg-hover)' : 'transparent'}
                                            >
                                                <span style={{
                                                    fontSize: '0.65rem',
                                                    fontWeight: '800',
                                                    padding: '0.1rem 0.3rem',
                                                    borderRadius: '4px',
                                                    background: 'var(--color-primary)',
                                                    color: '#fff',
                                                    letterSpacing: '0.03em',
                                                    flexShrink: 0,
                                                }}>
                                                    {lang.flag}
                                                </span>
                                                {lang.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

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
                                    {t('header.cta.signup')}
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
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.25 }}
                            style={{
                                position: 'fixed',
                                top: '75px', // Start below the header
                                right: 0,
                                width: '85%',
                                maxWidth: '360px',
                                height: 'calc(100vh - 75px)', // Crucial: Restricts height to viewport minus header
                                background: 'var(--bg-surface)',
                                borderLeft: '1px solid var(--border-light)',
                                padding: '1.5rem',
                                boxShadow: 'var(--shadow-glass)',
                                zIndex: 999,
                                display: 'flex',
                                flexDirection: 'column',
                                overflowY: 'auto', // Crucial: Enables internal scrolling
                                WebkitOverflowScrolling: 'touch',
                                overscrollBehavior: 'contain',
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
                                            <button key={item.labelKey} onClick={() => { item.action(); setIsMobileMenuOpen(false); }} style={sharedStyle} className="header-nav-link">
                                                {displayLabel}
                                            </button>
                                        );
                                    }
                                    if (item.isRoute) {
                                        return (
                                            <Link key={item.labelKey} to={item.href} onClick={() => setIsMobileMenuOpen(false)} style={sharedStyle} className="header-nav-link" aria-current={location.pathname === item.href ? 'page' : undefined}>
                                                {displayLabel}
                                            </Link>
                                        );
                                    }
                                    return (
                                        <a key={item.labelKey} href={item.href} onClick={() => setIsMobileMenuOpen(false)} style={sharedStyle} className="header-nav-link">
                                            {displayLabel}
                                        </a>
                                    );
                                })}
                            </nav>

                            {isGuest && (
    <div
        style={{
            marginBottom: '1rem',
            padding: '0.8rem 1rem',
            borderRadius: '12px',
            background: isDark
                ? 'rgba(245, 158, 11, 0.08)'
                : 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
        }}
    >
        <div
            style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#f59e0b',
                boxShadow: '0 0 8px rgba(245, 158, 11, 0.45)',
                flexShrink: 0,
            }}
        />

        <div>
            <p
                style={{
                    margin: 0,
                    fontSize: '0.86rem',
                    fontWeight: '700',
                    color: 'var(--text-main)',
                }}
            >
                Guest Mode
            </p>

            <p
                style={{
                    margin: 0,
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                }}
            >
                Some features require an account
            </p>
        </div>
    </div>
)}

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
                                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                        {LANGUAGES.map(lang => (
                                            <button
                                                key={lang.code}
                                                onClick={() => i18n.changeLanguage(lang.code)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.35rem',
                                                    padding: '0.5rem 0.85rem',
                                                    background: i18n.language === lang.code ? 'var(--color-primary)' : 'transparent',
                                                    border: '1px solid var(--border-medium)',
                                                    borderRadius: '8px',
                                                    color: i18n.language === lang.code ? '#fff' : 'var(--text-main)',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    fontFamily: 'inherit',
                                                    transition: 'all 0.2s ease',
                                                }}
                                            >
                                                <span style={{
                                                    fontSize: '0.65rem',
                                                    fontWeight: '800',
                                                    padding: '0.1rem 0.3rem',
                                                    borderRadius: '4px',
                                                    background: 'var(--color-primary)',
                                                    color: '#fff',
                                                    letterSpacing: '0.03em',
                                                    flexShrink: 0,
                                                }}>
                                                    {lang.flag}
                                                </span>
                                                {lang.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {!hideAuthButtons && (
                                    <>
                                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-main)', textDecoration: 'none', border: '1px solid var(--border-medium)', borderRadius: '10px', fontWeight: '600', background: 'transparent' }}>
                                            {t('header.cta.login')}
                                        </Link>
                                        <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '0.75rem', textAlign: 'center', background: 'var(--color-primary)', color: 'white', textDecoration: 'none', borderRadius: '10px', fontWeight: '600' }}>
                                            {t('header.cta.signup')}
                                        </Link>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <style>{`
                    /* Protect header from global responsive.css wildcards */
                    header .header-container {
                        display: flex !important;
                        flex-direction: row !important;
                        justify-content: space-between !important;
                        align-items: center !important;
                        flex-wrap: nowrap !important;
                        gap: 1rem !important;
                        padding: 0.7rem 2rem;
                    }

                    @media (max-width: 900px) {
                        header .header-container {
                            padding: 0.7rem 1.2rem;
                        }
                        .desktop-nav, .desktop-cta { display: none !important; }
                        .mobile-menu-btn { display: flex !important; }
                    }

                    .header-nav-link {
                        position: relative;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        line-height: 1.2;
                        transition: color 0.2s ease;
                        -webkit-tap-highlight-color: transparent;
                    }

                    .header-nav-link::after {
                        content: '';
                        position: absolute;
                        left: 0;
                        right: 0;
                        bottom: -0.3rem;
                        height: 2px;
                        border-radius: 999px;
                        background: currentColor;
                        transform: scaleX(0);
                        transform-origin: left center;
                        transition: transform 0.24s ease;
                    }

                    .header-nav-link:hover,
                    .header-nav-link:focus-visible,
                    .header-nav-link[data-active='true'],
                    .header-nav-link[aria-current='page'] {
                        color: var(--color-primary) !important;
                    }

                    .header-nav-link:hover::after,
                    .header-nav-link:focus-visible::after,
                    .header-nav-link[data-active='true']::after,
                    .header-nav-link[aria-current='page']::after {
                        transform: scaleX(1);
                    }

                    @media (hover: none) and (pointer: coarse) {
                        .header-nav-link:hover::after {
                            transform: scaleX(0);
                        }
                    }
                `}</style>
            </motion.header>

            <AIAssistantModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} />
        </>
    );
}
