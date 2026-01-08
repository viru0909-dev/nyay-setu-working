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
            color: '#8b5cf6'
        },
        {
            icon: <BookOpen size={32} />,
            title: t('constitutionReader'),
            description: t('constitutionReaderDesc'),
            color: '#6366f1'
        },
        {
            icon: <FileText size={32} />,
            title: t('fileCases'),
            description: t('fileCasesDesc'),
            color: '#ec4899'
        },
        {
            icon: <Video size={32} />,
            title: t('virtualHearings'),
            description: t('virtualHearingsDesc'),
            color: '#10b981'
        },
        {
            icon: <Shield size={32} />,
            title: t('securePrivate'),
            description: t('securePrivateDesc'),
            color: '#f59e0b'
        },
        {
            icon: <Zap size={32} />,
            title: t('realTimeUpdates'),
            description: t('realTimeUpdatesDesc'),
            color: '#3b82f6'
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
                    minHeight: 'calc(100vh - 80px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <div className="container" style={{ maxWidth: '1200px', width: '100%' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            style={{
                                background: 'var(--bg-glass-strong)',
                                backdropFilter: 'var(--glass-blur)',
                                WebkitBackdropFilter: 'var(--glass-blur)',
                                borderRadius: '32px',
                                border: 'var(--border-glass-strong)',
                                boxShadow: 'var(--shadow-glass)',
                                padding: '4rem 2rem',
                                maxWidth: '1000px',
                                margin: '0 auto'
                            }}
                        >
                            <div style={{
                                display: 'inline-block',
                                padding: '0.5rem 1.5rem',
                                background: 'rgba(37, 99, 235, 0.1)',
                                border: '1px solid rgba(37, 99, 235, 0.2)',
                                borderRadius: '2rem',
                                marginBottom: '2rem'
                            }}>
                                <span style={{ color: 'var(--color-accent)', fontSize: '0.95rem', fontWeight: '600' }}>
                                    ⚡ {t('aboutHeroTag')}
                                </span>
                            </div>

                            <h1 style={{
                                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                                fontWeight: '900',
                                color: 'var(--text-main)',
                                marginBottom: '1.5rem',
                                lineHeight: '1.1'
                            }}>
                                {t('heroTitle')}{' '}
                                <span style={{
                                    background: 'linear-gradient(135deg, var(--color-accent) 0%, #ec4899 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    {t('heroTitleHighlight')}
                                </span>
                            </h1>

                            <p style={{
                                fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
                                color: 'var(--text-secondary)',
                                maxWidth: '800px',
                                margin: '0 auto 3rem',
                                lineHeight: '1.6'
                            }}>
                                {t('heroSubtitle')}
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Link to="/signup" className="btn btn-primary btn-lg" style={{
                                    textDecoration: 'none',
                                    fontSize: '1.125rem',
                                    padding: '1rem 2.5rem'
                                }}>
                                    {t('getStartedFree')} <ArrowRight size={20} />
                                </Link>

                                <a href="#features" className="btn" style={{
                                    background: 'var(--bg-glass)',
                                    color: 'var(--color-accent)',
                                    border: 'var(--border-glass-strong)',
                                    fontSize: '1.125rem',
                                    padding: '1rem 2.5rem',
                                    textDecoration: 'none',
                                    fontWeight: '700',
                                    borderRadius: '0.75rem'
                                }}>
                                    {t('watchDemo')}
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Stats Section */}
                {/* Stats Section - Floating Glass Cards */}
                <section style={{ padding: '0 2rem 4rem' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '2rem'
                        }}>
                            {stats.map((stat, idx) => (
                                <motion.div
                                    key={idx}
                                    className="card"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    style={{
                                        textAlign: 'center',
                                        padding: '2rem'
                                    }}
                                >
                                    <div style={{
                                        fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                                        fontWeight: '900',
                                        background: 'linear-gradient(135deg, var(--color-accent) 0%, #ec4899 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {stat.number}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', fontWeight: '600' }}>
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
                <section id="features" style={{ padding: '6rem 2rem' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                            <h2 style={{
                                fontSize: 'clamp(2rem, 4vw, 3rem)',
                                fontWeight: '900',
                                color: 'var(--text-main)',
                                marginBottom: '1rem'
                            }}>
                                {t('featuresTitle')}{' '}
                                <span style={{
                                    background: 'linear-gradient(135deg, var(--color-accent) 0%, #6366f1 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    {t('featuresTitleHighlight')}
                                </span>
                            </h2>
                            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                                {t('featuresSubtitle')}
                            </p>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '2rem'
                        }}>
                            {features.map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    className="card"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -8 }}
                                    style={{
                                        padding: '2rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '1rem',
                                        background: `${feature.color}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '1.5rem',
                                        color: feature.color
                                    }}>
                                        {feature.icon}
                                    </div>
                                    <h3 style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                                        {feature.title}
                                    </h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>
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
                {/* CTA Section */}
                <section style={{
                    padding: '6rem 2rem',
                    marginBottom: '4rem'
                }}>
                    <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <div className="card" style={{
                            padding: '4rem 2rem',
                            textAlign: 'center',
                            borderRadius: '32px',
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)'
                        }}>
                            <h2 style={{
                                fontSize: 'clamp(2rem, 4vw, 3rem)',
                                fontWeight: '900',
                                color: 'var(--text-main)',
                                marginBottom: '1.5rem'
                            }}>
                                {t('ctaTitle')}
                            </h2>
                            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
                                {t('ctaSubtitle')}
                            </p>
                            <Link to="/signup" className="btn btn-primary btn-lg" style={{
                                textDecoration: 'none',
                                fontSize: '1.25rem'
                            }}>
                                {t('createAccount')} <ArrowRight size={24} />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
