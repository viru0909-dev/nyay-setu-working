import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Scale, ArrowRight, Brain, Shield, Code2, Database,
    Github, Linkedin, Target, Award, Sparkles, ExternalLink,
    CheckCircle2, Clock, Wifi, Globe, Mic
} from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import { useLanguage } from '../contexts/LanguageContext';

const techStack = [
    { icon: Code2, name: 'React + Spring Boot', color: '#61dafb' },
    { icon: Brain, name: 'Groq LPU AI', color: '#8b5cf6' },
    { icon: Shield, name: 'Blockchain Evidence', color: '#10b981' },
    { icon: Database, name: 'PostgreSQL', color: '#336791' }
];

const roadmapPhases = [
    {
        phase: 'Phase 1',
        title: 'Current Release',
        status: 'live',
        color: '#10b981',
        items: [
            'Vakil-Friend AI Assistant (Groq LPU)',
            'Blockchain Evidence Vault (SHA-256)',
            'Virtual Courtroom & Hearings',
            'Multi-role Dashboard'
        ]
    },
    {
        phase: 'Phase 2',
        title: 'Indigenous AI',
        status: 'in-progress',
        color: '#f59e0b',
        items: [
            'OpenNyAI Legal NER Integration',
            'Bhashini Translation (22 Languages)',
            'Voice Input for Rural Users',
            'Section 63(4) Certificate Generator'
        ]
    },
    {
        phase: 'Phase 3',
        title: 'National Scale',
        status: 'planned',
        color: '#8b5cf6',
        items: [
            'Offline-First PWA Architecture',
            'ISO 27037 Compliance',
            'e-Courts Phase III Integration',
            'MeghRaj Sovereign Cloud'
        ]
    },
];

