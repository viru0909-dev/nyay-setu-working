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
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e293b 100%)'
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
                    padding: '6rem 2rem 4rem',
                    textAlign: 'center'
                }}>
                    <div className="container" style={{ maxWidth: '1200px' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div style={{
                                display: 'inline-block',
                                padding: '0.5rem 1.5rem',
                                background: 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '2rem',
                                marginBottom: '2rem'
                            }}>
                                <span style={{ color: '#8b5cf6', fontSize: '0.95rem', fontWeight: '600' }}>
                                    ⚡ {t('aboutHeroTag')}
                                </span>
                            </div>

                            <h1 style={{
                                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                                fontWeight: '900',
                                color: 'white',
                                marginBottom: '1.5rem',
                                lineHeight: '1.1'
                            }}>
                                {t('heroTitle')}{' '}
                                <span style={{
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    {t('heroTitleHighlight')}
                                </span>
                            </h1>

                            <p style={{
                                fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
                                color: '#94a3b8',
                                maxWidth: '800px',
                                margin: '0 auto 3rem',
                                lineHeight: '1.6'
                            }}>
                                {t('heroSubtitle')}
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Link to="/signup" style={{
                                    padding: '1rem 2.5rem',
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '0.75rem',
                                    fontWeight: '700',
                                    fontSize: '1.125rem',
                                    boxShadow: '0 8px 30px rgba(139, 92, 246, 0.4)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.3s'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.6)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.4)';
                                    }}>
                                    {t('getStartedFree')} <ArrowRight size={20} />
                                </Link>

                                <a href="#features" style={{
                                    padding: '1rem 2.5rem',
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    color: '#8b5cf6',
                                    textDecoration: 'none',
                                    border: '2px solid rgba(139, 92, 246, 0.3)',
                                    borderRadius: '0.75rem',
                                    fontWeight: '700',
                                    fontSize: '1.125rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.3s'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}>
                                    {t('watchDemo')}
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Stats Section */}
                <section style={{ padding: '4rem 2rem', background: 'rgba(15, 23, 42, 0.5)' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '2rem'
                        }}>
                            {stats.map((stat, idx) => (
                                <div key={idx} style={{ textAlign: 'center' }}>
                                    <div style={{
                                        fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                                        fontWeight: '900',
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {stat.number}
                                    </div>
                                    <div style={{ color: '#94a3b8', fontSize: '1.125rem', fontWeight: '600' }}>
                                        {stat.label}
                                    </div>
                                </div>
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
                                color: 'white',
                                marginBottom: '1rem'
                            }}>
                                {t('featuresTitle')}{' '}
                                <span style={{
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    {t('featuresTitleHighlight')}
                                </span>
                            </h2>
                            <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
                                {t('featuresSubtitle')}
                            </p>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '2rem'
                        }}>
                            {features.map((feature, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        padding: '2rem',
                                        background: 'rgba(30, 41, 59, 0.6)',
                                        backdropFilter: 'blur(20px)',
                                        borderRadius: '1.5rem',
                                        border: '1px solid rgba(139, 92, 246, 0.2)',
                                        transition: 'all 0.3s',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-8px)';
                                        e.currentTarget.style.borderColor = feature.color;
                                        e.currentTarget.style.boxShadow = `0 20px 40px ${feature.color}30`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                                        e.currentTarget.style.boxShadow = 'none';
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
                                    <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                                        {feature.title}
                                    </h3>
                                    <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6' }}>
                                        {feature.description}
                                    </p>
                                </div>
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
                    padding: '6rem 2rem',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)'
                }}>
                    <div className="container" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                        <h2 style={{
                            fontSize: 'clamp(2rem, 4vw, 3rem)',
                            fontWeight: '900',
                            color: 'white',
                            marginBottom: '1.5rem'
                        }}>
                            {t('ctaTitle')}
                        </h2>
                        <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '2.5rem' }}>
                            {t('ctaSubtitle')}
                        </p>
                        <Link to="/signup" style={{
                            padding: '1.25rem 3rem',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '0.75rem',
                            fontWeight: '700',
                            fontSize: '1.25rem',
                            boxShadow: '0 8px 30px rgba(139, 92, 246, 0.4)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            {t('createAccount')} <ArrowRight size={24} />
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
