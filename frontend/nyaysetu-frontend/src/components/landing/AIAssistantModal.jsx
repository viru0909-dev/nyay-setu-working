import { X, Brain, MessageCircle, Send, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useState, useRef, useEffect } from 'react';
import { brainAPI } from '../../services/api';
import ReactMarkdown from 'react-markdown';

export default function AIAssistantModal({ isOpen, onClose }) {
    const { language } = useLanguage();
    const [chatStarted, setChatStarted] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!isOpen) {
            setChatStarted(false);
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

    const handleQuestionClick = (question) => {
        setChatStarted(true);
        sendMessage(question);
    };

    const handleStartChat = () => {
        setChatStarted(true);
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

    return (
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
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '2rem'
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '900px',
                            width: '100%',
                            maxHeight: '90vh',
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            border: '2px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '2rem',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Close Button */}
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '1.5rem',
                                right: '1.5rem',
                                background: 'rgba(139, 92, 246, 0.2)',
                                border: '2px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '0.75rem',
                                width: '3rem',
                                height: '3rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'white',
                                transition: 'all 0.3s',
                                zIndex: 10
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)';
                                e.currentTarget.style.borderColor = '#8b5cf6';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                            }}
                        >
                            <X size={24} />
                        </motion.button>

                        {!chatStarted ? (
                            /* Welcome Screen */
                            <div style={{ padding: '3rem', overflow: 'auto' }}>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    style={{ textAlign: 'center', marginBottom: '3rem' }}
                                >
                                    <motion.div
                                        animate={{
                                            rotate: [0, 5, -5, 0],
                                            scale: [1, 1.05, 1]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatType: 'reverse'
                                        }}
                                        style={{
                                            display: 'inline-block',
                                            padding: '1.5rem',
                                            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                            borderRadius: '1.5rem',
                                            marginBottom: '1.5rem'
                                        }}
                                    >
                                        <Brain size={48} color="white" />
                                    </motion.div>

                                    <h2 style={{
                                        fontSize: '2.5rem',
                                        fontWeight: '900',
                                        color: 'white',
                                        marginBottom: '1rem',
                                        background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}>
                                        {language === 'en' ? 'AI-Powered Legal Brain' : 'AI-संचालित कानूनी मस्तिष्क'}
                                    </h2>

                                    <p style={{ color: '#94a3b8', fontSize: '1.125rem', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
                                        {language === 'en'
                                            ? 'Your intelligent assistant that understands Indian law and provides instant answers to your legal queries.'
                                            : 'आपका बुद्धिमान सहायक जो भारतीय कानून को समझता है और आपके कानूनी प्रश्नों के तत्काल उत्तर प्रदान करता है।'
                                        }
                                    </p>
                                </motion.div>

                                <motion.h3
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    style={{
                                        fontSize: '1.75rem',
                                        fontWeight: '800',
                                        color: 'white',
                                        marginBottom: '1.5rem',
                                        textAlign: 'center'
                                    }}
                                >
                                    {language === 'en' ? '💡 Try Asking' : '💡 पूछने का प्रयास करें'}
                                </motion.h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                                    {sampleQuestions.map((question, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + idx * 0.1 }}
                                            whileHover={{ scale: 1.02, x: 5 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleQuestionClick(question)}
                                            style={{
                                                padding: '1rem 1.5rem',
                                                background: 'rgba(30, 41, 59, 0.6)',
                                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                                borderRadius: '0.75rem',
                                                color: '#94a3b8',
                                                fontSize: '0.95rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                                                e.currentTarget.style.borderColor = '#8b5cf6';
                                                e.currentTarget.style.color = '#a78bfa';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                                                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                                                e.currentTarget.style.color = '#94a3b8';
                                            }}
                                        >
                                            "{question}"
                                        </motion.div>
                                    ))}
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                    style={{ textAlign: 'center' }}
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleStartChat}
                                        style={{
                                            padding: '1rem 2.5rem',
                                            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                            border: 'none',
                                            borderRadius: '0.75rem',
                                            color: 'white',
                                            fontSize: '1.125rem',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            transition: 'transform 0.2s'
                                        }}
                                    >
                                        <Sparkles size={20} />
                                        {language === 'en' ? 'Start Chatting Now!' : 'अभी चैट करना शुरू करें!'}
                                    </motion.button>
                                </motion.div>
                            </div>
                        ) : (
                            /* Chat Interface */
                            <div style={{ display: 'flex', flexDirection: 'column', height: '85vh', padding: '2rem', paddingTop: '4rem' }}>
                                <h2 style={{
                                    fontSize: '1.75rem',
                                    fontWeight: '800',
                                    color: 'white',
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}>
                                    <Brain size={32} style={{ color: '#8b5cf6' }} />
                                    {language === 'en' ? 'Legal AI Assistant' : 'कानूनी AI सहायक'}
                                </h2>

                                {/* Messages Area */}
                                <div style={{
                                    flex: 1,
                                    overflow: 'auto',
                                    marginBottom: '1.5rem',
                                    padding: '1rem',
                                    background: 'rgba(15, 23, 42, 0.5)',
                                    borderRadius: '1rem',
                                    border: '1px solid rgba(139, 92, 246, 0.2)'
                                }}>
                                    {messages.map((msg, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            style={{
                                                marginBottom: '1rem',
                                                padding: '1rem',
                                                borderRadius: '0.75rem',
                                                background: msg.role === 'user'
                                                    ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
                                                    : 'rgba(139, 92, 246, 0.1)',
                                                border: msg.role === 'ai' ? '1px solid rgba(139, 92, 246, 0.3)' : 'none',
                                                marginLeft: msg.role === 'user' ? 'auto' : '0',
                                                marginRight: msg.role === 'user' ? '0' : 'auto',
                                                maxWidth: '85%'
                                            }}
                                        >
                                            <div className="markdown-content">
                                                <ReactMarkdown>
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {isLoading && (
                                        <div style={{
                                            padding: '1rem',
                                            borderRadius: '0.75rem',
                                            background: 'rgba(139, 92, 246, 0.1)',
                                            border: '1px solid rgba(139, 92, 246, 0.3)',
                                            maxWidth: '85%'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Loader2 size={16} style={{ color: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
                                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                                                    {language === 'en' ? 'Thinking...' : 'सोच रहा हूँ...'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
                                        placeholder={language === 'en' ? 'Ask me anything about Indian law...' : 'भारतीय कानून के बारे में कुछ भी पूछें...'}
                                        style={{
                                            flex: 1,
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
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => sendMessage(inputMessage)}
                                        disabled={isLoading || !inputMessage.trim()}
                                        style={{
                                            padding: '1rem 1.5rem',
                                            background: isLoading || !inputMessage.trim()
                                                ? 'rgba(139, 92, 246, 0.3)'
                                                : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                            border: 'none',
                                            borderRadius: '0.75rem',
                                            color: 'white',
                                            fontSize: '1rem',
                                            fontWeight: '700',
                                            cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <Send size={20} />
                                    </motion.button>
                                </div>
                            </div>
                        )}

                        <style>{`
                            @keyframes spin {
                                from { transform: rotate(0deg); }
                                to { transform: rotate(360deg); }
                            }
                            
                            .markdown-content h1, 
                            .markdown-content h2, 
                            .markdown-content h3 {
                                font-size: 1.1rem !important;
                                font-weight: 700 !important;
                                margin-top: 0.75rem !important;
                                margin-bottom: 0.5rem !important;
                                color: #f8fafc !important;
                                line-height: 1.4 !important;
                            }
                            .markdown-content p {
                                margin-bottom: 0.75rem !important;
                                line-height: 1.6 !important;
                                color: inherit !important;
                            }
                            .markdown-content ul, 
                            .markdown-content ol {
                                margin-bottom: 0.75rem !important;
                                padding-left: 1.25rem !important;
                                color: inherit !important;
                            }
                            .markdown-content li {
                                margin-bottom: 0.35rem !important;
                            }
                            .markdown-content strong {
                                color: #c4b5fd !important;
                                font-weight: 700 !important;
                            }
                            .markdown-content code {
                                background: rgba(0,0,0,0.3) !important;
                                padding: 0.1rem 0.3rem !important;
                                border-radius: 0.25rem !important;
                                font-family: monospace !important;
                                font-size: 0.85rem !important;
                            }
                        `}</style>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
