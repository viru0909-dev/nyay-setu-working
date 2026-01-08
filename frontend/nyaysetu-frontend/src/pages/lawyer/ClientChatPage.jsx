import { useState, useEffect } from 'react';
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
    Loader2
} from 'lucide-react';

export default function ClientChatPage() {
    const [selectedContact, setSelectedContact] = useState(null);
    const [message, setMessage] = useState('');

    const contacts = [
        { id: 1, name: 'Rajesh Kumar', lastMsg: 'I have uploaded the deed.', time: '10:30 AM', unread: 2, status: 'online' },
        { id: 2, name: 'Priya Sharma', lastMsg: 'When is the next hearing?', time: 'Yesterday', unread: 0, status: 'offline' },
        { id: 3, name: 'Amit Singh', lastMsg: 'Thank you for the update.', time: 'Monday', unread: 0, status: 'online' },
        { id: 4, name: 'Sneha Patel', lastMsg: 'Can we meet tomorrow?', time: 'Dec 18', unread: 0, status: 'offline' },
    ];

    const messages = [
        { id: 1, sender: 'client', text: 'Namaste Adv. Sharma, I have a question regarding the sale deed.', time: '10:15 AM' },
        { id: 2, sender: 'me', text: 'Greetings Rajesh. Please go ahead. I am reviewing your folder now.', time: '10:20 AM' },
        { id: 3, sender: 'client', text: 'I have uploaded the latest copy. Is it verified yet?', time: '10:25 AM' },
    ];

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
                    {contacts.map(contact => (
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
                            {contact.unread > 0 && (
                                <div style={{
                                    minWidth: '20px', height: '20px', borderRadius: '10px',
                                    background: '#6366f1', color: 'white', fontSize: '0.7rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: '800', padding: '0 6px'
                                }}>
                                    {contact.unread}
                                </div>
                            )}
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
                                <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Phone size={20} /></button>
                                <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Video size={20} /></button>
                                <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><MoreVertical size={20} /></button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {messages.map(msg => (
                                <div key={msg.id} style={{
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
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '1.5rem', borderTop: 'var(--border-glass-subtle)' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Paperclip size={22} /></button>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
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
                                    <button style={{
                                        position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                                        background: 'var(--bg-glass-subtle)', color: 'var(--color-accent)', border: 'none',
                                        borderRadius: '0.5rem', padding: '0.3rem 0.6rem', fontSize: '0.7rem',
                                        fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer'
                                    }}>
                                        <Sparkles size={14} /> AI REPLY
                                    </button>
                                </div>
                                <button style={{
                                    width: '44px', height: '44px', borderRadius: '50%',
                                    background: 'var(--color-accent)',
                                    color: 'var(--text-main)', border: 'none', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-glass)'
                                }}>
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
