import { motion } from 'framer-motion';
import { Shield, Award, Users, TrendingUp, Clock, Lock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function TrustIndicators() {
    const { language } = useLanguage();

    const indicators = language === 'en' ? [
        {
            icon: Shield,
            title: "Bank-Grade Security",
            description: "256-bit encryption protects your data",
            color: "#8b5cf6"
        },
        {
            icon: Award,
            title: "Government Certified",
            description: "Approved by Ministry of Law & Justice",
            color: "#10b981"
        },
        {
            icon: Users,
            title: "50,000+ Active Users",
            description: "Growing community of satisfied citizens",
            color: "#6366f1"
        },
        {
            icon: TrendingUp,
            title: "99% Success Rate",
            description: "Cases resolved efficiently and fairly",
            color: "#ec4899"
        },
        {
            icon: Clock,
            title: "24/7 Availability",
            description: "Access justice anytime, anywhere",
            color: "#f59e0b"
        },
        {
            icon: Lock,
            title: "Data Privacy",
            description: "GDPR compliant & ISO certified",
            color: "#3b82f6"
        }
    ] : [
        {
            icon: Shield,
            title: "बैंक-ग्रेड सुरक्षा",
            description: "256-बिट एन्क्रिप्शन आपके डेटा की सुरक्षा करता है",
            color: "#8b5cf6"
        },
        {
            icon: Award,
            title: "सरकार द्वारा प्रमाणित",
            description: "कानून और न्याय मंत्रालय द्वारा अनुमोदित",
            color: "#10b981"
        },
        {
            icon: Users,
            title: "50,000+ सक्रिय उपयोगकर्ता",
            description: "संतुष्ट नागरिकों का बढ़ता समुदाय",
            color: "#6366f1"
        },
        {
            icon: TrendingUp,
            title: "99% सफलता दर",
            description: "मामलों का कुशलता और निष्पक्षता से समाधान",
            color: "#ec4899"
        },
        {
            icon: Clock,
            title: "24/7 उपलब्धता",
            description: "कभी भी, कहीं भी न्याय तक पहुंच",
            color: "#f59e0b"
        },
        {
            icon: Lock,
            title: "डेटा गोपनीयता",
            description: "GDPR अनुपालक और ISO प्रमाणित",
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
                        marginBottom: '1rem'
                    }}>
                        {language === 'en' ? '🔒 ' : '🔒 '}
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

                {/* Indicators Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>
                    {indicators.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -5 }}
                            style={{
                                padding: '2rem',
                                background: 'rgba(255, 255, 255, 0.4)', // Light glass
                                backdropFilter: 'blur(10px)',
                                borderRadius: '1.25rem',
                                border: 'var(--border-glass)',
                                textAlign: 'center',
                                transition: 'all 0.3s',
                                cursor: 'pointer',
                                boxShadow: 'var(--shadow-glass)'
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
                                width: '70px',
                                height: '70px',
                                margin: '0 auto 1.5rem',
                                background: `${item.color}15`,
                                borderRadius: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `2px solid ${item.color}30`
                            }}>
                                <item.icon size={36} style={{ color: item.color }} />
                            </div>

                            {/* Title */}
                            <h3 style={{
                                color: 'var(--text-main)',
                                fontSize: '1.25rem',
                                fontWeight: '800',
                                marginBottom: '0.75rem'
                            }}>
                                {item.title}
                            </h3>

                            {/* Description */}
                            <p style={{
                                color: 'var(--text-secondary)',
                                fontSize: '0.95rem',
                                lineHeight: '1.5'
                            }}>
                                {item.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

