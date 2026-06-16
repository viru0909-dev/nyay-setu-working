import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function FAQSection() {
    const { t } = useTranslation('landing');
    const [openIndex, setOpenIndex] = useState(null);

    const faqKeys = [
        'whatIs',
        'isFree',
        'whoCanUse',
        'aiReplacement',
        'forgotPassword',
        'reportIssue',
    ];

    const toggle = (index) => {
        setOpenIndex((prev) => (prev === index ? null : index));
    };

    return (
        <section
            id="faq"
            style={{
                padding: '6rem 2rem',
                background: 'var(--bg-main)',
                borderTop: '1px solid var(--border-light)',
            }}
        >
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.4rem 1rem',
                        marginBottom: '1rem',
                        background: 'rgba(63,93,204,0.08)',
                        border: '1px solid rgba(63,93,204,0.15)',
                        borderRadius: '2rem',
                    }}>
                        <HelpCircle size={14} style={{ color: 'var(--color-accent)' }} />
                        <span style={{
                            color: 'var(--color-accent)',
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            letterSpacing: '0.07em',
                            textTransform: 'uppercase',
                        }}>
                            {t('faq.badge')}
                        </span>
                    </div>

                    <h2 style={{
                        fontSize: 'clamp(1.9rem, 3.5vw, 2.6rem)',
                        fontWeight: '800',
                        color: 'var(--text-main)',
                        marginBottom: '1rem',
                        letterSpacing: '-0.025em',
                    }}>
                        {t('faq.title')}{' '}
                        <span style={{ color: 'var(--color-secondary)' }}>{t('faq.titleHighlight')}</span>
                    </h2>

                    <p style={{
                        fontSize: '1.05rem',
                        color: 'var(--text-secondary)',
                        maxWidth: '560px',
                        margin: '0 auto',
                        lineHeight: '1.6',
                    }}>
                        {t('faq.subtitle')}
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {faqKeys.map((key, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                style={{
                                    background: 'var(--bg-glass-strong)',
                                    border: `1px solid ${isOpen ? 'rgba(63,93,204,0.35)' : 'var(--border-light)'}`,
                                    borderRadius: '14px',
                                    overflow: 'hidden',
                                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                                    boxShadow: isOpen ? 'var(--shadow-glass)' : 'var(--shadow-sm)',
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => toggle(index)}
                                    aria-expanded={isOpen}
                                    aria-controls={`faq-panel-${index}`}
                                    id={`faq-trigger-${index}`}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '1rem',
                                        padding: '1.25rem 1.5rem',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        color: 'var(--text-main)',
                                    }}
                                >
                                    <span style={{
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        lineHeight: '1.4',
                                    }}>
                                        {t(`faq.items.${key}.question`)}
                                    </span>
                                    <ChevronDown
                                        size={20}
                                        style={{
                                            flexShrink: 0,
                                            color: 'var(--color-accent)',
                                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.25s ease',
                                        }}
                                    />
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            id={`faq-panel-${index}`}
                                            role="region"
                                            aria-labelledby={`faq-trigger-${index}`}
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <div style={{
                                                padding: '0 1.5rem 1.25rem',
                                                fontSize: '0.95rem',
                                                color: 'var(--text-secondary)',
                                                lineHeight: '1.7',
                                            }}>
                                                {key === 'forgotPassword' ? (
                                                    <>
                                                        {t('faq.items.forgotPassword.answerBefore')}
                                                        <Link
                                                            to="/login"
                                                            style={{
                                                                color: 'var(--color-accent)',
                                                                fontWeight: '600',
                                                                textDecoration: 'none',
                                                            }}
                                                        >
                                                            {t('faq.items.forgotPassword.answerLink')}
                                                        </Link>
                                                        {t('faq.items.forgotPassword.answerAfter')}
                                                    </>
                                                ) : key === 'reportIssue' ? (
                                                    <>
                                                        {t('faq.items.reportIssue.answerBefore')}
                                                        <a
                                                            href="https://github.com/viru0909-dev/nyay-setu-working/issues"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                color: 'var(--color-accent)',
                                                                fontWeight: '600',
                                                                textDecoration: 'none',
                                                            }}
                                                        >
                                                            {t('faq.items.reportIssue.answerLink')}
                                                        </a>
                                                        {t('faq.items.reportIssue.answerAfter')}
                                                    </>
                                                ) : (
                                                    t(`faq.items.${key}.answer`)
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
