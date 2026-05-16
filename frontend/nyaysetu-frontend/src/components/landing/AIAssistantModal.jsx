import { X, Brain, Send, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { brainAPI } from '../../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AIAssistantModal({ isOpen, onClose }) {
    const { language } = useLanguage();
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    useEffect(() => {
        if (!isOpen) {
            setMessages([]);
            setInputMessage('');
            setSessionId(null);
        }
    }, [isOpen]);

    const sendMessage = async (text) => {
        if (!text.trim()) return;
        const userMessage = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);
        try {
            const response = await brainAPI.chat(text, sessionId);
            const aiMessage = { role: 'ai', content: response.data.message };
            setMessages(prev => [...prev, aiMessage]);
            if (response.data.sessionId) setSessionId(response.data.sessionId);
        } catch (error) {
            console.error('AI Chat Error:', error);
            const errorMessage = {
                role: 'ai',
                content: language === 'en'
                    ? 'Sorry, I encountered an error. Please try again.'
                    : 'क्षमा करें, एक त्रुटि हुई। कृपया पुनः प्रयास करें।'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const sampleQuestions = language === 'en'
        ? [
            "What are my fundamental rights?",
            "How do I file a case online?",
            "Explain Article 21 of the Constitution",
            "What is bail and how does it work?",
            "How to find a lawyer near me?"
        ]
        : [
            "मेरे मौलिक अधिकार क्या हैं?",
            "मैं ऑनलाइन मामला कैसे दर्ज करूं?",
            "संविधान के अनुच्छेद 21 को समझाएं",
            "जमानत क्या है और यह कैसे काम करती है?",
            "मेरे पास वकील कैसे खोजें?"
        ];

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.55)',
                        backdropFilter: 'blur(6px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '1.5rem'
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.96, opacity: 0, y: 16 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.96, opacity: 0, y: 16 }}
                        transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
                        onClick={e => e.stopPropagation()}
                        style={{
                            width: '95vw',
                            maxWidth: '1000px',
                            height: '88vh',
                            maxHeight: '88vh',
                            background: 'var(--bg-surface)',
                            border: 'var(--border-glass-strong)',
                            borderRadius: '1.25rem',
                            boxShadow: 'var(--shadow-glass-strong)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                    >
                        {/* ── Header ── */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1.25rem 1.5rem',
                            borderBottom: '1px solid var(--border-light)',
                            background: 'var(--bg-surface)',
                            flexShrink: 0
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '2.5rem',
                                    height: '2.5rem',
                                    borderRadius: '0.75rem',
                                    background: 'rgba(63,93,204,0.12)',
                                    border: '1px solid rgba(63,93,204,0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Brain size={20} style={{ color: 'var(--color-accent)' }} />
                                </div>
                                <div>
                                    <h2 style={{
                                        fontSize: '1.2rem',
                                        fontWeight: '800',
                                        color: 'var(--text-main)',
                                        margin: 0,
                                        lineHeight: 1.2,
                                        fontFamily: 'var(--font-heading)'
                                    }}>
                                        {language === 'en' ? 'Legal AI Assistant' : 'कानूनी AI सहायक'}
                                    </h2>
                                    <p style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-muted)',
                                        margin: 0,
                                        lineHeight: 1
                                    }}>
                                        {language === 'en' ? 'Powered by NyaySetu AI' : 'NyaySetu AI द्वारा संचालित'}
                                    </p>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.08, rotate: 90 }}
                                whileTap={{ scale: 0.92 }}
                                transition={{ type: 'spring', stiffness: 350 }}
                                onClick={onClose}
                                style={{
                                    background: 'var(--bg-hover)',
                                    border: '1px solid var(--border-medium)',
                                    borderRadius: '0.625rem',
                                    width: '2.5rem',
                                    height: '2.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                    flexShrink: 0
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(63,93,204,0.1)';
                                    e.currentTarget.style.borderColor = 'var(--color-accent)';
                                    e.currentTarget.style.color = 'var(--color-accent)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'var(--bg-hover)';
                                    e.currentTarget.style.borderColor = 'var(--border-medium)';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }}
                            >
                                <X size={18} />
                            </motion.button>
                        </div>

                        {/* ── Chat Area ── */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '1.25rem 1.5rem',
                            background: 'var(--bg-main)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0'
                        }}>
                            {/* Suggestions */}
                            {messages.length === 0 && (
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.625rem',
                                        marginBottom: '1rem'
                                    }}>
                                        <div style={{
                                            width: '2rem',
                                            height: '2rem',
                                            borderRadius: '50%',
                                            background: 'rgba(63,93,204,0.12)',
                                            border: '1px solid rgba(63,93,204,0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <Sparkles size={14} style={{ color: 'var(--color-accent)' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1 }}>
                                                {language === 'en' ? 'Try Asking' : 'पूछ कर देखें'}
                                            </div>
                                            <div style={{
                                                fontSize: '0.95rem',
                                                fontWeight: '700',
                                                color: 'var(--text-main)',
                                                lineHeight: 1.2,
                                                fontFamily: 'var(--font-heading)'
                                            }}>
                                                {language === 'en' ? 'Common Questions' : 'सामान्य प्रश्न'}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                        {sampleQuestions.map((q, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.06, duration: 0.22 }}
                                                onClick={() => sendMessage(q)}
                                                style={{
                                                    padding: '0.9rem 1.1rem',
                                                    background: 'var(--bg-surface)',
                                                    border: '1px solid var(--border-medium)',
                                                    borderRadius: '0.75rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    boxShadow: 'var(--shadow-sm)',
                                                    transition: 'all 0.18s ease'
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.borderColor = 'var(--color-accent)';
                                                    e.currentTarget.style.background = 'rgba(63,93,204,0.06)';
                                                    e.currentTarget.style.transform = 'translateX(3px)';
                                                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.borderColor = 'var(--border-medium)';
                                                    e.currentTarget.style.background = 'var(--bg-surface)';
                                                    e.currentTarget.style.transform = 'translateX(0)';
                                                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                                }}
                                            >
                                                <span style={{
                                                    color: 'var(--text-main)',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '500',
                                                    lineHeight: 1.4
                                                }}>
                                                    {q}
                                                </span>
                                                <span style={{
                                                    color: 'var(--color-accent)',
                                                    fontWeight: '700',
                                                    fontSize: '1rem',
                                                    flexShrink: 0
                                                }}>→</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Messages */}
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    style={{
                                        display: 'flex',
                                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        marginBottom: '0.875rem'
                                    }}
                                >
                                    {msg.role === 'ai' && (
                                        <div style={{
                                            width: '1.75rem',
                                            height: '1.75rem',
                                            borderRadius: '50%',
                                            background: 'rgba(63,93,204,0.12)',
                                            border: '1px solid rgba(63,93,204,0.25)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            marginRight: '0.5rem',
                                            marginTop: '0.25rem'
                                        }}>
                                            <Brain size={12} style={{ color: 'var(--color-accent)' }} />
                                        </div>
                                    )}

                                    <div style={{
                                        maxWidth: '72%',
                                        padding: '0.875rem 1rem',
                                        borderRadius: msg.role === 'user'
                                            ? '1rem 1rem 0.25rem 1rem'
                                            : '1rem 1rem 1rem 0.25rem',
                                        lineHeight: '1.6',
                                        fontSize: '0.9rem',
                                        background: msg.role === 'user'
                                            ? 'var(--color-accent)'
                                            : 'var(--bg-surface)',
                                        color: msg.role === 'user'
                                            ? '#fff'
                                            : 'var(--text-main)',
                                        border: msg.role === 'ai'
                                            ? '1px solid var(--border-medium)'
                                            : 'none',
                                        boxShadow: msg.role === 'ai'
                                            ? 'var(--shadow-md)'
                                            : '0 2px 8px rgba(63,93,204,0.3)'
                                    }}>
                                        <div className="markdown-content">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}
                                >
                                    <div style={{
                                        width: '1.75rem',
                                        height: '1.75rem',
                                        borderRadius: '50%',
                                        background: 'rgba(63,93,204,0.12)',
                                        border: '1px solid rgba(63,93,204,0.25)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <Brain size={12} style={{ color: 'var(--color-accent)' }} />
                                    </div>
                                    <div style={{
                                        padding: '0.75rem 1rem',
                                        borderRadius: '1rem 1rem 1rem 0.25rem',
                                        background: 'var(--bg-surface)',
                                        border: '1px solid var(--border-medium)',
                                        boxShadow: 'var(--shadow-sm)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <Loader2 size={14} style={{ color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            {language === 'en' ? 'Thinking…' : 'सोच रहा हूँ…'}
                                        </span>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* ── Input ── */}
                        <div style={{
                            padding: '1rem 1.5rem',
                            borderTop: '1px solid var(--border-light)',
                            background: 'var(--bg-surface)',
                            display: 'flex',
                            gap: '0.625rem',
                            alignItems: 'center',
                            flexShrink: 0
                        }}>
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={e => setInputMessage(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && sendMessage(inputMessage)}
                                placeholder={
                                    language === 'en'
                                        ? 'Ask about Indian law (e.g. Article 21, bail, FIR…)'
                                        : 'भारतीय कानून के बारे में कुछ भी पूछें…'
                                }
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1rem',
                                    background: 'var(--bg-input)',
                                    border: '1.5px solid var(--border-medium)',
                                    color: 'var(--text-main)',
                                    borderRadius: '0.75rem',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    fontFamily: 'var(--font-body)',
                                    transition: 'border-color 0.18s, box-shadow 0.18s'
                                }}
                                onFocus={e => {
                                    e.target.style.borderColor = 'var(--border-focus)';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(63,93,204,0.15)';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = 'var(--border-medium)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => sendMessage(inputMessage)}
                                disabled={isLoading || !inputMessage.trim()}
                                style={{
                                    padding: '0.75rem',
                                    width: '2.75rem',
                                    height: '2.75rem',
                                    background: isLoading || !inputMessage.trim()
                                        ? 'var(--bg-hover)'
                                        : 'var(--color-accent)',
                                    border: isLoading || !inputMessage.trim()
                                        ? '1.5px solid var(--border-medium)'
                                        : 'none',
                                    borderRadius: '0.75rem',
                                    color: isLoading || !inputMessage.trim()
                                        ? 'var(--text-muted)'
                                        : '#fff',
                                    cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: isLoading || !inputMessage.trim()
                                        ? 'none'
                                        : '0 2px 8px rgba(63,93,204,0.35)',
                                    transition: 'all 0.18s ease'
                                }}
                            >
                                <Send size={17} />
                            </motion.button>
                        </div>

                        <style>{`
                            @keyframes spin {
                                from { transform: rotate(0deg); }
                                to   { transform: rotate(360deg); }
                            }
                            .markdown-content p {
                                margin-bottom: 0.6rem !important;
                                line-height: 1.65 !important;
                                color: inherit !important;
                            }
                            .markdown-content p:last-child { margin-bottom: 0 !important; }
                            .markdown-content h1,
                            .markdown-content h2,
                            .markdown-content h3 {
                                font-size: 1rem !important;
                                font-weight: 700 !important;
                                margin: 0.75rem 0 0.4rem !important;
                                color: var(--text-main) !important;
                                font-family: var(--font-heading) !important;
                            }
                            .markdown-content ul,
                            .markdown-content ol {
                                margin-bottom: 0.6rem !important;
                                padding-left: 1.25rem !important;
                                color: inherit !important;
                            }
                            .markdown-content li { margin-bottom: 0.3rem !important; }
                            .markdown-content strong {
                                color: var(--color-accent) !important;
                                font-weight: 700 !important;
                            }
                            .markdown-content code {
                                background: var(--bg-hover) !important;
                                border: 1px solid var(--border-light) !important;
                                padding: 0.1rem 0.35rem !important;
                                border-radius: 0.3rem !important;
                                font-family: monospace !important;
                                font-size: 0.82rem !important;
                            }
                        `}</style>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
