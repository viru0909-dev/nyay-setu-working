import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I\'m your AI legal assistant powered by Google Gemini. How can I help you with legal questions today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            // Call Gemini backend endpoint
            const response = await fetch('http://localhost:8080/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input
                })
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();
            const aiResponse = {
                role: 'assistant',
                content: data.response || 'I apologize, but I encountered an error. Please try again.'
            };
            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorResponse = {
                role: 'assistant',
                content: 'I understand your question. As an AI legal assistant, I can help you with general legal information about Indian law, the Constitution, case filing procedures, and more. For specific legal advice, please consult with a qualified lawyer. What would you like to know?'
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    zIndex: 1001
                }}
            >
                <MessageCircle size={28} />
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'fixed',
                            bottom: '100px',
                            right: '2rem',
                            width: '400px',
                            maxWidth: 'calc(100vw - 4rem)',
                            height: '600px',
                            maxHeight: 'calc(100vh - 140px)',
                            background: 'rgba(15, 23, 42, 0.98)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '1rem',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
                            zIndex: 1001,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1.25rem',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <MessageCircle size={24} color="white" />
                                <div>
                                    <h3 style={{ color: 'white', fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>
                                        AI Legal Assistant
                                    </h3>
                                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', margin: 0 }}>
                                        Powered by Google Gemini
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    padding: '0.5rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    color: 'white'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}>
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        display: 'flex',
                                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                                    }}
                                >
                                    <div style={{
                                        maxWidth: '80%',
                                        padding: '0.875rem 1.125rem',
                                        borderRadius: '1rem',
                                        background: msg.role === 'user'
                                            ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
                                            : 'rgba(51, 65, 85, 0.6)',
                                        color: 'white',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.5'
                                    }}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div style={{ display: 'flex' }}>
                                    <div style={{
                                        padding: '0.875rem 1.125rem',
                                        borderRadius: '1rem',
                                        background: 'rgba(51, 65, 85, 0.6)',
                                        color: 'white',
                                        fontSize: '0.9rem'
                                    }}>
                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                            <span style={{ animation: 'bounce 1.4s infinite' }}>●</span>
                                            <span style={{ animation: 'bounce 1.4s infinite 0.2s' }}>●</span>
                                            <span style={{ animation: 'bounce 1.4s infinite 0.4s' }}>●</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div style={{
                            padding: '1.25rem',
                            borderTop: '1px solid rgba(139, 92, 246, 0.2)',
                            background: 'rgba(30, 41, 59, 0.5)'
                        }}>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask me about law, cases, or the Constitution..."
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem 1rem',
                                        background: 'rgba(15, 23, 42, 0.5)',
                                        border: '2px solid rgba(139, 92, 246, 0.2)',
                                        borderRadius: '0.75rem',
                                        color: 'white',
                                        fontSize: '0.95rem',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                    style={{
                                        padding: '0.75rem 1.25rem',
                                        background: input.trim()
                                            ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
                                            : 'rgba(139, 92, 246, 0.3)',
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        color: 'white',
                                        cursor: input.trim() ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>

                        <style>{`
                            @keyframes bounce {
                                0%, 60%, 100% { transform: translateY(0); }
                                30% { transform: translateY(-4px); }
                            }
                        `}</style>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
