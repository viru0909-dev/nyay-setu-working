
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Gavel,
    FileText,
    Clock,
    MessageSquare,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Calendar,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { caseAPI, judgeAPI } from '../../services/api';

export default function JudgeCaseDetailsPage() {
    const { caseId } = useParams();
    const navigate = useNavigate();
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState('overview');

    // AI State
    const [aiPrompt, setAiPrompt] = useState('');
    const [isScheduling, setIsScheduling] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isChatting, setIsChatting] = useState(false);

    useEffect(() => {
        if (caseId) fetchCaseDetails();
    }, [caseId]);

    const handleAISchedule = async () => {
        if (!aiPrompt.trim()) return;
        setIsScheduling(true);
        try {
            // Augment prompt with case context
            const augmentedPrompt = `For case "${caseData.title}" (${caseData.id}): ${aiPrompt}`;
            await judgeAPI.scheduleHearingAI(augmentedPrompt);
            alert('✅ Hearing scheduled via AI successfully!');
            setAiPrompt('');
            // refresh data if needed
        } catch (error) {
            console.error('AI Schedule Error:', error);
            alert('Failed to schedule hearing via AI.');
        } finally {
            setIsScheduling(false);
        }
    };

    const handleChat = async () => {
        if (!chatInput.trim()) return;
        const msg = chatInput;
        setChatInput('');
        setChatHistory(prev => [...prev, { role: 'user', content: msg }]);
        setIsChatting(true);

        try {
            const response = await judgeAPI.aiChat(msg, caseId);
            setChatHistory(prev => [...prev, { role: 'ai', content: response.data.response }]);
        } catch (error) {
            console.error('Chat Error:', error);
            setChatHistory(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error processing your request.' }]);
        } finally {
            setIsChatting(false);
        }
    };

    const fetchCaseDetails = async () => {
        try {
            const response = await caseAPI.getById(caseId);
            setCaseData(response.data);
        } catch (error) {
            console.error('Failed to fetch case details:', error);
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
        boxShadow: 'var(--shadow-glass)'
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            Loading...
        </div>
    );

    if (!caseData) return <div>Case not found</div>;

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '2rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/judge')} // Or history.back()
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'none', border: 'none',
                        color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '1rem',
                        fontSize: '0.9rem', fontWeight: '600'
                    }}
                >
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>

                <div style={{ ...glassStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <span style={{
                                padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700',
                                background: 'rgba(37, 99, 235, 0.1)', color: '#60a5fa', border: '1px solid rgba(37, 99, 235, 0.3)'
                            }}>
                                {caseData.caseType}
                            </span>
                            <span style={{
                                padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700',
                                background: caseData.urgency === 'URGENT' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                color: caseData.urgency === 'URGENT' ? '#f87171' : '#34d399',
                                border: `1px solid ${caseData.urgency === 'URGENT' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                            }}>
                                {caseData.urgency}
                            </span>
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
                            {caseData.title}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.1rem' }}>
                            Case ID: #{caseData.id.substring(0, 8).toUpperCase()}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button style={{
                            padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: 'none',
                            background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                            color: 'white', fontWeight: '700', cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}>
                            <Calendar size={18} /> Schedule Hearing
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Layout Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>

                {/* Left Column: Details, Evidence, History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Case Overview */}
                    <div style={glassStyle}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <FileText size={24} color="#818cf8" /> Case Overview
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: 'var(--border-glass)' }}>
                                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Petitioner</h3>
                                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-main)' }}>{caseData.petitioner}</div>
                            </div>
                            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: 'var(--border-glass)' }}>
                                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Respondent</h3>
                                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-main)' }}>{caseData.respondent}</div>
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.75rem' }}>Description</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{caseData.description}</p>
                        </div>
                    </div>

                    {/* Evidence Section */}
                    <div style={glassStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <CheckCircle2 size={24} color="#34d399" /> Evidence Review
                            </h2>
                            <button style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontWeight: '600', cursor: 'pointer' }}>
                                View All
                            </button>
                        </div>

                        {/* Placeholder for Evidence List */}
                        <div style={{ padding: '2rem', textAlign: 'center', border: '2px dashed var(--border-glass)', borderRadius: '1rem' }}>
                            <p style={{ color: 'var(--text-secondary)' }}>Evidence documents will be listed here.</p>
                        </div>
                    </div>

                    {/* Hearing History */}
                    <div style={glassStyle}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Clock size={24} color="#fbbf24" /> Hearing History
                        </h2>
                        {/* Placeholder for Hearings */}
                        <div style={{ padding: '2rem', textAlign: 'center', border: '2px dashed var(--border-glass)', borderRadius: '1rem' }}>
                            <p style={{ color: 'var(--text-secondary)' }}>Past hearing records will appear here.</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: AI Assistant & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* AI Scheduler */}
                    <div style={glassStyle}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={20} color="#f59e0b" /> AI Scheduler
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                                type="text"
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder={`"Schedule hearing for next Friday..."`}
                                style={{
                                    flex: 1, padding: '0.75rem', borderRadius: '0.75rem',
                                    background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)',
                                    color: 'var(--text-main)', fontSize: '0.9rem'
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleAISchedule()}
                            />
                            <button
                                onClick={handleAISchedule}
                                disabled={isScheduling || !aiPrompt.trim()}
                                style={{
                                    padding: '0.75rem', borderRadius: '0.75rem', border: 'none',
                                    background: 'var(--color-accent)', color: 'white', cursor: 'pointer',
                                    opacity: isScheduling ? 0.7 : 1
                                }}
                            >
                                {isScheduling ? <Loader2 size={18} className="spin" /> : <ChevronRight size={18} />}
                            </button>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                            By default, this schedules for <b>{caseData.title}</b>.
                        </p>
                    </div>

                    {/* AI Legal Assistant Chat */}
                    <div style={{ ...glassStyle, flex: 1, minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MessageSquare size={20} color="#c084fc" /> AI Legal Assistant
                        </h3>

                        {/* Messages Area */}
                        <div style={{
                            flex: 1, overflowY: 'auto', marginBottom: '1rem',
                            display: 'flex', flexDirection: 'column', gap: '0.75rem',
                            paddingRight: '0.5rem'
                        }}>
                            {chatHistory.length === 0 ? (
                                <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    Ask me anything about this case.<br />I have access to case details and documents.
                                </div>
                            ) : (
                                chatHistory.map((msg, idx) => (
                                    <div key={idx} style={{
                                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        background: msg.role === 'user' ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '1rem',
                                        borderBottomRightRadius: msg.role === 'user' ? '0.25rem' : '1rem',
                                        borderBottomLeftRadius: msg.role === 'user' ? '1rem' : '0.25rem',
                                        maxWidth: '85%',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.4'
                                    }}>
                                        {msg.content}
                                    </div>
                                ))
                            )}
                            {isChatting && (
                                <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '1rem' }}>
                                    <Loader2 size={14} className="spin" />
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Ask about this case..."
                                style={{
                                    flex: 1, padding: '0.75rem', borderRadius: '0.75rem',
                                    background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)',
                                    color: 'var(--text-main)', fontSize: '0.9rem'
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                            />
                            <button
                                onClick={handleChat}
                                disabled={isChatting || !chatInput.trim()}
                                style={{
                                    padding: '0.75rem', borderRadius: '0.75rem', border: 'none',
                                    background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer'
                                }}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
