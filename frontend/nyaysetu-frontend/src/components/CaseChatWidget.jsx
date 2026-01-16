import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, MessageSquare, Loader2, MinusCircle, Maximize2, Minimize2 } from 'lucide-react';
import { vakilFriendAPI } from '../services/api';
import ReactMarkdown from 'react-markdown';

export default function CaseChatWidget({ caseId, caseTitle }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isMinimized]);

    const handleToggle = () => {
        if (!isOpen) {
            setIsOpen(true);
            if (!sessionId && !isStarting) {
                startChatSession();
            }
        } else {
            setIsOpen(!isOpen);
        }
    };

    const startChatSession = async () => {
        try {
            setIsStarting(true);
            const response = await vakilFriendAPI.startCaseSession(caseId);
            setSessionId(response.data.sessionId);
            setMessages([{
                role: 'assistant',
                content: response.data.message || `I am ready to help with case: **${caseTitle}**`
            }]);
        } catch (error) {
            console.error("Failed to start case chat:", error);
            setMessages([{
                role: 'assistant',
                content: "⚠️ Failed to connect to AI assistant. Please try again later."
            }]);
        } finally {
            setIsStarting(false);
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMsg = inputMessage.trim();
        setInputMessage('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const response = await vakilFriendAPI.sendMessage(sessionId, userMsg);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.data.message
            }]);
        } catch (error) {
            console.error("Failed to send message:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "❌ Error sending message. Please try again."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={handleToggle}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    padding: '1rem',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.5)',
                    cursor: 'pointer',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title="Ask Vakil Friend about this case"
            >
                <Bot size={32} />
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: isMinimized ? '300px' : '400px',
            height: isMinimized ? 'auto' : '600px',
            maxHeight: '80vh',
            background: 'var(--bg-glass-strong)',
            backdropFilter: 'var(--glass-blur)',
            border: 'var(--border-glass-strong)',
            borderRadius: '1rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTopLeftRadius: '1rem',
                borderTopRightRadius: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Bot size={20} />
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Vakil Friend</h3>
                        <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.9 }}>Case Assistant</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}
                    >
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            {!isMinimized && (
                <>
                    <div style={{
                        flex: 1,
                        padding: '1rem',
                        overflowY: 'auto',
                        background: 'transparent',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        {isStarting ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div key={idx} style={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%',
                                    background: msg.role === 'user' ? 'var(--color-accent)' : 'var(--bg-white)',
                                    color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '1rem',
                                    borderBottomRightRadius: msg.role === 'user' ? '0.25rem' : '1rem',
                                    borderBottomLeftRadius: msg.role === 'user' ? '1rem' : '0.25rem',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.5',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}>
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            ))
                        )}
                        {isLoading && (
                            <div style={{ alignSelf: 'flex-start', background: 'var(--bg-white)', padding: '0.75rem 1rem', borderRadius: '1rem', borderBottomLeftRadius: '0.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-secondary)' }} />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{
                        padding: '1rem',
                        borderTop: 'var(--border-glass)',
                        background: 'var(--bg-glass-strong)',
                        display: 'flex',
                        gap: '0.5rem'
                    }}>
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask about this case..."
                            disabled={isLoading || isStarting}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: 'var(--border-glass)',
                                background: 'var(--bg-white)',
                                color: 'var(--text-main)',
                                outline: 'none'
                            }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={isLoading || isStarting || !inputMessage.trim()}
                            style={{
                                background: 'var(--color-accent)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                padding: '0.75rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: (isLoading || isStarting || !inputMessage.trim()) ? 0.5 : 1
                            }}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
