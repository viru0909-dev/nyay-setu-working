import { motion } from 'framer-motion';
import { UserPlus, FileSearch, Gavel, CheckCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function HowItWorks() {
    const { t } = useTranslation('landing');

    const steps = [
        {
            icon: UserPlus,
            number: "01",
            title: t('landing:howItWorks.steps.step01.title'),
            description: t('landing:howItWorks.steps.step01.description'),
            color: "#8b5cf6"
        },
        {
            icon: FileSearch,
            number: "02",
            title: t('landing:howItWorks.steps.step02.title'),
            description: t('landing:howItWorks.steps.step02.description'),
            color: "#6366f1"
        },
        {
            icon: Gavel,
            number: "03",
            title: t('landing:howItWorks.steps.step03.title'),
            description: t('landing:howItWorks.steps.step03.description'),
            color: "#ec4899"
        },
        {
            icon: CheckCircle,
            number: "04",
            title: t('landing:howItWorks.steps.step04.title'),
            description: t('landing:howItWorks.steps.step04.description'),
            color: "#10b981"
        }
    ];

    return (
        <section style={{
            padding: '1rem 2rem 6rem',
            background: 'transparent' // Let body background show through
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{
                            display: 'inline-block',
                            padding: '0.75rem 1.5rem',
                            background: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '2rem',
                            marginBottom: '1.5rem'
                        }}
                    >
                        <span style={{ color: 'var(--color-accent)', fontSize: '0.95rem', fontWeight: '700' }}>
                            {t('landing:howItWorks.badge')}
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        style={{
                            fontSize: 'clamp(2rem, 4vw, 3rem)',
                            fontWeight: '900',
                            color: 'var(--text-main)',
                            marginBottom: '1rem'
                        }}
                    >
                        {t('landing:howItWorks.title')}
                        <span style={{
                            background: 'linear-gradient(135deg, var(--color-accent) 0%, #ec4899 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {t('landing:howItWorks.titleHighlight')}
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        style={{
                            fontSize: '1.25rem',
                            color: 'var(--text-secondary)',
                            maxWidth: '700px',
                            margin: '0 auto',
                            lineHeight: '1.6'
                        }}
                    >
                        {t('landing:howItWorks.subtitle')}
                    </motion.p>
                </div>

                {/* Steps */}
                <div style={{ position: 'relative' }}>
                    {/* Connection Line */}
                    <div style={{
                        position: 'absolute',
                        top: '80px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '80%',
                        height: '2px',
                        background: 'linear-gradient(90deg, #8b5cf6 0%, #6366f1 33%, #ec4899 66%, #10b981 100%)',
                        opacity: 0.3,
                        zIndex: 0,
                        display: window.innerWidth > 768 ? 'block' : 'none'
                    }} />

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '3rem',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        {steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.15 }}
                                style={{
                                    textAlign: 'center',
                                    position: 'relative'
                                }}
                            >
                                {/* Step Number Background */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-20px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    fontSize: '6rem',
                                    fontWeight: '900',
                                    color: step.color,
                                    opacity: 0.05,
                                    zIndex: 0,
                                    lineHeight: 1
                                }}>
                                    {step.number}
                                </div>

                                {/* Icon Container */}
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    style={{
                                        width: '120px',
                                        height: '120px',
                                        margin: '0 auto 2rem',
                                        background: 'var(--bg-glass-strong)', // Glass effect
                                        backdropFilter: 'var(--glass-blur)',
                                        border: `3px solid ${step.color}40`,
                                        borderRadius: '2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                        zIndex: 1,
                                        boxShadow: 'var(--shadow-glass)'
                                    }}
                                >
                                    <step.icon size={48} style={{ color: step.color }} />
                                </motion.div>

                                {/* Step Number Badge */}
                                <div style={{
                                    display: 'inline-block',
                                    padding: '0.5rem 1rem',
                                    background: `${step.color}10`,
                                    border: `2px solid ${step.color}30`,
                                    borderRadius: '2rem',
                                    color: step.color,
                                    fontWeight: '900',
                                    fontSize: '0.875rem',
                                    marginBottom: '1rem',
                                    letterSpacing: '0.05em'
                                }}>
                                    {t('landing:howItWorks.stepLabel')} {step.number}
                                </div>

                                {/* Title */}
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '800',
                                    color: 'var(--text-main)',
                                    marginBottom: '1rem'
                                }}>
                                    {step.title}
                                </h3>

                                {/* Description */}
                                <p style={{
                                    color: 'var(--text-secondary)',
                                    fontSize: '1rem',
                                    lineHeight: '1.6',
                                    maxWidth: '300px',
                                    margin: '0 auto'
                                }}>
                                    {step.description}
                                </p>

                                {/* Arrow for desktop */}
                                {idx < steps.length - 1 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '60px',
                                        right: '-50px',
                                        color: step.color,
                                        opacity: 0.5,
                                        display: window.innerWidth > 768 ? 'block' : 'none'
                                    }}>
                                        <ArrowRight size={32} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    style={{
                        textAlign: 'center',
                        marginTop: '5rem'
                    }}
                >
                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '1.125rem',
                        marginBottom: '2rem',
                        fontWeight: '600'
                    }}>
                        {t('landing:howItWorks.ctaText')}
                    </p>
                    <motion.button
                        className="btn btn-primary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            padding: '1.25rem 3rem',
                            fontSize: '1.125rem',
                            borderRadius: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}
                        onClick={() => window.location.href = '/signup'}
                    >
                        {t('landing:howItWorks.ctaButton')}
                        <ArrowRight size={20} />
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
}
