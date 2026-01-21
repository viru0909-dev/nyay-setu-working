import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Upload, Shield, CheckCircle2, AlertCircle,
    Loader2, MapPin, Calendar, MessageSquare, ToggleLeft,
    ToggleRight, Send, Bot, User as UserIcon, ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { clientFirAPI, vakilFriendAPI } from '../../services/api';

export default function FileFirPage() {
    const navigate = useNavigate();
    const { t } = useLanguage();

    // Mode toggle: 'manual' or 'ai'
    const [mode, setMode] = useState('manual');

    // Manual form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        incidentDate: '',
        incidentLocation: ''
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // AI Chat state
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [aiSummary, setAiSummary] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Start AI session
    const startAiSession = async () => {
        try {
            const response = await vakilFriendAPI.startSession();
            setSessionId(response.data.sessionId);
            setMessages([{
                role: 'assistant',
                content: `🚔 **FIR Filing Assistant**\n\nI'll help you file an FIR. Please describe:\n\n1. **When** did the incident happen?\n2. **Where** did it occur?\n3. **What** happened?\n\nTake your time and provide as much detail as possible.`
            }]);
        } catch (err) {
            console.error('Failed to start AI session:', err);
            setError('Failed to start AI assistant. Please try manual mode.');
        }
    };

    useEffect(() => {
        if (mode === 'ai' && !sessionId) {
            startAiSession();
        }
    }, [mode]);

    // Handle AI chat
    const sendAiMessage = async () => {
        if (!input.trim() || !sessionId || aiLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setAiLoading(true);

        try {
            const response = await vakilFriendAPI.chat(sessionId, userMessage);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.data.response
            }]);

            // Check if AI has enough info to generate summary
            if (messages.length >= 4) {
                setAiSummary({
                    ready: true,
                    title: `FIR: ${userMessage.substring(0, 50)}...`,
                    description: messages.map(m => `${m.role === 'user' ? 'Citizen' : 'AI'}: ${m.content}`).join('\n\n')
                });
            }
        } catch (err) {
            console.error('AI chat error:', err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setAiLoading(false);
        }
    };

    // Generate FIR from AI chat
    const generateFirFromAi = () => {
        const fullConversation = messages
            .filter(m => m.role === 'user')
            .map(m => m.content)
            .join('\n\n');

        setFormData({
            title: `FIR - Incident Report ${new Date().toLocaleDateString('en-IN')}`,
            description: fullConversation,
            incidentDate: new Date().toISOString().split('T')[0],
            incidentLocation: ''
        });
        setMode('manual');
        setError(null);
    };

    // Submit FIR
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.description) {
            setError('Please provide a title and description');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            if (formData.incidentDate) {
                data.append('incidentDate', formData.incidentDate);
            }
            if (formData.incidentLocation) {
                data.append('incidentLocation', formData.incidentLocation);
            }
            data.append('aiGenerated', mode === 'ai' || sessionId != null);
            if (sessionId) {
                data.append('aiSessionId', sessionId);
            }
            if (file) {
                data.append('file', file);
            }

            const response = await clientFirAPI.fileFir(data);
            setResult(response.data);
            console.log('FIR Filed:', response.data);
        } catch (err) {
            console.error('FIR filing error:', err);
            setError(err.response?.data?.message || 'Failed to file FIR. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Success State
    if (result) {
        return (
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
                    border: '2px solid #10b981',
                    borderRadius: '1.5rem',
                    padding: '3rem',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)'
                    }}>
                        <CheckCircle2 size={40} color="white" />
                    </div>

                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#10b981', marginBottom: '0.5rem' }}>
                        ✅ FIR Submitted Successfully!
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Your complaint has been sent for police review
                    </p>

                    <div style={{
                        background: 'var(--bg-glass)',
                        border: 'var(--border-glass)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        marginBottom: '1.5rem'
                    }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            FIR Number
                        </p>
                        <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                            {result.firNumber}
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '1rem',
                        marginBottom: '2rem'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Status</p>
                            <span style={{
                                background: 'rgba(245, 158, 11, 0.1)',
                                color: '#f59e0b',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.875rem',
                                fontWeight: '600'
                            }}>
                                {result.status?.replace(/_/g, ' ')}
                            </span>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Filed On</p>
                            <p style={{ color: 'var(--text-main)', fontWeight: '600' }}>
                                {new Date(result.uploadedAt).toLocaleDateString('en-IN')}
                            </p>
                        </div>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                        📌 You will be notified when the police reviews your FIR.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/client')}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                border: 'none',
                                borderRadius: '0.75rem',
                                color: 'white',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            Go to Dashboard
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    🚔 {t('File FIR (First Information Report)')}
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    {t('Report an incident to the police. Choose your preferred method below.')}
                </p>
            </div>

            {/* Mode Toggle */}
            <div style={{
                background: 'var(--bg-glass-strong)',
                border: 'var(--border-glass)',
                borderRadius: '1rem',
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap'
            }}>
                <button
                    onClick={() => setMode('manual')}
                    style={{
                        flex: 1,
                        minWidth: '200px',
                        padding: '1rem',
                        background: mode === 'manual'
                            ? 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)'
                            : 'var(--bg-glass)',
                        border: mode === 'manual' ? 'none' : 'var(--border-glass)',
                        borderRadius: '0.75rem',
                        color: mode === 'manual' ? 'white' : 'var(--text-secondary)',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <FileText size={20} />
                    Manual Form
                </button>
                <button
                    onClick={() => setMode('ai')}
                    style={{
                        flex: 1,
                        minWidth: '200px',
                        padding: '1rem',
                        background: mode === 'ai'
                            ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                            : 'var(--bg-glass)',
                        border: mode === 'ai' ? 'none' : 'var(--border-glass)',
                        borderRadius: '0.75rem',
                        color: mode === 'ai' ? 'white' : 'var(--text-secondary)',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <Bot size={20} />
                    AI Assistance (Vakil Friend)
                </button>
            </div>

            {/* AI Chat Mode */}
            {mode === 'ai' && (
                <div style={{
                    background: 'var(--bg-glass-strong)',
                    border: 'var(--border-glass)',
                    borderRadius: '1.5rem',
                    overflow: 'hidden',
                    marginBottom: '1.5rem'
                }}>
                    {/* Chat Messages */}
                    <div style={{
                        height: '400px',
                        overflowY: 'auto',
                        padding: '1.5rem'
                    }}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    marginBottom: '1rem'
                                }}
                            >
                                <div style={{
                                    maxWidth: '80%',
                                    padding: '1rem',
                                    borderRadius: '1rem',
                                    background: msg.role === 'user'
                                        ? 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)'
                                        : 'var(--bg-glass)',
                                    color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                                    border: msg.role === 'user' ? 'none' : 'var(--border-glass)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                                        <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>
                                            {msg.role === 'user' ? 'You' : 'Vakil Friend'}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {aiLoading && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div style={{
                                    padding: '1rem',
                                    borderRadius: '1rem',
                                    background: 'var(--bg-glass)',
                                    border: 'var(--border-glass)'
                                }}>
                                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-accent)' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div style={{
                        borderTop: 'var(--border-glass)',
                        padding: '1rem',
                        display: 'flex',
                        gap: '0.75rem'
                    }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendAiMessage()}
                            placeholder="Describe your incident..."
                            style={{
                                flex: 1,
                                padding: '0.75rem 1rem',
                                background: 'var(--bg-glass)',
                                border: 'var(--border-glass)',
                                borderRadius: '0.5rem',
                                color: 'var(--text-main)',
                                fontSize: '1rem'
                            }}
                        />
                        <button
                            onClick={sendAiMessage}
                            disabled={aiLoading || !input.trim()}
                            style={{
                                padding: '0.75rem 1.25rem',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                border: 'none',
                                borderRadius: '0.5rem',
                                color: 'white',
                                cursor: aiLoading ? 'not-allowed' : 'pointer',
                                opacity: aiLoading ? 0.6 : 1
                            }}
                        >
                            <Send size={20} />
                        </button>
                    </div>

                    {/* Generate FIR Button */}
                    {messages.length >= 3 && (
                        <div style={{ padding: '1rem', borderTop: 'var(--border-glass)' }}>
                            <button
                                onClick={generateFirFromAi}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <CheckCircle2 size={20} />
                                Generate FIR from Conversation
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Manual Form Mode */}
            {mode === 'manual' && (
                <form onSubmit={handleSubmit}>
                    <div style={{
                        background: 'var(--bg-glass-strong)',
                        border: 'var(--border-glass)',
                        borderRadius: '1.5rem',
                        padding: '1.5rem',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-main)', fontWeight: '600', marginBottom: '0.5rem' }}>
                                Title / Subject *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Theft at residence, Vehicle accident..."
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    background: 'var(--bg-glass)',
                                    border: 'var(--border-glass)',
                                    borderRadius: '0.5rem',
                                    color: 'var(--text-main)',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontWeight: '600', marginBottom: '0.5rem' }}>
                                    <Calendar size={16} /> Incident Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.incidentDate}
                                    onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: 'var(--bg-glass)',
                                        border: 'var(--border-glass)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-main)',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontWeight: '600', marginBottom: '0.5rem' }}>
                                    <MapPin size={16} /> Location
                                </label>
                                <input
                                    type="text"
                                    value={formData.incidentLocation}
                                    onChange={(e) => setFormData({ ...formData, incidentLocation: e.target.value })}
                                    placeholder="e.g., Near City Mall, Pune"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: 'var(--bg-glass)',
                                        border: 'var(--border-glass)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-main)',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-main)', fontWeight: '600', marginBottom: '0.5rem' }}>
                                Detailed Description *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the incident in detail: what happened, who was involved, any witnesses..."
                                rows={6}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    background: 'var(--bg-glass)',
                                    border: 'var(--border-glass)',
                                    borderRadius: '0.5rem',
                                    color: 'var(--text-main)',
                                    fontSize: '1rem',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontWeight: '600', marginBottom: '0.5rem' }}>
                                <Upload size={16} /> Evidence (Optional)
                            </label>
                            <div
                                onClick={() => document.getElementById('evidence-input').click()}
                                style={{
                                    padding: '2rem',
                                    background: 'var(--bg-glass)',
                                    border: '2px dashed var(--border-glass)',
                                    borderRadius: '0.75rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <input
                                    id="evidence-input"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.mp4"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    style={{ display: 'none' }}
                                />
                                {file ? (
                                    <p style={{ color: 'var(--color-accent)', fontWeight: '600' }}>
                                        📎 {file.name}
                                    </p>
                                ) : (
                                    <p style={{ color: 'var(--text-secondary)' }}>
                                        Click to upload photos, videos, or documents
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <AlertCircle size={20} color="#ef4444" />
                            <p style={{ color: '#ef4444' }}>{error}</p>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || !formData.title || !formData.description}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: loading || !formData.title || !formData.description
                                ? 'var(--bg-glass)'
                                : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            border: 'none',
                            borderRadius: '0.75rem',
                            color: loading || !formData.title || !formData.description ? 'var(--text-secondary)' : 'white',
                            fontSize: '1.125rem',
                            fontWeight: '700',
                            cursor: loading || !formData.title || !formData.description ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            boxShadow: loading ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                Submitting FIR...
                            </>
                        ) : (
                            <>
                                <Shield size={20} />
                                Submit FIR to Police
                            </>
                        )}
                    </button>
                </form>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
