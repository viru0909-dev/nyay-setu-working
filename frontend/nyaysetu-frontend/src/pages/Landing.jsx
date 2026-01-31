import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Bot, BookOpen, FileText, Video, Shield, Zap,
    ArrowRight
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Temporarily comment out problematic components
// import AnimatedBackground from '../components/landing/AnimatedBackground';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import AIChatbot from '../components/landing/AIChatbot';
import NewsSection from '../components/landing/NewsSection';
import HowItWorks from '../components/landing/HowItWorks';
import TrustIndicators from '../components/landing/TrustIndicators';

export default function Landing() {
    const { t } = useLanguage();

    const features = [
        {
            icon: <Bot size={32} />,
            title: t('aiLegalAssistant'),
            description: t('aiLegalAssistantDesc'),
            color: '#1E2A44'
        },
        {
            icon: <BookOpen size={32} />,
            title: t('constitutionReader'),
            description: t('constitutionReaderDesc'),
            color: '#1E2A44'
        },
        {
            icon: <FileText size={32} />,
            title: t('fileCases'),
            description: t('fileCasesDesc'),
            color: '#1E2A44'
        },
        {
            icon: <Video size={32} />,
            title: t('virtualHearings'),
            description: t('virtualHearingsDesc'),
            color: '#1E2A44'
        },
        {
            icon: <Shield size={32} />,
            title: t('securePrivate'),
            description: t('securePrivateDesc'),
            color: '#1E2A44'
        },
        {
            icon: <Zap size={32} />,
            title: t('realTimeUpdates'),
            description: t('realTimeUpdatesDesc'),
            color: '#1E2A44'
        }
    ];

    const stats = [
        { number: '10K+', label: t('casesFiled') },
        { number: '50K+', label: t('activeUsers') },
        { number: '99%', label: t('successRate') },
        { number: '24/7', label: t('aiSupport') }
    ];

    return (
        <div style={{
            position: 'relative',
            minHeight: '100vh',
            background: 'var(--bg-main)',
        }}>
            {/* Temporarily comment out 3D background */}
            {/* <AnimatedBackground /> */}
            <Header />
            <AIChatbot />

            <main style={{ position: 'relative', zIndex: 1 }}>
                {/* Hero Section */}
                <section id="home" style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8rem 2rem 4rem',
                    textAlign: 'center'
                }}>
                    <div className="container" style={{ maxWidth: '1400px', width: '100%' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            style={{
                                maxWidth: '1200px',
                                margin: '0 auto'
                            }}
                        >
                            <div style={{
                                display: 'inline-block',
                                padding: '0.5rem 1.25rem',
                                background: 'rgba(63, 93, 204, 0.08)',
                                border: '1px solid rgba(63, 93, 204, 0.15)',
                                borderRadius: '2rem',
                                marginBottom: '2.5rem'
                            }}>
                                <span style={{ color: 'var(--color-secondary)', fontSize: '0.875rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                    {t('aboutHeroTag')}
                                </span>
                            </div>

                            <h1 style={{
                                fontSize: 'clamp(2.5rem, 5vw, 4.25rem)',
                                fontWeight: '800',
                                color: 'var(--color-primary)',
                                marginBottom: '1.5rem',
                                lineHeight: '1.15',
                                letterSpacing: '-0.03em'
                            }}>
                                {t('heroTitle')}{' '}
                                <span style={{
                                    background: 'linear-gradient(135deg, #3F5DCC 0%, #7C5CFF 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}>
                                    {t('heroTitleHighlight')}
                                </span>
                            </h1>

                            <p style={{
                                fontSize: 'clamp(1.1rem, 2vw, 1.25rem)',
                                color: 'var(--text-secondary)',
                                maxWidth: '750px',
                                margin: '0 auto 3.5rem',
                                lineHeight: '1.7'
                            }}>
                                {t('heroSubtitle')}
                            </p>

                            <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Link to="/signup" className="btn btn-primary" style={{
                                    fontSize: '1.1rem',
                                    padding: '1.1rem 2.75rem',
                                    borderRadius: '12px',
                                    textDecoration: 'none'
                                }}>
                                    {t('getStartedFree')} <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                                </Link>

                                <motion.a
                                    href="#features"
                                    className="btn btn-secondary"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    style={{
                                        fontSize: '1.1rem',
                                        padding: '1.1rem 2.75rem',
                                        borderRadius: '12px',
                                        textDecoration: 'none'
                                    }}
                                >
                                    {t('watchDemo')}
                                </motion.a>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Stats Section */}
                {/* Stats Section */}
                <section style={{ padding: '0 2rem 6rem' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '2rem'
                        }}>
                            {stats.map((stat, idx) => (
                                <motion.div
                                    key={idx}
                                    className="card"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                                    style={{
                                        textAlign: 'center',
                                        padding: '2.5rem 2rem',
                                        background: '#FFFFFF',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '16px'
                                    }}
                                >
                                    <div style={{
                                        fontSize: 'clamp(2.25rem, 4vw, 3rem)',
                                        fontWeight: '800',
                                        color: 'var(--color-primary)',
                                        marginBottom: '0.5rem',
                                        letterSpacing: '-0.02em',
                                        lineHeight: 1
                                    }}>
                                        {stat.number}
                                    </div>
                                    <div style={{
                                        color: 'var(--text-secondary)',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        {stat.label}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <HowItWorks />

                {/* Features Section */}
                <section id="features" style={{ padding: '8rem 2rem', background: '#FFFFFF', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                            <h2 style={{
                                fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                                fontWeight: '800',
                                color: 'var(--color-primary)',
                                marginBottom: '1.25rem',
                                letterSpacing: '-0.02em'
                            }}>
                                {t('featuresTitle')}{' '}
                                <span style={{ color: 'var(--color-secondary)' }}>
                                    {t('featuresTitleHighlight')}
                                </span>
                            </h2>
                            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', lineHeight: '1.7' }}>
                                {t('featuresSubtitle')}
                            </p>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                            gap: '2.5rem'
                        }}>
                            {features.map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    className="card"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -5, borderColor: 'var(--color-secondary)' }}
                                    style={{
                                        padding: '2.5rem',
                                        cursor: 'pointer',
                                        background: '#FFFFFF',
                                        border: '1px solid #E5E7EB',
                                        transition: 'all 0.3s ease-out'
                                    }}
                                >
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '12px',
                                        background: 'rgba(63, 93, 204, 0.08)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '1.75rem',
                                        color: 'var(--color-secondary)'
                                    }}>
                                        {feature.icon}
                                    </div>
                                    <h3 style={{ color: 'var(--color-primary)', fontSize: '1.35rem', fontWeight: '700', marginBottom: '1rem' }}>
                                        {feature.title}
                                    </h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.7', marginBottom: 0 }}>
                                        {feature.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Trust Indicators */}
                <TrustIndicators />

                {/* News Section */}
                <NewsSection />

                {/* CTA Section */}
                <section style={{
                    padding: '8rem 2rem',
                    background: 'var(--bg-main)'
                }}>
                    <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
                        <div className="card" style={{
                            padding: '5rem 3rem',
                            textAlign: 'center',
                            borderRadius: '24px',
                            background: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            boxShadow: '0 10px 40px rgba(30, 42, 68, 0.04)'
                        }}>
                            <h2 style={{
                                fontSize: 'clamp(2rem, 4vw, 3rem)',
                                fontWeight: '800',
                                color: 'var(--color-primary)',
                                marginBottom: '1.5rem',
                                letterSpacing: '-0.02em'
                            }}>
                                {t('ctaTitle')}
                            </h2>
                            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '700px', margin: '0 auto 3rem' }}>
                                {t('ctaSubtitle')}
                            </p>
                            <Link to="/signup" className="btn btn-primary" style={{
                                textDecoration: 'none',
                                fontSize: '1.15rem',
                                padding: '1.1rem 3rem',
                                borderRadius: '12px'
                            }}>
                                {t('createAccount')} <ArrowRight size={22} style={{ marginLeft: '0.75rem' }} />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
