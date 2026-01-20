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
    ArrowLeft
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

            // Transform cases into chat contacts (Lawyers)
            const chatContacts = myCases.map(c => ({
                id: c.id,
                caseId: c.id,
                name: c.lawyerName || 'Assigned Lawyer', // Fallback if no lawyer assigned yet
                subtitle: `Case: ${c.title}`,
                time: new Date(c.updatedAt).toLocaleDateString(),
                status: 'online',
                lawyerAssigned: !!c.lawyerId
            })).filter(c => c.lawyerAssigned); // Only show cases with assigned lawyers

            setCases(chatContacts);

            // Auto-select first case if available
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
            const response = await messageAPI.getMessages(caseId);
            const fetchedMessages = response.data.map(msg => ({
                id: msg.id,
                sender: msg.senderId === selectedCase.id ? 'lawyer' : 'me', // simplistic logic
                text: msg.message,
                time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                attachments: msg.attachments || []
            }));

            setMessages(fetchedMessages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedCase) return;

        setSending(true);
        try {
            await messageAPI.send(selectedCase.id, message);
            setMessage('');
            fetchMessages(selectedCase.id);
        } catch (error) {
            console.error('Error sending message:', error);
            // toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedCase) return;

        setFileUploading(true);
        try {
            await documentAPI.upload(file, {
                caseId: selectedCase.id,
                category: 'EVIDENCE',
                description: `Shared via chat by client`
            });

            const fileMsg = `Shared file: ${file.name}`;
            await messageAPI.send(selectedCase.id, fileMsg);

            // toast.success('File shared successfully');
            fetchMessages(selectedCase.id);
        } catch (error) {
            console.error('Error uploading file:', error);
            // toast.error('Failed to upload file');
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
            const response = await vakilFriendAPI.sendMessage('temp-session', `Refine this message to my lawyer to be more professional: "${message}"`);
            setMessage(response.data.reply);
        } catch (error) {
            console.error('Error generating AI help:', error);
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
                            <MessageSquare size={24} color="var(--color-accent)" /> My Lawyers
                        </h2>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                            <Loader2 className="animate-spin" color="var(--color-accent)" />
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
                                border: `1px solid ${selectedCase?.id === c.id ? 'var(--color-accent)' : 'transparent'}`,
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
                                    <span style={{ color: 'white', fontWeight: '700', fontSize: '0.95rem' }}>{c.name}</span>
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
                        <MessageSquare size={48} color="var(--color-accent)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
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
                                    <div style={{ color: 'var(--color-success)', fontSize: '0.75rem', fontWeight: '600' }}>{selectedCase.subtitle}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button title="Request Meeting" style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Calendar size={20} /></button>
                                <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Phone size={20} /></button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {messages.map((msg, idx) => (
                                <div key={msg.id || idx} style={{
                                    alignSelf: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                                    maxWidth: '70%'
                                }}>
                                    <div style={{
                                        padding: '0.75rem 1rem',
                                        borderRadius: '1rem',
                                        background: msg.sender === 'me' ? 'var(--color-accent)' : 'var(--bg-glass-subtle)',
                                        color: 'var(--text-main)',
                                        fontSize: '0.95rem',
                                        borderBottomRightRadius: msg.sender === 'me' ? '0.2rem' : '1rem',
                                        borderBottomLeftRadius: msg.sender === 'client' ? '0.2rem' : '1rem'
                                    }}>
                                        {msg.text}
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

                                <div style={{ position: 'relative', flex: 1 }}>
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={message}
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
                                            background: 'var(--bg-glass-subtle)', color: 'var(--color-accent)', border: 'none',
                                            borderRadius: '0.5rem', padding: '0.3rem 0.6rem', fontSize: '0.7rem',
                                            fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer'
                                        }}
                                    >
                                        <Sparkles size={14} /> AI HELP
                                    </button>
                                </div>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!message.trim() || sending}
                                    style={{
                                        width: '44px', height: '44px', borderRadius: '50%',
                                        background: 'var(--color-accent)',
                                        color: 'var(--text-main)', border: 'none', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-glass)',
                                        opacity: (!message.trim() || sending) ? 0.7 : 1
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
