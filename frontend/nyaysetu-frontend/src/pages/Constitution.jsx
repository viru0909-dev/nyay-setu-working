import { useState, useMemo, useEffect } from 'react';

import { useTheme } from '../contexts/ThemeContext';
import { Search, BookOpen, Globe, Download, Bookmark, MessageCircle, Share2, X, BookmarkPlus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { brainAPI } from '../services/api';
import { useTranslation } from 'react-i18next';


export default function Constitution() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation('constitution');
    
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPartId, setSelectedPartId] = useState(null);
    const [selectedArticleNumber, setSelectedArticleNumber] = useState(null);
    const [showAIChat, setShowAIChat] = useState(false);
    const [bookmarks, setBookmarks] = useState([]);
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const language = i18n.language;

    // Enhanced Constitution Data with more articles
    

    
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

    const toggleBookmark = (article) => {
        if (bookmarks.find(b => b.number === article.number)) {
            setBookmarks(bookmarks.filter(b => b.number !== article.number));
        } else {
            setBookmarks([...bookmarks, article]);
        }
    };

    const handleDownloadPDF = () => {
        alert(t('pdfComingSoon'));
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
                                    e.target.style.opacity = '0.9';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.opacity = '1';
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
                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
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

                <div style={{ display: 'grid', gridTemplateColumns: showAIChat ? '1fr 400px' : '1fr', gap: '2rem' }}>
                    {/* Main Content */}
                    <div>
                        {selectedArticleNumber && selectedArticle  ? (
                            // Article Detail View
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
                                    ← {t('constitution:back')}
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
                        ) : selectedPartId && selectedPart ? (
                            // Part Detail View
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
                                            transition={{ delay: idx * 0.1 }}
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
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
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
                                        onClick={() => setSelectedPartId(part.id)}
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
                                            {part.articles.length} {t('constitution:articles')}
                                        </div>

                                        <h3 style={{ color: 'var(--color-primary)', fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.3', paddingRight: '3rem' }}>
                                            {part.title}
                                        </h3>

                                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                                            {part.description}
                                        </p>

                                        <div style={{ color: 'var(--color-primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {t('constitution:readMore')} →
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
                                    background: 'var(--bg-surface)',
                                    borderRadius: '1.5rem',
                                    border: '1px solid var(--border-light)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1.5rem',
                                    boxShadow: 'var(--shadow-glass)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ color: 'var(--color-primary)', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
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
                                        background: 'var(--bg-hover)',
                                        borderRadius: '1rem',
                                        border: '1px solid var(--border-light)'
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
                                        onKeyPress={(e) => e.key === 'Enter' && handleAIChat()}
                                        placeholder={t('typeMessage')}
                                        style={{
                                            padding: '1rem',
                                            background: 'var(--bg-input)',
                                            border: '1px solid var(--border-light)',
                                            borderRadius: '0.75rem',
                                            color: 'var(--text-main)',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            width: '100%'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
                                        onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
                                    />

                                    <button
                                        onClick={handleAIChat}
                                        disabled={isAiLoading || !aiQuery.trim()}
                                        style={{
                                            padding: '1rem',
                                            background: isAiLoading || !aiQuery.trim()
                                                ? 'rgba(30, 42, 68, 0.3)'
                                                : 'var(--color-primary)',
                                            border: 'none',
                                            borderRadius: '0.75rem',
                                            color: 'white',
                                            fontSize: '1rem',
                                            fontWeight: '700',
                                            cursor: isAiLoading || !aiQuery.trim() ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                        onMouseEnter={(e) => !isAiLoading && aiQuery.trim() && (e.target.style.transform = 'scale(1.05)')}
                                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                    >
                                        {isAiLoading ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                                                {language === 'en' ? 'Thinking...' : 'सोच रहा हूँ...'}
                                            </>
                                        ) : (
                                            t('send')
                                        )}
                                    </button>

                                    {aiResponse && (
                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '1.5rem',
                                            background: 'var(--bg-hover)',
                                            borderRadius: '1rem',
                                            border: '1px solid var(--border-light)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                                                <MessageCircle size={24} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                                                <div>
                                                    <h4 style={{ color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                                                        {language === 'en' ? 'AI Response:' : 'AI उत्तर:'}
                                                    </h4>
                                                    <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                                                        {aiResponse}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

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
                                                    onClick={() => setSelectedArticle(bookmark)}
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
                                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
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

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div >
    );
}
