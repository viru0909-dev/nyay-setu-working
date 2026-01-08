import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Scale, ArrowRight, CheckCircle, Clock, Users, FileText,
    Zap, Shield, Brain, TrendingUp, Award, Target
} from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';

export default function About() {
    const [activeTab, setActiveTab] = useState('problem');

    const problems = [
        { icon: Clock, title: 'Long Delays', desc: 'Cases take years to resolve', color: 'var(--color-error)' },
        { icon: FileText, title: 'Complex Paperwork', desc: 'Difficult documentation process', color: 'var(--color-warning)' },
        { icon: Users, title: 'Lack of Awareness', desc: 'Citizens unaware of rights', color: 'var(--color-text-secondary)' },
        { icon: TrendingUp, title: 'High Costs', desc: 'Expensive legal procedures', color: 'var(--color-accent)' }
    ];

    const solutions = [
        { icon: Zap, title: 'Instant Filing', desc: 'File cases online in minutes', color: 'var(--color-primary)' },
        { icon: Brain, title: 'AI Assistance', desc: 'Smart legal guidance 24/7', color: 'var(--color-accent)' },
        { icon: Scale, title: 'Transparency', desc: 'Track case status in real-time', color: 'var(--color-accent-light)' },
        { icon: Shield, title: 'Secure Platform', desc: 'Bank-grade data protection', color: 'var(--color-primary)' }
    ];

    const howItWorks = [
        { step: '01', title: 'Register', desc: 'Create your account in 2 minutes', icon: Users },
        { step: '02', title: 'File Case', desc: 'Upload documents and submit online', icon: FileText },
        { step: '03', title: 'AI Processing', desc: 'Our AI verifies and processes', icon: Brain },
        { step: '04', title: 'Track Progress', desc: 'Get real-time case updates', icon: TrendingUp },
        { step: '05', title: 'Virtual Hearing', desc: 'Attend hearings remotely', icon: Scale },
        { step: '06', title: 'Resolution', desc: 'Receive judgment digitally', icon: Award }
    ];

    const stats = [
        { value: '10,000+', label: 'Cases Filed', icon: FileText },
        { value: '50,000+', label: 'Active Users', icon: Users },
        { value: '85%', label: 'Time Saved', icon: Clock },
        { value: '24/7', label: 'AI Support', icon: Brain }
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)' }}>
            <Header />

            {/* Hero Section */}
            <section style={{ padding: '8rem 2rem 4rem 2rem', textAlign: 'center', position: 'relative' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div style={{
                        display: 'inline-block',
                        padding: '0.5rem 1.5rem',
                        background: 'var(--bg-glass)',
                        border: 'var(--border-glass)',
                        borderRadius: '2rem',
                        marginBottom: '1.5rem'
                    }}>
                        <span style={{ color: 'var(--color-accent)', fontSize: '0.9rem', fontWeight: '600' }}>
                            ⚡ India's First AI-Powered Judiciary Platform
                        </span>
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                        fontWeight: '800',
                        color: 'var(--text-main)',
                        marginBottom: '1.5rem',
                        lineHeight: '1.2'
                    }}>
                        Revolutionizing <span style={{
                            background: 'var(--gradient-primary)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>Justice</span> for Every Citizen
                    </h1>

                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--text-secondary)',
                        maxWidth: '800px',
                        margin: '0 auto 2rem',
                        lineHeight: '1.8'
                    }}>
                        NyaySetu is transforming India's judicial system by making legal processes accessible,
                        transparent, and efficient through cutting-edge AI technology.
                    </p>
                </motion.div>

                {/* Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '2rem',
                    maxWidth: '1200px',
                    margin: '4rem auto 0'
                }}>
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            style={{
                                padding: '2rem',
                                background: 'var(--bg-glass)',
                                border: 'var(--border-glass)',
                                borderRadius: '1rem',
                                textAlign: 'center',
                                boxShadow: 'var(--shadow-glass)'
                            }}
                        >
                            <stat.icon size={32} style={{ color: 'var(--color-accent)', margin: '0 auto 1rem' }} />
                            <h3 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                                {stat.value}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Problem vs Solution */}
            <section style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem' }}>
                        The Problem & Our Solution
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        Understanding the challenges and how we solve them
                    </p>
                </div>

                {/* Tab Selector */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
                    {['problem', 'solution'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '1rem 2rem',
                                background: activeTab === tab ? 'var(--color-accent)' : 'var(--bg-glass)',
                                border: activeTab === tab ? 'none' : 'var(--border-glass)',
                                borderRadius: '0.75rem',
                                color: 'var(--text-main)',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab === 'problem' ? '⚠️ Traditional System' : '✨ NyaySetu Solution'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '2rem'
                    }}
                >
                    {(activeTab === 'problem' ? problems : solutions).map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            style={{
                                padding: '2rem',
                                background: 'var(--bg-glass)',
                                border: 'var(--border-glass)',
                                borderRadius: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                boxShadow: 'var(--shadow-glass)'
                            }}
                        >
                            <item.icon size={40} style={{ color: item.color, marginBottom: '1rem' }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                {item.title}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{item.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* How It Works */}
            <section style={{ padding: '4rem 2rem', background: 'var(--bg-glass-strong)' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem' }}>
                            How NyaySetu Works
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                            A simple, streamlined process from start to finish
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem'
                    }}>
                        {howItWorks.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                style={{ position: 'relative' }}
                            >
                                {i < howItWorks.length - 1 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        right: '-1rem',
                                        transform: 'translateY(-50%)',
                                        display: window.innerWidth > 768 ? 'block' : 'none'
                                    }}>
                                        <ArrowRight size={24} style={{ color: 'var(--color-accent)', opacity: 0.3 }} />
                                    </div>
                                )}
                                <div style={{
                                    padding: '2rem',
                                    background: 'var(--bg-glass)',
                                    border: 'var(--border-glass)',
                                    borderRadius: '1rem',
                                    position: 'relative',
                                    height: '100%',
                                    boxShadow: 'var(--shadow-glass)'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '-1rem',
                                        left: '1.5rem',
                                        background: 'var(--color-accent)',
                                        color: 'white',
                                        width: '3rem',
                                        height: '3rem',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '800',
                                        fontSize: '1.1rem'
                                    }}>
                                        {step.step}
                                    </div>
                                    <div style={{ marginTop: '2rem' }}>
                                        <step.icon size={32} style={{ color: 'var(--color-accent)', marginBottom: '1rem' }} />
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                            {step.title}
                                        </h3>
                                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{step.desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '3rem'
                }}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        style={{
                            padding: '3rem',
                            background: 'var(--bg-glass-strong)',
                            border: 'var(--border-glass)',
                            borderRadius: '1.5rem',
                            boxShadow: 'var(--shadow-glass)'
                        }}
                    >
                        <Target size={48} style={{ color: 'var(--color-accent)', marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem' }}>
                            Our Mission
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
                            To democratize access to justice by leveraging AI and technology, making legal
                            processes transparent, efficient, and accessible to every Indian citizen,
                            regardless of their location or economic background.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        style={{
                            padding: '3rem',
                            background: 'var(--bg-glass-strong)',
                            border: 'var(--border-glass)',
                            borderRadius: '1.5rem',
                            boxShadow: 'var(--shadow-glass)'
                        }}
                    >
                        <Award size={48} style={{ color: 'var(--color-accent-light)', marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem' }}>
                            Our Vision
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
                            To create a future where justice is not delayed, where legal rights are
                            universally understood, and where technology empowers citizens to navigate
                            the judicial system with confidence and ease.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '6rem 2rem', textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{
                        maxWidth: '800px',
                        margin: '0 auto',
                        padding: '4rem 3rem',
                        background: 'var(--bg-glass-strong)',
                        backdropFilter: 'var(--glass-blur)',
                        border: 'var(--border-glass-strong)',
                        borderRadius: '2rem',
                        boxShadow: 'var(--shadow-glass-strong)'
                    }}
                >
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem' }}>
                        Ready to Experience Justice Reimagined?
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.8' }}>
                        Join thousands of citizens who have already simplified their legal journey with NyaySetu
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/signup" style={{ textDecoration: 'none' }}>
                            <button style={{
                                padding: '1rem 2.5rem',
                                background: 'var(--color-accent)',
                                border: 'none',
                                borderRadius: '0.75rem',
                                color: 'var(--text-main)',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'transform 0.2s'
                            }}
                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                            >
                                Get Started Free <ArrowRight size={20} />
                            </button>
                        </Link>
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <button style={{
                                padding: '1rem 2.5rem',
                                background: 'var(--bg-glass)',
                                border: 'var(--border-glass)',
                                borderRadius: '0.75rem',
                                color: 'var(--text-main)',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'var(--bg-glass-hover)';
                                    e.target.style.borderColor = 'var(--color-accent)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'var(--bg-glass)';
                                    e.target.style.borderColor = 'var(--border-glass)';
                                }}
                            >
                                Learn More
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </section>

            <Footer />
        </div>
    );
}
