import { useState, useMemo, useEffect } from 'react';
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
import { downloadConstitutionPdf } from '../utils/downloadConstitutionPdf';

import useGuest from '../hooks/useGuest';
import useAuthStore from '../store/authStore';
import GuestBlurredResults from '../components/guest/GuestBlurredResults';

export default function Constitution() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation('constitution');

    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPartId, setSelectedPartId] = useState(null);
    const [selectedArticleNumber, setSelectedArticleNumber] = useState(null);
    const [showAIChat, setShowAIChat] = useState(false);
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
    const [isDownloading, setIsDownloading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const language = i18n.language;
    const { isGuest } = useGuest();
    const updateGuestPrefs = useAuthStore((s) => s.updateGuestPrefs);
    const setGuestIntent = useAuthStore((s) => s.setGuestIntent);

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

    const handleDownloadPDF = async () => {
        if (isDownloading) return; // guard against double-clicks (Hindi PDF is ~19 MB)
        setIsDownloading(true);
        try {
            await downloadConstitutionPdf(language, t);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleAIChat = async () => {
        if (!aiQuery.trim()) return;

        setIsAiLoading(true);
        try {
            const response = await brainAPI.chat(aiQuery, sessionId);
            setAiResponse(response.data.message);
            if (response.data.sessionId) setSessionId(response.data.sessionId);
        } catch (error) {
            console.error('AI Chat Error:', error);
            setAiResponse(t('aiError'));
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {/* Spinner keyframes — `.animate-spin` is used in this file but is not
                defined by any global stylesheet, so define it locally. */}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`}</style>
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
                                disabled={isDownloading}
                                aria-busy={isDownloading}
                                aria-label={t('downloadPdfAria')}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'var(--color-primary)',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    color: 'white',
                                    cursor: isDownloading ? 'wait' : 'pointer',
                                    opacity: isDownloading ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontWeight: '700',
                                    fontSize: '1rem',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => { if (!isDownloading) e.currentTarget.style.transform = 'scale(1.05)'; }}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {isDownloading
                                    ? <Loader2 size={20} className="animate-spin" />
                                    : <Download size={20} />}
                                {isDownloading
                                    ? t('downloadInProgress')
                                    : t('constitution:downloadPDF')}
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

                    {/* AI Assistant Side Draw Panel */}
                    <AnimatePresence>
                        {showAIChat && (
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                style={{
                                    background: 'var(--bg-surface)',
                                    borderRadius: '1.5rem',
                                    border: '1px solid var(--border-light)',
                                    padding: '1.5rem',
                                    boxShadow: 'var(--shadow-glass)',
                                    position: 'sticky',
                                    top: '6rem',
                                    height: 'calc(100vh - 10rem)',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-primary)', margin: 0 }}>
                                        Constitution AI
                                    </h3>
                                    <button onClick={() => setShowAIChat(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                        <X size={20} />
                                    </button>
                                </div>

                                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', background: 'var(--bg-main)', borderRadius: '1rem', padding: '1rem' }}>
                                    {aiResponse ? (
                                        <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.6', margin: 0 }}>
                                            {aiResponse}
                                        </p>
                                    ) : (
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', margin: '2rem 0' }}>
                                            Ask anything about parts, contextual clauses, or legal language mutations.
                                        </p>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        value={aiQuery}
                                        onChange={(e) => setAiQuery(e.target.value)}
                                        placeholder="Ask AI assistant..."
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem 1rem',
                                            borderRadius: '0.75rem',
                                            border: '1px solid var(--border-light)',
                                            background: 'var(--bg-input)',
                                            color: 'var(--text-main)',
                                            outline: 'none'
                                        }}
                                    />
                                    <button
                                        onClick={handleAIChat}
                                        disabled={isAiLoading}
                                        style={{
                                            padding: '0.75rem 1.25rem',
                                            background: 'var(--color-primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '0.75rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : 'Send'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <Footer />
        </div>
    );
}