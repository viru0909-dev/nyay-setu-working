import { Link } from 'react-router-dom';
import { FaLinkedin, FaTwitter, FaGithub, FaEnvelope, FaHeart } from 'react-icons/fa';
import { Scale } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const socialLinks = [
        {
            icon: <FaEnvelope size={20} />,
            href: 'mailto:gadekarvidera4@gmail.com',
            label: 'Email',
            color: '#ea4335'
        },
        {
            icon: <FaLinkedin size={20} />,
            href: 'https://www.linkedin.com/in/virendragadekar/',
            label: 'LinkedIn',
            color: '#0077b5'
        },
        {
            icon: <FaTwitter size={20} />,
            href: 'https://x.com/GadekarVirendra',
            label: 'X/Twitter',
            color: '#1da1f2'
        },
        {
            icon: <FaGithub size={20} />,
            href: 'https://github.com/viru0909-dev/nyay-setu-working',
            label: 'GitHub',
            color: '#333'
        }
    ];

    const quickLinks = [
        { label: 'Features', href: '#features' },
        { label: 'Constitution', href: '#constitution' },
        { label: 'AI Assistant', href: '#chatbot' },
        { label: 'About', href: '#about' }
    ];

    const legalLinks = [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Disclaimer', href: '/disclaimer' }
    ];

    return (
        <footer style={{
            background: 'var(--bg-glass-strong)',
            borderTop: 'var(--border-glass)',
            padding: '4rem 0 2rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Gradient overlay - Removed for cleaner glass look, or kept subtle */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent 0%, var(--color-accent) 50%, transparent 100%)'
            }} />

            <div className="container" style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '0 2rem'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '3rem',
                    marginBottom: '3rem'
                }}>
                    {/* Brand Section */}
                    <div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                borderRadius: '12px',
                                padding: '0.5rem',
                                display: 'flex'
                            }}>
                                <Scale size={24} color="white" />
                            </div>
                            <span style={{
                                fontSize: '1.5rem',
                                fontWeight: '900',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                NyaySetu
                            </span>
                        </div>
                        <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.95rem',
                            lineHeight: '1.6',
                            marginBottom: '1.5rem'
                        }}>
                            India's first AI-powered virtual judiciary platform, making justice accessible to every citizen.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {socialLinks.map((link) => (
                                <motion.a
                                    key={link.label}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.1, y: -3 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: 'var(--bg-glass-strong)',
                                        border: 'var(--border-glass)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--color-accent)',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = link.color;
                                        e.currentTarget.style.color = 'white';
                                        e.currentTarget.style.borderColor = link.color;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'var(--bg-glass-strong)';
                                        e.currentTarget.style.color = 'var(--color-accent)';
                                        e.currentTarget.style.borderColor = 'var(--border-glass)';
                                    }}
                                >
                                    {link.icon}
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 style={{
                            color: 'var(--text-main)',
                            fontSize: '1.125rem',
                            fontWeight: '700',
                            marginBottom: '1.5rem'
                        }}>
                            Quick Links
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {quickLinks.map((link) => (
                                <li key={link.label} style={{ marginBottom: '0.75rem' }}>
                                    <a
                                        href={link.href}
                                        style={{
                                            color: 'var(--text-secondary)',
                                            textDecoration: 'none',
                                            fontSize: '0.95rem',
                                            transition: 'color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.color = 'var(--color-accent)'}
                                        onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 style={{
                            color: 'var(--text-main)',
                            fontSize: '1.125rem',
                            fontWeight: '700',
                            marginBottom: '1.5rem'
                        }}>
                            Legal
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {legalLinks.map((link) => (
                                <li key={link.label} style={{ marginBottom: '0.75rem' }}>
                                    <Link
                                        to={link.href}
                                        style={{
                                            color: 'var(--text-secondary)',
                                            textDecoration: 'none',
                                            fontSize: '0.95rem',
                                            transition: 'color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.color = 'var(--color-accent)'}
                                        onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 style={{
                            color: 'var(--text-main)',
                            fontSize: '1.125rem',
                            fontWeight: '700',
                            marginBottom: '1.5rem'
                        }}>
                            Get In Touch
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <a
                                href="mailto:gadekarvidera4@gmail.com"
                                style={{
                                    color: 'var(--text-secondary)',
                                    textDecoration: 'none',
                                    fontSize: '0.95rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseEnter={(e) => e.target.style.color = 'var(--color-accent)'}
                                onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                            >
                                <FaEnvelope size={16} />
                                gadekarvidera4@gmail.com
                            </a>
                            <a
                                href="https://github.com/viru0909-dev/nyay-setu-working"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: 'var(--text-secondary)',
                                    textDecoration: 'none',
                                    fontSize: '0.95rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseEnter={(e) => e.target.style.color = 'var(--color-accent)'}
                                onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                            >
                                <FaGithub size={16} />
                                View Repository
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{
                    borderTop: 'var(--border-glass)',
                    paddingTop: '2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.875rem',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        © {currentYear} NyaySetu. Made with <FaHeart color="var(--color-accent)" size={14} /> by Virendra Gadekar
                    </p>
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.875rem',
                        margin: 0
                    }}>
                        All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
