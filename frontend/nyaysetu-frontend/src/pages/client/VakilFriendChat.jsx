import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, User, CheckCircle, ArrowLeft, Loader2, History, Plus, MessageSquare, Paperclip, FileText, X } from 'lucide-react';
import { vakilFriendAPI } from '../../services/api';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export default function VakilFriendChat() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isStarting, setIsStarting] = useState(true);
    const [readyToFile, setReadyToFile] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [error, setError] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState([]); // For document attachments
    const [uploadingFile, setUploadingFile] = useState(false);
    const messagesContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // Scroll to bottom of messages container only (not the page)
    const scrollToBottom = (behavior = 'auto') => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: behavior
            });
        }
    };

    useEffect(() => {
        // Use smooth scroll when messages change, but immediate for first load
        scrollToBottom(messages.length <= 1 ? 'auto' : 'smooth');
    }, [messages, isLoading]);

    useEffect(() => {
        loadSessions();
        startSession();
    }, []);

    // Load all chat sessions for history
    const loadSessions = async () => {
        try {
            const response = await vakilFriendAPI.getSessions();
            setSessions(response.data || []);
        } catch (err) {
            console.error('Failed to load sessions:', err);
        }
    };

    // Load a specific session from history
    const loadSession = async (historySessionId) => {
        try {
            setIsLoading(true);
            const response = await vakilFriendAPI.getSession(historySessionId);
            const data = response.data;
            setSessionId(historySessionId);

            // Parse conversation data
            if (data.conversationData) {
                try {
                    const parsedMessages = JSON.parse(data.conversationData);
                    setMessages(parsedMessages);
                } catch (e) {
                    setMessages([{ role: 'assistant', content: 'Session loaded but conversation data is corrupted.' }]);
                }
            }
            setShowHistory(false);
        } catch (err) {
            console.error('Failed to load session:', err);
            setError('Failed to load session');
        } finally {
            setIsLoading(false);
        }
    };

    // Start a new session
    const startNewSession = async () => {
        setMessages([]);
        setSessionId(null);
        setReadyToFile(false);
        await startSession();
        await loadSessions(); // Refresh session list
    };

    const startSession = async () => {
        try {
            setIsStarting(true);
            setError(null);
            const response = await vakilFriendAPI.startSession();
            setSessionId(response.data.sessionId);
            setMessages([{
                role: 'assistant',
                content: response.data.message || "🙏 Namaste! I am Vakil-Friend, your AI legal assistant. How can I help you today?"
            }]);
        } catch (err) {
            console.error('Failed to start session:', err);
            setError('Failed to connect. Please make sure the backend is running.');
            setMessages([{
                role: 'assistant',
                content: '🙏 Namaste! I am Vakil-Friend (offline mode). The backend server is not responding. Please start the backend and refresh.'
            }]);
        } finally {
            setIsStarting(false);
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        if (!sessionId) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ No active session. Please refresh the page.'
            }]);
            setIsLoading(false);
            return;
        }

        try {
            const response = await vakilFriendAPI.sendMessage(sessionId, userMessage);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.data.message
            }]);
            setReadyToFile(response.data.readyToFile);
        } catch (err) {
            console.error('Failed to send message:', err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const completeSession = async () => {
        if (!sessionId) return;
        setIsCompleting(true);
        try {
            const response = await vakilFriendAPI.completeSession(sessionId);
            const data = response.data;

            // Build success message with all details
            let successMessage = `✅ **Case Filed Successfully!**\n\n`;
            successMessage += `📋 **Case ID:** ${data.caseId}\n`;
            successMessage += `📝 **Title:** ${data.caseTitle}\n`;
            successMessage += `🏷️ **Type:** ${data.caseType}\n`;
            successMessage += `⚡ **Urgency:** ${data.urgency}\n`;
            successMessage += `👤 **Petitioner:** ${data.petitioner}\n`;
            successMessage += `👥 **Respondent:** ${data.respondent}\n`;
            successMessage += `📊 **Status:** ${data.status}\n\n`;

            if (data.judgeAssigned) {
                successMessage += `⚖️ **Judge Assigned:** ${data.assignedJudge}\n`;
            }

            if (data.hearingScheduled) {
                const hearingDate = new Date(data.nextHearing);
                successMessage += `📅 **First Hearing:** ${hearingDate.toLocaleDateString('en-IN', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })} at ${hearingDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}\n`;
            }

            successMessage += `\n---\n`;
            successMessage += `📌 **What's Next:**\n`;
            successMessage += `1. Upload evidence documents in the Documents section\n`;
            successMessage += `2. Prepare a brief statement of facts\n`;
            successMessage += `3. Attend your scheduled hearing\n`;
            successMessage += `\n_Redirecting to My Cases..._`;

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: successMessage
            }]);

            setTimeout(() => navigate('/client/cases'), 5000);
        } catch (err) {
            console.error('Failed to complete session:', err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Failed to file case. Please try again or contact support.'
            }]);
        } finally {
            setIsCompleting(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // File attachment handlers
    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        for (const file of files) {
            // Validate file type
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg',
                'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                alert(`File type not supported: ${file.name}`);
                continue;
            }
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert(`File too large: ${file.name} (max 10MB)`);
                continue;
            }

            // Add to attached files with pending status
            setAttachedFiles(prev => [...prev, {
                file,
                name: file.name,
                size: file.size,
                status: 'pending',
                id: null
            }]);

            // Upload the file
            await uploadFile(file);
        }

        // Clear input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const uploadFile = async (file) => {
        setUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', 'EVIDENCE');
            formData.append('description', `Uploaded during case filing via Vakil-Friend chat`);
            // Don't set caseId yet - will link when case is filed

            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8080/api/documents/upload', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Update file status to uploaded
            setAttachedFiles(prev => prev.map(f =>
                f.name === file.name && f.status === 'pending'
                    ? { ...f, status: 'uploaded', id: response.data.id }
                    : f
            ));

            // Add a message about the uploaded file
            setMessages(prev => [...prev, {
                role: 'user',
                content: `📎 Attached document: ${file.name}`
            }]);

        } catch (error) {
            console.error('File upload failed:', error);
            setAttachedFiles(prev => prev.map(f =>
                f.name === file.name && f.status === 'pending'
                    ? { ...f, status: 'failed' }
                    : f
            ));
            alert(`Failed to upload ${file.name}`);
        } finally {
            setUploadingFile(false);
        }
    };

    const removeAttachment = (fileName) => {
        setAttachedFiles(prev => prev.filter(f => f.name !== fileName));
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div style={{ maxWidth: '100%', position: 'relative' }}>
            {/* History Sidebar - Full screen modal */}
            {showHistory && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        zIndex: 999999,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        paddingTop: '3rem'
                    }}
                    onClick={() => setShowHistory(false)}
                >
                    <div
                        style={{
                            width: '400px',
                            maxWidth: '90vw',
                            maxHeight: '80vh',
                            background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            overflowY: 'auto',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>💬 Chat History</h3>
                            <button
                                onClick={() => setShowHistory(false)}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '0.5rem',
                                    padding: '0.5rem',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >✕</button>
                        </div>

                        <button
                            onClick={() => { startNewSession(); setShowHistory(false); }}
                            style={{
                                width: '100%',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                border: 'none',
                                borderRadius: '0.75rem',
                                padding: '0.75rem 1rem',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                marginBottom: '1.5rem'
                            }}
                        >
                            <Plus size={18} /> New Chat
                        </button>

                        {sessions.length === 0 ? (
                            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>No chat history yet</p>
                        ) : (
                            <div>
                                <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Recent Sessions</p>
                                {sessions.map((session, idx) => (
                                    <div
                                        key={session.sessionId}
                                        onClick={() => loadSession(session.sessionId)}
                                        style={{
                                            padding: '0.875rem',
                                            background: session.sessionId === sessionId
                                                ? 'rgba(139, 92, 246, 0.3)'
                                                : 'rgba(30, 27, 75, 0.5)',
                                            borderRadius: '0.75rem',
                                            marginBottom: '0.5rem',
                                            cursor: 'pointer',
                                            border: session.sessionId === sessionId
                                                ? '1px solid rgba(139, 92, 246, 0.5)'
                                                : '1px solid rgba(139, 92, 246, 0.1)',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <MessageSquare size={16} style={{ color: '#8b5cf6' }} />
                                            <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {session.title || `Session ${sessions.length - idx}`}
                                            </span>
                                        </div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.35rem', marginLeft: '1.5rem' }}>
                                            {session.status} • {new Date(session.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}


            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/client')}
                        style={{
                            background: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '0.5rem',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            color: '#c4b5fd',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <button
                        onClick={() => {
                            console.log('History button clicked, showHistory:', showHistory);
                            setShowHistory(true);
                        }}
                        style={{
                            background: showHistory ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            cursor: 'pointer',
                            color: '#c4b5fd',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.85rem',
                            fontWeight: '500'
                        }}
                        title="Chat History"
                    >
                        <History size={18} />
                        History
                    </button>
                    <button
                        onClick={startNewSession}
                        style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: '0.5rem',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            color: '#34d399',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        title="New Chat"
                    >
                        <Plus size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white', marginBottom: '0.25rem' }}>
                            Vakil-Friend AI
                        </h1>
                        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                            Chat with our AI to file your legal case
                        </p>
                    </div>
                </div>
                {readyToFile && (
                    <button
                        onClick={completeSession}
                        disabled={isCompleting}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            background: isCompleting ? 'rgba(16, 185, 129, 0.5)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            borderRadius: '0.75rem',
                            color: 'white',
                            fontSize: '0.9rem',
                            fontWeight: '700',
                            cursor: isCompleting ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                        }}
                    >
                        {isCompleting ? <Loader2 size={18} /> : <CheckCircle size={18} />}
                        {isCompleting ? 'Filing...' : 'Complete Filing'}
                    </button>
                )}
            </div>

            {/* Error Banner */}
            {error && (
                <div style={{
                    padding: '0.875rem 1.25rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '0.75rem',
                    marginBottom: '1rem',
                    color: '#fca5a5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Chat Container */}
            <div style={{
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '1rem',
                overflow: 'hidden'
            }}>
                {/* Chat Header */}
                <div style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <Bot size={24} color="white" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white', margin: 0 }}>
                            AI Legal Assistant
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: sessionId ? '#10b981' : '#f59e0b', margin: 0 }}>
                            {sessionId ? '● Online' : '● Connecting...'}
                        </p>
                    </div>
                </div>

                {/* Messages Area - This is the scrollable container */}
                <div
                    ref={messagesContainerRef}
                    style={{
                        padding: '1.5rem', // Slightly more padding
                        height: 'calc(100vh - 420px)', // Adjusted height to give more room at bottom
                        minHeight: '400px',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        scrollBehavior: 'smooth'
                    }}
                >
                    {isStarting ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                            color: '#94a3b8'
                        }}>
                            <Loader2 size={36} style={{ marginBottom: '1rem', animation: 'spin 1s linear infinite' }} />
                            <p>Connecting to Vakil-Friend...</p>
                        </div>
                    ) : (
                        <>
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
                                        display: 'flex',
                                        gap: '0.625rem',
                                        maxWidth: '80%',
                                        flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                                    }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: msg.role === 'user'
                                                ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                                                : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            {msg.role === 'user' ?
                                                <User size={16} color="white" /> :
                                                <Bot size={16} color="white" />
                                            }
                                        </div>
                                        <div style={{
                                            padding: '0.875rem 1rem',
                                            background: msg.role === 'user'
                                                ? 'rgba(59, 130, 246, 0.2)'
                                                : 'rgba(139, 92, 246, 0.15)',
                                            border: msg.role === 'user'
                                                ? '1px solid rgba(59, 130, 246, 0.3)'
                                                : '1px solid rgba(139, 92, 246, 0.2)',
                                            borderRadius: msg.role === 'user'
                                                ? '0.875rem 0.875rem 0.25rem 0.875rem'
                                                : '0.875rem 0.875rem 0.875rem 0.25rem',
                                        }}>
                                            <div className="markdown-content" style={{
                                                color: '#ffffff', // High contrast white
                                                fontSize: '1rem', // Slightly larger
                                                lineHeight: '1.7',
                                                fontWeight: '500' // Increased font weight
                                            }}>
                                                <ReactMarkdown>
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '1rem' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Bot size={16} color="white" />
                                    </div>
                                    <div style={{
                                        padding: '0.875rem 1rem',
                                        background: 'rgba(139, 92, 246, 0.15)',
                                        border: '1px solid rgba(139, 92, 246, 0.2)',
                                        borderRadius: '0.875rem 0.875rem 0.875rem 0.25rem',
                                        color: '#94a3b8'
                                    }}>
                                        <span className="typing-dot">●</span>
                                        <span className="typing-dot"> ●</span>
                                        <span className="typing-dot"> ●</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Input Area */}
                <div style={{
                    padding: '1rem 1.25rem',
                    borderTop: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                    {/* Attached Files Preview */}
                    {attachedFiles.length > 0 && (
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            flexWrap: 'wrap',
                            marginBottom: '0.75rem'
                        }}>
                            {attachedFiles.map((file, index) => (
                                <div key={index} style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                    padding: '0.375rem 0.625rem',
                                    background: file.status === 'uploaded'
                                        ? 'rgba(16, 185, 129, 0.15)'
                                        : file.status === 'failed'
                                            ? 'rgba(239, 68, 68, 0.15)'
                                            : 'rgba(139, 92, 246, 0.15)',
                                    border: `1px solid ${file.status === 'uploaded'
                                        ? 'rgba(16, 185, 129, 0.3)'
                                        : file.status === 'failed'
                                            ? 'rgba(239, 68, 68, 0.3)'
                                            : 'rgba(139, 92, 246, 0.3)'}`,
                                    borderRadius: '0.5rem'
                                }}>
                                    <FileText size={14} style={{ color: file.status === 'uploaded' ? '#10b981' : file.status === 'failed' ? '#ef4444' : '#8b5cf6' }} />
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: '#e2e8f0',
                                        maxWidth: '120px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {file.name}
                                    </span>
                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                                        {formatFileSize(file.size)}
                                    </span>
                                    {file.status === 'pending' && (
                                        <Loader2 size={12} style={{ color: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
                                    )}
                                    {file.status === 'uploaded' && (
                                        <CheckCircle size={12} style={{ color: '#10b981' }} />
                                    )}
                                    <button
                                        onClick={() => removeAttachment(file.name)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            padding: '2px',
                                            cursor: 'pointer',
                                            color: '#94a3b8'
                                        }}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.625rem' }}>
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />

                        {/* Paperclip button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading || isStarting || uploadingFile}
                            title="Attach document"
                            style={{
                                padding: '0.75rem',
                                background: 'rgba(139, 92, 246, 0.1)',
                                border: '2px solid rgba(139, 92, 246, 0.2)',
                                borderRadius: '0.625rem',
                                color: uploadingFile ? '#94a3b8' : '#c4b5fd',
                                cursor: (isLoading || isStarting || uploadingFile) ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {uploadingFile ? (
                                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                                <Paperclip size={20} />
                            )}
                        </button>

                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Describe your legal issue..."
                            disabled={isLoading || isStarting}
                            rows={2}
                            style={{
                                flex: 1,
                                padding: '0.75rem 1rem',
                                background: 'rgba(15, 23, 42, 0.6)',
                                border: '2px solid rgba(139, 92, 246, 0.2)',
                                borderRadius: '0.625rem',
                                color: 'white',
                                fontSize: '0.9rem',
                                resize: 'none',
                                outline: 'none',
                                fontFamily: 'inherit'
                            }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!inputMessage.trim() || isLoading || isStarting}
                            style={{
                                padding: '0.75rem 1rem',
                                background: (!inputMessage.trim() || isLoading || isStarting)
                                    ? 'rgba(139, 92, 246, 0.3)'
                                    : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                border: 'none',
                                borderRadius: '0.625rem',
                                color: 'white',
                                cursor: (!inputMessage.trim() || isLoading || isStarting) ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: (!inputMessage.trim() || isLoading || isStarting)
                                    ? 'none'
                                    : '0 4px 15px rgba(139, 92, 246, 0.4)'
                            }}
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Keyframes for animations */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .typing-dot {
                    animation: pulse 1s infinite;
                }
                .typing-dot:nth-child(2) {
                    animation-delay: 0.2s;
                }
                .typing-dot:nth-child(3) {
                    animation-delay: 0.4s;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 1; }
                }
                
                /* Markdown Styling Fixes */
                .markdown-content h1, 
                .markdown-content h2, 
                .markdown-content h3 {
                    font-size: 1.1rem !important;
                    font-weight: 700 !important;
                    margin-top: 0.75rem !important;
                    margin-bottom: 0.5rem !important;
                    color: #f8fafc !important;
                }
                .markdown-content p {
                    margin-bottom: 0.75rem !important;
                    line-height: 1.6 !important;
                }
                .markdown-content ul, 
                .markdown-content ol {
                    margin-bottom: 0.75rem !important;
                    padding-left: 1.25rem !important;
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
                    font-size: 0.9rem !important;
                }
            `}</style>
        </div>
    );
}
