import { Trophy, Award, Sparkles, FileText, Presentation, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useState } from 'react';

export default function AchievementsSection() {
    const { language } = useLanguage();
    const [hoveredCard, setHoveredCard] = useState(null);

    const achievements = language === 'en' ? [
        {
            title: "VOIS Finale",
            subtitle: "Top 50 Finalist",
            description: "Selected among the top 50 finalists in the VOIS for Tech Innovation Marathon 2.0, a prestigious national competition demonstrating excellence in legal technology innovation.",
            icon: <Trophy size={40} />,
            color: '#FFD700',
            bgGradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
        },
        {
            title: "e-Submit Pune Zonal",
            subtitle: "Secured Rank 2",
            description: "Achieved 2nd rank in the e-Submit Pune Zonal competition and won a cash prize, recognized for innovative solutions in digital legal services.",
            icon: <Award size={40} />,
            color: '#C0C0C0',
            bgGradient: 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)'
        }
    ] : [
        {
            title: "VOIS फाइनल",
            subtitle: "शीर्ष 50 फाइनलिस्ट",
            description: "VOIS for Tech Innovation Marathon 2.0 में शीर्ष 50 फाइनलिस्टों में चयनित, एक प्रतिष्ठित राष्ट्रीय प्रतियोगिता जो कानूनी प्रौद्योगिकी नवाचार में उत्कृष्टता का प्रदर्शन करती है।",
            icon: <Trophy size={40} />,
            color: '#FFD700',
            bgGradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
        },
        {
            title: "e-Submit पुणे ज़ोनल",
            subtitle: "रैंक 2 हासिल की",
            description: "e-Submit पुणे ज़ोनल प्रतियोगिता में दूसरी रैंक हासिल की और नकद पुरस्कार जीता, डिजिटल कानूनी सेवाओं में नवीन समाधानों के लिए मान्यता प्राप्त।",
            icon: <Award size={40} />,
            color: '#C0C0C0',
            bgGradient: 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)'
        }
    ];

    return (
        <section style={{ padding: '6rem 2rem', background: 'var(--bg-glass)' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1.5rem',
                        background: 'rgba(63, 93, 204, 0.1)',
                        border: '1px solid rgba(63, 93, 204, 0.3)',
                        borderRadius: '2rem',
                        marginBottom: '1.5rem'
                    }}>
                        <Sparkles size={24} style={{ color: 'var(--color-secondary)' }} />
                        <span style={{ color: 'var(--color-secondary)', fontSize: '0.95rem', fontWeight: '700' }}>
                            {language === 'en' ? 'OUR ACHIEVEMENTS' : 'हमारी उपलब्धियां'}
                        </span>
                    </div>

                    <h2 style={{
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        fontWeight: '900',
                        color: 'var(--text-main)',
                        marginBottom: '1rem'
                    }}>
                        {language === 'en' ? 'Recognized for ' : 'मान्यता प्राप्त '}
                        <span style={{
                            background: 'linear-gradient(135deg, #3F5DCC 0%, #7C5CFF 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {language === 'en' ? 'Excellence' : 'उत्कृष्टता के लिए'}
                        </span>
                    </h2>

                    <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                        {language === 'en'
                            ? 'Celebrating our journey of innovation and recognition in legal technology'
                            : 'कानूनी प्रौद्योगिकी में नवाचार और मान्यता की हमारी यात्रा का जश्न'}
                    </p>
                </div>

                {/* Achievements Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '3rem',
                    padding: '2rem 1rem',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    {achievements.map((achievement, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2, duration: 0.6 }}
                            whileHover={{ y: -12, scale: 1.03 }}
                            style={{
                                padding: '3rem 2.5rem',
                                background: 'var(--bg-glass-strong)',
                                backdropFilter: 'var(--glass-blur)',
                                borderRadius: '2rem',
                                border: 'var(--border-glass)',
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: 'var(--shadow-glass)',
                                position: 'relative',
                                overflow: 'hidden',
                                minHeight: '320px'
                            }}
                            onMouseEnter={(e) => {
                                setHoveredCard(idx);
                                e.currentTarget.style.borderColor = achievement.color;
                                e.currentTarget.style.boxShadow = `0 20px 60px ${achievement.color}40`;
                            }}
                            onMouseLeave={(e) => {
                                setHoveredCard(null);
                                e.currentTarget.style.borderColor = 'var(--border-glass)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-glass)';
                            }}
                        >
                            {/* Decorative Gradient Overlay */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '150px',
                                height: '150px',
                                background: achievement.bgGradient,
                                opacity: 0.1,
                                borderRadius: '0 0 0 100%',
                                pointerEvents: 'none'
                            }} />

                            {/* Interactive Overlay for VOIS (idx === 0) */}
                            <AnimatePresence>
                                {idx === 0 && hoveredCard === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'rgba(255, 215, 0, 0.95)',
                                            backdropFilter: 'blur(10px)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '1.25rem',
                                            zIndex: 10,
                                            borderRadius: '2rem',
                                            padding: '2rem'
                                        }}
                                    >
                                        <h4 style={{
                                            color: '#1E2A44',
                                            fontSize: '1.5rem',
                                            fontWeight: '800',
                                            marginBottom: '1rem',
                                            textAlign: 'center'
                                        }}>
                                            {language === 'en' ? 'View Submission Materials' : 'सबमिशन सामग्री देखें'}
                                        </h4>

                                        {/* Report Button */}
                                        <motion.a
                                            href="/VOIS_Submission/VOIS_Final_Report_NyaySetu.pdf"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '1rem 2rem',
                                                background: '#1E2A44',
                                                color: '#FFD700',
                                                borderRadius: '12px',
                                                border: '2px solid #1E2A44',
                                                fontSize: '1.1rem',
                                                fontWeight: '700',
                                                textDecoration: 'none',
                                                width: '80%',
                                                maxWidth: '300px',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <FileText size={22} />
                                            {language === 'en' ? 'View Report' : 'रिपोर्ट देखें'}
                                        </motion.a>

                                        {/* Presentation Button */}
                                        <motion.a
                                            href="/VOIS_Submission/Nyay_Setu_VOIS_Presentation_PDF.pdf"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '1rem 2rem',
                                                background: '#1E2A44',
                                                color: '#FFD700',
                                                borderRadius: '12px',
                                                border: '2px solid #1E2A44',
                                                fontSize: '1.1rem',
                                                fontWeight: '700',
                                                textDecoration: 'none',
                                                width: '80%',
                                                maxWidth: '300px',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <Presentation size={22} />
                                            {language === 'en' ? 'View Presentation' : 'प्रस्तुति देखें'}
                                        </motion.a>

                                        {/* Video Button */}
                                        <motion.a
                                            href="/VOIS_Submission/NyaySetu_VOIS.mp4"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '1rem 2rem',
                                                background: '#1E2A44',
                                                color: '#FFD700',
                                                borderRadius: '12px',
                                                border: '2px solid #1E2A44',
                                                fontSize: '1.1rem',
                                                fontWeight: '700',
                                                textDecoration: 'none',
                                                width: '80%',
                                                maxWidth: '300px',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <Video size={22} />
                                            {language === 'en' ? 'Watch Video' : 'वीडियो देखें'}
                                        </motion.a>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Icon */}
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '20px',
                                background: `${achievement.color}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '2rem',
                                color: achievement.color,
                                position: 'relative',
                                zIndex: 1
                            }}>
                                {achievement.icon}
                            </div>

                            {/* Content */}
                            <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                {/* Title */}
                                <h3 style={{
                                    color: 'var(--text-main)',
                                    fontSize: '1.75rem',
                                    fontWeight: '800',
                                    marginBottom: '0.5rem',
                                    lineHeight: '1.3'
                                }}>
                                    {achievement.title}
                                </h3>

                                {/* Subtitle */}
                                <div style={{
                                    display: 'inline-block',
                                    width: 'fit-content',
                                    padding: '0.5rem 1.25rem',
                                    background: `${achievement.color}20`,
                                    color: achievement.color,
                                    borderRadius: '0.75rem',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    marginBottom: '1.5rem'
                                }}>
                                    {achievement.subtitle}
                                </div>

                                {/* Description */}
                                <p style={{
                                    color: 'var(--text-secondary)',
                                    fontSize: '1.1rem',
                                    lineHeight: '1.7',
                                    marginBottom: 0,
                                    flex: 1
                                }}>
                                    {achievement.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
