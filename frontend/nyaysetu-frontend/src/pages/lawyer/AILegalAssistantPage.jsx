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
    Scale,
    Mic,
    StopCircle,
    Volume2
} from 'lucide-react';
import { brainAPI } from '../../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AILegalAssistantPage() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "🙏 Greetings, Counselor. I am your Smart Legal Strategist.\n\nI have access to your **Active Case Portfolio** and **Hearing Schedule**. I can assist with:\n\n1. **Schedule Planning**: \"What hearings do I have this week?\"\n2. **Case Strategy**: \"Draft a strategy for the Theft case.\"\n3. **Legal Research**: \"Summarize BNS Section 302.\"\n\nHow can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [speakingIndex, setSpeakingIndex] = useState(null);
    const scrollRef = useRef(null);
    const mediaRecorderRef = useRef(null);

    // Browser Native Speech Recognition
    const startRecording = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Your browser does not support speech recognition.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'en-IN'; // Default to Indian English for Lawyers
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);
        recognition.onError = (event) => {
            console.error("Speech recognition error", event.error);
            setIsRecording(false);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => prev + (prev ? ' ' : '') + transcript);
        };

        mediaRecorderRef.current = recognition;
        recognition.start();
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // Text to Speech
    const speakText = (text, index) => {
        if (!('speechSynthesis' in window)) return;

        if (speakingIndex === index) {
            window.speechSynthesis.cancel();
            setSpeakingIndex(null);
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-IN';

        utterance.onend = () => setSpeakingIndex(null);
        utterance.onerror = () => setSpeakingIndex(null);

        setSpeakingIndex(index);
        window.speechSynthesis.speak(utterance);
    };

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
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'var(--glass-blur)',
        border: 'var(--border-glass-strong)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-glass-strong)'
    };

    const researchTools = [
        { name: 'Schedule Manager', icon: History, desc: 'Check upcoming hearings' },
        { name: 'Portfolio Audit', icon: Scaling, desc: 'Review active cases' },
        { name: 'Statute Analyzer', icon: Scale, desc: 'Analyze IPC/BNS sections' },
        { name: 'Draft Refinement', icon: FileText, desc: 'Polish legal petitions' },
    ];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        background: 'var(--color-accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'var(--shadow-glass)'
                    }}>
                        <Brain size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                            AI Legal Assistant
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>
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
                                        background: 'var(--bg-glass-subtle)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0, border: 'var(--border-glass-subtle)'
                                    }}>
                                        <Sparkles size={20} color="var(--color-accent)" />
                                    </div>
                                )}
                                <div style={{
                                    maxWidth: '80%',
                                    padding: '1rem 1.25rem',
                                    borderRadius: '1.25rem',
                                    fontSize: '1rem',
                                    lineHeight: '1.6',
                                    background: msg.role === 'user' ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-glass-subtle)',
                                    color: 'var(--text-main)',
                                    border: msg.role === 'user' ? '1px solid var(--color-accent)' : 'var(--border-glass-subtle)',
                                    borderTopRightRadius: msg.role === 'user' ? '0.2rem' : '1.25rem',
                                    borderTopLeftRadius: msg.role === 'assistant' ? '0.2rem' : '1.25rem',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    <div className="markdown-content">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                    {msg.role === 'assistant' && (
                                        <button
                                            onClick={() => speakText(msg.content, i)}
                                            style={{
                                                background: 'none', border: 'none',
                                                color: speakingIndex === i ? 'var(--color-accent)' : 'var(--text-secondary)',
                                                cursor: 'pointer', padding: '0.25rem 0', marginTop: '0.5rem',
                                                display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem',
                                                opacity: 0.8
                                            }}
                                        >
                                            {speakingIndex === i ? <StopCircle size={14} /> : <Volume2 size={14} />}
                                            {speakingIndex === i ? 'Stop' : 'Read'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-glass-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Loader2 size={20} className="spin" color="var(--color-accent)" />
                                </div>
                                <div style={{ padding: '1rem', background: 'var(--bg-glass-subtle)', borderRadius: '1.25rem', borderTopLeftRadius: '0.2rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>AI is researching legal precedents...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chat Input */}
                    <div style={{ padding: '1.5rem', background: 'var(--bg-glass-subtle)', borderTop: 'var(--border-glass-subtle)' }}>
                        <div style={{ position: 'relative', display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                disabled={loading}
                                style={{
                                    width: '44px', height: '44px', borderRadius: '12px',
                                    background: isRecording ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-glass)',
                                    border: isRecording ? '1px solid rgba(239, 68, 68, 0.5)' : 'var(--border-glass)',
                                    color: isRecording ? '#ef4444' : 'var(--text-secondary)',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s', flexShrink: 0,
                                    marginBottom: '2px', // Align with input
                                    animation: isRecording ? 'pulse 1.5s infinite' : 'none'
                                }}
                            >
                                {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
                            </button>

                            <div style={{ position: 'relative', flex: 1 }}>
                                <textarea
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                                    placeholder="Query legal sections, research precedents, or ask for drafting help..."
                                    style={{
                                        width: '100%',
                                        background: 'var(--bg-glass)',
                                        border: 'var(--border-glass)',
                                        borderRadius: '1rem',
                                        padding: '1rem 3.5rem 1rem 1.25rem',
                                        color: 'var(--text-main)',
                                        outline: 'none',
                                        fontSize: '1rem',
                                        resize: 'none',
                                        height: '80px' // Fixed height match
                                    }}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || loading}
                                    style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        bottom: '1rem',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        background: input.trim() ? 'var(--color-accent)' : 'var(--bg-glass-subtle)',
                                        border: 'none',
                                        color: 'white',
                                        cursor: input.trim() ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ ...glassStyle, padding: '1.25rem' }}>
                        <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '1.25rem', fontWeight: '700' }}>Quick Actions</h3>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {researchTools.map((tool, i) => (
                                <button key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    background: 'var(--bg-glass-subtle)',
                                    border: 'var(--border-glass-subtle)',
                                    borderRadius: '0.75rem',
                                    padding: '0.8rem',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }} onMouseOver={e => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'var(--bg-glass-subtle)'}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '8px',
                                        background: 'var(--bg-glass-subtle)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--color-accent)', flexShrink: 0
                                    }}>
                                        <tool.icon size={16} />
                                    </div>
                                    <div>
                                        <div style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: '700' }}>{tool.name}</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>{tool.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ ...glassStyle, padding: '1.25rem', background: 'var(--bg-glass-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                            <MessageSquare size={14} /> Knowledge Core
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
                            Trained on over 1.2 million Indian court proceedings and the latest Bharitya Nyaya Sanhita (BNS) updates.
                        </p>
                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-accent-light)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>
                            Learn more <ArrowUpRight size={14} />
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                .spin { animation: spin 1s linear infinite; }
                
                /* Markdown Styling */
                .markdown-content p { margin-bottom: 0.5rem; }
                .markdown-content ul, .markdown-content ol { padding-left: 1.2rem; margin-bottom: 0.5rem; }
                .markdown-content li { margin-bottom: 0.2rem; }
                .markdown-content strong { color: var(--color-accent); font-weight: 700; }
                .markdown-content code { background: rgba(0,0,0,0.2); padding: 0.1rem 0.3rem; borderRadius: 4px; fontFamily: monospace; }
            `}</style>
        </div>
    );
}
