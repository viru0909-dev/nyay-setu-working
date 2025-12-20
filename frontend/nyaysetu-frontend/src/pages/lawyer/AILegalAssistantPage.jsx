import { useState, useRef, useEffect } from 'react';
import {
    Brain,
    Sparkles,
    Search,
    FileText,
    MessageSquare,
    History,
    ChevronRight,
    Loader2,
    Send,
    Scaling,
    ArrowUpRight,
    Scale
} from 'lucide-react';
import { brainAPI } from '../../services/api';

export default function AILegalAssistantPage() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "🙏 Greetings, Counselor. I am the NyaySetu Legal Strategist. I can assist you with comprehensive case research, statute analysis, and drafting strategies. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const response = await brainAPI.chat(userMsg);
            setMessages(prev => [...prev, { role: 'assistant', content: response.data.message }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Connection to AI Brain was interrupted. Please check your network." }]);
        } finally {
            setLoading(false);
        }
    };

    const glassStyle = {
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
    };

    const researchTools = [
        { name: 'Statute Analyzer', icon: Scale, desc: 'Analyze IPC/BNS sections' },
        { name: 'Precedent Search', icon: History, desc: 'Find similar case rulings' },
        { name: 'Draft Refinement', icon: FileText, desc: 'Polish legal petitions' },
        { name: 'Strategy Audit', icon: Scaling, desc: 'Analyze case strengths' },
    ];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
                    }}>
                        <Brain size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'white', margin: 0 }}>
                            AI Legal Assistant
                        </h1>
                        <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0 }}>
                            Advanced legal research and strategic consultation powered by Llama 3.1
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', flex: 1, minHeight: 0 }}>
                {/* Chat Column */}
                <div style={{ ...glassStyle, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                    {/* Chat Messages */}
                    <div
                        ref={scrollRef}
                        style={{
                            flex: 1,
                            padding: '1.5rem',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.25rem'
                        }}
                    >
                        {messages.map((msg, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                gap: '1rem'
                            }}>
                                {msg.role === 'assistant' && (
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '12px',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0, border: '1px solid rgba(99, 102, 241, 0.2)'
                                    }}>
                                        <Sparkles size={20} color="#818cf8" />
                                    </div>
                                )}
                                <div style={{
                                    maxWidth: '80%',
                                    padding: '1rem 1.25rem',
                                    borderRadius: '1.25rem',
                                    fontSize: '1rem',
                                    lineHeight: '1.6',
                                    background: msg.role === 'user' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                    color: msg.role === 'user' ? '#c7d2fe' : '#e2e8f0',
                                    border: msg.role === 'user' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                                    borderTopRightRadius: msg.role === 'user' ? '0.2rem' : '1.25rem',
                                    borderTopLeftRadius: msg.role === 'assistant' ? '0.2rem' : '1.25rem',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Loader2 size={20} className="spin" color="#818cf8" />
                                </div>
                                <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '1.25rem', borderTopLeftRadius: '0.2rem' }}>
                                    <span style={{ color: '#64748b' }}>AI is researching legal precedents...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chat Input */}
                    <div style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.3)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ position: 'relative' }}>
                            <textarea
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                                placeholder="Query legal sections, research precedents, or ask for drafting help..."
                                style={{
                                    width: '100%',
                                    background: 'rgba(15, 23, 42, 0.5)',
                                    border: '1px solid rgba(139, 92, 246, 0.3)',
                                    borderRadius: '1rem',
                                    padding: '1rem 4rem 1rem 1.25rem',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '1rem',
                                    resize: 'none',
                                    height: '80px'
                                }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || loading}
                                style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    bottom: '1rem',
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '10px',
                                    background: input.trim() ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'rgba(255,255,255,0.05)',
                                    border: 'none',
                                    color: 'white',
                                    cursor: input.trim() ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ ...glassStyle, padding: '1.25rem' }}>
                        <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '1.25rem', fontWeight: '700' }}>Quick Actions</h3>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {researchTools.map((tool, i) => (
                                <button key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    borderRadius: '0.75rem',
                                    padding: '0.8rem',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }} onMouseOver={e => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '8px',
                                        background: 'rgba(99, 102, 241, 0.15)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#818cf8', flexShrink: 0
                                    }}>
                                        <tool.icon size={16} />
                                    </div>
                                    <div>
                                        <div style={{ color: 'white', fontSize: '0.85rem', fontWeight: '700' }}>{tool.name}</div>
                                        <div style={{ color: '#64748b', fontSize: '0.7rem' }}>{tool.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ ...glassStyle, padding: '1.25rem', background: 'rgba(99, 102, 241, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                            <MessageSquare size={14} /> Knowledge Core
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
                            Trained on over 1.2 million Indian court proceedings and the latest Bharitya Nyaya Sanhita (BNS) updates.
                        </p>
                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#c7d2fe', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>
                            Learn more <ArrowUpRight size={14} />
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
}
