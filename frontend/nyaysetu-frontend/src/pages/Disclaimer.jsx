import { Link } from 'react-router-dom';
import { Scale, AlertTriangle, Bot, Info } from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import { motion } from 'framer-motion';

export default function Disclaimer() {
    const sections = [
        {
            icon: <AlertTriangle size={24} />,
            title: 'Not Legal Advice',
            content: 'The information provided on NyaySetu is for general informational purposes only and does not constitute legal advice. Always seek the advice of a qualified lawyer for any legal matters specific to your situation.'
        },
        {
            icon: <Bot size={24} />,
            title: 'AI-Generated Content',
            content: 'NyaySetu uses AI to assist with legal information. While we strive for accuracy, AI-generated content may not always be complete or up to date. Do not rely solely on AI responses for legal decisions.'
        },
        {
            icon: <Info size={24} />,
            title: 'Accuracy of Information',
            content: 'We make no warranties about the completeness, reliability, or accuracy of information on this platform. Any action you take based on the information here is strictly at your own risk.'
        }
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
            <Header />

            {/* Hero */}
            <section style={{
                padding: '10rem 2rem 5rem',
                background: 'var(--bg-surface)',
                borderBottom: '1px solid var(--border-light)',
                textAlign: 'center'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ maxWidth: '700px', margin: '0 auto' }}
                >
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, #3F5DCC, #7C5CFF)',
                        borderRadius: '16px',
                        marginBottom: '1.5rem'
                    }}>
                        <Scale size={32} color="white" />
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        fontWeight: '800',
                        color: 'var(--color-primary)',
                        marginBottom: '1rem',
                        letterSpacing: '-0.02em'
                    }}>
                        Disclaimer
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                        Last updated: May 2026 · Important information about the limitations of our platform.
                    </p>
                </motion.div>
            </section>

            {/* Sections */}
            <section style={{ padding: '4rem 2rem' }}>
                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem'
                }}>
                    {sections.map((section, index) => (
                        <motion.div
                            whileHover={{ y: -5 }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = 'rgba(63,93,204,0.4)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(63,93,204,0.12)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'var(--border-light)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-glass)';
                            }}
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            style={{
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-light)',
                                borderRadius: '1.5rem',
                                padding: '2rem',
                                boxShadow: 'var(--shadow-glass)',
                                transition: 'all 0.25s ease'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div style={{
                                    color: 'var(--color-secondary)',
                                    background: 'rgba(63, 93, 204, 0.08)',
                                    padding: '0.6rem',
                                    borderRadius: '10px',
                                    display: 'flex'
                                }}>
                                    {section.icon}
                                </div>
                                <h2 style={{
                                    fontSize: '1.15rem',
                                    fontWeight: '700',
                                    color: 'var(--color-primary)'
                                }}>
                                    {section.title}
                                </h2>
                            </div>
                            <p style={{
                                color: 'var(--text-secondary)',
                                lineHeight: '1.8',
                                margin: 0
                            }}>
                                {section.content}
                            </p>
                        </motion.div>
                    ))}

                    <Link to="/"
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        style={{
                        color: 'var(--color-secondary)',
                        textDecoration: 'none',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'opacity 0.2s ease'
                    }}>
                        ← Back to Home
                    </Link>
                </div>
            </section>
            <Footer />
        </div>
    );
}