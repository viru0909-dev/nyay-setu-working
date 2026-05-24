import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Search, BookOpen, Globe, Download, Bookmark, MessageCircle, Share2, X, BookmarkPlus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { brainAPI } from '../services/api';

// ── Reactive mobile breakpoint hook ──────────────────────────────────────────
function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(
        () => typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
    );
    useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
        const handler = (e) => setIsMobile(e.matches);
        mq.addEventListener('change', handler);
        setIsMobile(mq.matches);
        return () => mq.removeEventListener('change', handler);
    }, [breakpoint]);
    return isMobile;
}

export default function Constitution() {
    const navigate = useNavigate();
    const { language, toggleLanguage, t } = useLanguage();
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPart, setSelectedPart] = useState(null);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [showAIChat, setShowAIChat] = useState(false);
    const [isPanelMinimized, setIsPanelMinimized] = useState(false);
    const [bookmarks, setBookmarks] = useState([]);
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);

    // Responsive
    const isMobile = useIsMobile();

    // Swipe-to-dismiss state for mobile bottom sheet
    const dragStartY = useRef(null);
    const [sheetDragOffset, setSheetDragOffset] = useState(0);
    const responseEndRef = useRef(null);

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
                    id: 2,
                    title: "Part II - Citizenship",
                    description: "Articles related to citizenship of India",
                    articles: [
                        {
                            number: "5",
                            title: "Citizenship at the commencement of the Constitution",
                            content: "At the commencement of this Constitution, every person who has his domicile in the territory of India and who was born in the territory of India, or either of whose parents was born in the territory of India, or who has been ordinarily resident in the territory of India for not less than five years immediately preceding such commencement, shall be a citizen of India.",
                            keywords: ["citizenship", "constitution", "domicile", "india"]
                        },
                        {
                            number: "6",
                            title: "Rights of citizenship of certain persons who have migrated from Pakistan to India",
                            content: "A person who has migrated to the territory of India from Pakistan shall be deemed to be a citizen of India if he or either of his parents or grandparents was born in India as defined in the Government of India Act, 1935, and if certain conditions relating to migration and registration are fulfilled.",
                            keywords: ["migration", "pakistan", "citizenship", "registration"]
                        },
                        {
                            number: "7",
                            title: "Rights of citizenship of certain migrants to Pakistan",
                            content: "A person who has after the first day of March, 1947, migrated from the territory of India to Pakistan shall not be deemed to be a citizen of India unless he has returned to India under a permit for resettlement or permanent return.",
                            keywords: ["migration", "pakistan", "permit", "citizenship"]
                        },
                        {
                            number: "8",
                            title: "Rights of citizenship of certain persons of Indian origin residing outside India",
                            content: "Any person of Indian origin residing outside India who or either of whose parents or grandparents was born in India may register as a citizen of India through diplomatic or consular representatives of India in the country where they reside.",
                            keywords: ["indian origin", "outside india", "citizenship", "registration"]
                        },
                        {
                            number: "9",
                            title: "Persons voluntarily acquiring citizenship of a foreign State not to be citizens",
                            content: "No person shall be a citizen of India if he has voluntarily acquired the citizenship of any foreign State.",
                            keywords: ["foreign state", "citizenship", "voluntary"]
                        },
                        {
                            number: "10",
                            title: "Continuance of the rights of citizenship",
                            content: "Every person who is or is deemed to be a citizen of India under the foregoing provisions shall continue to be such citizen, subject to the provisions of any law made by Parliament.",
                            keywords: ["rights", "citizenship", "parliament"]
                        },
                         {
                            number: "11",
                            title: "Parliament to regulate the right of citizenship by law",
                            content: "Nothing in the foregoing provisions shall derogate from the power of Parliament to make any provision with respect to the acquisition and termination of citizenship and all other matters relating to citizenship.",
                            keywords: ["parliament", "citizenship", "law", "termination"]
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
                    id: 2,
                    title: "भाग II - नागरिकता",
                    description: "भारत की नागरिकता से संबंधित अनुच्छेद",
                    articles: [
                        {
                            number: "5",
                            title: "संविधान के प्रारंभ पर नागरिकता",
                            content: "इस संविधान के प्रारंभ पर प्रत्येक व्यक्ति, जिसका भारत के राज्यक्षेत्र में अधिवास है और जो भारत के राज्यक्षेत्र में जन्मा था या जिसके माता या पिता में से कोई भारत के राज्यक्षेत्र में जन्मा था या जो ऐसे प्रारंभ से ठीक पहले कम से कम पाँच वर्ष तक भारत में सामान्य रूप से निवास कर रहा था, भारत का नागरिक होगा।",
                            keywords: ["नागरिकता", "संविधान", "अधिवास", "भारत"]
                        },
                        {
                            number: "6",
                            title: "पाकिस्तान से भारत आए कुछ व्यक्तियों के नागरिकता के अधिकार",
                            content: "जो व्यक्ति पाकिस्तान से भारत आया है, वह भारत का नागरिक माना जाएगा यदि वह या उसके माता-पिता या दादा-दादी में से कोई भारत में जन्मा था तथा प्रव्रजन और पंजीकरण से संबंधित शर्तें पूरी करता हो।",
                            keywords: ["प्रव्रजन", "पाकिस्तान", "नागरिकता", "पंजीकरण"]
                        },
                        {
                            number: "7",
                            title: "पाकिस्तान जाने वाले कुछ प्रवासियों के नागरिकता के अधिकार",
                            content: "जो व्यक्ति 1 मार्च 1947 के बाद भारत से पाकिस्तान चला गया है, वह भारत का नागरिक नहीं माना जाएगा, जब तक कि वह पुनर्वास या स्थायी वापसी के परमिट के अंतर्गत भारत वापस न आया हो।",
                            keywords: ["प्रवास", "पाकिस्तान", "परमिट", "नागरिकता"]
                        },
                        {
                            number: "8",
                            title: "भारत के बाहर रहने वाले भारतीय मूल के कुछ व्यक्तियों के नागरिकता के अधिकार",
                            content: "भारत के बाहर रहने वाला भारतीय मूल का कोई व्यक्ति, जिसके माता-पिता या दादा-दादी में से कोई भारत में जन्मा था, उस देश में भारत के राजनयिक या वाणिज्य दूतावास प्रतिनिधि के समक्ष पंजीकरण कराकर भारत का नागरिक बन सकता है।",
                            keywords: ["भारतीय मूल", "विदेश", "नागरिकता", "पंजीकरण"]
                        },
                        {
                            number: "9",
                            title: "विदेशी राज्य की नागरिकता स्वेच्छा से ग्रहण करने वाले व्यक्ति भारत के नागरिक नहीं होंगे",
                            content: "यदि किसी व्यक्ति ने स्वेच्छा से किसी विदेशी राज्य की नागरिकता ग्रहण कर ली है, तो वह भारत का नागरिक नहीं होगा।",
                            keywords: ["विदेशी राज्य", "नागरिकता", "स्वेच्छा"]
                        },
                        {
                            number: "10",
                            title: "नागरिकता के अधिकारों का बना रहना",
                            content: "जो व्यक्ति उपर्युक्त उपबंधों के अधीन भारत का नागरिक है या माना गया है, वह संसद द्वारा बनाई गई विधि के अधीन नागरिक बना रहेगा।",
                            keywords: ["अधिकार", "नागरिकता", "संसद"]
                        },
                        {
                           number: "11",
                            title: "संसद द्वारा नागरिकता के अधिकार का विनियमन",
                            content: "उपर्युक्त उपबंध संसद की उस शक्ति को प्रभावित नहीं करेंगे जिसके द्वारा वह नागरिकता के अर्जन और समाप्ति तथा नागरिकता से संबंधित अन्य विषयों पर विधि बना सके।",
                            keywords: ["संसद", "नागरिकता", "विधि", "समाप्ति"]
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

    const handleAIChat = async () => {
        if (!aiQuery.trim()) return;

        setIsAiLoading(true);
        setAiQuery('');
        try {
            const response = await brainAPI.chat(aiQuery, sessionId);
            setAiResponse(response.data.message);
            if (response.data.sessionId) setSessionId(response.data.sessionId);
            // Scroll to bottom of response area after answer arrives
            setTimeout(() => responseEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
        } catch (error) {
            console.error('AI Chat Error:', error);
            setAiResponse(language === 'en'
                ? 'Sorry, I encountered an error. Please try again.'
                : 'क्षमा करें, एक त्रुटि हुई। कृपया पुनः प्रयास करें।');
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', position: 'relative' }}>
            <Header />

            {/* geometric grid pattern — same as Landing hero */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(124,92,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
            <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '6rem 2rem 4rem', position: 'relative', zIndex: 1 }}>
                {/* Page Header */}
                <div style={{
                    padding: '3rem',
                    background: 'var(--bg-glass)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '2rem',
                    marginBottom: '3rem',
                    boxShadow: 'var(--shadow-glass)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{
                                padding: '1rem',
                                background: 'var(--color-primary)',
                                borderRadius: '1rem'
                            }}>
                                <BookOpen size={48} color="white" />
                            </div>
                            <div>
                                <h1 style={{ color: 'var(--color-primary)', fontSize: '2.5rem', fontWeight: '900', margin: '0 0 0.5rem 0' }}>
                                    {t('constitutionOfIndia')}
                                </h1>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
                                    {language === 'en' ? 'The Supreme Law of India' : 'भारत का सर्वोच्च कानून'}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <button
                                onClick={toggleLanguage}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'var(--color-primary)',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    color: '#FFFFFF',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontWeight: '700',
                                    fontSize: '1rem',
                                    transition: 'all 0.3s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.opacity = '0.9';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.opacity = '1';
                                }}
                            >
                                <Globe size={20} />
                                {language === 'en' ? 'हिंदी में पढ़ें' : 'Read in English'}
                            </button>

                            <button
                                onClick={handleDownloadPDF}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'var(--color-primary)',
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
                                    background: showAIChat ? 'var(--color-primary)' : 'var(--bg-surface)',
                                    border: showAIChat ? '2px solid var(--color-primary)' : '1px solid var(--border-medium)',
                                    borderRadius: '0.75rem',
                                    color: showAIChat ? '#FFFFFF' : 'var(--text-main)',
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
                            color: 'var(--color-primary)'
                        }} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('searchArticles')}
                            style={{
                                width: '100%',
                                padding: '1.5rem 1.5rem 1.5rem 4.5rem',
                                background: 'var(--bg-input)',
                                border: '1px solid var(--border-light)',
                                borderRadius: '1.5rem',
                                color: 'var(--text-main)',
                                fontSize: '1.125rem',
                                outline: 'none',
                                transition: 'all 0.3s',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--border-focus)';
                                e.target.style.boxShadow = '0 0 0 3px rgba(63,93,204,0.12)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--border-light)';
                                e.target.style.boxShadow = 'var(--shadow-sm)';
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
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
                                        background: 'var(--bg-hover)',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: '0.75rem',
                                        color: 'var(--text-main)',
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
                                    background: 'var(--bg-surface)',
                                    borderRadius: '2rem',
                                    border: '1px solid var(--border-light)',
                                    boxShadow: 'var(--shadow-glass)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
                                        <span style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'var(--color-primary)',
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
                                                    background: bookmarks.find(b => b.number === selectedArticle.number) ? 'var(--color-primary)' : '#F1F5F9',
                                                    border: '1px solid #E2E8F0',
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
                                                    background: 'var(--bg-glass)',
                                                    border: 'var(--border-glass)',
                                                    borderRadius: '0.75rem',
                                                    color: 'white',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Share2 size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <h2 style={{ color: 'var(--color-primary)', fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem', lineHeight: '1.3' }}>
                                        {selectedArticle.title}
                                    </h2>

                                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', lineHeight: '2', marginBottom: '2rem' }}>
                                        {selectedArticle.content}
                                    </p>

                                    {selectedArticle.keywords && (
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {selectedArticle.keywords.map((keyword, idx) => (
                                                <span key={idx} style={{
                                                    padding: '0.5rem 1rem',
                                                    background: 'var(--bg-glass)',
                                                    border: 'var(--border-glass)',
                                                    borderRadius: '0.5rem',
                                                    color: 'var(--color-primary)',
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
                                        background: 'var(--bg-hover)',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: '0.75rem',
                                        color: 'var(--text-main)',
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
                                    background: 'var(--bg-surface)',
                                    borderRadius: '1.5rem',
                                    marginBottom: '2rem',
                                    border: '1px solid var(--border-light)',
                                    boxShadow: 'var(--shadow-glass)'
                                }}>
                                    <h2 style={{ color: 'var(--color-primary)', fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.5rem' }}>
                                        {selectedPart.title}
                                    </h2>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
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
                                                background: 'var(--bg-surface)',
                                                borderRadius: '1.5rem',
                                                border: '1px solid var(--border-light)',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s',
                                                boxShadow: 'var(--shadow-sm)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--border-focus)';
                                                e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--border-light)';
                                                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                                <span style={{
                                                    padding: '0.6rem 1.25rem',
                                                    background: 'var(--color-primary)',
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
                                                        color: bookmarks.find(b => b.number === article.number) ? 'var(--color-primary)' : '#64748b'
                                                    }}
                                                >
                                                    <Bookmark size={20} fill={bookmarks.find(b => b.number === article.number) ? 'var(--color-primary)' : 'none'} />
                                                </button>
                                            </div>

                                            <h3 style={{ color: 'var(--color-primary)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                                                {article.title}
                                            </h3>

                                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7' }}>
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
                                            background: 'var(--bg-surface)',
                                            borderRadius: '1.5rem',
                                            border: '1px solid var(--border-light)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            boxShadow: 'var(--shadow-sm)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--border-focus)';
                                            e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--border-light)';
                                            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                        }}
                                    >
                                        <div style={{
                                            position: 'absolute',
                                            top: '1rem',
                                            right: '1rem',
                                            padding: '0.5rem 1rem',
                                            border: '1px solid rgba(30, 42, 68, 0.1)',
                                            borderRadius: '0.75rem',
                                            fontSize: '0.85rem',
                                            fontWeight: '800',
                                            background: 'var(--color-primary)',
                                            color: '#FFFFFF'
                                        }}>
                                            {part.articles.length} {t('articles')}
                                        </div>

                                        <h3 style={{ color: 'var(--color-primary)', fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.3', paddingRight: '3rem' }}>
                                            {part.title}
                                        </h3>

                                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                                            {part.description}
                                        </p>

                                        <div style={{ color: 'var(--color-primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {t('readMore')} →
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* === FLOATING AI LEGAL ASSISTANT === */}

                    {/* FAB — shown when panel is closed */}
                    <AnimatePresence>
                        {!showAIChat && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.7, y: 16 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.7, y: 16 }}
                                transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
                                onClick={() => { setShowAIChat(true); setSheetDragOffset(0); }}
                                style={{
                                    position: 'fixed',
                                    bottom: isMobile ? '24px' : '28px',
                                    right: isMobile ? '20px' : '28px',
                                    zIndex: 1000,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '50px',
                                    padding: isMobile ? '14px 18px' : '14px 22px',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 24px rgba(79,70,229,0.5), 0 2px 8px rgba(0,0,0,0.3)',
                                    fontWeight: '700',
                                    fontSize: '14px',
                                    overflow: 'visible',
                                }}
                                whileHover={{ y: -3, scale: 1.05, boxShadow: '0 8px 32px rgba(79,70,229,0.6)' }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <MessageCircle size={18} />
                                {language === 'en' ? 'Legal AI' : 'कानूनी AI'}
                                {/* Pulse ring */}
                                <span style={{
                                    position: 'absolute',
                                    inset: '-4px',
                                    borderRadius: '50px',
                                    border: '2px solid rgba(79,70,229,0.45)',
                                    animation: 'al-pulse-ring 2.2s ease-out infinite',
                                    pointerEvents: 'none',
                                }} />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    {/* ── Mobile: dim backdrop ─────────────────────────────── */}
                    <AnimatePresence>
                        {showAIChat && isMobile && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => setShowAIChat(false)}
                                style={{
                                    position: 'fixed', inset: 0,
                                    background: 'rgba(0,0,0,0.6)',
                                    zIndex: 1000,
                                    backdropFilter: 'blur(3px)',
                                    WebkitBackdropFilter: 'blur(3px)',
                                }}
                            />
                        )}
                    </AnimatePresence>

                    {/* ── Floating Panel (desktop) / Bottom Sheet (mobile) ── */}
                    <AnimatePresence>
                        {showAIChat && (
                            <motion.div
                                key="ai-panel"
                                /* Desktop: pop up from bottom-right; Mobile: slide up from bottom */
                                initial={isMobile
                                    ? { y: '100%' }
                                    : { opacity: 0, y: 24, scale: 0.96 }}
                                animate={isMobile
                                    ? { y: sheetDragOffset > 0 ? sheetDragOffset : 0 }
                                    : { opacity: 1, y: 0, scale: 1 }}
                                exit={isMobile
                                    ? { y: '100%' }
                                    : { opacity: 0, y: 24, scale: 0.96 }}
                                transition={{ duration: isMobile ? 0.35 : 0.26, ease: isMobile ? [0.32, 0.72, 0, 1] : [0.34, 1.56, 0.64, 1] }}
                                style={{
                                    position: 'fixed',
                                    zIndex: 1001,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    background: 'var(--bg-surface)',
                                    overflow: 'hidden',
                                    ...(isMobile ? {
                                        /* Bottom sheet */
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: '82vh',
                                        borderRadius: '22px 22px 0 0',
                                        boxShadow: '0 -8px 40px rgba(0,0,0,0.45)',
                                        border: '1px solid rgba(79,70,229,0.2)',
                                        borderBottom: 'none',
                                    } : {
                                        /* Floating panel — anchored top+bottom so it never hides under navbar or clips the right edge */
                                        top: isPanelMinimized ? 'auto' : '80px',   /* clears ~72px navbar */
                                        bottom: '24px',
                                        right: '24px',
                                        width: '360px',
                                        maxHeight: isPanelMinimized ? 'none' : 'calc(100vh - 104px)', /* 80px top + 24px bottom */
                                        height: isPanelMinimized ? 'auto' : undefined,
                                        borderRadius: '18px',
                                        border: '1px solid rgba(79,70,229,0.28)',
                                        boxShadow: '0 24px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(79,70,229,0.08)',
                                    })
                                }}
                                /* Touch swipe-to-dismiss for mobile */
                                onTouchStart={(e) => {
                                    if (isMobile) dragStartY.current = e.touches[0].clientY;
                                }}
                                onTouchMove={(e) => {
                                    if (!isMobile || dragStartY.current === null) return;
                                    const delta = e.touches[0].clientY - dragStartY.current;
                                    if (delta > 0) setSheetDragOffset(delta);
                                }}
                                onTouchEnd={() => {
                                    if (!isMobile) return;
                                    if (sheetDragOffset > 100) {
                                        setShowAIChat(false);
                                        setSheetDragOffset(0);
                                    } else {
                                        setSheetDragOffset(0);
                                    }
                                    dragStartY.current = null;
                                }}
                            >
                                {/* ── Mobile drag handle ─────────────────────── */}
                                {isMobile && (
                                    <div
                                        style={{ padding: '12px 0 4px', display: 'flex', justifyContent: 'center', flexShrink: 0, cursor: 'grab' }}
                                    >
                                        <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.25)', borderRadius: '2px' }} />
                                    </div>
                                )}

                                {/* ── Panel header ───────────────────────────── */}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: isMobile ? '14px 20px 14px' : '13px 16px',
                                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                        flexShrink: 0,
                                        cursor: isPanelMinimized ? 'pointer' : 'default',
                                    }}
                                    onClick={() => isPanelMinimized && setIsPanelMinimized(false)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '34px', height: '34px',
                                            background: 'rgba(255,255,255,0.18)',
                                            borderRadius: '10px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <MessageCircle size={17} color="#fff" />
                                        </div>
                                        <div>
                                            <div style={{ color: '#fff', fontWeight: '700', fontSize: isMobile ? '15px' : '13px', lineHeight: 1.2 }}>
                                                {language === 'en' ? 'AI Legal Assistant' : 'AI कानूनी सहायक'}
                                            </div>
                                            {!isPanelMinimized && (
                                                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: isMobile ? '12px' : '11px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <span style={{ width: '6px', height: '6px', background: '#4ade80', borderRadius: '50%', display: 'inline-block' }} />
                                                    NyaySetu Brain · Groq
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {/* Minimize toggle — desktop only */}
                                        {!isMobile && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setIsPanelMinimized(!isPanelMinimized); }}
                                                style={{
                                                    width: '28px', height: '28px',
                                                    background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px',
                                                    color: '#fff', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '13px', lineHeight: 1,
                                                    transition: 'background 0.15s',
                                                }}
                                                title={isPanelMinimized ? 'Expand' : 'Minimize'}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                            >
                                                {isPanelMinimized ? '▲' : '▬'}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => { setShowAIChat(false); setIsPanelMinimized(false); setSheetDragOffset(0); }}
                                            style={{
                                                width: '28px', height: '28px',
                                                background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px',
                                                color: '#fff', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                        >
                                            <X size={15} />
                                        </button>
                                    </div>
                                </div>

                                {/* ── Panel body — hidden when minimized (desktop) ── */}
                                {!isPanelMinimized && (
                                    <>
                                        {/* Scrollable response area */}
                                        <div style={{
                                            flex: 1,
                                            overflowY: 'auto',
                                            padding: isMobile ? '20px 20px 12px' : '16px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            scrollbarWidth: 'thin',
                                            scrollbarColor: 'rgba(79,70,229,0.3) transparent',
                                            minHeight: 0, /* critical for flex+overflow to work */
                                        }}>
                                            {/* Empty / hint state */}
                                            {!aiResponse && !isAiLoading && (
                                                <div style={{ textAlign: 'center', padding: isMobile ? '24px 8px' : '16px 8px' }}>
                                                    <div style={{
                                                        width: '52px', height: '52px', margin: '0 auto 14px',
                                                        background: 'linear-gradient(135deg, rgba(79,70,229,0.18), rgba(124,58,237,0.18))',
                                                        borderRadius: '16px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                        <MessageCircle size={26} color="#818cf8" />
                                                    </div>
                                                    <p style={{ color: '#94a3b8', fontSize: isMobile ? '14px' : '13px', lineHeight: 1.6, margin: '0 0 18px' }}>
                                                        {language === 'en'
                                                            ? 'Ask me about law, cases, or the Constitution'
                                                            : 'कानून, मामले, या संविधान के बारे में पूछें'}
                                                    </p>
                                                    {/* Suggestion chips */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        {[
                                                            language === 'en' ? 'What are Fundamental Rights?' : 'मौलिक अधिकार क्या हैं?',
                                                            language === 'en' ? 'Explain Article 21' : 'अनुच्छेद 21 समझाएं',
                                                            language === 'en' ? 'What is the Preamble?' : 'प्रस्तावना क्या है?',
                                                        ].map((s) => (
                                                            <button
                                                                key={s}
                                                                onClick={() => setAiQuery(s)}
                                                                style={{
                                                                    background: 'rgba(79,70,229,0.08)',
                                                                    border: '1px solid rgba(79,70,229,0.22)',
                                                                    color: '#a5b4fc',
                                                                    borderRadius: '10px',
                                                                    padding: isMobile ? '11px 14px' : '8px 12px',
                                                                    fontSize: isMobile ? '13px' : '12px',
                                                                    cursor: 'pointer',
                                                                    textAlign: 'left',
                                                                    transition: 'all 0.15s',
                                                                    fontFamily: 'inherit',
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.background = 'rgba(79,70,229,0.18)';
                                                                    e.currentTarget.style.transform = 'translateX(4px)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.background = 'rgba(79,70,229,0.08)';
                                                                    e.currentTarget.style.transform = 'translateX(0)';
                                                                }}
                                                            >
                                                                ✦ {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Loading dots */}
                                            {isAiLoading && (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '28px 20px' }}>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        {[0, 1, 2].map((i) => (
                                                            <span key={i} style={{
                                                                width: '9px', height: '9px',
                                                                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                                                borderRadius: '50%',
                                                                display: 'inline-block',
                                                                animation: `al-bounce-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                                                            }} />
                                                        ))}
                                                    </div>
                                                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
                                                        {language === 'en' ? 'Consulting legal knowledge…' : 'कानूनी ज्ञान खोज रहा हूँ…'}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Response bubble */}
                                            {aiResponse && !isAiLoading && (
                                                <div style={{
                                                    background: 'rgba(79,70,229,0.07)',
                                                    border: '1px solid rgba(79,70,229,0.18)',
                                                    borderRadius: '14px',
                                                    padding: isMobile ? '18px' : '14px',
                                                }}>
                                                    <div style={{
                                                        color: '#818cf8', fontSize: '11px', fontWeight: '700',
                                                        marginBottom: '10px', letterSpacing: '0.6px',
                                                        display: 'flex', alignItems: 'center', gap: '6px',
                                                    }}>
                                                        ⚖️ {language === 'en' ? 'AI Response' : 'AI उत्तर'}
                                                    </div>
                                                    <p style={{
                                                        color: 'var(--text-main)',
                                                        fontSize: isMobile ? '15px' : '13px',
                                                        lineHeight: '1.7',
                                                        margin: 0,
                                                        whiteSpace: 'pre-wrap',
                                                    }}>
                                                        {aiResponse}
                                                    </p>
                                                    {/* Ask another button */}
                                                    <button
                                                        onClick={() => setAiResponse('')}
                                                        style={{
                                                            marginTop: '14px',
                                                            background: 'rgba(79,70,229,0.12)',
                                                            border: '1px solid rgba(79,70,229,0.25)',
                                                            borderRadius: '8px',
                                                            color: '#a5b4fc',
                                                            padding: '7px 14px',
                                                            fontSize: '12px',
                                                            cursor: 'pointer',
                                                            fontFamily: 'inherit',
                                                            transition: 'all 0.15s',
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(79,70,229,0.22)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(79,70,229,0.12)'}
                                                    >
                                                        {language === 'en' ? '↩ Ask another question' : '↩ दूसरा प्रश्न पूछें'}
                                                    </button>
                                                </div>
                                            )}

                                            {/* Scroll anchor */}
                                            <div ref={responseEndRef} />
                                        </div>

                                        {/* ── Input row ────────────────────────── */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            gap: '10px',
                                            padding: isMobile ? '14px 20px 28px' : '12px 14px',
                                            borderTop: '1px solid rgba(255,255,255,0.07)',
                                            flexShrink: 0,
                                            background: 'var(--bg-surface)',
                                        }}>
                                            <textarea
                                                value={aiQuery}
                                                onChange={(e) => setAiQuery(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleAIChat();
                                                    }
                                                }}
                                                placeholder={language === 'en' ? 'Ask about law or the Constitution…' : 'कानून या संविधान के बारे में पूछें…'}
                                                rows={isMobile ? 2 : 2}
                                                style={{
                                                    flex: 1,
                                                    background: 'var(--bg-input)',
                                                    border: '1px solid rgba(255,255,255,0.12)',
                                                    borderRadius: '12px',
                                                    color: 'var(--text-main)',
                                                    fontSize: isMobile ? '15px' : '13px',
                                                    padding: '10px 14px',
                                                    resize: 'none',
                                                    outline: 'none',
                                                    fontFamily: 'inherit',
                                                    lineHeight: 1.5,
                                                    transition: 'border-color 0.15s',
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = 'rgba(79,70,229,0.55)'}
                                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                                            />
                                            <button
                                                onClick={handleAIChat}
                                                disabled={isAiLoading || !aiQuery.trim()}
                                                style={{
                                                    width: isMobile ? '46px' : '40px',
                                                    height: isMobile ? '46px' : '40px',
                                                    flexShrink: 0,
                                                    background: isAiLoading || !aiQuery.trim()
                                                        ? 'rgba(79,70,229,0.28)'
                                                        : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                                    border: 'none', borderRadius: '12px',
                                                    color: '#fff',
                                                    cursor: isAiLoading || !aiQuery.trim() ? 'not-allowed' : 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    boxShadow: isAiLoading || !aiQuery.trim() ? 'none' : '0 2px 10px rgba(79,70,229,0.45)',
                                                    transition: 'all 0.2s',
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isAiLoading && aiQuery.trim()) {
                                                        e.currentTarget.style.transform = 'scale(1.08)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                            >
                                                {isAiLoading
                                                    ? <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />
                                                    : <MessageCircle size={17} />
                                                }
                                            </button>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* === END FLOATING AI LEGAL ASSISTANT === */}
                </div>
            </div>

            <Footer />

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes al-pulse-ring {
                    0%   { opacity: 1; transform: scale(1); }
                    70%  { opacity: 0; transform: scale(1.4); }
                    100% { opacity: 0; }
                }
                @keyframes al-bounce-dot {
                    0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
                    40%           { transform: scale(1.1); opacity: 1; }
                }
            `}</style>
        </div >
    );
}