import { useState } from 'react';
import { Search, BookOpen, Globe, Download, Bookmark, MessageCircle, Share2, X, BookmarkPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function Constitution() {
    const navigate = useNavigate();
    const { language, toggleLanguage, t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPart, setSelectedPart] = useState(null);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [showAIChat, setShowAIChat] = useState(false);
    const [bookmarks, setBookmarks] = useState([]);
    const [aiQuery, setAiQuery] = useState('');

    // Enhanced Constitution Data with more articles
    const constitutionData = {
        en: {
            parts: [
                {
                    id: 1,
                    title: "Part I - The Union and its Territory",
                    description: "Articles defining the territory of India",
                    articles: [
                        {
                            number: "1",
                            title: "Name and territory of the Union",
                            content: "India, that is Bharat, shall be a Union of States. The territory of India shall comprise: (a) the territories of the States; (b) the Union territories specified in the First Schedule; and (c) such other territories as may be acquired.",
                            keywords: ["name", "bharat", "territory", "union"]
                        },
                        {
                            number: "2",
                            title: "Admission or establishment of new States",
                            content: "Parliament may by law admit into the Union, or establish, new States on such terms and conditions as it thinks fit.",
                            keywords: ["parliament", "new states", "admission"]
                        },
                        {
                            number: "3",
                            title: "Formation of new States and alteration of areas",
                            content: "Parliament may by law: (a) form a new State; (b) increase or diminish the area of any State; (c) alter the boundaries of any State; (d) alter the name of any State.",
                            keywords: ["formation", "boundaries", "areas"]
                        }
                    ]
                },
                {
                    id: 3,
                    title: "Part III - Fundamental Rights",
                    description: "Basic human rights guaranteed to all citizens",
                    articles: [
                        {
                            number: "14",
                            title: "Equality before law",
                            content: "The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India. Prohibition of discrimination on grounds of religion, race, caste, sex or place of birth.",
                            keywords: ["equality", "law", "discrimination"]
                        },
                        {
                            number: "19",
                            title: "Protection of certain rights regarding freedom of speech, etc.",
                            content: "All citizens shall have the right to: (a) freedom of speech and expression; (b) assemble peaceably and without arms; (c) form associations or unions; (d) move freely throughout the territory of India; (e) reside and settle in any part of the territory of India; (f) practice any profession, or to carry on any occupation, trade or business.",
                            keywords: ["freedom", "speech", "expression", "movement"]
                        },
                        {
                            number: "21",
                            title: "Protection of life and personal liberty",
                            content: "No person shall be deprived of his life or personal liberty except according to procedure established by law. The right to life includes the right to live with human dignity.",
                            keywords: ["life", "liberty", "dignity"]
                        },
                        {
                            number: "21A",
                            title: "Right to education",
                            content: "The State shall provide free and compulsory education to all children of the age of six to fourteen years in such manner as the State may, by law, determine.",
                            keywords: ["education", "children", "free education"]
                        }
                    ]
                },
                {
                    id: 4,
                    title: "Part IV - Directive Principles of State Policy",
                    description: "Guidelines for governance and policy-making",
                    articles: [
                        {
                            number: "38",
                            title: "State to secure a social order for the promotion of welfare of the people",
                            content: "The State shall strive to promote the welfare of the people by securing and protecting as effectively as it may a social order in which justice, social, economic and political, shall inform all the institutions of the national life.",
                            keywords: ["welfare", "social order", "justice"]
                        },
                        {
                            number: "39",
                            title: "Certain principles of policy to be followed by the State",
                            content: "The State shall direct its policy towards securing: (a) that the citizens, men and women equally, have the right to an adequate means of livelihood; (b) that the ownership and control of material resources is distributed to subserve the common good; (c) that the operation of the economic system does not result in concentration of wealth.",
                            keywords: ["policy", "livelihood", "resources", "wealth"]
                        }
                    ]
                },
                {
                    id: 4.5,
                    title: "Part IVA - Fundamental Duties",
                    description: "Basic duties of every Indian citizen",
                    articles: [
                        {
                            number: "51",
                            title: "Fundamental Duties",
                            content: "It shall be the duty of every citizen of India: (a) to abide by the Constitution; (b) to cherish and follow the noble ideals of the freedom struggle; (c) to uphold and protect the sovereignty, unity and integrity of India; (d) to defend the country; (e) to promote harmony and spirit of common brotherhood; (f) to value and preserve the rich heritage of our composite culture; (g) to protect natural environment; (h) to develop scientific temper; (i) to safeguard public property; (j) to strive towards excellence.",
                            keywords: ["duties", "citizens", "responsibility", "protection"]
                        }
                    ]
                }
            ]
        },
        hi: {
            parts: [
                {
                    id: 1,
                    title: "भाग I - संघ और उसका राज्यक्षेत्र",
                    description: "भारत के राज्यक्षेत्र को परिभाषित करने वाले अनुच्छेद",
                    articles: [
                        {
                            number: "1",
                            title: "संघ का नाम और राज्यक्षेत्र",
                            content: "भारत, अर्थात् इंडिया, राज्यों का संघ होगा। भारत का राज्यक्षेत्र निम्नलिखित से मिलकर बनेगा: (क) राज्यों के राज्यक्षेत्र; (ख) पहली अनुसूची में विनिर्दिष्ट संघ राज्यक्षेत्र; और (ग) ऐसे अन्य राज्यक्षेत्र जो अर्जित किए जाएं।",
                            keywords: ["नाम", "भारत", "राज्यक्षेत्र", "संघ"]
                        },
                        {
                            number: "2",
                            title: "नए राज्यों का प्रवेश या स्थापना",
                            content: "संसद विधि द्वारा ऐसे निबंधनों और शर्तों पर, जो वह ठीक समझे, संघ में नए राज्यों का प्रवेश या उनकी स्थापना कर सकेगी।",
                            keywords: ["संसद", "नए राज्य", "प्रवेश"]
                        },
                        {
                            number: "3",
                            title: "नए राज्यों का निर्माण और क्षेत्रों का परिवर्तन",
                            content: "संसद विधि द्वारा: (क) नया राज्य बना सकेगी; (ख) किसी राज्य के क्षेत्र को बढ़ा या घटा सकेगी; (ग) किसी राज्य की सीमाओं को बदल सकेगी; (घ) किसी राज्य का नाम बदल सकेगी।",
                            keywords: ["निर्माण", "सीमाएं", "क्षेत्र"]
                        }
                    ]
                },
                {
                    id: 3,
                    title: "भाग III - मौलिक अधिकार",
                    description: "सभी नागरिकों को गारंटीकृत मूल मानव अधिकार",
                    articles: [
                        {
                            number: "14",
                            title: "विधि के समक्ष समता",
                            content: "राज्य, भारत के राज्यक्षेत्र में किसी व्यक्ति को विधि के समक्ष समता से या विधियों के समान संरक्षण से वंचित नहीं करेगा। धर्म, मूलवंश, जाति, लिंग या जन्मस्थान के आधार पर विभेद का प्रतिषेध।",
                            keywords: ["समानता", "कानून", "भेदभाव"]
                        },
                        {
                            number: "19",
                            title: "वाक्-स्वातंत्र्य आदि विषयक कुछ अधिकारों का संरक्षण",
                            content: "सभी नागरिकों को: (क) वाक्-स्वातंत्र्य और अभिव्यक्ति स्वातंत्र्य; (ख) शांतिपूर्वक और बिना हथियारों के सम्मेलन करने; (ग) संगम या संघ बनाने; (घ) भारत के राज्यक्षेत्र में सर्वत्र अबाध संचरण करने; (ङ) भारत के राज्यक्षेत्र के किसी भाग में निवास करने और बस जाने; (च) कोई वृत्ति, उपजीविका, व्यापार या कारबार करने का अधिकार होगा।",
                            keywords: ["स्वतंत्रता", "भाषण", "अभिव्यक्ति", "आवाजाही"]
                        },
                        {
                            number: "21",
                            title: "प्राण और दैहिक स्वतंत्रता का संरक्षण",
                            content: "विधि द्वारा स्थापित प्रक्रिया के अनुसार ही किसी व्यक्ति को उसके प्राण या दैहिक स्वतंत्रता से वंचित किया जाएगा, अन्यथा नहीं। जीवन के अधिकार में मानवीय गरिमा के साथ जीने का अधिकार शामिल है।",
                            keywords: ["जीवन", "स्वतंत्रता", "गरिमा"]
                        },
                        {
                            number: "21क",
                            title: "शिक्षा का अधिकार",
                            content: "राज्य छह से चौदह वर्ष की आयु के सभी बच्चों को ऐसी रीति में, जो राज्य विधि द्वारा अवधारित करे, निःशुल्क और अनिवार्य शिक्षा उपलब्ध कराएगा।",
                            keywords: ["शिक्षा", "बच्चे", "निःशुल्क शिक्षा"]
                        }
                    ]
                },
                {
                    id: 4,
                    title: "भाग IV - राज्य की नीति के निदेशक तत्त्व",
                    description: "शासन और नीति-निर्माण के लिए दिशानिर्देश",
                    articles: [
                        {
                            number: "38",
                            title: "राज्य लोक कल्याण की अभिवृद्धि के लिए सामाजिक व्यवस्था बनाएगा",
                            content: "राज्य लोक कल्याण की अभिवृद्धि के लिए सामाजिक व्यवस्था को, जिसमें सामाजिक, आर्थिक और राजनीतिक न्याय राष्ट्रीय जीवन की सभी संस्थाओं को अनुप्राणित करे, प्रभावी रूप से इस प्रकार बनाएगा कि उस व्यवस्था को बनाए रखने का प्रयास करेगा।",
                            keywords: ["कल्याण", "सामाजिक व्यवस्था", "न्याय"]
                        },
                        {
                            number: "39",
                            title: "राज्य द्वारा अनुसरणीय कुछ नीति तत्त्व",
                            content: "राज्य अपनी नीति का इस प्रकार संचालन करेगा कि सुनिश्चित रूप से: (क) पुरुष और स्त्री सभी नागरिकों को समान रूप से जीविका के पर्याप्त साधन प्राप्त करने का अधिकार हो; (ख) भौतिक संसाधनों का स्वामित्व और नियंत्रण इस प्रकार बंटा हो जिससे सामूहिक हित का उत्तम साधन हो; (ग) आर्थिक व्यवस्था के संचालन से धन का संकेंद्रण न हो।",
                            keywords: ["नीति", "जीविका", "संसाधन", "धन"]
                        }
                    ]
                },
                {
                    id: 4.5,
                    title: "भाग IVक - मूल कर्तव्य",
                    description: "प्रत्येक भारतीय नागरिक के मूल कर्तव्य",
                    articles: [
                        {
                            number: "51",
                            title: "मूल कर्तव्य",
                            content: "भारत के प्रत्येक नागरिक का यह कर्तव्य होगा कि वह: (क) संविधान का पालन करे; (ख) स्वतंत्रता के लिए हमारे राष्ट्रीय आंदोलन को प्रेरित करने वाले उच्च आदर्शों को हृदय में संजोए रखे; (ग) भारत की संप्रभुता, एकता और अखंडता की रक्षा करे; (घ) देश की रक्षा करे; (ङ) सामंजस्य और समान भ्रातृत्व की भावना का निर्माण करे; (च) हमारी सामासिक संस्कृति की गौरवशाली परंपरा का महत्व समझे; (छ) प्राकृतिक पर्यावरण की रक्षा करे; (ज) वैज्ञानिक दृष्टिकोण विकसित करे; (झ) सार्वजनिक संपत्ति की सुरक्षा करे; (ञ) उत्कर्ष की ओर बढ़ने का सतत प्रयास करे।",
                            keywords: ["कर्तव्य", "नागरिक", "जिम्मेदारी", "संरक्षण"]
                        }
                    ]
                }
            ]
        }
    };

    const data = constitutionData[language];

    const filteredParts = data.parts.filter(part =>
        part.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.articles.some(article =>
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const toggleBookmark = (article) => {
        if (bookmarks.find(b => b.number === article.number)) {
            setBookmarks(bookmarks.filter(b => b.number !== article.number));
        } else {
            setBookmarks([...bookmarks, article]);
        }
    };

    const handleDownloadPDF = () => {
        alert(language === 'en'
            ? 'PDF download feature coming soon! This will download the complete Constitution of India.'
            : 'PDF डाउनलोड सुविधा जल्द आ रही है! यह भारत के पूर्ण संविधान को डाउनलोड करेगी।');
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e293b 100%)' }}>
            <Header />

            <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '6rem 2rem 4rem' }}>
                {/* Enhanced Page Header */}
                <div style={{
                    padding: '3rem',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '2rem',
                    marginBottom: '3rem',
                    boxShadow: '0 20px 60px rgba(139, 92, 246, 0.2)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{
                                padding: '1rem',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                borderRadius: '1rem'
                            }}>
                                <BookOpen size={48} color="white" />
                            </div>
                            <div>
                                <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: '900', margin: '0 0 0.5rem 0' }}>
                                    {t('constitutionOfIndia')}
                                </h1>
                                <p style={{ color: '#94a3b8', fontSize: '1.1rem', margin: 0 }}>
                                    {language === 'en' ? 'The Supreme Law of India' : 'भारत का सर्वोच्च कानून'}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <button
                                onClick={toggleLanguage}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'rgba(139, 92, 246, 0.2)',
                                    border: '2px solid rgba(139, 92, 246, 0.4)',
                                    borderRadius: '0.75rem',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontWeight: '700',
                                    fontSize: '1rem',
                                    transition: 'all 0.3s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(139, 92, 246, 0.3)';
                                    e.target.style.borderColor = '#8b5cf6';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(139, 92, 246, 0.2)';
                                    e.target.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                                }}
                            >
                                <Globe size={20} />
                                {language === 'en' ? 'हिंदी में पढ़ें' : 'Read in English'}
                            </button>

                            <button
                                onClick={handleDownloadPDF}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontWeight: '700',
                                    fontSize: '1rem',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                            >
                                <Download size={20} />
                                {t('downloadPDF')}
                            </button>

                            <button
                                onClick={() => setShowAIChat(!showAIChat)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: showAIChat ? '#ec4899' : 'rgba(236, 72, 153, 0.2)',
                                    border: '2px solid rgba(236, 72, 153, 0.4)',
                                    borderRadius: '0.75rem',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontWeight: '700',
                                    fontSize: '1rem',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <MessageCircle size={20} />
                                {t('askAI')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={24} style={{
                            position: 'absolute',
                            left: '1.5rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#8b5cf6'
                        }} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('searchArticles')}
                            style={{
                                width: '100%',
                                padding: '1.5rem 1.5rem 1.5rem 4.5rem',
                                background: 'rgba(30, 41, 59, 0.6)',
                                backdropFilter: 'blur(10px)',
                                border: '2px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '1.5rem',
                                color: 'white',
                                fontSize: '1.125rem',
                                outline: 'none',
                                transition: 'all 0.3s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: showAIChat ? '1fr 400px' : '1fr', gap: '2rem' }}>
                    {/* Main Content */}
                    <div>
                        {selectedArticle ? (
                            // Article Detail View
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <button
                                    onClick={() => setSelectedArticle(null)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'rgba(139, 92, 246, 0.2)',
                                        border: '2px solid rgba(139, 92, 246, 0.3)',
                                        borderRadius: '0.75rem',
                                        color: '#8b5cf6',
                                        cursor: 'pointer',
                                        marginBottom: '2rem',
                                        fontWeight: '700',
                                        fontSize: '1rem'
                                    }}
                                >
                                    ← {language === 'en' ? 'Back' : 'वापस जाएं'}
                                </button>

                                <div style={{
                                    padding: '3rem',
                                    background: 'rgba(30, 41, 59, 0.6)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '2rem',
                                    border: '2px solid rgba(139, 92, 246, 0.3)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
                                        <span style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                            borderRadius: '1rem',
                                            color: 'white',
                                            fontWeight: '800',
                                            fontSize: '1.125rem'
                                        }}>
                                            {t('article')} {selectedArticle.number}
                                        </span>

                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <button
                                                onClick={() => toggleBookmark(selectedArticle)}
                                                style={{
                                                    padding: '0.75rem',
                                                    background: bookmarks.find(b => b.number === selectedArticle.number) ? '#8b5cf6' : 'rgba(139, 92, 246, 0.2)',
                                                    border: 'none',
                                                    borderRadius: '0.75rem',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s'
                                                }}
                                            >
                                                <Bookmark size={20} fill={bookmarks.find(b => b.number === selectedArticle.number) ? 'white' : 'none'} />
                                            </button>
                                            <button
                                                onClick={() => alert('Share feature coming soon!')}
                                                style={{
                                                    padding: '0.75rem',
                                                    background: 'rgba(139, 92, 246, 0.2)',
                                                    border: 'none',
                                                    borderRadius: '0.75rem',
                                                    color: 'white',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Share2 size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <h2 style={{ color: 'white', fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem', lineHeight: '1.3' }}>
                                        {selectedArticle.title}
                                    </h2>

                                    <p style={{ color: '#94a3b8', fontSize: '1.25rem', lineHeight: '2', marginBottom: '2rem' }}>
                                        {selectedArticle.content}
                                    </p>

                                    {selectedArticle.keywords && (
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {selectedArticle.keywords.map((keyword, idx) => (
                                                <span key={idx} style={{
                                                    padding: '0.5rem 1rem',
                                                    background: 'rgba(139, 92, 246, 0.1)',
                                                    border: '1px solid rgba(139, 92, 246, 0.3)',
                                                    borderRadius: '0.5rem',
                                                    color: '#a78bfa',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {keyword}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : selectedPart ? (
                            // Part Detail View
                            <div>
                                <button
                                    onClick={() => setSelectedPart(null)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'rgba(139, 92, 246, 0.2)',
                                        border: '2px solid rgba(139, 92, 246, 0.3)',
                                        borderRadius: '0.75rem',
                                        color: '#8b5cf6',
                                        cursor: 'pointer',
                                        marginBottom: '2rem',
                                        fontWeight: '700',
                                        fontSize: '1rem'
                                    }}
                                >
                                    ← {language === 'en' ? 'Back to Parts' : 'भागों पर वापस जाएं'}
                                </button>

                                <div style={{
                                    padding: '2rem',
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    borderRadius: '1.5rem',
                                    marginBottom: '2rem'
                                }}>
                                    <h2 style={{ color: 'white', fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.5rem' }}>
                                        {selectedPart.title}
                                    </h2>
                                    <p style={{ color: '#94a3b8', fontSize: '1.125rem' }}>
                                        {selectedPart.description}
                                    </p>
                                </div>

                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    {selectedPart.articles.map((article, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            onClick={() => setSelectedArticle(article)}
                                            whileHover={{ x: 8 }}
                                            style={{
                                                padding: '2rem',
                                                background: 'rgba(30, 41, 59, 0.6)',
                                                backdropFilter: 'blur(10px)',
                                                borderRadius: '1.5rem',
                                                border: '2px solid rgba(139, 92, 246, 0.2)',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = '#8b5cf6';
                                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                                <span style={{
                                                    padding: '0.6rem 1.25rem',
                                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                                    borderRadius: '0.75rem',
                                                    color: 'white',
                                                    fontWeight: '800',
                                                    fontSize: '0.95rem'
                                                }}>
                                                    {t('article')} {article.number}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleBookmark(article);
                                                    }}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: bookmarks.find(b => b.number === article.number) ? '#8b5cf6' : '#64748b'
                                                    }}
                                                >
                                                    <Bookmark size={20} fill={bookmarks.find(b => b.number === article.number) ? '#8b5cf6' : 'none'} />
                                                </button>
                                            </div>

                                            <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                                                {article.title}
                                            </h3>

                                            <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.7' }}>
                                                {article.content.substring(0, 150)}...
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // Parts List View
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                                gap: '2rem'
                            }}>
                                {filteredParts.map((part, idx) => (
                                    <motion.div
                                        key={part.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        onClick={() => setSelectedPart(part)}
                                        style={{
                                            padding: '2.5rem',
                                            background: 'rgba(30, 41, 59, 0.6)',
                                            backdropFilter: 'blur(10px)',
                                            borderRadius: '1.5rem',
                                            border: '2px solid rgba(139, 92, 246, 0.2)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#8b5cf6';
                                            e.currentTarget.style.boxShadow = '0 20px 50px rgba(139, 92, 246, 0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div style={{
                                            position: 'absolute',
                                            top: '1rem',
                                            right: '1rem',
                                            padding: '0.5rem 1rem',
                                            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                            borderRadius: '0.75rem',
                                            fontSize: '0.85rem',
                                            fontWeight: '800',
                                            color: 'white'
                                        }}>
                                            {part.articles.length} {t('articles')}
                                        </div>

                                        <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.3', paddingRight: '3rem' }}>
                                            {part.title}
                                        </h3>

                                        <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                                            {part.description}
                                        </p>

                                        <div style={{ color: '#8b5cf6', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {t('readMore')} →
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* AI Chat Sidebar */}
                    <AnimatePresence>
                        {showAIChat && (
                            <motion.div
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 100 }}
                                style={{
                                    position: 'sticky',
                                    top: '6rem',
                                    height: 'fit-content',
                                    maxHeight: 'calc(100vh - 8rem)',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <div style={{
                                    padding: '2rem',
                                    background: 'rgba(30, 41, 59, 0.8)',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: '1.5rem',
                                    border: '2px solid rgba(139, 92, 246, 0.3)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1.5rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
                                            {t('aiChatbotTitle')}
                                        </h3>
                                        <button
                                            onClick={() => setShowAIChat(false)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#94a3b8',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
                                        {t('askQuestion')}
                                    </p>

                                    <div style={{
                                        padding: '1.5rem',
                                        background: 'rgba(139, 92, 246, 0.1)',
                                        borderRadius: '1rem',
                                        border: '1px solid rgba(139, 92, 246, 0.2)'
                                    }}>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                                            {language === 'en'
                                                ? 'Try asking: "What are fundamental rights?" or "Explain Article 21"'
                                                : 'पूछें: "मौलिक अधिकार क्या हैं?" या "अनुच्छेद 21 समझाएं"'
                                            }
                                        </p>
                                    </div>

                                    <input
                                        type="text"
                                        value={aiQuery}
                                        onChange={(e) => setAiQuery(e.target.value)}
                                        placeholder={t('typeMessage')}
                                        style={{
                                            padding: '1rem',
                                            background: 'rgba(30, 41, 59, 0.6)',
                                            border: '2px solid rgba(139, 92, 246, 0.3)',
                                            borderRadius: '0.75rem',
                                            color: 'white',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)'}
                                    />

                                    <button
                                        style={{
                                            padding: '1rem',
                                            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                            border: 'none',
                                            borderRadius: '0.75rem',
                                            color: 'white',
                                            fontSize: '1rem',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                        onClick={() => alert(language === 'en'
                                            ? 'AI chat feature will be connected once Gemini quota resets!'
                                            : 'AI चैट सुविधा Gemini कोटा रीसेट होने के बाद कनेक्ट होगी!'
                                        )}
                                    >
                                        {t('send')}
                                    </button>
                                </div>

                                {/* Bookmarks */}
                                {bookmarks.length > 0 && (
                                    <div style={{
                                        marginTop: '1.5rem',
                                        padding: '1.5rem',
                                        background: 'rgba(30, 41, 59, 0.8)',
                                        backdropFilter: 'blur(20px)',
                                        borderRadius: '1.5rem',
                                        border: '2px solid rgba(139, 92, 246, 0.3)'
                                    }}>
                                        <h4 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Bookmark size={20} fill="#8b5cf6" color="#8b5cf6" />
                                            {t('bookmarks')}
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {bookmarks.map((bookmark, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => setSelectedArticle(bookmark)}
                                                    style={{
                                                        padding: '0.75rem',
                                                        background: 'rgba(139, 92, 246, 0.1)',
                                                        borderRadius: '0.75rem',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.background = 'rgba(139, 92, 246, 0.2)'}
                                                    onMouseLeave={(e) => e.target.style.background = 'rgba(139, 92, 246, 0.1)'}
                                                >
                                                    <p style={{ color: '#8b5cf6', fontSize: '0.85rem', fontWeight: '700', margin: '0 0 0.25rem 0' }}>
                                                        {t('article')} {bookmark.number}
                                                    </p>
                                                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                                                        {bookmark.title.length > 40 ? bookmark.title.substring(0, 40) + '...' : bookmark.title}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <Footer />
        </div>
    );
}
