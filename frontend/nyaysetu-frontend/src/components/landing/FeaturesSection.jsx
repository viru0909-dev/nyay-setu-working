import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Bot, BookOpen, FileText, Video, ShieldCheck, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FeatureCard = ({ f, i, isGuest }) => {
    const { t } = useTranslation('landing');
    const cardRef = useRef(null);
    const spotlightRef = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);

        // Update spotlight position
        if (spotlightRef.current) {
            spotlightRef.current.style.background = `radial-gradient(circle 250px at ${mouseX}px ${mouseY}px, ${f.color}25, transparent 70%)`;
            spotlightRef.current.style.opacity = '1';
        }
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        if (spotlightRef.current) {
            spotlightRef.current.style.opacity = '0';
        }
    };

    const FeatureIcon = f.icon;

    return (
        <motion.div
            className="feature-card-gsap"
            ref={cardRef}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileHover={{ scale: 1.02 }}
        >
            <div
                className="feature-card-inner"
                style={{
                    padding: '2.5rem',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transform: "translateZ(40px)",
                    boxShadow: `0 15px 35px ${f.color}15, inset 0 0 0 1px ${f.color}20`,
                    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                }}
            >
                {/* Spotlight / Lighting overlay — follows cursor */}
                <div
                    ref={spotlightRef}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        zIndex: 0,
                        pointerEvents: 'none',
                        borderRadius: '24px',
                        transition: 'opacity 0.3s ease',
                    }}
                />

                {/* Glowing background blob */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '180px',
                    height: '180px',
                    background: f.color,
                    filter: 'blur(80px)',
                    opacity: 0.08,
                    zIndex: 0,
                    pointerEvents: 'none',
                    transition: 'opacity 0.4s ease, transform 0.4s ease'
                }} className="card-glow" />

                {/* Border glow line on top */}
                <div className="card-border-glow" style={{
                    position: 'absolute',
                    top: 0,
                    left: '10%',
                    right: '10%',
                    height: '1px',
                    background: `linear-gradient(90deg, transparent, ${f.color}60, transparent)`,
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                    zIndex: 2,
                }} />

                <div style={{
                    width: '64px', height: '64px', borderRadius: '18px',
                    background: `linear-gradient(135deg, ${f.color}20 0%, ${f.color}05 100%)`,
                    border: `1px solid ${f.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1.75rem',
                    position: 'relative', zIndex: 1,
                    transform: "translateZ(30px)",
                    boxShadow: `0 8px 20px ${f.color}10`,
                    transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
                }} className="card-icon-wrap">
                    <FeatureIcon size={32} style={{ color: f.color }} />
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        marginBottom: '1.25rem',
                        position: 'relative', zIndex: 1,
                        transform: "translateZ(20px)",
                    }}
                >
                    <h3
                        style={{
                            fontSize: '1.35rem',
                            fontWeight: '800',
                            color: 'var(--text-main)',
                            margin: 0,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        {f.title}
                    </h3>
                    {isGuest && (
                        f.title === t('features.fileCases.title') ||
                        f.title === t('features.virtualHearings.title')
                    ) && (
                            <span
                                style={{
                                    padding: '0.3rem 0.6rem',
                                    borderRadius: '999px',
                                    fontSize: '0.7rem',
                                    fontWeight: '700',
                                    background: 'rgba(245,158,11,0.10)',
                                    border: '1px solid rgba(245,158,11,0.18)',
                                    color: '#f59e0b',
                                    letterSpacing: '0.02em',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Account Required
                            </span>
                        )}
                </div>
                <p style={{
                    fontSize: '1rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.7',
                    margin: 0,
                    position: 'relative', zIndex: 1,
                    transform: "translateZ(10px)",
                }}>
                    {f.desc}
                </p>
            </div>
        </motion.div>
    );
};

export default function FeaturesSection({ isGuest }) {
    const { t } = useTranslation('landing');
    const sectionRef = useRef(null);

    const FEATURES = [
        { icon: Bot, title: t('features.aiLegalAssistant.title'), desc: t('features.aiLegalAssistant.description'), color: '#3F5DCC' },
        { icon: BookOpen, title: t('features.constitutionReader.title'), desc: t('features.constitutionReader.description'), color: '#7C5CFF' },
        { icon: FileText, title: t('features.fileCases.title'), desc: t('features.fileCases.description'), color: '#10B981' },
        { icon: Video, title: t('features.virtualHearings.title'), desc: t('features.virtualHearings.description'), color: '#F59E0B' },
        { icon: ShieldCheck, title: t('features.securePrivate.title'), desc: t('features.securePrivate.description'), color: '#EF4444' },
        { icon: Zap, title: t('features.realTimeUpdates.title'), desc: t('features.realTimeUpdates.description'), color: '#8B5CF6' },
    ];

    useEffect(() => {
        let ctx = gsap.context(() => {
            // Animate heading
            gsap.fromTo('.features-header',
                { y: 60, opacity: 0 },
                {
                    y: 0, opacity: 1,
                    duration: 1.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: '.features-header',
                        start: "top 85%",
                    }
                }
            );

            // Animate cards with a staggering 3D pop effect
            gsap.fromTo('.feature-card-gsap',
                {
                    y: 120,
                    opacity: 0,
                    rotationX: -30,
                    scale: 0.85
                },
                {
                    y: 0,
                    opacity: 1,
                    rotationX: 0,
                    scale: 1,
                    duration: 1.4,
                    stagger: 0.15,
                    ease: "expo.out",
                    scrollTrigger: {
                        trigger: '.features-grid-container',
                        start: "top 80%",
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section id="features" ref={sectionRef} style={{
            padding: '9rem 2rem',
            background: 'var(--bg-surface)',
            position: 'relative',
            overflow: 'hidden',
            borderTop: '1px solid var(--border-light)',
            borderBottom: '1px solid var(--border-light)',
        }}>
            {/* Dynamic Animated Background elements */}
            <div style={{
                position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', zIndex: 0,
                backgroundImage: 'radial-gradient(circle at 15% 40%, rgba(63,93,204,0.04) 0%, transparent 60%), radial-gradient(circle at 85% 60%, rgba(124,92,255,0.04) 0%, transparent 60%)',
                pointerEvents: 'none'
            }} />

            <div style={{ maxWidth: '1320px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <div className="features-header" style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <div style={{
                        display: 'inline-block', padding: '0.6rem 1.4rem', marginBottom: '1.5rem',
                        background: 'rgba(63,93,204,0.06)', border: '1px solid rgba(63,93,204,0.15)',
                        borderRadius: '2rem',
                        backdropFilter: 'blur(10px)',
                    }}>
                        <span style={{ color: 'var(--color-accent)', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                            {t('features.badge')}
                        </span>
                    </div>
                    <h2 style={{ fontSize: 'clamp(2.5rem, 4.5vw, 3.8rem)', fontWeight: '900', color: 'var(--text-main)', marginBottom: '1.5rem', letterSpacing: '-0.03em', lineHeight: '1.15' }}>
                        {t('features.title')}{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #7C5CFF 0%, #3F5DCC 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            display: 'inline-block'
                        }}>{t('features.titleHighlight')}</span>
                    </h2>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto', lineHeight: '1.8' }}>
                        {t('features.subtitle')}
                    </p>
                </div>

                <div className="features-grid-container" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                    gap: '2.5rem',
                    perspective: '1500px'
                }}>
                    {FEATURES.map((f, i) => (
                        <FeatureCard key={i} f={f} i={i} isGuest={isGuest} />
                    ))}
                </div>
            </div>

            <style>{`
                .feature-card-gsap {
                    cursor: pointer;
                }
                .feature-card-gsap:hover .card-glow {
                    opacity: 0.35 !important;
                    transform: scale(1.4);
                }
                .feature-card-gsap:hover .card-border-glow {
                    opacity: 1 !important;
                }
                .feature-card-gsap:hover .feature-card-inner {
                    border-color: rgba(124,92,255,0.25) !important;
                    box-shadow: 0 20px 60px rgba(124,92,255,0.12), 0 0 40px rgba(124,92,255,0.06), inset 0 1px 0 rgba(255,255,255,0.06) !important;
                }
                .feature-card-gsap:hover .card-icon-wrap {
                    box-shadow: 0 0 30px currentColor !important;
                }
                @media (max-width: 900px) {
                    .features-grid-container {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
                @media (max-width: 600px) {
                    .features-grid-container {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </section>
    );
}
