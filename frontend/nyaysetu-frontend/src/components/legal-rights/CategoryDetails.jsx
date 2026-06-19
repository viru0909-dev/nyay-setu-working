import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Shield, Monitor, ShoppingBag, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const iconMap = {
    Shield: Shield,
    Monitor: Monitor,
    ShoppingBag: ShoppingBag,
    FileText: FileText,
};

export default function CategoryDetails({ category }) {
    const { t } = useTranslation('common');
    const IconComponent = iconMap[category.icon] || FileText;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Link
                to="/legal-rights"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '0.75rem',
                    color: 'var(--text-main)',
                    textDecoration: 'none',
                    marginBottom: '2rem',
                    fontWeight: '700',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            >
                <ArrowLeft size={18} /> {t('back', { defaultValue: 'Back to Categories' })}
            </Link>

            <div style={{
                padding: '3rem',
                background: 'var(--bg-surface)',
                borderRadius: '2rem',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-glass)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            padding: '1.25rem',
                            background: category.color + '15',
                            border: `1px solid ${category.color}30`,
                            borderRadius: '1.25rem'
                        }}>
                            <IconComponent size={40} style={{ color: category.color }} />
                        </div>
                        <div>
                            <h2 style={{ color: 'var(--text-main)', fontSize: '2.5rem', fontWeight: '800', margin: '0 0 0.5rem 0', lineHeight: '1.3' }}>
                                {category.title}
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', margin: 0 }}>
                                {category.description}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => alert('Share feature coming soon!')}
                        style={{
                            padding: '0.75rem',
                            background: 'var(--bg-hover)',
                            border: '1px solid var(--border-light)',
                            borderRadius: '0.75rem',
                            color: 'var(--text-main)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <Share2 size={20} />
                    </button>
                </div>

                <div style={{ marginTop: '3rem', display: 'grid', gap: '2rem' }}>
                    {category.content.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            style={{
                                padding: '2rem',
                                background: 'var(--bg-main)',
                                borderRadius: '1.5rem',
                                border: '1px solid var(--border-light)',
                                boxShadow: 'var(--shadow-sm)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                left: 0, top: 0, bottom: 0,
                                width: '4px',
                                background: category.color
                            }} />
                            <h3 style={{ color: 'var(--text-main)', fontSize: '1.35rem', fontWeight: '700', marginBottom: '1rem' }}>
                                {item.heading}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', margin: 0 }}>
                                {item.body}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {category.keywords && (
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-light)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', alignSelf: 'center', marginRight: '0.5rem', fontWeight: '600' }}>
                            Related Topics:
                        </span>
                        {category.keywords.map((keyword, idx) => (
                            <span key={idx} style={{
                                padding: '0.4rem 1rem',
                                background: 'var(--bg-hover)',
                                border: '1px solid var(--border-light)',
                                borderRadius: '2rem',
                                color: 'var(--text-secondary)',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                textTransform: 'capitalize'
                            }}>
                                {keyword}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}