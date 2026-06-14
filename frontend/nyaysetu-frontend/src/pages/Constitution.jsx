import { useState, useEffect, useRef ,useMemo } from 'react';


import { useTheme } from '../contexts/ThemeContext';
import {
    Search, BookOpen, Globe, Download, Bookmark, MessageCircle, Share2, X, BookmarkPlus, Loader2, Map,
    ShieldCheck,
    Landmark,
    Scale,
    Building2,
    Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { brainAPI } from '../services/api';
import { useTranslation } from 'react-i18next';

import useGuest from '../hooks/useGuest';
import useAuthStore from '../store/authStore';
import GuestBlurredResults from '../components/guest/GuestBlurredResults';

const Z_INDEX = {
  FLOATING_PANEL: 1000,
  FLOATING_PANEL_OVERLAY: 1001,
};

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
    const { t, i18n } = useTranslation('constitution');

    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPartId, setSelectedPartId] = useState(null);
    const [selectedArticleNumber, setSelectedArticleNumber] = useState(null);
    const [showAIChat, setShowAIChat] = useState(false);
    const [isPanelMinimized, setIsPanelMinimized] = useState(false);
    const [bookmarks, setBookmarks] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [systemVoices, setSystemVoices] = useState([]);

// Warm up and capture device engine voices on mount
useEffect(() => {
    const updateVoices = () => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            setSystemVoices(window.speechSynthesis.getVoices());
        }
    };

    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
    }
}, []);
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const language = i18n.language;
    const { isGuest } = useGuest();
    const updateGuestPrefs = useAuthStore((s) => s.updateGuestPrefs);
    const setGuestIntent = useAuthStore((s) => s.setGuestIntent);

    // Responsive
    const isMobile = useIsMobile();

    // Swipe-to-dismiss state for mobile bottom sheet
    const dragStartY = useRef(null);
    const [sheetDragOffset, setSheetDragOffset] = useState(0);
    const responseEndRef = useRef(null);

    // Enhanced Constitution Data with more articles
    const partIcons = {
        1: <Map size={40} />,
        3: <ShieldCheck size={40} />,
        4: <Landmark size={40} />,
        5: <Scale size={40} />,
        6: <Building2 size={40} />,
        9: <Users size={40} />,
    };

    const parts = useMemo(() => {
        return i18n.getResource(
            i18n.language,
            'constitution',
            'parts'
        ) || [];
    }, [i18n.language]);

    const selectedPart = useMemo(() => {
        return parts.find(
            part => part.id === selectedPartId
        );
    }, [parts, selectedPartId]);

    const selectedArticle = useMemo(() => {
        return selectedPart?.articles.find(
            article => article.number === selectedArticleNumber
        );
    }, [selectedPart, selectedArticleNumber]);

    const filteredParts = parts.filter(part =>
        part.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.articles.some(article =>
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const searchMatches = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return [];

        const matches = [];
        parts.forEach((part) => {
            part.articles.forEach((article) => {
                if (
                    article.title.toLowerCase().includes(q) ||
                    article.content.toLowerCase().includes(q) ||
                    part.title.toLowerCase().includes(q)
                ) {
                    matches.push({
                        ...article,
                        partId: part.id,
                        partTitle: part.title,
                        matchId: `${part.id}-${article.number}`,
                    });
                }
            });
        });
        return matches;
    }, [parts, searchQuery]);

    useEffect(() => {
        if (isGuest) {
            updateGuestPrefs({ visitedConstitution: true });
        }
    }, [isGuest, updateGuestPrefs]);

    const handleGuestSignUp = () => {
        setGuestIntent({ path: '/constitution', feature: 'view all search matches' });
        navigate('/signup', { state: { from: { pathname: '/constitution' } } });
    };

    const renderSearchMatchCard = (article, _index, isLockedPreview) => (
        <div
            className={`guest-search-card${isLockedPreview ? ' guest-search-card--locked' : ''}`}
            onClick={isLockedPreview ? undefined : () => { setSelectedPartId(article.partId); setSelectedArticleNumber(article.number); }}
            onKeyDown={isLockedPreview ? undefined : (e) => { if (e.key === 'Enter') { setSelectedPartId(article.partId); setSelectedArticleNumber(article.number); } }}
            role={isLockedPreview ? undefined : 'button'}
            tabIndex={isLockedPreview ? undefined : 0}
            style={{
                padding: '1.5rem',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                borderRadius: '1rem',
                marginBottom: '1rem',
                cursor: isLockedPreview ? 'default' : 'pointer'
            }}
        >
            <span className="guest-search-card__part" style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 'bold', display: 'block', marginBottom: '0.25rem' }}>
                {article.partTitle}
            </span>
            <h3 style={{ color: 'var(--color-primary)', fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.45rem', lineHeight: 1.35 }}>
                {t('article')} {article.number}: {article.title}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                {article.content.substring(0, 140)}…
            </p>
        </div>
    );

    const toggleBookmark = (article) => {
        if (bookmarks.find(b => b.number === article.number)) {
            setBookmarks(bookmarks.filter(b => b.number !== article.number));
        } else {
            setBookmarks([...bookmarks, article]);
        }
    };
  const handleSpeak = (text) => {
    if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        return;
    }

    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);

    // Map i18n codes to standard regional voice tags
    const langMapping = {
        en: 'en-IN',
        hi: 'hi-IN',
        mr: 'mr-IN',
        ta: 'ta-IN',
        te: 'te-IN'
    };

    const targetLang = langMapping[language] || 'en-IN';
    utterance.lang = targetLang;

    // Use our state-cached system voices list
    const voicesList = systemVoices.length > 0 ? systemVoices : window.speechSynthesis.getVoices();
    
    // Look for an exact accent match (e.g., ta-IN)
    let matchingVoice = voicesList.find(voice => 
        voice.lang.toLowerCase().replace('_', '-').includes(targetLang.toLowerCase())
    );

    // Fallback: Look for the primary language prefix (e.g., ta)
    if (!matchingVoice) {
        matchingVoice = voicesList.find(voice => 
            voice.lang.toLowerCase().startsWith(language.toLowerCase())
        );
    }

    // Secondary Fallback: Fall back to Indian English accent so it reads something out loud
    if (!matchingVoice) {
        console.warn(`Native audio accent pack not found on this device for code: ${targetLang}. Falling back to default.`);
        matchingVoice = voicesList.find(voice => 
            voice.lang.toLowerCase().replace('_', '-').includes('en-in')
        );
    }

    if (matchingVoice) {
        utterance.voice = matchingVoice;
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (e) => {
        console.error("Speech Synthesis Error:", e);
        setIsPlaying(false);
    };

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
};
// Clean up speech if the user navigates away or closes the article
useEffect(() => {
    return () => {
        window.speechSynthesis.cancel();
    };
}, [selectedArticleNumber]);

    const handleDownloadPDF = () => {
        const pdfByLanguage = {
            en: {
                href: '/documents/COI_MAY2024.pdf',
                filename: 'Constitution_of_India_English.pdf',
            },
            hi: {
                href: '/documents/COI_MAY2024_Hindi.pdf',
                filename: 'Constitution_of_India_Hindi.pdf',
            },
        };
    
        // Use Hindi PDF when page is in Hindi, otherwise English
        const pdf = language === 'hi' ? pdfByLanguage.hi : pdfByLanguage.en;
    
        const link = document.createElement('a');
        link.href = pdf.href;
        link.setAttribute('download', pdf.filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
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
            setAiResponse(t('aiError'));
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <Header />

            {/* geometric grid pattern — same as Landing hero */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(124,92,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
            
            <div style={{ maxWidth: '1600px', width: '100%', margin: '0 auto', padding: '6rem 2rem 4rem', position: 'relative', zIndex: 1, flex: '1 0 auto' }}>
                {/* Page Header */}
                <div style={{
                    padding: '3rem',
                    background: 'var(--bg-glass)',
                    backgroundImage: "url('/assets/constitution.png')",
                    backgroundPosition: 'center',
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
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
                                    {t('constitution:title')}
                                </h1>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
                                    {t('constitution:subtitle')}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <button
                                onClick={() =>
                                    i18n.changeLanguage(language === 'en' ? 'hi' : 'en')
                                }
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
                                    e.currentTarget.style.opacity = '0.9';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.opacity = '1';
                                }}
                            >
                                <Globe size={20} />
                                {language === 'en'
                                    ? t('readHindi')
                                    : t('readEnglish')}
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
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <Download size={20} />
                                {t('constitution:downloadPDF')}
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
                                {t('constitution:askAI')}
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

                <div style={{ display: 'grid', gridTemplateColumns: showAIChat ? '1fr 400px' : '1fr', gap: '2rem', alignItems: 'start' }}>
                    {/* Main Content Pane */}
                    <div>
                        {selectedArticleNumber && selectedArticle ? (
                            // 1. Article Detail View
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <button
                                    onClick={() => setSelectedArticleNumber(null)}
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
                                    {t('constitution:back')}
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
                                            {t('constitution:article')} {selectedArticle.number}
                                        </span>

                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <button
    onClick={() => handleSpeak(`${selectedArticle.title}. ${selectedArticle.content}`)}
    style={{
        padding: '0.75rem',
        background: isPlaying ? '#EF4444' : 'var(--bg-hover)',
        border: '1px solid var(--border-light)',
        borderRadius: '0.75rem',
        color: isPlaying ? 'white' : 'var(--color-primary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s',
        minWidth: '44px',
        minHeight: '44px'
    }}
    title={isPlaying ? "Stop Listening" : "Listen to Article"}
>
    {isPlaying ? (
        <X size={20} />
    ) : (
        <span style={{ fontSize: '1.25rem', display: 'inline-block', transform: 'scaleX(-1)' }}>📣</span>
    )}
</button>
                                            <button
                                                onClick={() => toggleBookmark(selectedArticle)}
                                                style={{
                                                    padding: '0.75rem',
                                                    background: bookmarks.find(b => b.number === selectedArticle.number) ? 'var(--color-primary)' : '#F1F5F9',
                                                    border: '1px solid #E2E8F0',
                                                    borderRadius: '0.75rem',
                                                    color: bookmarks.find(b => b.number === selectedArticle.number) ? 'white' : 'var(--color-primary)',
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
                                                    background: 'var(--bg-hover)',
                                                    border: '1px solid var(--border-light)',
                                                    borderRadius: '0.75rem',
                                                    color: 'var(--text-main)',
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
                                                    background: 'var(--bg-hover)',
                                                    border: '1px solid var(--border-light)',
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
                        ) : selectedPartId && selectedPart ? (
                            // 2. Part Detail View / Article Stack
                            <div>
                                <button
                                    onClick={() => setSelectedPartId(null)}
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
                                    ← {t('constitution:backToParts')}
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
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => setSelectedArticleNumber(article.number)}
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
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                <span style={{
                                                    padding: '0.6rem 1.25rem',
                                                    background: 'var(--color-primary)',
                                                    borderRadius: '0.75rem',
                                                    color: 'white',
                                                    fontWeight: '800',
                                                    fontSize: '0.95rem'
                                                }}>
                                                    {t('constitution:article')} {article.number}
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
                        ) : searchQuery.trim() && searchMatches.length > 0 ? (
                            // 3. Search Results Mode
                            <div>
                                <p className="guest-search-banner" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    <Search size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                                    <span>
                                        <strong style={{ color: 'var(--text-main)' }}>{searchMatches.length}</strong>
                                        {' '}article{searchMatches.length > 1 ? 's' : ''} found
                                        {isGuest && ' · Showing a preview — sign up for full results'}
                                    </span>
                                </p>
                                {isGuest ? (
                                    <GuestBlurredResults
                                        items={searchMatches.map((m) => ({ ...m, id: m.matchId }))}
                                        renderItem={renderSearchMatchCard}
                                        onSignUp={handleGuestSignUp}
                                        signUpLabel="Sign up to view all matches"
                                    />
                                ) : (
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {searchMatches.map((article, idx) => (
                                            <div key={article.matchId}>{renderSearchMatchCard(article, idx, false)}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : searchQuery.trim() ? (
                            // 4. Empty Search State
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '4rem 2rem' }}>
                                {language === 'en' ? 'No articles matched your search.' : 'आपकी खोज से कोई अनुच्छेद मेल नहीं खाता।'}
                            </p>
                        ) : (
                            // 5. Default Grid Layout (Parts Overview)
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
                                        transition={{ delay: idx * 0.05 }}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        onClick={() => setSelectedPartId(part.id)}
                                        style={{
                                            padding: '4rem 2.5rem 2.5rem',
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
                                            top: '1.5rem',
                                            right: '1.5rem',
                                            color: 'var(--color-primary)',
                                            opacity: 0.15
                                        }}>
                                            {partIcons[part.id] || <BookOpen size={40} />}
                                        </div>

                                        <h3 style={{ color: 'var(--color-primary)', fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem' }}>
                                            {part.title}
                                        </h3>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                                            {part.description}
                                        </p>
                                        <span style={{ display: 'inline-block', marginTop: '1.5rem', fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                                            {part.articles?.length || 0} {t('articles', { defaultValue: 'Articles' })} →
                                        </span>
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
                                    zIndex: Z_INDEX.FLOATING_PANEL,
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
                                    zIndex: Z_INDEX.FLOATING_PANEL,
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
                                    zIndex: Z_INDEX.FLOATING_PANEL_OVERLAY,
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


                                {/* Bookmarks */}
{bookmarks.length > 0 && (
    <div style={{
        marginTop: '1.5rem',
        padding: '1.5rem',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '1.5rem',
        border: '1px solid var(--border-light)'
    }}>
        <h4 style={{ color: 'var(--color-primary)', fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bookmark size={20} fill="var(--color-primary)" color="var(--color-primary)" />
            {t('bookmarks')}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {bookmarks.map((bookmark, idx) => (
                <div
                    key={idx}
                    onClick={() => setSelectedArticleNumber(bookmark.number)}
                    style={{
                        padding: '0.75rem',
                        background: 'rgba(30, 42, 68, 0.05)',
                        borderRadius: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(30, 42, 68, 0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(30, 42, 68, 0.05)'}
                >
                    <p style={{ color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: '700', margin: '0 0 0.25rem 0' }}>
                        {t('article')} {bookmark.number}
                    </p>
                </div>
            ))}            
        </div>             
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