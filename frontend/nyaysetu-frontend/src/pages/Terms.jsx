import { Link } from 'react-router-dom';
import { Scale, Mail, FileCheck, AlertCircle, RefreshCw, BookOpen } from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import { motion } from 'framer-motion';

export default function Terms() {
    const sections = [
        {
            icon: <FileCheck size={24} />,
            title: 'Acceptance of Terms',
            content: 'By accessing and using NyaySetu, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.'
        },
        {
            icon: <BookOpen size={24} />,
            title: 'Use of Services',
            content: 'NyaySetu provides a digital platform for legal assistance and case management. You agree to use our services only for lawful purposes and in accordance with these terms. Misuse of the platform may result in account suspension.'
        },
        {
            icon: <AlertCircle size={24} />,
            title: 'Limitation of Liability',
            content: 'NyaySetu is not a law firm and does not provide legal advice. The platform is intended for informational purposes only. Always consult a qualified legal professional for legal advice specific to your situation.'
        },
        {
            icon: <RefreshCw size={24} />,
            title: 'Changes to Terms',
            content: 'We reserve the right to modify these terms at any time. We will notify users of significant changes. Continued use of the platform after changes constitutes acceptance of the new terms.'
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
                        Terms of Service
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                        Last updated: May 2026 · Please read these terms carefully before using NyaySetu.
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