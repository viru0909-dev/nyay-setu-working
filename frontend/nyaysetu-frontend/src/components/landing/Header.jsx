import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import AIAssistantModal from './AIAssistantModal';

export default function Header({ hideAuthButtons = false, onConstitutionClick }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const navigate = useNavigate();

    // Use language context
    const { language, toggleLanguage } = useLanguage();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { label: 'Home', href: '/', isRoute: true },
        { label: 'Features', href: '#features' },
        { label: 'Constitution', href: '/constitution', isRoute: true },
        { label: 'AI Assistant', href: '#chatbot' },
        { label: 'About', href: '/about', isRoute: true }
    ];

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                background: isScrolled
                    ? '#FFFFFF'
                    : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid #E5E7EB',
                transition: 'all 0.3s ease-out',
                boxShadow: isScrolled ? '0 1px 3px 0 rgba(0, 0, 0, 0.05)' : 'none'
            }}
        >
            <div className="container" style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '0.75rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                {/* Logo */}
                <Link to="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    textDecoration: 'none',
                    color: 'var(--color-primary)',
                    fontSize: '1.25rem',
                    fontWeight: '800',
                    letterSpacing: '-0.02em'
                }}>
                    <motion.div
                        whileHover={{ rotate: 10 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            background: 'var(--color-primary)',
                            borderRadius: '10px',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Scale size={24} color="white" />
                    </motion.div>
                    <span>
                        NyaySetu
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav style={{
                    display: 'flex',
                    gap: '2.5rem',
                    alignItems: 'center'
                }} className="desktop-nav">
                    {navItems.map((item) => {
                        const isActive = false; // Add logic if needed
                        return item.isRoute ? (
                            <Link
                                key={item.label}
                                to={item.href}
                                style={{
                                    color: isActive ? 'var(--color-secondary)' : '#475569',
                                    textDecoration: 'none',
                                    fontSize: '0.95rem',
                                    fontWeight: isActive ? '600' : '500',
                                    transition: 'color 0.3s ease-out',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.target.style.color = 'var(--color-primary)'}
                                onMouseLeave={(e) => e.target.style.color = isActive ? 'var(--color-secondary)' : '#475569'}
                            >
                                {item.label}
                            </Link>
                        ) : item.label === 'AI Assistant' ? (
                            <button
                                key={item.label}
                                onClick={() => setShowAIModal(true)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#475569',
                                    fontSize: '0.95rem',
                                    fontWeight: '500',
                                    transition: 'color 0.3s ease-out',
                                    cursor: 'pointer',
                                    padding: 0
                                }}
                                onMouseEnter={(e) => e.target.style.color = 'var(--color-primary)'}
                                onMouseLeave={(e) => e.target.style.color = '#475569'}
                            >
                                {item.label}
                            </button>
                        ) : (
                            <a
                                key={item.label}
                                href={item.href}
                                style={{
                                    color: '#475569',
                                    textDecoration: 'none',
                                    fontSize: '0.95rem',
                                    fontWeight: '500',
                                    transition: 'color 0.3s ease-out',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => e.target.style.color = 'var(--color-primary)'}
                                onMouseLeave={(e) => e.target.style.color = '#475569'}
                            >
                                {item.label}
                            </a>
                        );
                    })}
                </nav>

                {/* CTA Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }} className="desktop-cta">
                    {/* Language Toggle */}
                    <button
                        onClick={toggleLanguage}
                        style={{
                            padding: '0.6rem 1rem',
                            background: 'transparent',
                            border: '1px solid #CBD5E1',
                            borderRadius: '10px',
                            color: 'var(--color-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            transition: 'all 0.3s ease-out'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#F1F5F9';
                            e.currentTarget.style.borderColor = 'var(--color-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = '#CBD5E1';
                        }}
                    >
                        <Globe size={16} />
                        {language === 'en' ? 'हिंदी' : 'EN'}
                    </button>

                    {!hideAuthButtons && (
                        <>
                            <Link to="/login" style={{
                                padding: '0.6rem 1.25rem',
                                color: 'var(--color-primary)',
                                border: '1px solid #CBD5E1',
                                background: 'transparent',
                                textDecoration: 'none',
                                borderRadius: '10px',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                transition: 'all 0.3s ease-out'
                            }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = '#F1F5F9';
                                    e.target.style.borderColor = 'var(--color-primary)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'transparent';
                                    e.target.style.borderColor = '#CBD5E1';
                                }}>
                                Login
                            </Link>
                            <Link to="/signup" style={{
                                padding: '0.6rem 1.5rem',
                                background: 'var(--color-primary)',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '10px',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                transition: 'all 0.3s ease-out',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'var(--color-primary-hover)';
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = 'var(--shadow-md)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'var(--color-primary)';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'var(--shadow-sm)';
                                }}>
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="mobile-menu-btn"
                    style={{
                        display: 'none',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        padding: '0.5rem'
                    }}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mobile-menu"
                        style={{
                            background: 'var(--bg-glass-strong)',
                            backdropFilter: 'var(--glass-blur)',
                            borderTop: 'var(--border-glass)',
                            padding: '1.5rem',
                            boxShadow: 'var(--shadow-glass)'
                        }}
                    >
                        {navItems.map((item) => (
                            item.isRoute ? (
                                <Link
                                    key={item.label}
                                    to={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    style={{
                                        display: 'block',
                                        padding: '0.75rem 0',
                                        color: 'var(--text-main)',
                                        textDecoration: 'none',
                                        fontSize: '1.125rem',
                                        fontWeight: '600',
                                        borderBottom: 'var(--border-glass)'
                                    }}
                                >
                                    {item.label}
                                </Link>
                            ) : item.label === 'AI Assistant' ? (
                                <button
                                    key={item.label}
                                    onClick={() => {
                                        setShowAIModal(true);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '0.75rem 0',
                                        color: 'var(--text-main)',
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '1.125rem',
                                        fontWeight: '600',
                                        borderBottom: 'var(--border-glass)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {item.label}
                                </button>
                            ) : (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    style={{
                                        display: 'block',
                                        padding: '0.75rem 0',
                                        color: 'var(--text-main)',
                                        textDecoration: 'none',
                                        fontSize: '1.125rem',
                                        fontWeight: '600',
                                        borderBottom: 'var(--border-glass)'
                                    }}
                                >
                                    {item.label}
                                </a>
                            )
                        ))}
                        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <Link
                                to="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                style={{
                                    padding: '0.75rem',
                                    textAlign: 'center',
                                    color: 'var(--color-primary)',
                                    textDecoration: 'none',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '10px',
                                    fontWeight: '600',
                                    background: 'transparent'
                                }}>
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                onClick={() => setIsMobileMenuOpen(false)}
                                style={{
                                    padding: '0.75rem',
                                    textAlign: 'center',
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '10px',
                                    fontWeight: '600'
                                }}>
                                Get Started
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @media (max-width: 768px) {
                    .desktop-nav, .desktop-cta {
                        display: none !important;
                    }
                    .mobile-menu-btn {
                        display: block !important;
                    }
                }
            `}</style>

            {/* AI Assistant Modal */}
            <AIAssistantModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} />
        </motion.header>
    );
}
