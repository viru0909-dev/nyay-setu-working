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
            background: 'var(--color-primary)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '4rem 0 2rem',
            position: 'relative',
            overflow: 'hidden',
            color: '#ffffff'
        }}>
            {/* Gradient overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent 0%, var(--color-accent) 50%, transparent 100%)',
                opacity: 0.5
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
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                padding: '0.5rem',
                                display: 'flex'
                            }}>
                                <Scale size={24} color="white" />
                            </div>
                            <span style={{
                                fontSize: '1.5rem',
                                fontWeight: '900',
                                color: 'white'
                            }}>
                                NyaySetu
                            </span>
                        </div>
                        <p style={{
                            color: 'rgba(255, 255, 255, 0.7)',
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
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = link.color;
                                        e.currentTarget.style.borderColor = link.color;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
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
                            color: 'white',
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
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            textDecoration: 'none',
                                            fontSize: '0.95rem',
                                            transition: 'color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.color = 'white'}
                                        onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.7)'}
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
                            color: 'white',
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
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            textDecoration: 'none',
                                            fontSize: '0.95rem',
                                            transition: 'color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.color = 'white'}
                                        onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.7)'}
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
                            color: 'white',
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
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    textDecoration: 'none',
                                    fontSize: '0.95rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseEnter={(e) => e.target.style.color = 'white'}
                                onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.7)'}
                            >
                                <FaEnvelope size={16} />
                                gadekarvidera4@gmail.com
                            </a>
                            <a
                                href="https://github.com/viru0909-dev/nyay-setu-working"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    textDecoration: 'none',
                                    fontSize: '0.95rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseEnter={(e) => e.target.style.color = 'white'}
                                onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.7)'}
                            >
                                <FaGithub size={16} />
                                View Repository
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    paddingTop: '2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <p style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.875rem',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        © {currentYear} NyaySetu. Made with <FaHeart color="#ef4444" size={14} /> by Virendra Gadekar
                    </p>
                    <p style={{
                        color: 'rgba(255, 255, 255, 0.5)',
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
