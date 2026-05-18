import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext.jsx';

// Self-contained translations so this page has i18n support without
// touching the shared LanguageContext translations table.
const STRINGS = {
    en: {
        title: 'Unauthorized',
        message: "You don't have permission to access this page.",
        backHome: 'Back to Home',
        goBack: 'Go Back'
    },
    hi: {
        title: 'अनधिकृत',
        message: 'आपके पास इस पृष्ठ तक पहुंचने की अनुमति नहीं है।',
        backHome: 'होम पर वापस जाएं',
        goBack: 'वापस जाएं'
    }
};

export default function Unauthorized() {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = STRINGS[language] || STRINGS.en;

    const buttonBase = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        borderRadius: '0.75rem',
        fontWeight: '600',
        fontSize: '0.95rem',
        cursor: 'pointer',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        border: '1px solid var(--border-light)'
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    maxWidth: '480px',
                    width: '100%',
                    textAlign: 'center',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '1.5rem',
                    padding: '3rem 2rem',
                    boxShadow: 'var(--shadow-glass)'
                }}
            >
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '72px',
                    height: '72px',
                    background: 'linear-gradient(135deg, #3F5DCC, #7C5CFF)',
                    borderRadius: '18px',
                    marginBottom: '1.5rem'
                }}>
                    <ShieldAlert size={36} color="white" />
                </div>

                <h1 style={{
                    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                    fontWeight: '800',
                    color: 'var(--color-primary)',
                    marginBottom: '0.75rem',
                    letterSpacing: '-0.02em'
                }}>
                    {t.title}
                </h1>

                <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '1.05rem',
                    lineHeight: '1.7',
                    marginBottom: '2rem'
                }}>
                    {t.message}
                </p>

                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }}>
                    <Link
                        to="/"
                        onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                        style={{
                            ...buttonBase,
                            background: 'linear-gradient(135deg, #3F5DCC, #7C5CFF)',
                            color: 'white',
                            border: 'none'
                        }}
                    >
                        <Home size={18} />
                        {t.backHome}
                    </Link>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'rgba(63,93,204,0.4)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'var(--border-light)';
                        }}
                        style={{
                            ...buttonBase,
                            background: 'transparent',
                            color: 'var(--color-secondary)'
                        }}
                    >
                        <ArrowLeft size={18} />
                        {t.goBack}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
