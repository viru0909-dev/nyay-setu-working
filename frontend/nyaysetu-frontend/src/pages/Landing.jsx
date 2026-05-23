import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { UserPlus, FileText, Zap, ArrowRight, Users, Star, CheckCircle, Smartphone, Bot, BookOpen, Video, ShieldCheck, Cpu, Cuboid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import AIChatbot from '../components/landing/AIChatbot';
import AchievementsSection from '../components/landing/AchievementsSection';
import HowItWorks from '../components/landing/HowItWorks';
import TrustIndicators from '../components/landing/TrustIndicators';

export default function Landing() {
    const { t } = useTranslation('landing');
    const { theme } = useTheme();
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const heroImage = theme === 'dark'
        ? {
            fallbackSrc: '/scales-dark-720.jpg',
            fallbackSrcSet: '/scales-dark-480.jpg 480w, /scales-dark-720.jpg 720w',
            webpSrcSet: '/scales-dark-480.webp 480w, /scales-dark-720.webp 720w',
        }
        : {
            fallbackSrc: '/scales-light-720.jpg',
            fallbackSrcSet: '/scales-light-480.jpg 480w, /scales-light-720.jpg 720w',
            webpSrcSet: '/scales-light-480.webp 480w, /scales-light-720.webp 720w',
        };

    useEffect(() => {
        const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); window.deferredPrompt = e; };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (import.meta.env.DEV) { alert('PWA install works on port 4174 (preview), not dev.'); return; }
        const ev = window.deferredPrompt || deferredPrompt;
        if (ev) { await ev.prompt(); window.deferredPrompt = null; setDeferredPrompt(null); }
        else alert('Already installed, or use browser menu.');
    };

    const TRUST_STATS = [
        { value: '50K+', label: t('trustStats.activeUsers'), icon: Users },
        { value: '99%',  label: t('trustStats.successRate'), icon: Star },
        { value: '24/7', label: t('trustStats.availability'), icon: CheckCircle },
    ];

    const QUICK_CARDS = [
        {
            number: '01',
            icon: UserPlus,
            title: t('quickCards.createAccount.title'),
            desc: t('quickCards.createAccount.desc'),
            cta: t('quickCards.createAccount.cta'),
            color: '#3F5DCC',
            accent: 'rgba(63,93,204,0.18)',
            label: 'Access Layer',
        },
        {
            number: '02',
            icon: FileText,
            title: t('quickCards.submitCase.title'),
            desc: t('quickCards.submitCase.desc'),
            cta: t('quickCards.submitCase.cta'),
            color: '#1F7A8C',
            accent: 'rgba(31,122,140,0.18)',
            label: 'Case Intake',
        },
        {
            number: '03',
            icon: Zap,
            title: t('quickCards.powerfulFeatures.title'),
            desc: t('quickCards.powerfulFeatures.desc'),
            cta: t('quickCards.powerfulFeatures.cta'),
            color: '#6C5CE7',
            accent: 'rgba(108,92,231,0.18)',
            label: 'Legal Support',
        },
    ];

    const FEATURES = [
        { icon: Bot,         title: t('features.aiLegalAssistant.title'),   desc: t('features.aiLegalAssistant.description'),   color: '#3F5DCC' },
        { icon: BookOpen,    title: t('features.constitutionReader.title'),  desc: t('features.constitutionReader.description'),  color: '#7C5CFF' },
        { icon: FileText,    title: t('features.fileCases.title'),           desc: t('features.fileCases.description'),           color: '#10B981' },
        { icon: Video,       title: t('features.virtualHearings.title'),     desc: t('features.virtualHearings.description'),     color: '#F59E0B' },
        { icon: ShieldCheck, title: t('features.securePrivate.title'),       desc: t('features.securePrivate.description'),       color: '#EF4444' },
        { icon: Zap,         title: t('features.realTimeUpdates.title'),     desc: t('features.realTimeUpdates.description'),     color: '#8B5CF6' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', position: 'relative' }}>
            <Header />
            <AIChatbot />

            <main>
                {/* ── Hero ──────────────────────────────────────────── */}
                <section style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '9rem 2rem 4rem',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
                        backgroundImage: `
                            linear-gradient(rgba(124,92,255,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(124,92,255,0.04) 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px',
                    }} />
                    <div style={{
                        position: 'absolute', top: '-80px', right: '-80px',
                        width: '500px', height: '500px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(124,92,255,0.10) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: '0', left: '-100px',
                        width: '400px', height: '400px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(63,93,204,0.07) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />

                    <div style={{
                        maxWidth: '1320px', margin: '0 auto', width: '100%',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '4rem',
                        alignItems: 'center',
                        position: 'relative', zIndex: 1,
                    }} className="hero-grid">
                        {/* Left — text */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                        >
                            <h1 style={{
                                fontSize: 'clamp(2.6rem, 4.5vw, 4rem)',
                                fontWeight: '900',
                                color: 'var(--text-main)',
                                lineHeight: '1.1',
                                letterSpacing: '-0.04em',
                                fontFamily: 'var(--font-heading)',
                                marginBottom: '0.5rem',
                            }}>
                                {t('hero.title')}
                            </h1>
                            <h1 style={{
                                fontSize: 'clamp(2.6rem, 4.5vw, 4rem)',
                                fontWeight: '900',
                                lineHeight: '1.1',
                                letterSpacing: '-0.04em',
                                fontFamily: 'var(--font-heading)',
                                marginBottom: '1.75rem',
                                background: 'linear-gradient(135deg, #7C5CFF 0%, #3F5DCC 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>
                                {t('hero.titleHighlight')}
                            </h1>

                            <p style={{
                                fontSize: '1.1rem',
                                color: 'var(--text-secondary)',
                                lineHeight: '1.75',
                                marginBottom: '2.5rem',
                                maxWidth: '480px',
                            }}>
                                {t('hero.subtitle')}
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
                                <Link to="/signup" style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.9rem 2rem',
                                    background: 'var(--color-primary)',
                                    color: '#fff',
                                    textDecoration: 'none',
                                    borderRadius: '12px',
                                    fontWeight: '700',
                                    fontSize: '1rem',
                                    boxShadow: '0 4px 20px rgba(63,93,204,0.25)',
                                    transition: 'all 0.2s ease',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(63,93,204,0.35)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(63,93,204,0.25)'; }}
                                >
                                    {t('hero.getStartedFree')} <ArrowRight size={18} />
                                </Link>

                                <motion.button
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleInstall}
                                    title={t('hero.installApp')}
                                    style={{
                                        width: '48px', height: '48px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-medium)',
                                        background: 'var(--bg-surface)',
                                        color: 'var(--text-secondary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer',
                                        boxShadow: 'var(--shadow-sm)',
                                    }}
                                >
                                    <Smartphone size={20} />
                                </motion.button>
                            </div>

                            {/* Trust stats */}
                            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                {TRUST_STATS.map((s, i) => (
                                    <motion.div key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        <s.icon size={15} style={{ color: 'var(--color-accent)' }} />
                                        <span style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-main)' }}>{s.value}</span>
                                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{s.label}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right — scales image */}
                        <motion.div
                            initial={{ opacity: 0, x: 30, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
                        >
                            <div style={{
                                position: 'absolute',
                                width: '420px', height: '420px', borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(124,92,255,0.13) 0%, transparent 70%)',
                                filter: 'blur(40px)',
                                zIndex: 0,
                            }} />
                            <div className="hero-img-wrap">
                                <picture>
                                    <source
                                        type="image/webp"
                                        srcSet={heroImage.webpSrcSet}
                                        sizes="(max-width: 900px) 480px, min(50vw, 480px)"
                                    />
                                    <motion.img
                                        src={heroImage.fallbackSrc}
                                        srcSet={heroImage.fallbackSrcSet}
                                        sizes="(max-width: 900px) 480px, min(50vw, 480px)"
                                        alt="Scales of Justice"
                                        className="hero-img"
                                        width="720"
                                        height="720"
                                        loading="eager"
                                        fetchPriority="high"
                                        decoding="async"
                                        animate={{ y: [0, -14, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                        style={{
                                            width: '100%',
                                            maxWidth: '480px',
                                            height: 'auto',
                                            display: 'block',
                                            position: 'relative',
                                            zIndex: 1,
                                        }}
                                    />
                                </picture>
                            </div>
                        </motion.div>
                    </div>

                    {/* ── Quick cards strip ─────────────────────────── */}
                    <div style={{
                        maxWidth: '1320px',
                        margin: '4rem auto 0',
                        width: '100%',
                        position: 'relative',
                        zIndex: 1,
                        borderTop: '1px solid var(--border-light)',
                        borderBottom: '1px solid var(--border-light)',
                        padding: '1.75rem 0 0.5rem',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.9rem',
                            marginBottom: '1.25rem',
                            padding: '0 0.5rem',
                        }}>
                            <span style={{
                                fontSize: '0.72rem',
                                fontWeight: '800',
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                color: 'var(--text-muted)',
                                fontFamily: 'var(--font-mono)',
                            }}>
                                Procedural Flow
                            </span>
                            <div style={{
                                height: '1px',
                                flex: 1,
                                background: 'linear-gradient(90deg, var(--border-light), transparent)',
                            }} />
                        </div>

                        <div className="quick-cards-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                            gap: 0,
                        }}>
                            {QUICK_CARDS.map((card, i) => {
                                const CardIcon = card.icon;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.56 + i * 0.08, duration: 0.5, ease: 'easeOut' }}
                                        whileHover={{ y: -2 }}
                                        className="workflow-step"
                                        style={{
                                            padding: '1.35rem 1.5rem 1.45rem',
                                            minHeight: '214px',
                                            position: 'relative',
                                            borderLeft: i === 0 ? 'none' : '1px solid var(--border-light)',
                                            background: 'linear-gradient(180deg, rgba(255,255,255,0.02), transparent 100%)',
                                            transition: 'transform 0.2s ease, border-color 0.2s ease, background 0.2s ease',
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            marginBottom: '1.15rem',
                                        }}>
                                            <span style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: '0.86rem',
                                                letterSpacing: '0.2em',
                                                color: 'var(--text-muted)',
                                                lineHeight: 1,
                                            }}>
                                                {card.number}
                                            </span>
                                            <div style={{
                                                flex: 1,
                                                height: '1px',
                                                background: 'linear-gradient(90deg, rgba(255,255,255,0.16), transparent)',
                                            }} />
                                            <span style={{
                                                fontSize: '0.68rem',
                                                fontWeight: '700',
                                                letterSpacing: '0.16em',
                                                textTransform: 'uppercase',
                                                color: card.color,
                                            }}>
                                                {card.label}
                                            </span>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.65rem',
                                            marginBottom: '0.9rem',
                                        }}>
                                            <div style={{
                                                width: '1.65rem',
                                                height: '1.65rem',
                                                borderRadius: '50%',
                                                border: `1px solid ${card.accent}`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}>
                                                <CardIcon size={14} style={{ color: card.color }} />
                                            </div>
                                            <h3 style={{
                                                fontSize: '1.05rem',
                                                fontWeight: '800',
                                                color: 'var(--text-main)',
                                                letterSpacing: '-0.02em',
                                                margin: 0,
                                            }}>
                                                {card.title}
                                            </h3>
                                        </div>

                                        <p style={{
                                            fontSize: '0.92rem',
                                            color: 'var(--text-secondary)',
                                            lineHeight: '1.75',
                                            margin: 0,
                                            maxWidth: '26ch',
                                        }}>
                                            {card.desc}
                                        </p>

                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '0.75rem',
                                            marginTop: '1.4rem',
                                            paddingTop: '1rem',
                                            borderTop: '1px solid var(--border-light)',
                                        }}>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                letterSpacing: '0.14em',
                                                textTransform: 'uppercase',
                                                color: 'var(--text-muted)',
                                            }}>
                                                Step {card.number}
                                            </span>
                                            <Link to="/signup" style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                color: card.color,
                                                fontSize: '0.84rem',
                                                fontWeight: '800',
                                                letterSpacing: '0.04em',
                                                textDecoration: 'none',
                                            }}>
                                                {card.cta} <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ── How It Works ──────────────────────────────────── */}
                <HowItWorks />

                {/* ── Features ──────────────────────────────────────── */}
                <section id="features" style={{
                    padding: '7rem 2rem',
                    background: 'var(--bg-surface)',
                    borderTop: '1px solid var(--border-light)',
                    borderBottom: '1px solid var(--border-light)',
                }}>
                    <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                            <div style={{
                                display: 'inline-block', padding: '0.4rem 1rem', marginBottom: '1rem',
                                background: 'rgba(63,93,204,0.08)', border: '1px solid rgba(63,93,204,0.15)',
                                borderRadius: '2rem',
                            }}>
                                <span style={{ color: 'var(--color-accent)', fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                                    {t('features.badge')}
                                </span>
                            </div>
                            <h2 style={{ fontSize: 'clamp(1.9rem,3.5vw,2.6rem)', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem', letterSpacing: '-0.025em' }}>
                                {t('features.title')}{' '}
                                <span style={{ color: 'var(--color-secondary)' }}>{t('features.titleHighlight')}</span>
                            </h2>
                            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto' }}>
                                {t('features.subtitle')}
                            </p>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(260px, 360px) minmax(0, 1fr)',
                            gap: '2rem',
                            alignItems: 'stretch',
                        }} className="features-system-grid">
                            <div style={{
                                padding: '2rem',
                                border: '1px solid var(--border-light)',
                                borderRadius: '14px',
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                                position: 'relative',
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '1rem',
                                }}>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: '800',
                                        letterSpacing: '0.18em',
                                        textTransform: 'uppercase',
                                        color: 'var(--text-muted)',
                                        fontFamily: 'var(--font-mono)',
                                    }}>
                                        Platform Stack
                                    </span>
                                    <span style={{
                                        width: '34px',
                                        height: '1px',
                                        background: 'var(--border-light)',
                                    }} />
                                </div>

                                <h3 style={{
                                    fontSize: 'clamp(1.45rem, 2vw, 2rem)',
                                    fontWeight: '800',
                                    color: 'var(--text-main)',
                                    letterSpacing: '-0.03em',
                                    lineHeight: '1.15',
                                    margin: '0 0 1rem',
                                    maxWidth: '12ch',
                                }}>
                                    Structured tools for case intake, guidance, and follow-through.
                                </h3>

                                <p style={{
                                    margin: 0,
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.8',
                                    maxWidth: '30ch',
                                }}>
                                    A single legal workflow, organized as an operational system instead of disconnected marketing tiles.
                                </p>

                                <div style={{
                                    marginTop: '1.75rem',
                                    display: 'grid',
                                    gap: '0.9rem',
                                }}>
                                    {[
                                        'Case handling built for public service contexts',
                                        'Readable process cues and clear scanning order',
                                        'Reduced visual noise for higher trust and clarity',
                                    ].map((item, index) => (
                                        <div key={index} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            paddingTop: index === 0 ? 0 : '0.9rem',
                                            borderTop: index === 0 ? 'none' : '1px solid var(--border-light)',
                                        }}>
                                            <span style={{
                                                width: '0.45rem',
                                                height: '0.45rem',
                                                borderRadius: '50%',
                                                background: 'var(--color-secondary)',
                                                flexShrink: 0,
                                            }} />
                                            <span style={{
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.88rem',
                                                lineHeight: '1.6',
                                            }}>
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0 }}>
                                {FEATURES.map((f, i) => {
                                    const FeatureIcon = f.icon;
                                    const isLast = i === FEATURES.length - 1;
                                    return (
                                        <motion.div key={i}
                                            initial={{ opacity: 0, x: 18 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.06 }}
                                            whileHover={{ x: 4 }}
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '72px minmax(0, 1fr)',
                                                gap: '1rem',
                                                padding: '1.2rem 0',
                                                borderTop: i === 0 ? '1px solid var(--border-light)' : 'none',
                                                borderBottom: '1px solid var(--border-light)',
                                                alignItems: 'start',
                                                cursor: 'default',
                                            }}
                                        >
                                            <div style={{
                                                position: 'relative',
                                                minHeight: '100%',
                                                display: 'flex',
                                                justifyContent: 'center',
                                            }}>
                                                <div style={{
                                                    width: '34px',
                                                    height: '34px',
                                                    borderRadius: '50%',
                                                    border: `1px solid ${f.color}40`,
                                                    background: 'var(--bg-main)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    position: 'relative',
                                                    zIndex: 1,
                                                }}>
                                                    <FeatureIcon size={16} style={{ color: f.color }} />
                                                </div>
                                                {!isLast && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '34px',
                                                        bottom: '-1.2rem',
                                                        width: '1px',
                                                        background: 'linear-gradient(180deg, rgba(255,255,255,0.18), transparent)',
                                                    }} />
                                                )}
                                            </div>

                                            <div>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: '1rem',
                                                    marginBottom: '0.4rem',
                                                }}>
                                                    <h3 style={{
                                                        fontSize: '1.08rem',
                                                        fontWeight: '800',
                                                        color: 'var(--text-main)',
                                                        margin: 0,
                                                        letterSpacing: '-0.02em',
                                                    }}>
                                                        {f.title}
                                                    </h3>
                                                    <span style={{
                                                        fontSize: '0.68rem',
                                                        fontWeight: '800',
                                                        letterSpacing: '0.16em',
                                                        textTransform: 'uppercase',
                                                        color: f.color,
                                                        whiteSpace: 'nowrap',
                                                    }}>
                                                        {String(i + 1).padStart(2, '0')}
                                                    </span>
                                                </div>
                                                <p style={{
                                                    fontSize: '0.92rem',
                                                    color: 'var(--text-secondary)',
                                                    lineHeight: '1.75',
                                                    margin: 0,
                                                    maxWidth: '62ch',
                                                }}>
                                                    {f.desc}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                <TrustIndicators />
                <AchievementsSection />

                {/* ── Vision Preview ───────────────────────────────────── */}
                <section style={{
                    padding: '6rem 2rem',
                    background: 'var(--bg-surface)',
                    borderTop: '1px solid var(--border-light)',
                    borderBottom: '1px solid var(--border-light)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', top: '50%', right: '-5%', transform: 'translateY(-50%)',
                        width: '600px', height: '600px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(124,92,255,0.06) 0%, transparent 60%)',
                        pointerEvents: 'none', zIndex: 0
                    }} />
                    
                    <div style={{ maxWidth: '1320px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.4rem 1rem', marginBottom: '1rem',
                                background: 'rgba(124,92,255,0.08)', border: '1px solid rgba(124,92,255,0.15)',
                                borderRadius: '2rem',
                            }}>
                                <Star size={14} color="#7C5CFF" />
                                <span style={{ color: '#7C5CFF', fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                                    Nyay-GPT Vision
                                </span>
                            </div>
                            <h2 style={{ fontSize: 'clamp(1.9rem,3.5vw,2.6rem)', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem', letterSpacing: '-0.025em' }}>
                                The Next Generation of <br />
                                <span style={{ color: '#7C5CFF' }}>Multimodal Legal Intelligence</span>
                            </h2>
                            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto' }}>
                                We are actively developing a self-hosted, multimodal legal workspace designed to demolish cognitive barriers and forensic dimensional voids.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                            {[
                                { icon: Cpu, title: 'Conversational Workspace', desc: 'Dynamic split-screen analysis with generated artifacts.', color: '#7C5CFF' },
                                { icon: Cuboid, title: '3D Spatial Forensics', desc: 'Navigate photorealistic 3D reconstructions of accident scenes.', color: '#F59E0B' },
                                { icon: Video, title: 'Live Multimodal Streaming', desc: 'Real-time WebRTC streaming for immediate legal guidance.', color: '#EF4444' }
                            ].map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        whileHover={{ y: -5 }}
                                        style={{
                                            background: 'var(--bg-main)',
                                            border: '1px solid var(--border-light)',
                                            borderRadius: '20px',
                                            padding: '2.5rem 2rem',
                                            boxShadow: 'var(--shadow-sm)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            transition: 'border-color 0.25s ease, box-shadow 0.25s ease'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = item.color + '50'; e.currentTarget.style.boxShadow = `0 10px 30px ${item.color}15`; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                                    >
                                        <div style={{
                                            width: '60px', height: '60px', borderRadius: '16px',
                                            background: `${item.color}15`, border: `1px solid ${item.color}30`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            marginBottom: '1.5rem',
                                        }}>
                                            <Icon size={30} color={item.color} />
                                        </div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                                            {item.title}
                                        </h3>
                                        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
                                            {item.desc}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                            <Link to="/upcoming-features" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.8rem 1.8rem', background: 'transparent',
                                color: '#7C5CFF', border: '2px solid #7C5CFF',
                                borderRadius: '12px', fontWeight: '700', fontSize: '1rem',
                                textDecoration: 'none', transition: 'all 0.2s ease',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#7C5CFF'; e.currentTarget.style.color = '#FFF'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7C5CFF'; }}
                            >
                                Explore the Full Roadmap <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── Final CTA ─────────────────────────────────────── */}
                <section style={{ padding: '7rem 2rem', background: 'var(--bg-main)' }}>
                    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            style={{
                                padding: '4.5rem 3rem',
                                textAlign: 'center',
                                borderRadius: '24px',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-light)',
                                boxShadow: 'var(--shadow-glass)',
                            }}
                        >
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.4rem 1rem', marginBottom: '1.5rem',
                                background: 'rgba(63,93,204,0.08)', border: '1px solid rgba(63,93,204,0.15)',
                                borderRadius: '2rem',
                            }}>
                                <span style={{ color: 'var(--color-accent)', fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                                    {t('cta.badge')}
                                </span>
                            </div>
                            <h2 style={{ fontSize: 'clamp(1.75rem,3.5vw,2.5rem)', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem', letterSpacing: '-0.025em' }}>
                                {t('cta.title')}
                            </h2>
                            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', maxWidth: '560px', margin: '0 auto 0.75rem', lineHeight: '1.7' }}>
                                {t('cta.subtitle')}
                            </p>
                            <p style={{
                                fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '2rem',
                                padding: '0.4rem 0.9rem', display: 'inline-block',
                                background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '6px',
                            }}>
                                {t('cta.disclaimer')}
                            </p>
                            <div style={{ display: 'block' }}>
                                <Link to="/signup" style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.9rem 2.5rem',
                                    background: 'var(--color-primary)', color: '#fff',
                                    textDecoration: 'none', borderRadius: '12px',
                                    fontWeight: '700', fontSize: '1rem',
                                    boxShadow: '0 4px 20px rgba(63,93,204,0.25)',
                                    transition: 'all 0.2s ease',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    {t('cta.createAccount')} <ArrowRight size={18} />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

            <Footer />

            <style>{`
                .hero-img-wrap {
                    position: relative;
                    z-index: 1;
                    -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 45%, transparent 100%);
                    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 45%, transparent 100%);
                }
                .hero-img { border-radius: 0; }
                @media (max-width: 900px) {
                    .hero-grid { grid-template-columns: 1fr !important; }
                    .hero-grid > div:last-child { display: none; }
                    .quick-cards-grid { grid-template-columns: 1fr !important; }
                    .workflow-step { border-left: 0 !important; border-top: 1px solid var(--border-light); }
                    .workflow-step:first-child { border-top: 0; }
                    .features-system-grid { grid-template-columns: 1fr !important; }
                    .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 600px) {
                    .quick-cards-grid { grid-template-columns: 1fr !important; }
                    .features-grid { grid-template-columns: 1fr !important; }
                    .features-system-grid { gap: 1.25rem !important; }
                    .features-system-grid > div:first-child { padding: 1.5rem !important; }
                    .features-grid > div { grid-template-columns: 56px minmax(0, 1fr) !important; gap: 0.85rem !important; }
                    .workflow-step { padding: 1.1rem 0.5rem 1.25rem !important; min-height: unset !important; }
                }
            `}</style>
        </div>
    );
}
