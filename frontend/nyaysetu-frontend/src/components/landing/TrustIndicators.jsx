import { motion } from 'framer-motion';
import { Shield, Award, Users, TrendingUp, Clock, Lock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function TrustIndicators() {
    const { language } = useLanguage();

    const indicators = [
        {
            icon: Shield,
            title: language === 'en' ? "Bank-Grade Security" : "बैंक-ग्रेड सुरक्षा",
            description: language === 'en' ? "256-bit encryption protects your data" : "256-bit एन्क्रिप्शन आपके डेटा की सुरक्षा करता है",
            color: "#8b5cf6"
        },
        {
            icon: Award,
            title: language === 'en' ? "Government Certified" : "सरकार द्वारा प्रमाणित",
            description: language === 'en' ? "Approved by Ministry of Law & Justice" : "कानून और न्याय मंत्रालय द्वारा अनुमोदित",
            color: "#10b981"
        },
        {
            icon: Users,
            title: language === 'en' ? "50,000+ Active Users" : "50,000+ सक्रिय उपयोगकर्ता",
            description: language === 'en' ? "Growing community of satisfied citizens" : "संतुष्ट नागरिकों का बढ़ता समुदाय",
            color: "#6366f1"
        },
        {
            icon: TrendingUp,
            title: language === 'en' ? "99% Success Rate" : "99% सफलता दर",
            description: language === 'en' ? "Cases resolved efficiently and fairly" : "मामलों का कुशलता और निष्पक्षता से समाधान",
            color: "#ec4899"
        },
        {
            icon: Clock,
            title: language === 'en' ? "24/7 Availability" : "24/7 उपलब्धता",
            description: language === 'en' ? "Access justice anytime, anywhere" : "कभी भी, कहीं भी न्याय तक पहुंच",
            color: "#f59e0b"
        },
        {
            icon: Lock,
            title: language === 'en' ? "Data Privacy" : "डेटा गोपनीयता",
            description: language === 'en' ? "GDPR compliant & ISO certified" : "GDPR अनुपालक और ISO प्रमाणित",
            color: "#3b82f6"
        }
    ];

    return (
        <section style={{
            padding: '5rem 2rem',
            background: 'var(--bg-glass-strong)', // Use variable
            backdropFilter: 'var(--glass-blur)',
            borderTop: 'var(--border-glass)',
            borderBottom: 'var(--border-glass)'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ textAlign: 'center', marginBottom: '4rem' }}
                >
                    <h2 style={{
                        fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                        fontWeight: '900',
                        color: 'var(--text-main)',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem'
                    }}>
                        <Lock size={36} color="var(--color-primary)" strokeWidth={2.5} />
                        <span style={{
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {language === 'en' ? 'Trusted by Thousands' : 'हजारों द्वारा विश्वसनीय'}
                        </span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
                        {language === 'en'
                            ? 'Your security and privacy are our top priorities'
                            : 'आपकी सुरक्षा और गोपनीयता हमारी सर्वोच्च प्राथमिकताएं हैं'
                        }
                    </p>
                </motion.div>

                {/* Indicators Scroll Container - Infinite Marquee */}
                <div
                    className="trust-scroll-mask"
                    style={{
                        maxWidth: '100%',
                        overflow: 'hidden',
                        padding: '1rem 0', // Extra vertical padding for hover effects
                        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
                    }}
                >
                    <div
                        className="trust-track"
                        style={{
                            display: 'flex',
                            gap: '2rem',
                            width: 'max-content',
                            padding: '1rem 0' // Internal padding to prevent border clipping
                        }}
                    >
                        {/* Duplicate lists for seamless loop */}
                        {[...indicators, ...indicators].map((item, idx) => (
                            <motion.div
                                key={`${idx}-${item.title}`} // Unique key using index and title
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                                style={{
                                    padding: '4rem 3rem',
                                    background: 'rgba(255, 255, 255, 0.4)', // Light glass
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '24px',
                                    border: 'var(--border-glass)',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    boxShadow: 'var(--shadow-glass)',
                                    minWidth: '400px',
                                    flex: '0 0 auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = item.color;
                                    e.currentTarget.style.boxShadow = `0 15px 40px ${item.color}20`;
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-glass)';
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
                                }}
                            >
                                {/* Icon */}
                                <div style={{
                                    width: '90px',
                                    height: '90px',
                                    margin: '0 auto 2rem',
                                    background: `${item.color}15`,
                                    borderRadius: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: `2px solid ${item.color}30`
                                }}>
                                    <item.icon size={42} style={{ color: item.color }} />
                                </div>

                                {/* Title */}
                                <h3 style={{
                                    color: 'var(--text-main)',
                                    fontSize: '1.75rem',
                                    fontWeight: '800',
                                    marginBottom: '1rem'
                                }}>
                                    {item.title}
                                </h3>

                                {/* Description */}
                                <p style={{
                                    color: 'var(--text-secondary)',
                                    fontSize: '1.15rem',
                                    lineHeight: '1.6'
                                }}>
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
                <style>{`
                    @keyframes scroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .trust-track {
                        animation: scroll 40s linear infinite;
                    }
                    .trust-track:hover {
                        animation-play-state: paused;
                    }
                `}</style>
            </div>
        </section>
    );
}

