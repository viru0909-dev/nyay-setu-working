import { useState } from 'react';
import { X, Search, BookOpen, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConstitutionReader({ isOpen, onClose }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPart, setSelectedPart] = useState(null);
    const [language, setLanguage] = useState('en');

    const constitutionData = {
        en: {
            title: "Constitution of India",
            parts: [
                {
                    id: 1,
                    title: "Part I - The Union and its Territory",
                    articles: [
                        { number: 1, title: "Name and territory of the Union", content: "India, that is Bharat, shall be a Union of States." },
                        { number: 2, title: "Admission or establishment of new States", content: "Parliament may by law admit into the Union, or establish, new States on such terms and conditions as it thinks fit." }
                    ]
                },
                {
                    id: 3,
                    title: "Part III - Fundamental Rights",
                    articles: [
                        { number: 14, title: "Equality before law", content: "The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India." },
                        { number: 19, title: "Protection of certain rights regarding freedom of speech, etc.", content: "All citizens shall have the right to freedom of speech and expression." },
                        { number: 21, title: "Protection of life and personal liberty", content: "No person shall be deprived of his life or personal liberty except according to procedure established by law." }
                    ]
                },
                {
                    id: 4,
                    title: "Part IV - Directive Principles of State Policy",
                    articles: [
                        { number: 38, title: "State to secure a social order for the promotion of welfare of the people", content: "The State shall strive to promote the welfare of the people by securing and protecting as effectively as it may a social order in which justice, social, economic and political, shall inform all the institutions of the national life." }
                    ]
                }
            ]
        },
        hi: {
            title: "भारत का संविधान",
            parts: [
                {
                    id: 1,
                    title: "भाग I - संघ और उसका राज्यक्षेत्र",
                    articles: [
                        { number: 1, title: "संघ का नाम और राज्यक्षेत्र", content: "भारत, अर्थात् इंडिया, राज्यों का संघ होगा।" },
                        { number: 2, title: "नए राज्यों का प्रवेश या स्थापना", content: "संसद विधि द्वारा ऐसे निबंधनों और शर्तों पर, जो वह ठीक समझे, संघ में नए राज्यों का प्रवेश या उनकी स्थापना कर सकेगी।" }
                    ]
                },
                {
                    id: 3,
                    title: "भाग III - मौलिक अधिकार",
                    articles: [
                        { number: 14, title: "विधि के समक्ष समता", content: "राज्य, भारत के राज्यक्षेत्र में किसी व्यक्ति को विधि के समक्ष समता से या विधियों के समान संरक्षण से वंचित नहीं करेगा।" },
                        { number: 19, title: "वाक्-स्वातंत्र्य आदि विषयक कुछ अधिकारों का संरक्षण", content: "सभी नागरिकों को वाक्-स्वातंत्र्य और अभिव्यक्ति स्वातंत्र्य का अधिकार होगा।" },
                        { number: 21, title: "प्राण और दैहिक स्वतंत्रता का संरक्षण", content: "विधि द्वारा स्थापित प्रक्रिया के अनुसार ही किसी व्यक्ति को उसके प्राण या दैहिक स्वतंत्रता से वंचित किया जाएगा, अन्यथा नहीं।" }
                    ]
                },
                {
                    id: 4,
                    title: "भाग IV - राज्य की नीति के निदेशक तत्त्व",
                    articles: [
                        { number: 38, title: "राज्य लोक कल्याण की अभिवृद्धि के लिए सामाजिक व्यवस्था बनाएगा", content: "राज्य लोक कल्याण की अभिवृद्धि के लिए सामाजिक व्यवस्था को, जिसमें सामाजिक, आर्थिक और राजनीतिक न्याय राष्ट्रीय जीवन की सभी संस्थाओं को अनुप्राणित करे, प्रभावी रूप से इस प्रकार बनाएगा कि उस व्यवस्था को बनाए रखने का प्रयास करेगा।" }
                    ]
                }
            ]
        }
    };

    const data = constitutionData[language];

    const filteredParts = data.parts.filter(part =>
        part.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.articles.some(article =>
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.8)',
                            zIndex: 2000,
                            backdropFilter: 'blur(4px)'
                        }}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '90%',
                            maxWidth: '1200px',
                            height: '85vh',
                            maxHeight: '800px',
                            background: 'rgba(15, 23, 42, 0.98)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '1.5rem',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)',
                            zIndex: 2001,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1.5rem 2rem',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <BookOpen size={28} color="white" />
                                <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '900', margin: 0 }}>
                                    {data.title}
                                </h2>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {/* Language Toggle */}
                                <button
                                    onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: '600',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <Globe size={18} />
                                    {language === 'en' ? 'हिंदी' : 'English'}
                                </button>

                                <button
                                    onClick={onClose}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        padding: '0.5rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        color: 'white'
                                    }}
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(139, 92, 246, 0.2)' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={20} style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#94a3b8'
                                }} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={language === 'en' ? "Search articles, parts..." : "लेख, भाग खोजें..."}
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem 0.875rem 3rem',
                                        background: 'rgba(30, 41, 59, 0.6)',
                                        border: '2px solid rgba(139, 92, 246, 0.2)',
                                        borderRadius: '0.75rem',
                                        color: 'white',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
                            {selectedPart ? (
                                <div>
                                    <button
                                        onClick={() => setSelectedPart(null)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(139, 92, 246, 0.2)',
                                            border: '1px solid rgba(139, 92, 246, 0.3)',
                                            borderRadius: '0.5rem',
                                            color: '#8b5cf6',
                                            cursor: 'pointer',
                                            marginBottom: '1.5rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        ← {language === 'en' ? 'Back to Parts' : 'भागों पर वापस जाएं'}
                                    </button>

                                    <h3 style={{ color: 'white', fontSize: '1.75rem', fontWeight: '800', marginBottom: '2rem' }}>
                                        {selectedPart.title}
                                    </h3>

                                    {selectedPart.articles.map((article, idx) => (
                                        <div key={idx} style={{
                                            padding: '1.5rem',
                                            background: 'rgba(30, 41, 59, 0.6)',
                                            borderRadius: '1rem',
                                            border: '1px solid rgba(139, 92, 246, 0.2)',
                                            marginBottom: '1.5rem'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                marginBottom: '0.75rem'
                                            }}>
                                                <span style={{
                                                    padding: '0.5rem 1rem',
                                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                                    borderRadius: '0.5rem',
                                                    color: 'white',
                                                    fontWeight: '700',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {language === 'en' ? 'Article' : 'अनुच्छेद'} {article.number}
                                                </span>
                                            </div>
                                            <h4 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                                                {article.title}
                                            </h4>
                                            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.7' }}>
                                                {article.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                                    gap: '1.5rem'
                                }}>
                                    {filteredParts.map((part) => (
                                        <div
                                            key={part.id}
                                            onClick={() => setSelectedPart(part)}
                                            style={{
                                                padding: '1.5rem',
                                                background: 'rgba(30, 41, 59, 0.6)',
                                                borderRadius: '1rem',
                                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-4px)';
                                                e.currentTarget.style.borderColor = '#8b5cf6';
                                                e.currentTarget.style.boxShadow = '0 12px 30px rgba(139, 92, 246, 0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                                                {part.title}
                                            </h3>
                                            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                                {part.articles.length} {language === 'en' ? 'Articles' : 'अनुच्छेद'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
