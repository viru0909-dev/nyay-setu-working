import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
    Cpu, 
    Cuboid, 
    Video, 
    Network, 
    GitBranch, 
    Languages, 
    Database, 
    ArrowRight,
    Star,
    Layers,
    ShieldCheck,
    Zap
} from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import { Link } from 'react-router-dom';

export default function UpcomingFeatures() {
    const { t } = useTranslation('upcomingFeatures');

    const FEATURES = [
        {
            id:'workspace',
            icon: Cpu,
            title: t('upcomingFeatures.targets.0.title'),
            subtitle: t('upcomingFeatures.targets.0.subtitle'),
            description: t('upcomingFeatures.targets.0.description'),
            color: '#7C5CFF',
            phase: t('upcomingFeatures.targets.0.badge'),
            bgImage: 'linear-gradient(135deg, rgba(124,92,255,0.1) 0%, rgba(124,92,255,0.02) 100%)'
        },
        {
            id: 'forensics',
            icon: Cuboid,
            title: t('upcomingFeatures.targets.1.title'),
            subtitle: t('upcomingFeatures.targets.1.subtitle'),
            description: t('upcomingFeatures.targets.1.description'),
            color: '#F59E0B',
            phase: t('upcomingFeatures.targets.1.badge'),
            bgImage: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.02) 100%)'
        },
        {
            id: 'webrtc',
            icon: Video,
            title: t('upcomingFeatures.targets.2.title'),
            subtitle: t('upcomingFeatures.targets.2.subtitle'),
            description: t('upcomingFeatures.targets.2.description'),
            color: '#EF4444',
            phase: t('upcomingFeatures.targets.2.badge'),
            bgImage: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.02) 100%)'
        },
        {
            id: 'multi-model',
            icon: Network,
            title: t('upcomingFeatures.targets.3.title'),
            subtitle: t('upcomingFeatures.targets.3.subtitle'),
            description: t('upcomingFeatures.targets.3.description'),
            color: '#3F5DCC',
            phase: t('upcomingFeatures.targets.3.badge'),
            bgImage: 'linear-gradient(135deg, rgba(63,93,204,0.1) 0%, rgba(63,93,204,0.02) 100%)'
        },
        {
            id: 'reasoning',
            icon: GitBranch,
            title: t('upcomingFeatures.targets.4.title'),
            subtitle: t('upcomingFeatures.targets.4.subtitle'),
            description: t('upcomingFeatures.targets.4.description'),
            color: '#10B981',
            phase: t('upcomingFeatures.targets.4.badge'),
            bgImage: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.02) 100%)'
        },
        {
            id: 'transliteration',
            icon: Languages,
            title: t('upcomingFeatures.targets.5.title'),
            subtitle: t('upcomingFeatures.targets.5.subtitle'),
            description: t('upcomingFeatures.targets.5.description'),
            color: '#8B5CF6',
            phase: t('upcomingFeatures.targets.5.badge'),
            bgImage: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.02) 100%)'
        },
        {
            id: 'rag',
            icon: Database,
            title: t('upcomingFeatures.targets.6.title'),
            subtitle: t('upcomingFeatures.targets.6.subtitle'),
            description: t('upcomingFeatures.targets.6.description'),
            color: '#EC4899',
            phase: t('upcomingFeatures.targets.6.badge'),
            bgImage: 'linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(236,72,153,0.02) 100%)'
        }
    ];

    const PHASES = t('upcomingFeatures.phases',{
        returnObjects: true,
    });

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', position: 'relative' }}>
            <Header />

            <main style={{ paddingTop: '80px' }}>
                {/* Hero Section */}
                <section style={{
                    padding: '6rem 2rem 4rem',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
                        width: '800px', height: '800px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(124,92,255,0.08) 0%, transparent 60%)',
                        pointerEvents: 'none', zIndex: 0
                    }} />
                    
                    <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.4rem 1rem', marginBottom: '1.5rem',
                                background: 'rgba(124,92,255,0.1)', border: '1px solid rgba(124,92,255,0.2)',
                                borderRadius: '2rem',
                            }}>
                                <Star size={14} color="#7C5CFF" />
                                <span style={{ color: '#7C5CFF', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                    {t('upcomingFeatures.hero.badge')}
                                </span>
                            </div>
                            <h1 style={{
                                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                                fontWeight: '900',
                                color: 'var(--text-main)',
                                lineHeight: '1.1',
                                letterSpacing: '-0.03em',
                                marginBottom: '1.5rem',
                                fontFamily: 'var(--font-heading)'
                            }}>
                                {t('upcomingFeatures.hero.title1')}<br />
                                <span style={{ 
                                    background: 'linear-gradient(135deg, #7C5CFF 0%, #3F5DCC 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>{t('upcomingFeatures.hero.title2')}</span>
                            </h1>
                            <p style={{
                                fontSize: '1.15rem',
                                color: 'var(--text-secondary)',
                                lineHeight: '1.7',
                                maxWidth: '700px',
                                margin: '0 auto 3rem'
                            }}>
                               {t('upcomingFeatures.hero.description')}                            
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Timeline Section */}
                <section style={{ padding: '0 2rem 5rem' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: '1.5rem',
                        }}>
                            {PHASES.map((phase, i) => (
                                <motion.div
                                    key={phase.num}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    style={{
                                        background: 'var(--bg-surface)',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: '16px',
                                        padding: '1.5rem',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px',
                                        background: 'linear-gradient(to bottom, #7C5CFF, #3F5DCC)'
                                    }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#7C5CFF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Phase {phase.num}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                                            {phase.weeks}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{phase.title}</h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>{phase.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section style={{ padding: '2rem 2rem 6rem' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ display: 'grid', gap: '2rem' }}>
                            {FEATURES.map((feature, i) => {
                                const Icon = feature.icon;
                                const isEven = i % 2 === 0;
                                
                                return (
                                    <motion.div
                                        key={feature.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-50px" }}
                                        transition={{ duration: 0.5 }}
                                        style={{
                                            background: 'var(--bg-surface)',
                                            border: '1px solid var(--border-light)',
                                            borderRadius: '24px',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            flexDirection: isEven ? 'row' : 'row-reverse',
                                            boxShadow: 'var(--shadow-glass)',
                                        }}
                                        className="feature-card"
                                    >
                                        <div style={{
                                            flex: '1',
                                            padding: '4rem 3rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center'
                                        }} className="feature-content">
                                            <div style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                                padding: '0.3rem 0.8rem', marginBottom: '1.5rem',
                                                background: 'var(--bg-hover)', border: '1px solid var(--border-medium)',
                                                borderRadius: '6px', alignSelf: 'flex-start'
                                            }}>
                                                <Layers size={14} style={{ color: 'var(--text-muted)' }} />
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    {feature.phase} Target
                                                </span>
                                            </div>
                                            
                                            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: '1.2' }}>
                                                {feature.title}
                                            </h2>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: feature.color, marginBottom: '1.5rem' }}>
                                                {feature.subtitle}
                                            </h3>
                                            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0 }}>
                                                {feature.description}
                                            </p>
                                        </div>
                                        
                                        <div style={{
                                            flex: '1',
                                            background: feature.bgImage,
                                            minHeight: '300px',
                                            borderLeft: isEven ? '1px solid var(--border-light)' : 'none',
                                            borderRight: !isEven ? '1px solid var(--border-light)' : 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }} className="feature-visual">
                                            <div style={{
                                                position: 'absolute', inset: 0,
                                                background: `radial-gradient(circle at center, ${feature.color}15 0%, transparent 70%)`
                                            }} />
                                            <motion.div
                                                whileHover={{ scale: 1.05, rotate: 5 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                                style={{
                                                    width: '120px', height: '120px',
                                                    borderRadius: '24px',
                                                    background: 'var(--bg-surface)',
                                                    border: `1px solid ${feature.color}30`,
                                                    boxShadow: `0 20px 40px ${feature.color}15`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    position: 'relative', zIndex: 1
                                                }}
                                            >
                                                <Icon size={56} color={feature.color} />
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section style={{ padding: '0 2rem 6rem' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                        <div style={{
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-light)',
                            borderRadius: '24px',
                            padding: '4rem 2rem',
                            boxShadow: 'var(--shadow-glass)'
                        }}>
                            <Zap size={32} color="#7C5CFF" style={{ margin: '0 auto 1.5rem' }} />
                            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem' }}>
                                {t('upcomingFeatures.cta.title')}
                            </h2>
                            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
                               {t('upcomingFeatures.cta.description')}
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Link to="/signup" style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.9rem 2rem', background: 'var(--color-primary)', color: '#fff',
                                    borderRadius: '12px', fontWeight: '700', textDecoration: 'none',
                                    boxShadow: 'var(--shadow-md)', transition: 'transform 0.2s'
                                }}>
                                    {t('upcomingFeatures.cta.getStarted')} <ArrowRight size={18} />
                                </Link>
                                <a href="https://github.com/viru0909-dev/nyay-setu-working" target="_blank" rel="noopener noreferrer" style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.9rem 2rem', background: 'transparent', color: 'var(--text-main)',
                                    border: '1px solid var(--border-medium)', borderRadius: '12px', 
                                    fontWeight: '700', textDecoration: 'none', transition: 'background 0.2s'
                                }}>
                                    {t('upcomingFeatures.cta.viewRepository')}
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />

            <style>{`
                @media (max-width: 900px) {
                    .feature-card { flexDirection: column !important; }
                    .feature-visual { border: none !important; border-top: 1px solid var(--border-light) !important; min-height: 250px !important; }
                    .feature-content { padding: 2.5rem 2rem !important; }
                }
            `}</style>
        </div>
    );
}
