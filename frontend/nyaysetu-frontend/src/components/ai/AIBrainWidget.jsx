import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, User, ChevronDown, Minimize2, Maximize2, Sparkles, Loader2 } from 'lucide-react';
import { brainAPI } from '../../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AIBrainWidget({ user }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeMsg = getWelcomeMessage(user?.role);
            setMessages([{ role: 'assistant', content: welcomeMsg }]);
        }
    }, [isOpen, user?.role]);

    const getWelcomeMessage = (role) => {
        switch (role) {
            case 'JUDGE': return "🙏 NyaySetu Judicial Brain online. I can help analyze dossiers, check evidence validity, or suggest procedural steps for your pending cases. How may I assist you, Your Honor?";
            case 'LAWYER': return "Greetings, Counselor. I'm ready to assist with case drafting, IPC/BNS research, or client communication strategies. What's on the agenda today?";
            case 'LITIGANT': return "🙏 Namaste. I am your NyaySetu legal guide. I can help you understand your rights, file a new case, or find a legal representative. What would you like to know?";
            default: return "Hello. I am the NyaySetu AI Brain. How can I help you today?";
        }
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const response = await brainAPI.chat(userMsg, sessionId);
            setMessages(prev => [...prev, { role: 'assistant', content: response.data.message }]);
            if (response.data.sessionId) setSessionId(response.data.sessionId);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Connection to Brain interrupted. Please try again shortly." }]);
        } finally {
            setLoading(false);
        }
    };

    const toggleChat = () => setIsOpen(!isOpen);

    const widgetStyle = {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    };

    const chatPanelStyle = {
        width: '400px',
        height: isMinimized ? '60px' : '550px',
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'var(--glass-blur)',
        border: 'var(--border-glass-strong)',
        borderRadius: '1.5rem',
        boxShadow: 'var(--shadow-glass-strong)',
        display: isOpen ? 'flex' : 'none',
        flexDirection: 'column',
        overflow: 'hidden',
        marginBottom: '1rem',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    };

    return (
        <div style={widgetStyle}>
            {/* Chat Panel */}
            <div style={chatPanelStyle}>
                {/* Header */}
                <div style={{
                    padding: '1rem 1.25rem',
                    background: 'var(--color-primary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Bot size={24} />
                            <div style={{
                                position: 'absolute', bottom: -2, right: -2,
                                width: '10px', height: '10px', background: '#10b981',
                                border: '2px solid rgba(255, 255, 255, 0.8)', borderRadius: '50%'
                            }} />
                        </div>
                        <div>
                            <span style={{ fontWeight: '800', fontSize: '1rem', display: 'block' }}>NyaySetu Brain</span>
                            <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Active Reasoning Engine</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setIsMinimized(!isMinimized)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                        </button>
                        <button onClick={toggleChat} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {!isMinimized && (
                    <>
                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            style={{
                                flex: 1,
                                padding: '1.25rem',
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem'
                            }}
                        >
                            {messages.map((msg, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    gap: '0.75rem'
                                }}>
                                    {msg.role === 'assistant' && (
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(30, 42, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Sparkles size={14} color="var(--color-primary)" />
                                        </div>
                                    )}
                                    <div style={{
                                        maxWidth: '85%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.5',
                                        background: msg.role === 'user' ? 'var(--color-accent-light)' : 'var(--bg-glass)',
                                        color: msg.role === 'user' ? 'var(--color-primary)' : 'var(--text-secondary)',
                                        border: msg.role === 'user' ? '1px solid var(--color-primary)' : 'var(--border-glass)',
                                        borderBottomRightRadius: msg.role === 'user' ? '0.2rem' : '1rem',
                                        borderBottomLeftRadius: msg.role === 'assistant' ? '0.2rem' : '1rem'
                                    }} className="markdown-content">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(30, 42, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Loader2 size={14} className="spin" color="var(--color-primary)" />
                                    </div>
                                    <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-glass)', borderRadius: '1rem', borderBottomLeftRadius: '0.2rem' }}>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <div style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1s infinite' }} />
                                            <div style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }} />
                                            <div style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '1.25rem', borderTop: 'var(--border-glass)' }}>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="Type your inquiry..."
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                                    style={{
                                        width: '100%',
                                        background: 'var(--bg-glass)',
                                        border: 'var(--border-glass)',
                                        borderRadius: '0.75rem',
                                        padding: '0.75rem 3rem 0.75rem 1rem',
                                        color: 'var(--text-main)',
                                        outline: 'none',
                                        fontSize: '0.9rem'
                                    }}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || loading}
                                    style={{
                                        position: 'absolute',
                                        right: '0.5rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: input.trim() ? 'var(--color-primary)' : 'transparent',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        padding: '0.4rem',
                                        color: input.trim() ? 'white' : '#64748b',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}

                <style>{`
                    @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .spin { animation: spin 1s linear infinite; }
                    ::-webkit-scrollbar { width: 4px; }
                    ::-webkit-scrollbar-track { background: transparent; }
                    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); borderRadius: 10px; }
                    
                    /* Markdown Styling */
                    .markdown-content h1, 
                    .markdown-content h2, 
                    .markdown-content h3 {
                        font-size: 1.05rem !important;
                        font-weight: 700 !important;
                        margin-top: 0.5rem !important;
                        margin-bottom: 0.4rem !important;
                        color: var(--text-main) !important;
                    }
                    .markdown-content p {
                        margin-bottom: 0.6rem !important;
                    }
                    .markdown-content ul, 
                    .markdown-content ol {
                        margin-bottom: 0.6rem !important;
                        padding-left: 1.2rem !important;
                    }
                    .markdown-content li {
                        margin-bottom: 0.25rem !important;
                    }
                `}</style>
            </div>

            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '20px',
                        background: 'var(--color-primary)',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 32px rgba(30, 42, 68, 0.4)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
                >
                    <Bot size={32} />
                </button>
            )}
        </div>
    );
}
