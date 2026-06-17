import { motion } from 'framer-motion';
import { Shield, Monitor, ShoppingBag, FileText, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const iconMap = {
    Shield: Shield,
    Monitor: Monitor,
    ShoppingBag: ShoppingBag,
    FileText: FileText,
};

export default function LegalCard({ category, index }) {
    const { t } = useTranslation('common');
    const IconComponent = iconMap[category.icon] || FileText;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            style={{
                background: 'var(--bg-glass-strong)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid var(--border-light)',
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: 'var(--shadow-glass)',
                transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = category.color + '50';
                e.currentTarget.style.boxShadow = `0 10px 28px ${category.color}18`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.boxShadow = 'var(--shadow-glass)';
            }}
        >
            <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${category.color}15 0%, transparent 70%)`,
                pointerEvents: 'none',
            }} />

            <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                background: category.color + '15',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.5rem',
                border: `1px solid ${category.color}30`,
            }}>
                <IconComponent size={28} style={{ color: category.color }} />
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                {category.title}
            </h3>

            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem', flex: 1 }}>
                {category.description}
            </p>

            <Link
                to={`/legal-rights/${category.id}`}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    color: category.color,
                    fontSize: '1rem', fontWeight: '700',
                    textDecoration: 'none',
                    transition: 'gap 0.2s ease',
                    marginTop: 'auto'
                }}
                onMouseEnter={e => e.currentTarget.style.gap = '0.6rem'}
                onMouseLeave={e => e.currentTarget.style.gap = '0.35rem'}
            >
                {t('learnMore', { defaultValue: 'Learn More' })} <ArrowRight size={18} />
            </Link>
        </motion.div>
    );
} 