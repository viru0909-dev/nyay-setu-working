import { useState, useEffect, useRef } from 'react';
import {
    MessageSquare,
    Search,
    User,
    Send,
    Sparkles,
    MoreVertical,
    Phone,
    Video,
    Paperclip,
    CheckCheck,
    Loader2,
    Calendar,
    ArrowLeft,
    ChevronDown,
    Mic
} from 'lucide-react';
import { messageAPI, caseAPI, vakilFriendAPI, documentAPI } from '../../services/api';
// import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function LawyerChatPage() {
    const navigate = useNavigate();
    const [selectedCase, setSelectedCase] = useState(null);
    const [message, setMessage] = useState('');
    const [cases, setCases] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [fileUploading, setFileUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Fetch client's cases on mount
    useEffect(() => {
        fetchCases();
    }, []);

    // Fetch messages when case selected
    useEffect(() => {
        if (selectedCase?.id) {
            fetchMessages(selectedCase.id);
            // Poll for new messages every 10 seconds
            const interval = setInterval(() => fetchMessages(selectedCase.id), 10000);
            return () => clearInterval(interval);
        }
    }, [selectedCase]);

    // Scroll to bottom on new message
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchCases = async () => {
        try {
            const response = await caseAPI.list(); // Current user's cases
            const myCases = response.data || [];

            // Group cases by Lawyer
            const lawyerMap = new Map();

            myCases.forEach(c => {
                if (!c.lawyerId) return;

                const existing = lawyerMap.get(c.lawyerId);
                const caseDate = new Date(c.updatedAt || c.createdAt || c.filedDate || Date.now());
                const caseInfo = { id: c.id, title: c.title, date: caseDate };

                if (existing) {
                    existing.allCases.push(caseInfo);
                    // Update to latest context if newer
                    if (caseDate > existing.dateObj) {
                        lawyerMap.set(c.lawyerId, {
                            ...existing,
                            id: c.id,
                            caseId: c.id,
                            subtitle: `Case: ${c.title}`,
                            time: caseDate.toLocaleDateString(),
                            dateObj: caseDate,
                            // Keep allCases reference
                        });
                    }
                } else {
                    lawyerMap.set(c.lawyerId, {
                        id: c.id,
                        caseId: c.id,
                        name: c.lawyerName || 'Lawyer',
                        subtitle: `Case: ${c.title}`,
                        time: caseDate.toLocaleDateString(),
                        dateObj: caseDate,
                        status: 'online',
                        lawyerAssigned: true,
                        lawyerId: c.lawyerId,
                        allCases: [caseInfo]
                    });
                }
            });

            const chatContacts = Array.from(lawyerMap.values())
                .sort((a, b) => b.dateObj - a.dateObj);

            setCases(chatContacts);

            if (chatContacts.length > 0) {
                setSelectedCase(chatContacts[0]);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching cases:', error);
            setLoading(false);
        }
    };

    const fetchMessages = async (caseId) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const myId = user?.id;
            const response = await messageAPI.getMessages(caseId);
            const fetchedMessages = response.data.map(msg => ({
                id: msg.id,
                sender: msg.senderId === myId ? 'me' : 'lawyer',
                text: msg.message,
                type: msg.type || 'TEXT',
                attachmentUrl: msg.attachmentUrl,
                time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                attachments: msg.attachments || []
            }));

            setMessages(fetchedMessages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async (customMessage = null, type = 'TEXT', attachmentUrl = null) => {
        const msgToSend = customMessage || message;
        if ((!msgToSend.trim() && type === 'TEXT') || !selectedCase) return;

        setSending(true);
        try {
            // Updated API call to include type and attachmentUrl
            // We need to modify messageAPI.send in services/api.js or pass a custom object here if the API was flexible.
            // Assuming messageAPI.send takes (caseId, message) currently. We need to update it or send raw axios post here.

            // Using raw axios post pattern since messageAPI.send might not support type yet in the frontend definition
            // But better to stick to api.js. 
            // NOTE: I'll assume messageAPI.send can accept an object or we modify it. 
            // Actually, let's just make the POST request here to be safe and quick

            const user = JSON.parse(localStorage.getItem('user'));
            const payload = {
                senderId: user?.id,
                message: msgToSend,
                type: type,
                attachmentUrl: attachmentUrl
            };

            // We use the same endpoint as in messageAPI.send
            await messageAPI.send(selectedCase.id, payload); // Modifying api.js next to support this payload

            if (!customMessage && type === 'TEXT') setMessage('');
            fetchMessages(selectedCase.id);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedCase) return;

        setFileUploading(true);
        try {
            const res = await documentAPI.upload(file, {
                caseId: selectedCase.id,
                category: 'EVIDENCE',
                description: `Shared via chat by client`
            });

            // Assuming response has id
            const docId = res.data.id;
            const downloadUrl = `/api/documents/${docId}/download`;

            const fileMsg = `Shared file: ${file.name}`;
            await handleSendMessage(fileMsg, 'FILE', downloadUrl);

            fetchMessages(selectedCase.id);
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setFileUploading(false);
        }
    };

    const handleVideoCall = () => {
        const roomId = `nyaysetu-video-${selectedCase.id}-${Date.now()}`;
        const url = `https://meet.jit.si/${roomId}`;
        handleSendMessage("📞 I would like to start a video call.", 'VIDEO_CALL', url);
    };

    const handlePhoneCall = () => {
        const roomId = `nyaysetu-audio-${selectedCase.id}-${Date.now()}`;
        const url = `https://meet.jit.si/${roomId}#config.startWithVideoMuted=true`;
        handleSendMessage("📞 I would like to have a phone call.", 'PHONE_CALL', url);
    };

    const handleVoiceMessage = async () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = uploadVoiceMessage;
            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            // Stop tracks
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const uploadVoiceMessage = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], "voice_message.wav", { type: 'audio/wav' });

        setFileUploading(true);
        try {
            const res = await documentAPI.upload(audioFile, {
                caseId: selectedCase.id,
                category: 'VOICE_NOTE',
                description: `Voice message`
            });

            const docId = res.data.id;
            const downloadUrl = `/api/documents/${docId}/download`;

            await handleSendMessage("🎤 Voice Message", 'AUDIO', downloadUrl);
        } catch (error) {
            console.error("Failed to upload voice message", error);
        } finally {
            setFileUploading(false);
        }
    };

    // AI Helper specialized for client queries
    const handleAIHelp = async () => {
        if (!message) {
            setMessage("Can you update me on the status of my case?");
            return;
        }

        try {
            const context = selectedCase ? ` regarding Case "${selectedCase.subtitle}"` : '';
            const response = await vakilFriendAPI.sendMessage('temp-session', `Refine this message to my lawyer${context} to be more professional: "${message}"`);
            setMessage(response.data.reply);
        } catch (error) {
            console.error('Error generating AI help:', error);
        }
    };

    const renderMessageContent = (msg) => {
        switch (msg.type) {
            case 'AUDIO':
                return (
                    <div>
                        <div style={{ marginBottom: '5px' }}>🎤 Voice Message</div>
                        <audio controls src={msg.attachmentUrl || '#'} style={{ height: '30px', maxWidth: '200px' }} />
                    </div>
                );
            case 'VIDEO_CALL':
            case 'PHONE_CALL':
                return (
                    <div>
                        <div style={{ marginBottom: '5px' }}>{msg.text}</div>
                        <a
                            href={msg.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-block',
                                marginTop: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'white',
                                color: 'var(--color-primary)',
                                borderRadius: '0.5rem',
                                textDecoration: 'none',
                                fontWeight: 'bold',
                                fontSize: '0.85rem'
                            }}
                        >
                            {msg.type === 'VIDEO_CALL' ? 'Join Video Call' : 'Join Audio Call'}
                        </a>
                    </div>
                );
            case 'FILE':
                return (
                    <div>
                        <div>{msg.text}</div>
                        <a href={msg.attachmentUrl} download style={{ color: 'gold', textDecoration: 'underline' }}>Download File</a>
                    </div>
                );
            default:
                return msg.text;
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

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: 'calc(100vh - 160px)', display: 'flex', gap: '2rem' }}>
            {/* Sidebar - My Lawyers/Cases */}
            <div style={{ ...glassStyle, width: '350px', padding: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem', borderBottom: 'var(--border-glass-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                            <ArrowLeft size={24} />
                        </button>
                        <h2 style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <MessageSquare size={24} color="var(--color-primary)" /> My Lawyers
                        </h2>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                            <Loader2 className="animate-spin" color="var(--color-primary)" />
                        </div>
                    ) : cases.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <p>No lawyers assigned to your cases yet.</p>
                        </div>
                    ) : cases.map(c => (
                        <div
                            key={c.id}
                            onClick={() => setSelectedCase(c)}
                            style={{
                                padding: '1rem',
                                borderRadius: '1rem',
                                background: selectedCase?.id === c.id ? 'var(--bg-glass-subtle)' : 'transparent',
                                border: `1px solid ${selectedCase?.id === c.id ? 'var(--color-primary)' : 'transparent'}`,
                                cursor: 'pointer',
                                display: 'flex',
                                gap: '1rem',
                                transition: 'all 0.2s',
                                marginBottom: '0.5rem'
                            }}
                        >
                            <div style={{ width: '52px', height: '52px', borderRadius: '15px', background: 'var(--bg-glass-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>
                                {c.name.charAt(0)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span style={{ color: 'var(--text-main)', fontWeight: '700', fontSize: '0.95rem' }}>{c.name}</span>
                                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{c.time}</span>
                                </div>
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {c.subtitle}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div style={{ ...glassStyle, flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {!selectedCase ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
                        <MessageSquare size={48} color="var(--color-primary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Select a Lawyer</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Select a conversation to start chatting with your lawyer.</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div style={{ padding: '1rem 1.5rem', borderBottom: 'var(--border-glass-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--bg-glass-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', fontWeight: '800' }}>
                                    {selectedCase.name.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-main)', fontWeight: '700' }}>{selectedCase.name}</div>

                                    {/* Case Selector Dropdown */}
                                    {selectedCase.allCases && selectedCase.allCases.length > 1 ? (
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <select
                                                value={selectedCase.caseId}
                                                onChange={(e) => {
                                                    const newCaseId = e.target.value;
                                                    const caseInfo = selectedCase.allCases.find(c => c.id === newCaseId);
                                                    if (caseInfo) {
                                                        setSelectedCase(prev => ({
                                                            ...prev,
                                                            caseId: newCaseId,
                                                            subtitle: `Case: ${caseInfo.title}`
                                                        }));
                                                    }
                                                }}
                                                style={{
                                                    background: 'transparent', border: 'none', color: 'var(--color-success)',
                                                    fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', outline: 'none',
                                                    appearance: 'none', paddingRight: '1rem'
                                                }}
                                            >
                                                {selectedCase.allCases.map(c => (
                                                    <option key={c.id} value={c.id} style={{ color: 'black' }}>Case: {c.title.substring(0, 30)}...</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={12} color="var(--color-success)" style={{ position: 'absolute', right: 0, pointerEvents: 'none' }} />
                                        </div>
                                    ) : (
                                        <div style={{ color: 'var(--color-success)', fontSize: '0.75rem', fontWeight: '600' }}>{selectedCase.subtitle}</div>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button title="Request Meeting" style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Calendar size={20} /></button>
                                <button onClick={handlePhoneCall} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Phone size={20} /></button>
                                <button onClick={handleVideoCall} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Video size={20} /></button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {messages.map((msg, idx) => (
                                <div key={msg.id || idx} style={{
                                    alignSelf: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%'
                                }}>
                                    <div style={{
                                        padding: '0.75rem 1rem',
                                        borderRadius: '1rem',
                                        background: msg.sender === 'me' ? 'var(--color-primary)' : 'var(--bg-glass-subtle)',
                                        color: msg.sender === 'me' ? 'white' : 'var(--text-main)',
                                        fontSize: '0.95rem',
                                        borderBottomRightRadius: msg.sender === 'me' ? '0.2rem' : '1rem',
                                        borderBottomLeftRadius: msg.sender === 'client' ? '0.2rem' : '1rem'
                                    }}>
                                        {renderMessageContent(msg)}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start', gap: '0.4rem', marginTop: '0.25rem', color: '#64748b', fontSize: '0.7rem' }}>
                                        {msg.time} {msg.sender === 'me' && <CheckCheck size={14} color="#10b981" />}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div style={{ padding: '1.5rem', borderTop: 'var(--border-glass-subtle)' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileUpload}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={fileUploading}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                >
                                    {fileUploading ? <Loader2 size={22} className="animate-spin" /> : <Paperclip size={22} />}
                                </button>
                                <button
                                    onClick={handleVoiceMessage}
                                    style={{
                                        background: isRecording ? '#ef4444' : 'transparent',
                                        border: 'none',
                                        color: isRecording ? 'white' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {isRecording ? <div className="animate-pulse" style={{ width: '12px', height: '12px', background: 'white', borderRadius: '2px' }} /> : <Mic size={22} />}
                                </button>

                                <div style={{ position: 'relative', flex: 1 }}>
                                    <input
                                        type="text"
                                        placeholder={isRecording ? "Recording audio..." : "Type a message..."}
                                        value={message}
                                        disabled={isRecording}
                                        onChange={e => setMessage(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                                        style={{
                                            width: '100%',
                                            background: 'var(--bg-glass)',
                                            border: 'var(--border-glass)',
                                            borderRadius: '0.75rem',
                                            padding: '0.75rem 1rem',
                                            color: 'var(--text-main)',
                                            outline: 'none'
                                        }}
                                    />
                                    <button
                                        onClick={handleAIHelp}
                                        style={{
                                            position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                                            background: 'var(--bg-glass-subtle)', color: 'var(--color-primary)', border: 'none',
                                            borderRadius: '0.5rem', padding: '0.3rem 0.6rem', fontSize: '0.7rem',
                                            fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer'
                                        }}
                                    >
                                        <Sparkles size={14} /> AI HELP
                                    </button>
                                </div>
                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={!message.trim() || sending || isRecording}
                                    style={{
                                        width: '44px', height: '44px', borderRadius: '50%',
                                        background: 'var(--color-accent)',
                                        color: 'var(--text-main)', border: 'none', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-glass)',
                                        opacity: (!message.trim() || sending || isRecording) ? 0.7 : 1
                                    }}
                                >
                                    {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
