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
    FileText,
    Bot
} from 'lucide-react';
import { messageAPI, lawyerAPI, vakilFriendAPI, documentAPI } from '../../services/api';
// import toast from 'react-hot-toast';

export default function ClientChatPage() {
    const [selectedContact, setSelectedContact] = useState(null);
    const [message, setMessage] = useState('');
    const [contacts, setContacts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [fileUploading, setFileUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Fetch clients on mount
    useEffect(() => {
        fetchContacts();
    }, []);

    // Fetch messages when contact selected
    useEffect(() => {
        if (selectedContact?.caseId) {
            fetchMessages(selectedContact.caseId);
            // Poll for new messages every 10 seconds
            const interval = setInterval(() => fetchMessages(selectedContact.caseId), 10000);
            return () => clearInterval(interval);
        }
    }, [selectedContact]);

    // Scroll to bottom on new message
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchContacts = async () => {
        try {
            const response = await lawyerAPI.getCases();
            const cases = response.data || [];

            // Group cases by Client to ensure unique client entries
            const clientMap = new Map();

            cases.forEach(c => {
                if (!c.clientId) return; // Skip if no client attached

                const existing = clientMap.get(c.clientId);
                const caseDate = new Date(c.updatedAt || c.createdAt || c.filedDate || Date.now());

                // If client exists, update if this case is more recent
                if (existing) {
                    if (caseDate > existing.dateObj) {
                        clientMap.set(c.clientId, {
                            ...existing,
                            caseId: c.id, // Switch context to latest case
                            lastMsg: `Case: ${c.title}`,
                            time: caseDate.toLocaleDateString(),
                            dateObj: caseDate
                        });
                    }
                } else {
                    // Add new client entry
                    clientMap.set(c.clientId, {
                        id: c.clientId, // Use Client ID as Contact ID
                        caseId: c.id,   // Store Case ID for messaging context
                        name: c.clientName || 'Client',
                        lastMsg: `Case: ${c.title}`,
                        time: caseDate.toLocaleDateString(),
                        dateObj: caseDate,
                        unread: 0,
                        status: 'offline'
                    });
                }
            });

            // Convert map to array and sort by date descending
            const chatContacts = Array.from(clientMap.values())
                .sort((a, b) => b.dateObj - a.dateObj);

            setContacts(chatContacts);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            setLoading(false);
        }
    };

    const fetchMessages = async (caseId) => {
        try {
            const response = await messageAPI.getMessages(caseId);
            const fetchedMessages = response.data.map(msg => ({
                id: msg.id,
                // Fix sender logic: Check if sender is NOT me (i.e. is the client)
                // Since we don't have straightforward MyUserID, we assume if sender != current user context, it is client?
                // Actually, backend should flag 'isMe'. For now, assuming senderId match logic needs to be:
                // If I am lawyer, and msg.senderId == clientId, then it is 'client'.
                // We have selectedContact.id which is clientId.
                // So: msg.senderId === selectedContact.id ? 'client' : 'me' 
                // (Assuming selectedContact.id holds the UUID matches msg.senderId)
                sender: (msg.senderId == selectedContact?.id) ? 'client' : 'me',
                text: msg.message,
                time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                attachments: msg.attachments || []
            }));

            // Filter duplicates or optimize update
            setMessages(fetchedMessages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedContact) return;

        setSending(true);
        try {
            // Optimistic UI update
            const newMessage = {
                id: Date.now(),
                sender: 'me',
                text: message,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, newMessage]);

            await messageAPI.send(selectedContact.caseId, message);
            setMessage('');
            fetchMessages(selectedContact.caseId); // confirm send
        } catch (error) {
            console.error('Error sending message:', error);
            // toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedContact) return;

        setFileUploading(true);
        try {
            const response = await documentAPI.upload(file, {
                caseId: selectedContact.caseId,
                category: 'EVIDENCE',
                description: `Shared via chat`
            });

            // Send message with attachment link
            const fileMsg = `Shared file: ${file.name}`;
            await messageAPI.send(selectedContact.caseId, fileMsg);

            // toast.success('File shared successfully');
            fetchMessages(selectedContact.caseId);
        } catch (error) {
            console.error('Error uploading file:', error);
            // toast.error('Failed to upload file');
        } finally {
            setFileUploading(false);
        }
    };

    const handleAIReply = async () => {
        if (!messages.length) return;

        // Get last message from client
        const lastClientMsg = [...messages].reverse().find(m => m.sender === 'client');
        if (!lastClientMsg) return;

        try {
            // Using Vakil-Friend API to generate suggestion
            const response = await vakilFriendAPI.sendMessage('temp-session', `Suggest a professional lawyer reply to this client message: "${lastClientMsg.text}"`);
            setMessage(response.data.reply); // Adjust based on actual API response structure
        } catch (error) {
            console.error('Error generating AI reply:', error);
            setMessage("Thank you for your message. I have received it and will review it shortly.");
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
            {/* Contacts Sidebar */}
            <div style={{ ...glassStyle, width: '350px', padding: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem', borderBottom: 'var(--border-glass-subtle)' }}>
                    <h2 style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <MessageSquare size={24} color="var(--color-accent)" /> Client Messages
                    </h2>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            style={{
                                width: '100%',
                                background: 'var(--bg-glass)',
                                border: 'var(--border-glass)',
                                borderRadius: '0.75rem',
                                padding: '0.7rem 1rem 0.7rem 3rem',
                                color: 'var(--text-main)',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                            <Loader2 className="animate-spin" color="var(--color-accent)" />
                        </div>
                    ) : contacts.map(contact => (
                        <div
                            key={contact.id}
                            onClick={() => setSelectedContact(contact)}
                            style={{
                                padding: '1rem',
                                borderRadius: '1rem',
                                background: selectedContact?.id === contact.id ? 'var(--bg-glass-subtle)' : 'transparent',
                                border: `1px solid ${selectedContact?.id === contact.id ? 'var(--color-accent)' : 'transparent'}`,
                                cursor: 'pointer',
                                display: 'flex',
                                gap: '1rem',
                                transition: 'all 0.2s',
                                marginBottom: '0.5rem'
                            }}
                            onMouseOver={e => !selectedContact?.id === contact.id && (e.currentTarget.style.background = 'var(--bg-glass-subtle)')}
                            onMouseOut={e => !selectedContact?.id === contact.id && (e.currentTarget.style.background = 'transparent')}
                        >
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    width: '52px', height: '52px', borderRadius: '15px',
                                    background: 'var(--bg-glass-subtle)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: 'var(--border-glass-subtle)',
                                    fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)'
                                }}>
                                    {contact.name.charAt(0)}
                                </div>
                                <div style={{
                                    position: 'absolute', bottom: -2, right: -2,
                                    width: '14px', height: '14px', borderRadius: '50%',
                                    background: contact.status === 'online' ? '#10b981' : '#64748b',
                                    border: '3px solid #0f172a'
                                }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span style={{ color: 'white', fontWeight: '700', fontSize: '0.95rem' }}>{contact.name}</span>
                                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{contact.time}</span>
                                </div>
                                <p style={{
                                    color: contact.unread > 0 ? '#e2e8f0' : '#94a3b8',
                                    fontSize: '0.85rem', margin: 0,
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                    fontWeight: contact.unread > 0 ? '600' : '400'
                                }}>
                                    {contact.lastMsg}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div style={{ ...glassStyle, flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {!selectedContact ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-glass-subtle)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem'
                        }}>
                            <MessageSquare size={40} color="var(--color-accent)" />
                        </div>
                        <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Select a Conversation</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '300px' }}>
                            Choose a client from the sidebar to start messaging and manage their legal inquiries.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div style={{ padding: '1rem 1.5rem', borderBottom: 'var(--border-glass-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--bg-glass-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', fontWeight: '800' }}>
                                    {selectedContact.name.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-main)', fontWeight: '700' }}>{selectedContact.name}</div>
                                    <div style={{ color: 'var(--color-success)', fontSize: '0.75rem', fontWeight: '600' }}>Active Now</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button title="Schedule Meeting" style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Calendar size={20} /></button>
                                <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Phone size={20} /></button>
                                <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Video size={20} /></button>
                                <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><MoreVertical size={20} /></button>
                            </div>
                        </div>

                        {/* Messages Area */}
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
                                        borderBottomLeftRadius: msg.sender === 'client' ? '0.2rem' : '1rem',
                                        boxShadow: msg.sender === 'me' ? 'var(--shadow-glass)' : 'none'
                                    }}>
                                        {msg.text}
                                    </div>
                                    <div style={{
                                        display: 'flex', justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                                        gap: '0.4rem', marginTop: '0.25rem', color: '#64748b', fontSize: '0.7rem'
                                    }}>
                                        {msg.time} {msg.sender === 'me' && <CheckCheck size={14} color="#10b981" />}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
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
                                        onClick={handleAIReply}
                                        style={{
                                            position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                                            background: 'var(--bg-glass-subtle)', color: 'var(--color-accent)', border: 'none',
                                            borderRadius: '0.5rem', padding: '0.3rem 0.6rem', fontSize: '0.7rem',
                                            fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer'
                                        }}
                                    >
                                        <Bot size={14} /> AI REPLY
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
