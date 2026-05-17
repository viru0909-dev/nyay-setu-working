import { Link } from 'react-router-dom';
import { Scale, Mail, Shield, Database, Eye, FileText } from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
    const sections = [
        {
            icon: <Database size={24} />,
            title: 'Information We Collect',
            content: 'We collect information you provide directly to us, such as your name, email address, and case details when you register or use our services. This includes login credentials, case filings, and any documents you upload to the platform.'
        },
        {
            icon: <Eye size={24} />,
            title: 'How We Use Your Information',
            content: 'We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you. Your data is used solely to deliver legal assistance and case management features.'
        },
        {
            icon: <Shield size={24} />,
            title: 'Data Security',
            content: 'We implement SHA-256 hashing and industry-standard security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.'
        },
        {
            icon: <FileText size={24} />,
            title: 'Your Rights',
            content: 'You have the right to access, correct, or delete your personal data at any time. You may also request a copy of the data we hold about you by contacting us directly.'
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
                        Privacy Policy
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                        Last updated: May 2026 · NyaySetu is committed to protecting your privacy.
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

                    {/* Contact Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{
                            background: 'linear-gradient(135deg, rgba(63,93,204,0.06) 0%, rgba(124,92,255,0.06) 100%)',
                            border: '1px solid rgba(63,93,204,0.15)',
                            borderRadius: '1.5rem',
                            padding: '2rem',
                            textAlign: 'center'
                        }}
                    >
                        <Mail size={32} style={{ color: 'var(--color-secondary)', marginBottom: '1rem' }} />
                        <h2 style={{
                            
                            fontSize: '1.15rem',
                            fontWeight: '700',
                            color: 'var(--color-primary)',
                            marginBottom: '0.5rem'
                        }}>
                            Contact Us
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Questions about this Privacy Policy?
                        </p>
                        
                            <a href="mailto:gadekarvirendra@gmail.com"
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
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
                                transition: 'opacity 0.2s ease'
                            }}
                        >
                            <Mail size={16} /> gadekarvirendra@gmail.com
                        </a>
                    </motion.div>

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