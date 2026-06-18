// footer is always dark navy regardless of theme — conventional behavior
// fixed GitHub icon hover from #333 (invisible on dark) to a visible grey
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaLinkedin, FaTwitter, FaGithub, FaEnvelope, FaHeart } from 'react-icons/fa';
import { Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AIAssistantModal from './AIAssistantModal';

export default function Footer() {
    const { t } = useTranslation(['landing', 'common']);
    const currentYear = new Date().getFullYear();
    const [showAIModal, setShowAIModal] = useState(false);

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
            color: '#8b949e'
        }
    ];

    const quickLinks = [
        { label: t('common:header.nav.home'), href: '/', isRoute: true },
        { label: t('common:header.nav.features'), href: '/#features' },
        { label: t('common:header.nav.upcomingFeatures'), href: '/upcoming-features', isRoute: true },
        { label: t('common:header.nav.constitution'), href: '/constitution', isRoute: true },
        { label: t('common:header.nav.aiAssistant'), action: () => setShowAIModal(true) },
        { label: t('common:header.nav.about'), href: '/about', isRoute: true },
        { label: 'FAQ', href: '/faq', isRoute: true }
    ];

    const legalLinks = [
        { label: t('landing:footer.privacyPolicy'), href: '/privacy' },
        { label: t('landing:footer.termsOfService'), href: '/terms' },
        { label: t('landing:footer.disclaimer'), href: '/disclaimer' }
    ];

    return (
        <footer style={{
            background: '#111827',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
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

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px,1fr))',
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
                            {t('landing:footer.tagline')}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {socialLinks.map((link) => (
                                <motion.a
                                    key={link.label}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"

                                    whileHover={{
                                        scale: 1.15,
                                        y: -5
                                    }}
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
                                        e.currentTarget.style.boxShadow =
                                            `0 0 18px ${link.color}`;
                                    }}


                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background =
                                            'rgba(255, 255, 255, 0.05)';
                                        e.currentTarget.style.borderColor =
                                            'rgba(255, 255, 255, 0.1)';
                                        e.currentTarget.style.boxShadow = 'none';
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
                            {t('landing:footer.quickLinks')}
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {quickLinks.map((link) => (
                                <li key={link.label} style={{ marginBottom: '0.75rem' }}>
                                    {link.action ? (
                                        <button
                                            type="button"
                                            onClick={link.action}
                                            style={{
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                textDecoration: 'none',
                                                fontSize: '0.95rem',

                                                transition: 'all 0.3s ease',
                                                display: 'inline-block',
                                                position: 'relative',
                                                background: 'none',
                                                border: 'none',
                                                padding: 0,
                                                cursor: 'pointer',
                                                fontFamily: 'inherit'
                                            }}

                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color = 'white';
                                                e.currentTarget.style.transform =
                                                    'translateX(5px)';
                                                e.currentTarget.style.textShadow =
                                                    '0 0 10px rgba(255,255,255,0.4)';
                                                e.currentTarget.style.borderBottom =
                                                    '2px solid #8b5cf6';
                                                const underline = e.currentTarget.querySelector('span');
                                                if (underline) underline.style.width = '100%';
                                            }}

                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color =
                                                    'rgba(255,255,255,0.7)';
                                                e.currentTarget.style.transform =
                                                    'translateX(0)';
                                                e.currentTarget.style.textShadow =
                                                    'none';
                                                e.currentTarget.style.borderBottom =
                                                    '2px solid transparent';
                                                const underline = e.currentTarget.querySelector('span');
                                                if (underline) underline.style.width = '0%';
                                            }}
                                        >
                                            <>
                                                {link.label}
                                                <span
                                                    style={{
                                                        position: 'absolute',
                                                        left: 0,
                                                        bottom: '-3px',
                                                        width: '0%',
                                                        height: '2px',
                                                        background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                                                        transition: 'width 0.3s ease',
                                                        pointerEvents: 'none'
                                                    }}
                                                />
                                            </>
                                        </button>
                                    ) : link.isRoute ? (
                                        <Link
                                            to={link.href}
                                            style={{
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                textDecoration: 'none',
                                                fontSize: '0.95rem',

                                                transition: 'all 0.3s ease',
                                                display: 'inline-block',
                                                position: 'relative'
                                            }}


                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color = 'white';
                                                e.currentTarget.style.transform = 'translateX(5px)';
                                                e.currentTarget.style.textShadow =
                                                    '0 0 10px rgba(255,255,255,0.4)';
                                                e.currentTarget.style.borderBottom =
                                                    '2px solid #8b5cf6';
                                                const underline = e.currentTarget.querySelector('span');
                                                if (underline) underline.style.width = '100%';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color =
                                                    'rgba(255,255,255,0.7)';
                                                e.currentTarget.style.transform = 'translateX(0)';
                                                e.currentTarget.style.textShadow = 'none';
                                                e.currentTarget.style.borderBottom =
                                                    '2px solid transparent';
                                                const underline = e.currentTarget.querySelector('span');
                                                if (underline) underline.style.width = '0%';
                                            }}

                                        >

                                            <>
                                                {link.label}
                                                <span
                                                    style={{
                                                        position: 'absolute',
                                                        left: 0,
                                                        bottom: '-3px',
                                                        width: '0%',
                                                        height: '2px',
                                                        background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                                                        transition: 'width 0.3s ease',
                                                        pointerEvents: 'none'
                                                    }}
                                                />
                                            </>
                                        </Link>
                                    ) : (
                                        <a
                                            href={link.href}
                                            style={{
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                textDecoration: 'none',
                                                fontSize: '0.95rem',
                                                // transition: 'color 0.2s'
                                                transition: 'all 0.3s ease',
                                                display: 'inline-block',
                                                position: 'relative'
                                            }}

                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color = 'white';
                                                e.currentTarget.style.transform = 'translateX(5px)';
                                                e.currentTarget.style.textShadow =
                                                    '0 0 10px rgba(255,255,255,0.4)';
                                                const underline = e.currentTarget.querySelector('span');
                                                if (underline) underline.style.width = '100%';

                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color =
                                                    'rgba(255,255,255,0.7)';
                                                e.currentTarget.style.transform = 'translateX(0)';
                                                e.currentTarget.style.textShadow = 'none';
                                                e.currentTarget.style.borderBottom =
                                                    '2px solid transparent';
                                                const underline = e.currentTarget.querySelector('span');
                                                if (underline) underline.style.width = '0%';

                                            }}
                                        >

                                            <>
                                                {link.label}
                                                <span
                                                    style={{
                                                        position: 'absolute',
                                                        left: 0,
                                                        bottom: '-3px',
                                                        width: '0%',
                                                        height: '2px',
                                                        background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                                                        transition: 'width 0.3s ease',
                                                        pointerEvents: 'none'
                                                    }}
                                                />
                                            </>
                                        </a>
                                    )}
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
                            {t('landing:footer.legal')}
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

                                            transition: 'all 0.3s ease',
                                            display: 'inline-block',
                                            position: 'relative'
                                        }}

                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = 'white';
                                            e.currentTarget.style.transform =
                                                'translateX(5px)';
                                            e.currentTarget.style.textShadow =
                                                '0 0 10px rgba(255,255,255,0.4)';
                                            const underline = e.currentTarget.querySelector('span');
                                            if (underline) underline.style.width = '100%';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color =
                                                'rgba(255,255,255,0.7)';
                                            e.currentTarget.style.transform =
                                                'translateX(0)';
                                            e.currentTarget.style.textShadow =
                                                'none';
                                            const underline = e.currentTarget.querySelector('span');
                                            if (underline) underline.style.width = '0%';
                                        }}
                                    >

                                        <>
                                            {link.label}
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    bottom: '-4px',
                                                    width: '0%',
                                                    height: '2px',
                                                    background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                                                    transition: 'width 0.3s ease'
                                                }}
                                            />
                                        </>
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
                            {t('landing:footer.getInTouch')}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <a
                                href="mailto:gadekarvidera4@gmail.com"
                                style={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    textDecoration: 'none',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.3s ease',

                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}

                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = 'white';
                                    e.currentTarget.style.transform = 'translateX(5px)';
                                    e.currentTarget.style.textShadow =
                                        '0 0 10px rgba(255,255,255,0.4)';
                                    const icon = e.currentTarget.querySelector('.contact-icon');
                                    if (icon) icon.style.transform = 'scale(1.15)';
                                    icon.style.filter = 'drop-shadow(0 0 8px #8b5cf6)';

                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color =
                                        'rgba(255,255,255,0.7)';
                                    e.currentTarget.style.transform =
                                        'translateX(0)';
                                    e.currentTarget.style.textShadow = 'none';
                                    const icon = e.currentTarget.querySelector('.contact-icon');
                                    if (icon) icon.style.transform = 'scale(1)';
                                }}
                            >

                                <span className="contact-icon" style={{
                                    display: 'inline-flex',
                                    transition: 'transform 0.3s ease'
                                }}>
                                    <FaEnvelope size={16} />
                                </span>
                                gadekarvidera4@gmail.com              </a>
                            <a
                                href="https://github.com/viru0909-dev/nyay-setu-working"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    textDecoration: 'none',
                                    fontSize: '0.95rem',
                                    display: 'flex',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}

                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = 'white';
                                    e.currentTarget.style.transform = 'translateX(5px)';
                                    e.currentTarget.style.textShadow =
                                        '0 0 10px rgba(255,255,255,0.4)';
                                    const icon = e.currentTarget.querySelector('.contact-icon');
                                    if (icon) icon.style.transform = 'scale(1.15)';

                                    icon.style.filter = 'drop-shadow(0 0 8px #8b5cf6)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color =
                                        'rgba(255,255,255,0.7)';
                                    e.currentTarget.style.transform =
                                        'translateX(0)';
                                    e.currentTarget.style.textShadow = 'none';
                                    const icon = e.currentTarget.querySelector('.contact-icon');
                                    if (icon) icon.style.transform = 'scale(1)';
                                    icon.style.filter = 'none';
                                }}
                            >
                                <span className="contact-icon" style={{
                                    display: 'inline-flex',
                                    transition: 'transform 0.3s ease'
                                }}>
                                    <FaGithub size={16} />
                                </span>
                                {t('landing:footer.viewRepository')}

                            </a>
                        </div>
                    </div>
                </motion.div>

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
                        © {currentYear} {t('landing:footer.copyright')} <FaHeart color="#ef4444" size={14} /> {t('landing:footer.by')}
                    </p>
                    <p style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.875rem',
                        margin: 0
                    }}>
                        {t('landing:footer.allRightsReserved')}
                    </p>
                </div>
            </div>
            <AIAssistantModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} />
        </footer>
    );
}
