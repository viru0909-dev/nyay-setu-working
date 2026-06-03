import { motion } from 'framer-motion';
import { Shield, Award, Users, TrendingUp, Clock, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function TrustIndicators() {
    const { t } = useTranslation('landing');

    const indicators = [
        {
            icon: Shield,
            title: t('trustIndicators.bankSecurity.title'),
            description: t('trustIndicators.bankSecurity.description'),
            color: "#8b5cf6"
        },
        {
            icon: Award,
            title: t('trustIndicators.govCertified.title'),
            description: t('trustIndicators.govCertified.description'),
            color: "#10b981"
        },
        {
            icon: Users,
            title: t('trustIndicators.activeUsers.title'),
            description: t('trustIndicators.activeUsers.description'),
            color: "#6366f1"
        },
        {
            icon: TrendingUp,
            title: t('trustIndicators.successRate.title'),
            description: t('trustIndicators.successRate.description'),
            color: "#ec4899"
        },
        {
            icon: Clock,
            title: t('trustIndicators.availability.title'),
            description: t('trustIndicators.availability.description'),
            color: "#f59e0b"
        },
        {
            icon: Lock,
            title: t('trustIndicators.dataPrivacy.title'),
            description: t('trustIndicators.dataPrivacy.description'),
            color: "#3b82f6"
        }
    ];

    return (
        <section style={{
            padding: '5rem 2rem',
            background: 'var(--bg-glass-strong)',
            backdropFilter: 'var(--glass-blur)',
            borderTop: 'var(--border-glass)',
            borderBottom: 'var(--border-glass)'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ textAlign: 'center', marginBottom: '4rem' }}
                >
                    <h2 style={{
                        fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                        fontWeight: '900',
                        color: 'var(--text-main)',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem'
                    }}>
                        <Lock size={36} color="var(--color-primary)" strokeWidth={2.5} />
                        <span style={{
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {t('trustIndicators.heading')}
                        </span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
                        {t('trustIndicators.subheading')}
                    </p>
                </motion.div>

                {/* Indicators Scroll Container - Infinite Marquee */}
                <div
                    className="trust-scroll-mask"
                    style={{
                        maxWidth: '100%',
                        overflow: 'hidden',
                        padding: '1rem 0',
                        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
                    }}
                >
                    <div
                        className="trust-track"
                        style={{
                            display: 'flex',
                            gap: '2rem',
                            width: 'max-content',
                            padding: '1rem 0'
                        }}
                    >
                        {[...indicators, ...indicators].map((item, idx) => (
                            <motion.div
                                key={`${idx}-${item.title}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                                style={{
                                    padding: '4rem 3rem',
                                    background: 'var(--bg-glass)',
                                    backdropFilter: 'var(--glass-blur)',
                                    borderRadius: '24px',
                                    border: '1px solid var(--border-light)',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    boxShadow: 'var(--shadow-glass)',
                                    minWidth: '400px',
                                    flex: '0 0 auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = item.color;
                                    e.currentTarget.style.boxShadow = `0 15px 40px ${item.color}20`;
                                    e.currentTarget.style.background = 'var(--bg-glass-strong)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border-light)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-glass)';
                                    e.currentTarget.style.background = 'var(--bg-glass)';
                                }}
                            >
                                {/* Icon */}
                                <div style={{
                                    width: '90px',
                                    height: '90px',
                                    margin: '0 auto 2rem',
                                    background: `${item.color}15`,
                                    borderRadius: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: `2px solid ${item.color}30`
                                }}>
                                    <item.icon size={42} style={{ color: item.color }} />
                                </div>

                                {/* Title */}
                                <h3 style={{
                                    color: 'var(--text-main)',
                                    fontSize: '1.75rem',
                                    fontWeight: '800',
                                    marginBottom: '1rem'
                                }}>
                                    {item.title}
                                </h3>

                                {/* Description */}
                                <p style={{
                                    color: 'var(--text-secondary)',
                                    fontSize: '1.15rem',
                                    lineHeight: '1.6'
                                }}>
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
                <style>{`
                    @keyframes scroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .trust-track {
                        animation: scroll 40s linear infinite;
                    }
                    .trust-track:hover {
                        animation-play-state: paused;
                    }
                `}</style>
            </div>
        </section>
    );
}