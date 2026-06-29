import { Trophy, Award, Sparkles, FileText, Presentation, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export default function AchievementsSection() {
    const { t } = useTranslation('landing');
    const [hoveredCard, setHoveredCard] = useState(null);

    const achievements = [
        {
            title: t('achievements.vois.title'),
            subtitle: t('achievements.vois.subtitle'),
            badge: t('achievements.vois.badge'),
            description: t('achievements.vois.description'),
            icon: <Trophy size={40} />,
            color: '#FFD700',
            bgGradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
        },
        {
            title: t('achievements.esubmit.title'),
            subtitle: t('achievements.esubmit.subtitle'),
            description: t('achievements.esubmit.description'),
            icon: <Award size={40} />,
            color: '#C0C0C0',
            bgGradient: 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)'
        }
    ];

    return (
        <section style={{ padding: '6rem 2rem', background: 'var(--bg-glass)' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1.5rem',
                        background: 'rgba(63, 93, 204, 0.1)',
                        border: '1px solid rgba(63, 93, 204, 0.3)',
                        borderRadius: '2rem',
                        marginBottom: '1.5rem'
                    }}>
                        <Sparkles size={24} style={{ color: 'var(--color-secondary)' }} />
                        <span style={{ color: 'var(--color-secondary)', fontSize: '0.95rem', fontWeight: '700' }}>
                            {t('achievements.badge')}
                        </span>
                    </div>

                    <h2 style={{
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        fontWeight: '900',
                        color: 'var(--text-main)',
                        marginBottom: '1rem'
                    }}>
                        {t('achievements.heading')}
                        <span style={{
                            background: 'linear-gradient(135deg, #3F5DCC 0%, #7C5CFF 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {t('achievements.headingHighlight')}
                        </span>
                    </h2>

                    <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                        {t('achievements.subheading')}
                    </p>
                </div>

                {/* Achievements Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
                    gap: '3rem',
                    padding: '2rem 1rem 8rem 1rem',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    {achievements.map((achievement, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2, duration: 0.6 }}
                            whileHover={{ y: -12, scale: 1.03 }}
                            style={{
                                padding: '3rem 2.5rem',
                                background: 'var(--bg-glass-strong)',
                                backdropFilter: 'var(--glass-blur)',
                                borderRadius: '2rem',
                                border: 'var(--border-glass)',
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: 'var(--shadow-glass)',
                                position: 'relative',
                                overflow: 'hidden',
                                minHeight: '320px'
                            }}
                            onMouseEnter={(e) => {
                                setHoveredCard(idx);
                                e.currentTarget.style.borderColor = achievement.color;
                                e.currentTarget.style.boxShadow = `0 20px 60px ${achievement.color}40`;
                            }}
                            onMouseLeave={(e) => {
                                setHoveredCard(null);
                                e.currentTarget.style.borderColor = 'var(--border-glass)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-glass)';
                            }}
                        >
                            {/* Decorative Gradient Overlay */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '150px',
                                height: '150px',
                                background: achievement.bgGradient,
                                opacity: 0.1,
                                borderRadius: '0 0 0 100%',
                                pointerEvents: 'none'
                            }} />

                            {/* Interactive Overlay for VOIS (idx === 0) */}
                            <AnimatePresence>
                                {idx === 0 && hoveredCard === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'rgba(255, 215, 0, 0.95)',
                                            backdropFilter: 'blur(10px)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '1.25rem',
                                            zIndex: 10,
                                            borderRadius: '2rem',
                                            padding: '2rem'
                                        }}
                                    >
                                        <h4 style={{
                                            color: '#1E2A44',
                                            fontSize: '1.5rem',
                                            fontWeight: '800',
                                            marginBottom: '1rem',
                                            textAlign: 'center'
                                        }}>
                                            {t('achievements.overlay.viewMaterials')}
                                        </h4>

                                        <motion.a
                                            href="/VOIS_Submission/VOIS_Final_Report_NyaySetu.pdf"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '1rem',
                                                background: '#1E2A44',
                                                color: '#FFD700',
                                                borderRadius: '12px',
                                                border: '2px solid #1E2A44',
                                                fontSize: '1.1rem',
                                                fontWeight: '700',
                                                textDecoration: 'none',
                                                width: '80%',
                                                maxWidth: '300px',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <FileText size={22} />
                                            {t('achievements.overlay.viewReport')}
                                        </motion.a>

                                        <motion.a
                                            href="/VOIS_Submission/Nyay_Setu_VOIS_Presentation_PDF.pdf"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '1rem',
                                                background: '#1E2A44',
                                                color: '#FFD700',
                                                borderRadius: '12px',
                                                border: '2px solid #1E2A44',
                                                fontSize: '1rem',
                                                fontWeight: '700',
                                                textDecoration: 'none',
                                                width: '80%',
                                                maxWidth: '300px',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <Presentation size={22} />
                                            {t('achievements.overlay.viewPresentation')}
                                        </motion.a>

                                        <motion.a
                                            href="/VOIS_Submission/NyaySetu_VOIS.mp4"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '1rem',
                                                background: '#1E2A44',
                                                color: '#FFD700',
                                                borderRadius: '12px',
                                                border: '2px solid #1E2A44',
                                                fontSize: '1.1rem',
                                                fontWeight: '700',
                                                textDecoration: 'none',
                                                width: '80%',
                                                maxWidth: '300px',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <Video size={22} />
                                            {t('achievements.overlay.watchVideo')}
                                        </motion.a>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Interactive Overlay for e-Submit (idx === 1) */}
                            <AnimatePresence>
                                {idx === 1 && hoveredCard === 1 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'rgba(192, 192, 192, 0.95)',
                                            backdropFilter: 'blur(10px)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '1rem',
                                            zIndex: 10,
                                            borderRadius: '2rem',
                                            padding: '1.5rem'
                                        }}
                                    >
                                        <h4 style={{
                                            color: '#1E2A44',
                                            fontSize: '1.3rem',
                                            fontWeight: '800',
                                            textAlign: 'center',
                                            margin: 0
                                        }}>
                                            {t('achievements.overlay.certificateTitle')}
                                        </h4>

                                        <motion.a
                                            href="/esubmit_certificate.png"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.03 }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <img
                                                src="/esubmit_certificate.png"
                                                alt="e-Submit Certificate"
                                                style={{
                                                    width: '100%',
                                                    maxWidth: '340px',
                                                    borderRadius: '12px',
                                                    border: '3px solid #1E2A44',
                                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                                                }}
                                            />
                                        </motion.a>

                                        <motion.a
                                            href="/esubmit_certificate.png"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '0.75rem 2rem',
                                                background: '#1E2A44',
                                                color: '#C0C0C0',
                                                borderRadius: '12px',
                                                border: '2px solid #1E2A44',
                                                fontSize: '1rem',
                                                fontWeight: '700',
                                                textDecoration: 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <Award size={20} />
                                            {t('achievements.overlay.viewCertificate')}
                                        </motion.a>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Icon */}
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '20px',
                                background: `${achievement.color}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '2rem',
                                color: achievement.color,
                                position: 'relative',
                                zIndex: 1
                            }}>
                                {achievement.icon}
                            </div>

                            {/* Content */}
                            <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{
                                    color: 'var(--text-main)',
                                    fontSize: '1.75rem',
                                    fontWeight: '800',
                                    marginBottom: '0.5rem',
                                    lineHeight: '1.3',
                                    wordWrap: 'break-word',
                                    hyphens: 'auto'
                                }}>
                                    {achievement.title}
                                </h3>

                                <div style={{
                                    display: 'flex',
                                    gap: '0.75rem',
                                    alignItems: 'center',
                                    marginBottom: '1.5rem',
                                    flexWrap: 'wrap'
                                }}>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '0.5rem 1.25rem',
                                        background: `${achievement.color}20`,
                                        color: achievement.color,
                                        borderRadius: '0.75rem',
                                        fontSize: '1rem',
                                        fontWeight: '700'
                                    }}>
                                        {achievement.subtitle}
                                    </div>

                                    {achievement.badge && (
                                        <div style={{
                                            display: 'inline-block',
                                            padding: '0.5rem 1rem',
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            color: '#FFFFFF',
                                            borderRadius: '0.75rem',
                                            fontSize: '0.875rem',
                                            fontWeight: '700',
                                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                        }}>
                                            {achievement.badge}
                                        </div>
                                    )}
                                </div>

                                <p style={{
                                    color: 'var(--text-secondary)',
                                    fontSize: '1.1rem',
                                    lineHeight: '1.7',
                                    marginBottom: 0,
                                    flex: 1
                                }}>
                                    {achievement.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}