export default function About() {
    const { t } = useLanguage();
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
            <Header />

            {/* Hero Section */}
            <section style={{
                padding: '10rem 2rem 6rem',
                textAlign: 'center',
                background: '#FFFFFF',
                borderBottom: '1px solid #E5E7EB'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ maxWidth: '1100px', margin: '0 auto' }}
                >
                    <span style={{
                        display: 'inline-block',
                        padding: '0.4rem 1rem',
                        background: 'rgba(63, 93, 204, 0.08)',
                        border: '1px solid rgba(63, 93, 204, 0.15)',
                        borderRadius: '2rem',
                        color: 'var(--color-secondary)',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '2rem'
                    }}>
                        {t('aboutHeroTag')}
                    </span>

                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                        fontWeight: '800',
                        color: 'var(--color-primary)',
                        marginBottom: '1.5rem',
                        lineHeight: '1.2',
                        letterSpacing: '-0.02em'
                    }}>
                        Building India's{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #3F5DCC, #7C5CFF)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            Sovereign Legal-Tech
                        </span>
                        {' '}Infrastructure
                    </h1>

                    <p style={{
                        fontSize: '1.15rem',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.7',
                        maxWidth: '750px',
                        margin: '0 auto'
                    }}>
                        NyaySetu combines AI intelligence with blockchain integrity to modernize
                        India's judicial system — aligned with the e-Courts Phase III mandate.
                    </p>
                </motion.div>
            </section>

            {/* Founder Section */}
            <section style={{ padding: '4rem 2rem' }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '4rem',
                    alignItems: 'center'
                }}>
                    {/* Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        style={{
                            background: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '2rem',
                            padding: '3rem',
                            textAlign: 'center',
                            boxShadow: '0 4px 20px rgba(30, 42, 68, 0.05)',
                            position: 'relative'
                        }}
                    >
                        {/* Profile Image with LinkedIn Hover */}
                        <a
                            href="https://www.linkedin.com/in/virendra-gadekar-8b47252a1/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'block',
                                width: '180px',
                                height: '180px',
                                margin: '0 auto 2rem',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #3F5DCC, #7C5CFF)',
                                padding: '4px',
                                boxShadow: '0 20px 40px rgba(63, 93, 204, 0.15)',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'transform 0.3s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.querySelector('.linkedin-badge').style.opacity = '1';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.querySelector('.linkedin-badge').style.opacity = '0';
                            }}
                        >
                            <img
                                src="/assets/profile/founder.jpg"
                                alt="Virendra Gadekar"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                }}
                            />
                            {/* LinkedIn Badge */}
                            <div
                                className="linkedin-badge"
                                style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    right: '0',
                                    background: '#0077b5',
                                    borderRadius: '50%',
                                    width: '48px',
                                    height: '48px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '3px solid white',
                                    opacity: '0',
                                    transition: 'opacity 0.3s'
                                }}
                            >
                                <Linkedin size={24} color="white" />
                            </div>
                        </a>

                        <h3 style={{
                            fontSize: '1.75rem',
                            fontWeight: '800',
                            color: 'var(--color-primary)',
                            marginBottom: '0.5rem'
                        }}>
                            Virendra Gadekar
                        </h3>

                        <p style={{
                            color: 'var(--color-secondary)',
                            fontWeight: '700',
                            marginBottom: '1.5rem'
                        }}>
                            Founder & Lead Developer
                        </p>

                        <p style={{
                            color: 'var(--text-secondary)',
                            lineHeight: '1.7'
                        }}>
                            Passionate about democratizing access to justice through
                            AI innovation and blockchain integrity.
                        </p>

                        {/* GitHub Link */}
                        <a
                            href="https://github.com/viru0909-dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginTop: '1.5rem',
                                padding: '0.75rem 1.5rem',
                                background: 'var(--bg-glass-strong)',
                                border: 'var(--border-glass)',
                                borderRadius: '0.75rem',
                                color: 'var(--text-main)',
                                textDecoration: 'none',
                                fontWeight: '600',
                                transition: 'all 0.3s'
                            }}
                        >
                            <Github size={20} /> GitHub Profile
                        </a>
                    </motion.div>

                    {/* Vision & Tech Stack */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div style={{ marginBottom: '2rem' }}>
                            <Target size={40} style={{ color: 'var(--color-secondary)', marginBottom: '1rem' }} />
                            <h2 style={{
                                fontSize: '2rem',
                                fontWeight: '800',
                                color: 'var(--color-primary)',
                                marginBottom: '1rem'
                            }}>
                                Our Vision
                            </h2>
                            <p style={{
                                color: 'var(--text-secondary)',
                                lineHeight: '1.8',
                                fontSize: '1.1rem'
                            }}>
                                To create a future where justice is not delayed, where legal rights are
                                universally understood, and where technology empowers citizens to navigate
                                the judicial system with confidence.
                            </p>
                        </div>

                        {/* Tech Stack */}
                        <h4 style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem',
                            marginBottom: '1rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }}>
                            Powered By
                        </h4>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '1rem'
                        }}>
                            {techStack.map((tech, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '1rem',
                                        background: 'var(--bg-glass)',
                                        borderRadius: '0.75rem',
                                        border: 'var(--border-glass)'
                                    }}
                                >
                                    <tech.icon size={24} style={{ color: tech.color }} />
                                    <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>
                                        {tech.name}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Development Roadmap */}
            <section style={{ padding: '6rem 2rem', background: '#FFFFFF', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ textAlign: 'center', marginBottom: '4rem' }}
                    >
                        <h2 style={{
                            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                            fontWeight: '800',
                            color: 'var(--color-primary)',
                            marginBottom: '1rem',
                            letterSpacing: '-0.02em'
                        }}>
                            Development Roadmap
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                            Our journey to building India's sovereign legal-tech platform
                        </p>
                    </motion.div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem'
                    }}>
                        {roadmapPhases.map((phase, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15 }}
                                style={{
                                    background: 'var(--bg-glass)',
                                    border: 'var(--border-glass)',
                                    borderRadius: '1.5rem',
                                    padding: '2rem',
                                    boxShadow: 'var(--shadow-glass)'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '1rem'
                                }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        background: `${phase.color}15`,
                                        borderRadius: '0.5rem',
                                        color: phase.color,
                                        fontWeight: '700',
                                        fontSize: '0.85rem'
                                    }}>
                                        {phase.phase}
                                    </span>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        color: phase.color
                                    }}>
                                        {phase.status === 'live' ? '✓ Live' :
                                            phase.status === 'in-progress' ? '⏳ In Progress' : '📅 Planned'}
                                    </span>
                                </div>

                                <h3 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '800',
                                    color: 'var(--text-main)',
                                    marginBottom: '1.5rem'
                                }}>
                                    {phase.title}
                                </h3>

                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {phase.items.map((item, idx) => (
                                        <li key={idx} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem 0',
                                            borderBottom: idx < phase.items.length - 1 ? '1px solid var(--border-glass)' : 'none',
                                            color: 'var(--text-secondary)',
                                            fontSize: '0.95rem'
                                        }}>
                                            <CheckCircle2 size={16} style={{ color: phase.color, flexShrink: 0 }} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>

                    {/* OpenNyAI Link */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        style={{
                            marginTop: '3rem',
                            padding: '2rem',
                            background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.08) 100%)',
                            border: '1px solid rgba(139,92,246,0.15)',
                            borderRadius: '1.5rem',
                            textAlign: 'center'
                        }}
                    >
                        <Sparkles size={32} style={{ color: 'var(--color-primary)', marginBottom: '1rem' }} />
                        <h4 style={{ color: 'var(--text-main)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                            Indigenous NLP Model - OpenNyAI
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
                            We're building a specialized legal language model trained on Indian case law,
                            statutes, and multilingual legal documents.
                        </p>
                        <a
                            href="https://github.com/viru0909-dev/OpenNyAI"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                background: 'var(--color-primary)',
                                color: 'white',
                                borderRadius: '0.75rem',
                                textDecoration: 'none',
                                fontWeight: '600',
                                transition: 'all 0.3s'
                            }}
                        >
                            <Github size={20} /> View on GitHub <ExternalLink size={16} />
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '8rem 2rem', textAlign: 'center', background: 'var(--bg-main)' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{
                        maxWidth: '750px',
                        margin: '0 auto',
                        padding: '5rem 3rem',
                        background: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '2rem',
                        boxShadow: '0 10px 40px rgba(30, 42, 68, 0.04)'
                    }}
                >
                    <h2 style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        color: 'var(--color-primary)',
                        marginBottom: '1.25rem',
                        letterSpacing: '-0.02em'
                    }}>
                        Ready to Experience NyaySetu?
                    </h2>
                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '1.15rem',
                        marginBottom: '3rem',
                        lineHeight: '1.7'
                    }}>
                        Join us in transforming India's judicial system
                    </p>
                    <Link to="/signup" style={{ textDecoration: 'none' }}>
                        <button className="btn btn-primary" style={{
                            padding: '1.1rem 3.5rem',
                            fontSize: '1.2rem',
                            borderRadius: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            Get Started <ArrowRight size={22} />
                        </button>
                    </Link>
                </motion.div>
            </section>

            <Footer />
        </div>
    );
}
