import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, User, CheckCircle, ArrowLeft, Loader2, History, Plus, MessageSquare, Paperclip, FileText, X, Mic, StopCircle, Volume2, Shield, AlertTriangle, CheckCircle2, Eye } from 'lucide-react';
import { vakilFriendAPI } from '../../services/api';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { API_BASE_URL } from '../../config/apiConfig';

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
    const [documentAnalysis, setDocumentAnalysis] = useState(null); // AI analysis results
    const [showAnalysisModal, setShowAnalysisModal] = useState(false); // Show analysis modal
    const [language, setLanguage] = useState('en'); // Default language
    const [isRecording, setIsRecording] = useState(false);
    const [speakingIndex, setSpeakingIndex] = useState(null); // Track which message is speaking
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const messagesContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // Supported Languages
    const languages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'Hindi (हिंदी)' },
        { code: 'mr', name: 'Marathi (मराठी)' },
        { code: 'ta', name: 'Tamil (தமிழ்)' },
        { code: 'te', name: 'Telugu (తెలుగు)' },
        { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
        { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
        { code: 'bn', name: 'Bengali (বাংলা)' },
        { code: 'ml', name: 'Malayalam (മലയാളം)' },
        { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' }
    ];

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

    const sendMessage = async (audioData = null) => {
        if ((!inputMessage.trim() && !audioData) || isLoading) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');

        // Optimistic UI update
        if (!audioData) {
            setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
            // If using browser speech, we already have the text in userMessage, so we don't need "Voice Message" placeholder
        } else {
            // Legacy path for backend audio if we ever switch back
            setMessages(prev => [...prev, { role: 'user', content: '🎤 [Voice Message]' }]);
        }

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
            // If using browser speech, just send text. If legacy backend audio, send audioData.
            const payload = {
                message: userMessage,
                language: language,
                audioData: audioData // This will be null for browser speech
            };

            const response = await axios.post(`${API_BASE_URL}/api/vakil-friend/chat/${sessionId}`, payload, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            const data = response.data;

            // If it was a voice message (backend processed), update the placeholder
            if (audioData && data.transcribedText) {
                setMessages(prev => {
                    const newMsgs = [...prev];
                    for (let i = newMsgs.length - 1; i >= 0; i--) {
                        if (newMsgs[i].role === 'user' && newMsgs[i].content === '🎤 [Voice Message]') {
                            newMsgs[i].content = `🎤 ${data.transcribedText}`;
                            break;
                        }
                    }
                    return newMsgs;
                });
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.message
            }]);

            // Auto-speak if using voice - assume it's the last message
            if (audioData) {
                // We need to wait for state update, but we can't easily. 
                // Simple hack: Set generic "active" state or just fire and accept we might not match index perfectly initially
                // Better: just speak it, and rely on global cancel for the stop button if we don't pass index
                speakText(data.message, -1); // -1 or generic ID
            }

            setReadyToFile(data.readyToFile);
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

    // Browser Native Speech Recognition
    const startRecording = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Your browser does not support speech recognition. Please use Chrome or Edge.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        // Map our language codes to browser locales
        const langMap = {
            'en': 'en-IN',
            'hi': 'hi-IN',
            'mr': 'mr-IN',
            'ta': 'ta-IN',
            'te': 'te-IN',
            'gu': 'gu-IN',
            'kn': 'kn-IN',
            'bn': 'bn-IN',
            'ml': 'ml-IN',
            'pa': 'pa-IN'
        };

        recognition.lang = langMap[language] || 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsRecording(true);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognition.onError = (event) => {
            console.error("Speech recognition error", event.error);
            setIsRecording(false);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log("Transcribed:", transcript);
            setInputMessage(transcript);

            // Optional: automatically send after short delay
            // setTimeout(() => sendMessage(), 500);
        };

        // Store verification reference if needed to stop manually
        mediaRecorderRef.current = recognition;
        recognition.start();
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const speakText = (text, index = -1) => {
        if (!('speechSynthesis' in window)) return;

        // If currently speaking THIS message, stop it
        if (speakingIndex === index && index !== -1) {
            window.speechSynthesis.cancel();
            setSpeakingIndex(null);
            return;
        }

        // Otherwise stop whatever was speaking and start this
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'en' ? 'en-IN' : language + '-IN';

        utterance.onend = () => {
            setSpeakingIndex(null);
        };

        utterance.onerror = () => {
            setSpeakingIndex(null);
        };

        setSpeakingIndex(index);
        window.speechSynthesis.speak(utterance);
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
            successMessage += `\n_Redirecting to Case Diary..._`;

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: successMessage
            }]);

            setTimeout(() => navigate('/litigant/case-diary'), 5000);
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
        // Add a temporary "Analyzing..." message
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: `🔄 Analyzing document: ${file.name}... Please wait.`
        }]);

        try {
            // Use Vakil Friend AI document analysis
            if (sessionId) {
                console.log('🔍 Analyzing document with AI...');
                const response = await vakilFriendAPI.analyzeDocumentForSession(sessionId, file);
                const analysis = response.data;

                // Update file status with analysis results
                setAttachedFiles(prev => prev.map(f =>
                    f.name === file.name && f.status === 'pending'
                        ? {
                            ...f,
                            status: 'analyzed',
                            id: analysis.documentId,
                            sha256Hash: analysis.sha256Hash,
                            analysis: analysis,
                            validityStatus: analysis.validityStatus,
                            usefulnessLevel: analysis.usefulnessLevel,
                            storedInVault: analysis.storedInVault
                        }
                        : f
                ));

                // Store current analysis for modal
                setDocumentAnalysis(analysis);
                setShowAnalysisModal(true);

                // Build AI analysis message
                let analysisMessage = `📄 **Document Analyzed: ${file.name}**\n\n`;
                analysisMessage += `🔐 **SHA-256 Hash:** \`${analysis.sha256Hash?.substring(0, 16)}...\`\n\n`;
                analysisMessage += `📋 **Type:** ${analysis.documentType || 'Unknown'}\n`;
                analysisMessage += `✅ **Validity:** ${analysis.validityStatus || 'Pending Review'}\n`;
                analysisMessage += `📊 **Usefulness:** ${analysis.usefulnessLevel || 'Medium'}\n\n`;

                if (analysis.summary) {
                    analysisMessage += `**Summary:** ${analysis.summary}\n\n`;
                }

                if (analysis.keyPoints && analysis.keyPoints.length > 0) {
                    analysisMessage += `**Key Points:**\n`;
                    analysis.keyPoints.forEach(point => {
                        analysisMessage += `• ${point}\n`;
                    });
                    analysisMessage += '\n';
                }

                if (analysis.storedInVault) {
                    analysisMessage += `🛡️ **Stored in Evidence Vault** - Document protected with SHA-256 hash\n`;
                }

                if (analysis.validityIssues && analysis.validityIssues.length > 0) {
                    analysisMessage += `\n⚠️ **Issues Found:**\n`;
                    analysis.validityIssues.forEach(issue => {
                        analysisMessage += `• ${issue}\n`;
                    });
                }

                // Add AI analysis as assistant message
                setMessages(prev => [
                    ...prev,
                    { role: 'user', content: `📎 Attached document: ${file.name}` },
                    { role: 'assistant', content: analysisMessage }
                ]);

            } else {
                // Fallback to simple upload if no session
                const formData = new FormData();
                formData.append('file', file);
                formData.append('category', 'EVIDENCE');
                formData.append('description', `Uploaded during case filing via Vakil-Friend chat`);

                const token = localStorage.getItem('token');
                const response = await axios.post(`${API_BASE_URL}/api/documents/upload`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setAttachedFiles(prev => prev.map(f =>
                    f.name === file.name && f.status === 'pending'
                        ? { ...f, status: 'uploaded', id: response.data.id }
                        : f
                ));

                setMessages(prev => [...prev, {
                    role: 'user',
                    content: `📎 Attached document: ${file.name}`
                }]);
            }

        } catch (error) {
            console.error('Document analysis failed:', error);
            setAttachedFiles(prev => prev.map(f =>
                f.name === file.name && f.status === 'pending'
                    ? { ...f, status: 'failed' }
                    : f
            ));
            alert(`Failed to analyze ${file.name}. Please try again.`);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `❌ Failed to analyze ${file.name}. Please try again.`
            }]);
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
                        background: 'rgba(0,0,0,0.4)', // Lighter backdrop
                        zIndex: 999999,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        paddingTop: '3rem',
                        backdropFilter: 'var(--glass-blur)'
                    }}
                    onClick={() => setShowHistory(false)}
                >
                    <div
                        style={{
                            width: '400px',
                            maxWidth: '90vw',
                            maxHeight: '80vh',
                            background: 'var(--bg-glass-strong)',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            overflowY: 'auto',
                            border: 'var(--border-glass-strong)',
                            boxShadow: 'var(--shadow-glass-strong)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>💬 Chat History</h3>
                            <button
                                onClick={() => setShowHistory(false)}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    borderRadius: '0.5rem',
                                    padding: '0.5rem',
                                    color: 'var(--color-error)',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >✕</button>
                        </div>

                        <button
                            onClick={() => { startNewSession(); setShowHistory(false); }}
                            style={{
                                width: '100%',
                                background: 'var(--color-primary)',
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
                                marginBottom: '1.5rem',
                                boxShadow: 'var(--shadow-glass)'
                            }}
                        >
                            <Plus size={18} /> New Chat
                        </button>

                        {sessions.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>No chat history yet</p>
                        ) : (
                            <div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Recent Sessions</p>
                                {sessions.map((session, idx) => (
                                    <div
                                        key={session.sessionId}
                                        onClick={() => loadSession(session.sessionId)}
                                        style={{
                                            padding: '0.875rem',
                                            background: session.sessionId === sessionId
                                                ? 'rgba(30, 42, 68, 0.1)'
                                                : 'var(--bg-glass)',
                                            borderRadius: '0.75rem',
                                            marginBottom: '0.5rem',
                                            cursor: 'pointer',
                                            border: session.sessionId === sessionId
                                                ? '1px solid var(--color-primary)'
                                                : 'var(--border-glass)',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <MessageSquare size={16} style={{ color: 'var(--color-primary)' }} />
                                            <span style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {session.title || `Session ${sessions.length - idx}`}
                                            </span>
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.35rem', marginLeft: '1.5rem' }}>
                                            {session.status} • {new Date(session.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Document Analysis Modal */}
            {showAnalysisModal && documentAnalysis && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.75)',
                        zIndex: 10001,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '2rem',
                        backdropFilter: 'blur(8px)'
                    }}
                    onClick={() => setShowAnalysisModal(false)}
                >
                    <div
                        style={{
                            width: '580px',
                            maxWidth: '95vw',
                            maxHeight: '90vh',
                            background: '#ffffff', // Clean white background for light theme
                            borderRadius: '2rem',
                            padding: '2rem',
                            overflowY: 'auto',
                            border: '1px solid rgba(30, 42, 68, 0.08)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                            position: 'relative'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Shield size={22} style={{ color: '#10b981' }} />
                                    <h3 style={{
                                        color: '#1e2a44',
                                        fontSize: '1.4rem',
                                        fontWeight: '800',
                                        margin: 0
                                    }}>
                                        AI Document Analysis
                                    </h3>
                                </div>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                                    {documentAnalysis.documentName || 'Analyzing Document...'}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAnalysisModal(false)}
                                style={{
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.75rem',
                                    padding: '0.6rem',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* SHA-256 Hash Section */}
                        <div style={{
                            background: '#f8fafc',
                            borderRadius: '1.25rem',
                            padding: '1.25rem',
                            marginBottom: '1.5rem',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                                <Shield size={16} style={{ color: '#10b981' }} />
                                <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.75rem', letterSpacing: '0.05em' }}>SHA-256 PROTECTED</span>
                            </div>
                            <div style={{
                                color: '#334155',
                                fontSize: '0.8rem',
                                wordBreak: 'break-all',
                                fontFamily: 'monospace',
                                lineHeight: '1.5'
                            }}>
                                {documentAnalysis.sha256Hash}
                            </div>
                        </div>

                        {/* Status Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                            {/* Validity */}
                            <div style={{
                                background: 'rgba(16, 185, 129, 0.04)',
                                borderRadius: '1.25rem',
                                padding: '1.25rem 0.75rem',
                                textAlign: 'center',
                                border: '1px solid rgba(16, 185, 129, 0.15)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <CheckCircle size={20} color="#10b981" />
                                </div>
                                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700' }}>Validity</div>
                                <div style={{ color: '#10b981', fontWeight: '800', fontSize: '0.95rem' }}>
                                    {documentAnalysis.validityStatus || 'VALID'}
                                </div>
                            </div>

                            {/* Usefulness */}
                            <div style={{
                                background: 'rgba(99, 102, 241, 0.04)',
                                borderRadius: '1.25rem',
                                padding: '1.25rem 0.75rem',
                                textAlign: 'center',
                                border: '1px solid rgba(99, 102, 241, 0.15)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Eye size={20} color="#6366f1" />
                                </div>
                                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700' }}>Usefulness</div>
                                <div style={{ color: '#6366f1', fontWeight: '800', fontSize: '0.95rem' }}>
                                    {documentAnalysis.usefulnessLevel || 'HIGH'}
                                </div>
                            </div>

                            {/* Vault Status */}
                            <div style={{
                                background: '#f8fafc',
                                borderRadius: '1.25rem',
                                padding: '1.25rem 0.75rem',
                                textAlign: 'center',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: '#f1f5f9',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Shield size={20} color="#64748b" />
                                </div>
                                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700' }}>Evidence Vault</div>
                                <div style={{ color: '#475569', fontWeight: '800', fontSize: '0.95rem' }}>
                                    {documentAnalysis.storedInVault ? 'STORED' : 'NOT STORED'}
                                </div>
                            </div>
                        </div>

                        {/* Document Type & Category */}
                        {/* Document Details Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid #e2e8f0' }}>
                                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: '700' }}>Document Type</div>
                                <div style={{ color: '#1e2a44', fontWeight: '700', fontSize: '1rem' }}>{documentAnalysis.documentType || 'Legal Document'}</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid #e2e8f0' }}>
                                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: '700' }}>Category</div>
                                <div style={{ color: '#1e2a44', fontWeight: '700', fontSize: '1rem' }}>{documentAnalysis.suggestedCategory || 'EVIDENCE'}</div>
                            </div>
                        </div>

                        {/* AI Summary Section */}
                        <div style={{
                            background: '#f8fafc',
                            padding: '1.5rem',
                            borderRadius: '1.25rem',
                            border: '1px solid #e2e8f0',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.75rem' }}>AI Summary</div>
                            <p style={{ color: '#334155', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                                {documentAnalysis.summary || 'Analytical summary pending...'}
                            </p>
                        </div>

                        {/* Key Points Section */}
                        {documentAnalysis.keyPoints && documentAnalysis.keyPoints.length > 0 && (
                            <div style={{
                                background: 'rgba(99, 102, 241, 0.03)',
                                padding: '1.5rem',
                                borderRadius: '1.25rem',
                                border: '1px solid rgba(99, 102, 241, 0.1)',
                                marginBottom: '2rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', color: '#6366f1' }}>
                                    <Bot size={18} />
                                    <span style={{ fontWeight: '800', fontSize: '0.9rem', letterSpacing: '0.02em' }}>Key Points</span>
                                </div>
                                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {documentAnalysis.keyPoints.map((point, idx) => (
                                        <li key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', marginTop: '0.6rem', flexShrink: 0 }} />
                                            <span style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Validity Issues Area */}
                        {documentAnalysis.validityIssues && documentAnalysis.validityIssues.length > 0 && (
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.03)',
                                padding: '1.5rem',
                                borderRadius: '1.25rem',
                                border: '1px solid rgba(239, 68, 68, 0.1)',
                                marginBottom: '2rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', color: '#ef4444' }}>
                                    <AlertTriangle size={18} />
                                    <span style={{ fontWeight: '800', fontSize: '0.9rem', letterSpacing: '0.02em' }}>Critical Issues</span>
                                </div>
                                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {documentAnalysis.validityIssues.map((issue, idx) => (
                                        <li key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', marginTop: '0.6rem', flexShrink: 0 }} />
                                            <span style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>{issue}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Close Button */}
                        <button
                            onClick={() => setShowAnalysisModal(false)}
                            style={{
                                width: '100%',
                                padding: '1.1rem',
                                background: '#1e2a44',
                                border: 'none',
                                borderRadius: '1rem',
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 10px 15px -3px rgba(30, 42, 68, 0.2)'
                            }}
                        >
                            Close Analysis
                        </button>
                    </div>
                </div>
            )}


            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/litigant')}
                        style={{
                            background: 'var(--bg-glass)',
                            border: 'var(--border-glass)',
                            borderRadius: '0.5rem',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
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
                            background: showHistory ? 'rgba(30, 42, 68, 0.1)' : 'var(--bg-glass)',
                            border: showHistory ? '1px solid var(--color-primary)' : 'var(--border-glass)',
                            borderRadius: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            cursor: 'pointer',
                            color: showHistory ? 'var(--color-primary)' : 'var(--text-secondary)',
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
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            borderRadius: '0.5rem',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            color: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        title="New Chat"
                    >
                        <Plus size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
                            Vakil-Friend AI
                        </h1>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Chat with our AI to file your legal case
                        </p>
                    </div>
                </div>

                {/* Language Selector */}
                <div style={{ marginLeft: 'auto', marginRight: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Language:</span>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            border: 'var(--border-glass)',
                            background: 'var(--bg-glass)',
                            color: 'var(--text-main)',
                            fontSize: '0.9rem',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        {languages.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                    </select>
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
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '0.75rem',
                    marginBottom: '1rem',
                    color: 'var(--color-error)',
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
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '1.25rem',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(30, 42, 68, 0.06)'
            }}>
                {/* Chat Header */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    background: '#F8FAFC',
                    borderBottom: '1px solid #E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '14px',
                            background: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(30, 42, 68, 0.2)'
                        }}>
                            <Bot size={28} color="white" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                                Vakil-Friend AI
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: sessionId ? '#10b981' : '#f59e0b' }} />
                                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748B' }}>
                                    {sessionId ? 'Secured AI Assistant' : 'Connecting...'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages Area - This is the scrollable container */}
                <div
                    ref={messagesContainerRef}
                    style={{
                        padding: '1.5rem',
                        height: 'calc(100vh - 420px)',
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
                            color: 'var(--text-secondary)'
                        }}>
                            <Loader2 size={36} style={{ marginBottom: '1rem', animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
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
                                                : 'var(--color-primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }}>
                                            {msg.role === 'user' ?
                                                <User size={16} color="white" /> :
                                                <Bot size={16} color="white" />
                                            }
                                        </div>
                                        <div style={{
                                            padding: '1rem 1.25rem',
                                            background: msg.role === 'user' ? '#F1F5F9' : '#FFFFFF',
                                            border: msg.role === 'user' ? '1px solid #E2E8F0' : '1px solid #E5E7EB',
                                            borderRadius: msg.role === 'user'
                                                ? '1rem 1rem 0.25rem 1rem'
                                                : '1rem 1rem 1rem 0.25rem',
                                            boxShadow: msg.role === 'user' ? 'none' : '0 4px 12px rgba(30, 42, 68, 0.04)'
                                        }}>
                                            <div className="markdown-content" style={{
                                                color: 'var(--text-main)',
                                                fontSize: '0.95rem',
                                                lineHeight: '1.6',
                                            }}>
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                            {msg.role === 'assistant' && (
                                                <button
                                                    onClick={() => speakText(msg.content, index)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: speakingIndex === index ? 'var(--color-primary)' : 'var(--text-secondary)',
                                                        cursor: 'pointer',
                                                        padding: '0.25rem 0.5rem',
                                                        opacity: speakingIndex === index ? 1 : 0.7,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        marginTop: '0.25rem',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    title={speakingIndex === index ? "Stop speaking" : "Read aloud"}
                                                >
                                                    {speakingIndex === index ? (
                                                        <>
                                                            <StopCircle size={16} style={{ animation: 'pulse 1s infinite' }} />
                                                            <span style={{ fontSize: '0.75rem', marginLeft: '4px' }}>Stop</span>
                                                        </>
                                                    ) : (
                                                        <Volume2 size={16} />
                                                    )}
                                                </button>
                                            )}
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
                                        background: 'var(--color-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Bot size={16} color="white" />
                                    </div>
                                    <div style={{
                                        padding: '0.875rem 1rem',
                                        background: 'var(--bg-glass)',
                                        border: 'var(--border-glass)',
                                        borderRadius: '0.875rem 0.875rem 0.875rem 0.25rem',
                                        color: 'var(--text-secondary)'
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
                    borderTop: 'var(--border-glass)',
                    background: 'var(--bg-glass)'
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
                                        ? 'rgba(16, 185, 129, 0.1)'
                                        : file.status === 'failed'
                                            ? 'rgba(239, 68, 68, 0.1)'
                                            : 'var(--bg-glass)',
                                    border: `1px solid ${file.status === 'uploaded'
                                        ? 'rgba(16, 185, 129, 0.2)'
                                        : file.status === 'failed'
                                            ? 'rgba(239, 68, 68, 0.2)'
                                            : 'var(--border-glass)'}`,
                                    borderRadius: '0.5rem'
                                }}>
                                    <FileText size={14} style={{ color: file.status === 'uploaded' ? '#10b981' : file.status === 'failed' ? '#ef4444' : 'var(--color-accent)' }} />
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-main)',
                                        maxWidth: '120px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {file.name}
                                    </span>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                                        {formatFileSize(file.size)}
                                    </span>
                                    {file.status === 'pending' && (
                                        <Loader2 size={12} style={{ color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
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
                                            color: 'var(--text-secondary)'
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
                                background: 'var(--bg-glass)',
                                border: 'var(--border-glass)',
                                borderRadius: '0.625rem',
                                color: uploadingFile ? 'var(--text-secondary)' : 'var(--color-accent)',
                                cursor: (isLoading || isStarting || uploadingFile) ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => !isLoading && (e.currentTarget.style.background = 'var(--bg-glass-hover)')}
                            onMouseOut={e => !isLoading && (e.currentTarget.style.background = 'var(--bg-glass)')}
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
                                background: 'var(--bg-glass)',
                                border: 'var(--border-glass)',
                                borderRadius: '0.625rem',
                                color: 'var(--text-main)',
                                fontSize: '0.9rem',
                                resize: 'none',
                                outline: 'none',
                                fontFamily: 'inherit',
                                transition: 'all 0.2s'
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                            onBlur={e => e.currentTarget.style.borderColor = 'var(--border-glass)'}
                        />

                        {/* Mic Button */}
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={isLoading || isStarting}
                            style={{
                                padding: '0.75rem',
                                background: isRecording ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-glass)',
                                border: isRecording ? '1px solid rgba(239, 68, 68, 0.5)' : 'var(--border-glass)',
                                borderRadius: '0.625rem',
                                color: isRecording ? '#ef4444' : 'var(--text-secondary)',
                                cursor: (isLoading) ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                animation: isRecording ? 'pulse 1.5s infinite' : 'none'
                            }}
                            title={isRecording ? "Stop Recording" : "Speak (Bhashini AI)"}
                        >
                            {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
                        </button>

                        <button
                            onClick={() => sendMessage()}
                            disabled={!inputMessage.trim() || isLoading || isStarting}
                            style={{
                                padding: '0.75rem 1rem',
                                background: (!inputMessage.trim() || isLoading || isStarting)
                                    ? 'var(--bg-glass-strong)'
                                    : 'var(--color-primary)',
                                border: 'none',
                                borderRadius: '0.625rem',
                                color: (!inputMessage.trim() || isLoading || isStarting) ? 'var(--text-secondary)' : 'white',
                                cursor: (!inputMessage.trim() || isLoading || isStarting) ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: (!inputMessage.trim() || isLoading || isStarting)
                                    ? 'none'
                                    : '0 4px 15px rgba(30, 42, 68, 0.4)',
                                transition: 'all 0.2s'
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
                    color: var(--text-main) !important;
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
                    color: var(--color-primary) !important;
                    font-weight: 700 !important;
                }
                .markdown-content code {
                    background: var(--bg-glass-strong) !important;
                    padding: 0.1rem 0.3rem !important;
                    border-radius: 0.25rem !important;
                    font-family: monospace !important;
                    font-size: 0.9rem !important;
                }
            `}</style>
        </div>
    );
}
