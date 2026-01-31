import { Newspaper, ExternalLink, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

export default function NewsSection() {
    const { language } = useLanguage();

    // Mock news data - in production, this would come from an API
    const newsItems = language === 'en' ? [
        {
            title: "Supreme Court Upholds Digital Court Proceedings",
            source: "Supreme Court of India",
            time: "2 hours ago",
            category: "Supreme Court",
            excerpt: "The Supreme Court has approved the continuation of virtual court proceedings, emphasizing accessibility and efficiency in the judicial system.",
            link: "#"
        },
        {
            title: "New Guidelines for E-Filing of Cases Released",
            source: "Department of Justice",
            time: "5 hours ago",
            category: "Policy Update",
            excerpt: "The government has released comprehensive guidelines for electronic filing of cases across all courts in India.",
            link: "#"
        },
        {
            title: "Increased Funding for Legal Aid Services",
            source: "NALSA",
            time: "1 day ago",
            category: "Legal Aid",
            excerpt: "National Legal Services Authority announces increased funding to improve access to justice for marginalized communities.",
            link: "#"
        },
        {
            title: "Digital Evidence Act Receives Presidential Assent",
            source: "Parliament of India",
            time: "2 days ago",
            category: "Legislation",
            excerpt: "New legislation to regulate digital evidence in courts receives approval, modernizing the Indian legal framework.",
            link: "#"
        }
    ] : [
        {
            title: "सुप्रीम कोर्ट ने डिजिटल कोर्ट कार्यवाही को बरकरार रखा",
            source: "भारत का सर्वोच्च न्यायालय",
            time: "2 घंटे पहले",
            category: "सुप्रीम कोर्ट",
            excerpt: "सुप्रीम कोर्ट ने वर्चुअल अदालती कार्यवाही की निरंतरता को मंजूरी दी है, न्यायिक प्रणाली में पहुंच और दक्षता पर जोर देते हुए।",
            link: "#"
        },
        {
            title: "मामलों की ई-फाइलिंग के लिए नई दिशानिर्देश जारी",
            source: "न्याय विभाग",
            time: "5 घंटे पहले",
            category: "नीति अपडेट",
            excerpt: "सरकार ने भारत में सभी अदालतों में मामलों की इलेक्ट्रॉनिक फाइलिंग के लिए व्यापक दिशानिर्देश जारी किए हैं।",
            link: "#"
        },
        {
            title: "कानूनी सहायता सेवाओं के लिए बढ़ा वित्त पोषण",
            source: "NALSA",
            time: "1 दिन पहले",
            category: "कानूनी सहायता",
            excerpt: "राष्ट्रीय कानूनी सेवा प्राधिकरण ने हाशिए के समुदायों के लिए न्याय तक पहुंच में सुधार के लिए वित्त पोषण में वृद्धि की घोषणा की।",
            link: "#"
        },
        {
            title: "डिजिटल साक्ष्य अधिनियम को राष्ट्रपति की मंजूरी मिली",
            source: "भारत की संसद",
            time: "2 दिन पहले",
            category: "विधान",
            excerpt: "अदालतों में डिजिटल साक्ष्य को विनियमित करने के लिए नया कानून मंजूरी प्राप्त करता है, भारतीय कानूनी ढांचे का आधुनिकीकरण करते हुए।",
            link: "#"
        }
    ];

    const categoryColors = {
        'Supreme Court': '#8b5cf6',
        'Policy Update': '#6366f1',
        'Legal Aid': '#ec4899',
        'Legislation': '#10b981',
        'सुप्रीम कोर्ट': '#8b5cf6',
        'नीति अपडेट': '#6366f1',
        'कानूनी सहायता': '#ec4899',
        'विधान': '#10b981'
    };

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
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '2rem',
                        marginBottom: '1.5rem'
                    }}>
                        <Newspaper size={24} style={{ color: '#8b5cf6' }} />
                        <span style={{ color: '#8b5cf6', fontSize: '0.95rem', fontWeight: '700' }}>
                            {language === 'en' ? 'LATEST UPDATES' : 'नवीनतम अपडेट'}
                        </span>
                    </div>

                    <h2 style={{
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        fontWeight: '900',
                        color: 'var(--text-main)',
                        marginBottom: '1rem'
                    }}>
                        {language === 'en' ? 'Judiciary ' : 'न्यायपालिका '}
                        <span style={{
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {language === 'en' ? 'News & Updates' : 'समाचार और अपडेट'}
                        </span>
                    </h2>

                    <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                        {language === 'en'
                            ? 'Stay informed with the latest developments in Indian judiciary'
                            : 'भारतीय न्यायपालिका में नवीनतम विकास के बारे में सूचित रहें'}
                    </p>
                </div>

                {/* News Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '2rem'
                }}>
                    {newsItems.map((news, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -8 }}
                            style={{
                                padding: '2rem',
                                background: 'var(--bg-glass-strong)',
                                backdropFilter: 'var(--glass-blur)',
                                borderRadius: '1.5rem',
                                border: 'var(--border-glass)',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: 'var(--shadow-glass)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = categoryColors[news.category] || '#8b5cf6';
                                e.currentTarget.style.boxShadow = `0 20px 40px ${categoryColors[news.category] || '#8b5cf6'}30`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-glass)'; // Fixed border color on leave
                                e.currentTarget.style.boxShadow = 'var(--shadow-glass)';
                            }}
                        >
                            {/* Category & Time */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{
                                    padding: '0.4rem 1rem',
                                    background: `${categoryColors[news.category] || '#8b5cf6'}20`,
                                    color: categoryColors[news.category] || '#8b5cf6',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.85rem',
                                    fontWeight: '700'
                                }}>
                                    {news.category}
                                </span>
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.85rem'
                                }}>
                                    <Clock size={14} />
                                    {news.time}
                                </span>
                            </div>

                            {/* Title */}
                            <h3 style={{
                                color: 'var(--text-main)',
                                fontSize: '1.375rem',
                                fontWeight: '800',
                                marginBottom: '1rem',
                                lineHeight: '1.3',
                                flex: '0 0 auto'
                            }}>
                                {news.title}
                            </h3>

                            {/* Source */}
                            <p style={{
                                color: '#8b5cf6',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                marginBottom: '1rem',
                                flex: '0 0 auto'
                            }}>
                                {news.source}
                            </p>

                            {/* Excerpt */}
                            <p style={{
                                color: 'var(--text-secondary)',
                                fontSize: '1rem',
                                lineHeight: '1.6',
                                marginBottom: '1.5rem',
                                flex: '1 1 auto'
                            }}>
                                {news.excerpt}
                            </p>

                            {/* Read More */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: categoryColors[news.category] || '#8b5cf6',
                                fontWeight: '700',
                                fontSize: '0.95rem',
                                flex: '0 0 auto'
                            }}>
                                {language === 'en' ? 'Read Full Story' : 'पूरी कहानी पढ़ें'}
                                <ExternalLink size={16} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* View All Button */}
                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <motion.button
                        className="btn btn-primary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            padding: '1rem 3rem',
                            fontSize: '1.125rem',
                            borderRadius: '12px'
                        }}
                    >
                        {language === 'en' ? 'View All News' : 'सभी समाचार देखें'}
                    </motion.button>
                </div>
            </div>
        </section>
    );
}

