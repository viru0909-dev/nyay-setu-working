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
                    ? 'rgba(15, 23, 42, 0.95)'
                    : 'transparent',
                backdropFilter: isScrolled ? 'blur(20px)' : 'none',
                borderBottom: isScrolled ? '1px solid rgba(139, 92, 246, 0.2)' : 'none',
                transition: 'all 0.3s ease',
                boxShadow: isScrolled ? '0 4px 30px rgba(0, 0, 0, 0.1)' : 'none'
            }}
        >
            <div className="container" style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '1rem 2rem',
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
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: '900'
                }}>
                    <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        style={{
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            borderRadius: '12px',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Scale size={28} />
                    </motion.div>
                    <span style={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        NyaySetu
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav style={{
                    display: 'flex',
                    gap: '2rem',
                    alignItems: 'center'
                }} className="desktop-nav">
                    {navItems.map((item) => (
                        item.isRoute ? (
                            <Link
                                key={item.label}
                                to={item.href}
                                style={{
                                    color: '#e2e8f0',
                                    textDecoration: 'none',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    transition: 'color 0.2s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.target.style.color = '#8b5cf6'}
                                onMouseLeave={(e) => e.target.style.color = '#e2e8f0'}
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
                                    color: '#e2e8f0',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    transition: 'color 0.2s',
                                    cursor: 'pointer',
                                    padding: 0
                                }}
                                onMouseEnter={(e) => e.target.style.color = '#8b5cf6'}
                                onMouseLeave={(e) => e.target.style.color = '#e2e8f0'}
                            >
                                {item.label}
                            </button>
                        ) : (
                            <a
                                key={item.label}
                                href={item.href}
                                style={{
                                    color: '#e2e8f0',
                                    textDecoration: 'none',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    transition: 'color 0.2s',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => e.target.style.color = '#8b5cf6'}
                                onMouseLeave={(e) => e.target.style.color = '#e2e8f0'}
                            >
                                {item.label}
                            </a>
                        )
                    ))}
                </nav>

                {/* CTA Buttons */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="desktop-cta">
                    {/* Language Toggle */}
                    <button
                        onClick={toggleLanguage}
                        style={{
                            padding: '0.625rem 1rem',
                            background: 'rgba(139, 92, 246, 0.15)',
                            border: '2px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '0.5rem',
                            color: '#8b5cf6',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: '700',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(139, 92, 246, 0.25)';
                            e.target.style.borderColor = '#8b5cf6';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(139, 92, 246, 0.15)';
                            e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                        }}
                    >
                        <Globe size={18} />
                        {language === 'en' ? 'हिंदी' : 'EN'}
                    </button>

                    {!hideAuthButtons && (
                        <>
                            <Link to="/login" style={{
                                padding: '0.625rem 1.5rem',
                                color: '#e2e8f0',
                                textDecoration: 'none',
                                borderRadius: '0.5rem',
                                fontWeight: '600',
                                transition: 'all 0.2s'
                            }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(139, 92, 246, 0.1)';
                                    e.target.style.color = '#8b5cf6';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'transparent';
                                    e.target.style.color = '#e2e8f0';
                                }}>
                                Login
                            </Link>
                            <Link to="/signup" style={{
                                padding: '0.625rem 1.5rem',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '0.5rem',
                                fontWeight: '700',
                                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                                transition: 'all 0.2s'
                            }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.4)';
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
                        color: 'white',
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
                            background: 'rgba(15, 23, 42, 0.98)',
                            backdropFilter: 'blur(20px)',
                            borderTop: '1px solid rgba(139, 92, 246, 0.2)',
                            padding: '1.5rem'
                        }}
                    >
                        {navItems.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                style={{
                                    display: 'block',
                                    padding: '0.75rem 0',
                                    color: '#e2e8f0',
                                    textDecoration: 'none',
                                    fontSize: '1.125rem',
                                    fontWeight: '600',
                                    borderBottom: '1px solid rgba(226, 232, 240, 0.1)'
                                }}
                            >
                                {item.label}
                            </a>
                        ))}
                        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <Link to="/login" style={{
                                padding: '0.75rem',
                                textAlign: 'center',
                                color: '#e2e8f0',
                                textDecoration: 'none',
                                border: '2px solid #8b5cf6',
                                borderRadius: '0.5rem',
                                fontWeight: '700'
                            }}>
                                Login
                            </Link>
                            <Link to="/signup" style={{
                                padding: '0.75rem',
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '0.5rem',
                                fontWeight: '700'
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
