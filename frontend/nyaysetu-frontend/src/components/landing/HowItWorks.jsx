import { motion } from 'framer-motion';
import { UserPlus, FileSearch, Gavel, CheckCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function HowItWorks() {
    const { language } = useLanguage();

    const steps = language === 'en' ? [
        {
            icon: UserPlus,
            number: "01",
            title: "Create Account",
            description: "Sign up in seconds with your phone number or email. No lengthy paperwork required.",
            color: "#8b5cf6"
        },
        {
            icon: FileSearch,
            number: "02",
            title: "Submit Your Case",
            description: "Fill out a simple form describing your legal issue. Upload relevant documents securely.",
            color: "#6366f1"
        },
        {
            icon: Gavel,
            number: "03",
            title: "AI Processing",
            description: "Our AI analyzes your case, suggests relevant laws, and routes it to the appropriate court.",
            color: "#ec4899"
        },
        {
            icon: CheckCircle,
            number: "04",
            title: "Track & Resolve",
            description: "Attend virtual hearings, get real-time updates, and track your case till resolution.",
            color: "#10b981"
        }
    ] : [
        {
            icon: UserPlus,
            number: "01",
            title: "खाता बनाएं",
            description: "अपने फ़ोन नंबर या ईमेल से सेकंडों में साइन अप करें। लंबी कागजी कार्रवाई की आवश्यकता नहीं।",
            color: "#8b5cf6"
        },
        {
            icon: FileSearch,
            number: "02",
            title: "अपना मामला प्रस्तुत करें",
            description: "अपने कानूनी मुद्दे का वर्णन करते हुए एक सरल फॉर्म भरें। प्रासंगिक दस्तावेज़ सुरक्षित रूप से अपलोड करें।",
            color: "#6366f1"
        },
        {
            icon: Gavel,
            number: "03",
            title: "AI प्रक्रिया",
            description: "हमारा AI आपके मामले का विश्लेषण करता है, प्रासंगिक कानूनों का सुझाव देता है, और इसे उपयुक्त अदालत में भेजता है।",
            color: "#ec4899"
        },
        {
            icon: CheckCircle,
            number: "04",
            title: "ट्रैक और समाधान",
            description: "वर्चुअल सुनवाई में भाग लें, रीयल-टाइम अपडेट प्राप्त करें, और समाधान तक अपने मामले को ट्रैक करें।",
            color: "#10b981"
        }
    ];

    return (
        <section style={{
            padding: '6rem 2rem',
            background: 'transparent' // Let body background show through
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{
                            display: 'inline-block',
                            padding: '0.75rem 1.5rem',
                            background: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '2rem',
                            marginBottom: '1.5rem'
                        }}
                    >
                        <span style={{ color: 'var(--color-accent)', fontSize: '0.95rem', fontWeight: '700' }}>
                            {language === 'en' ? '⚡ SIMPLE PROCESS' : '⚡ सरल प्रक्रिया'}
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        style={{
                            fontSize: 'clamp(2rem, 4vw, 3rem)',
                            fontWeight: '900',
                            color: 'var(--text-main)',
                            marginBottom: '1rem'
                        }}
                    >
                        {language === 'en' ? 'How ' : 'यह कैसे '}
                        <span style={{
                            background: 'linear-gradient(135deg, var(--color-accent) 0%, #ec4899 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {language === 'en' ? 'It Works' : 'काम करता है'}
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        style={{
                            fontSize: '1.25rem',
                            color: 'var(--text-secondary)',
                            maxWidth: '700px',
                            margin: '0 auto',
                            lineHeight: '1.6'
                        }}
                    >
                        {language === 'en'
                            ? 'Get justice in 4 simple steps. Our AI-powered platform makes legal processes accessible to everyone.'
                            : '4 सरल चरणों में न्याय प्राप्त करें। हमारा AI-संचालित प्लेटफ़ॉर्म कानूनी प्रक्रियाओं को सभी के लिए सुलभ बनाता है।'
                        }
                    </motion.p>
                </div>

                {/* Steps */}
                <div style={{ position: 'relative' }}>
                    {/* Connection Line */}
                    <div style={{
                        position: 'absolute',
                        top: '80px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '80%',
                        height: '2px',
                        background: 'linear-gradient(90deg, #8b5cf6 0%, #6366f1 33%, #ec4899 66%, #10b981 100%)',
                        opacity: 0.3,
                        zIndex: 0,
                        display: window.innerWidth > 768 ? 'block' : 'none'
                    }} />

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '3rem',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        {steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.15 }}
                                style={{
                                    textAlign: 'center',
                                    position: 'relative'
                                }}
                            >
                                {/* Step Number Background */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-20px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    fontSize: '6rem',
                                    fontWeight: '900',
                                    color: step.color,
                                    opacity: 0.05,
                                    zIndex: 0,
                                    lineHeight: 1
                                }}>
                                    {step.number}
                                </div>

                                {/* Icon Container */}
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    style={{
                                        width: '120px',
                                        height: '120px',
                                        margin: '0 auto 2rem',
                                        background: 'var(--bg-glass-strong)', // Glass effect
                                        backdropFilter: 'var(--glass-blur)',
                                        border: `3px solid ${step.color}40`,
                                        borderRadius: '2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                        zIndex: 1,
                                        boxShadow: 'var(--shadow-glass)'
                                    }}
                                >
                                    <step.icon size={48} style={{ color: step.color }} />
                                </motion.div>

                                {/* Step Number Badge */}
                                <div style={{
                                    display: 'inline-block',
                                    padding: '0.5rem 1rem',
                                    background: `${step.color}10`,
                                    border: `2px solid ${step.color}30`,
                                    borderRadius: '2rem',
                                    color: step.color,
                                    fontWeight: '900',
                                    fontSize: '0.875rem',
                                    marginBottom: '1rem',
                                    letterSpacing: '0.05em'
                                }}>
                                    {language === 'en' ? 'STEP' : 'चरण'} {step.number}
                                </div>

                                {/* Title */}
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '800',
                                    color: 'var(--text-main)',
                                    marginBottom: '1rem'
                                }}>
                                    {step.title}
                                </h3>

                                {/* Description */}
                                <p style={{
                                    color: 'var(--text-secondary)',
                                    fontSize: '1rem',
                                    lineHeight: '1.6',
                                    maxWidth: '300px',
                                    margin: '0 auto'
                                }}>
                                    {step.description}
                                </p>

                                {/* Arrow for desktop */}
                                {idx < steps.length - 1 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '60px',
                                        right: '-50px',
                                        color: step.color,
                                        opacity: 0.5,
                                        display: window.innerWidth > 768 ? 'block' : 'none'
                                    }}>
                                        <ArrowRight size={32} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    style={{
                        textAlign: 'center',
                        marginTop: '5rem'
                    }}
                >
                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '1.125rem',
                        marginBottom: '2rem',
                        fontWeight: '600'
                    }}>
                        {language === 'en'
                            ? '🎯 Ready to experience the future of justice?'
                            : '🎯 न्याय के भविष्य का अनुभव करने के लिए तैयार हैं?'
                        }
                    </p>
                    <button style={{
                        padding: '1.25rem 3rem',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                        border: 'none',
                        borderRadius: '0.75rem',
                        color: 'white',
                        fontSize: '1.125rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4)',
                        transition: 'all 0.3s',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-3px)';
                            e.target.style.boxShadow = '0 15px 50px rgba(139, 92, 246, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 10px 40px rgba(139, 92, 246, 0.4)';
                        }}
                        onClick={() => window.location.href = '/signup'}
                    >
                        {language === 'en' ? 'Start Your Journey' : 'अपनी यात्रा शुरू करें'}
                        <ArrowRight size={20} />
                    </button>
                </motion.div>
            </div>
        </section>
    );
}

