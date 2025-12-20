import { useState, useEffect } from 'react';
import {
    Video,
    Calendar,
    Clock,
    MapPin,
    User,
    Search,
    ChevronRight,
    ArrowUpRight,
    MoreVertical,
    Activity,
    CheckCircle2,
    Briefcase
} from 'lucide-react';
import { hearingAPI } from '../../services/api';

export default function LawyerHearingsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [hearings, setHearings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHearings();
    }, []);

    const loadHearings = async () => {
        try {
            const response = await hearingAPI.getMyHearings();
            const formattedHearings = (response.data || []).map(h => {
                const scheduledDate = h.scheduledDate ? new Date(h.scheduledDate) : null;
                return {
                    id: h.id,
                    caseTitle: h.caseTitle || 'Untitled Case',
                    time: scheduledDate ? scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'TBD',
                    date: scheduledDate ? scheduledDate.toLocaleDateString([], { month: 'short', day: '2-digit' }) : 'TBD',
                    type: 'Virtual', // Most hearings in system are virtual for MVP
                    room: h.videoRoomId || 'N/A',
                    party: 'Client', // Placeholder as backend doesn't send it yet
                    status: h.status || 'Scheduled'
                };
            });
            setHearings(formattedHearings);
        } catch (error) {
            console.error('Failed to load hearings:', error);
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

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
                    }}>
                        <Video size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'white', margin: 0 }}>
                            Hearing Schedule
                        </h1>
                        <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0 }}>
                            Track your court appearances and session details
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
                {/* Main: Hearings List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ ...glassStyle, padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Search by case or party name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'rgba(15, 23, 42, 0.4)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    borderRadius: '0.75rem',
                                    padding: '0.7rem 1rem 0.7rem 3rem',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>
                    </div>

                    {hearings.map(hearing => (
                        <div key={hearing.id} style={{
                            ...glassStyle,
                            padding: '1.5rem',
                            display: 'flex',
                            gap: '1.5rem',
                            alignItems: 'center',
                            transition: 'all 0.2s'
                        }} onMouseOver={e => e.currentTarget.style.transform = 'translateX(8px)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'translateX(0)'}>
                            {/* Date Box */}
                            <div style={{
                                width: '70px', height: '70px', borderRadius: '15px',
                                background: 'rgba(99, 102, 241, 0.1)',
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center', flexShrink: 0
                            }}>
                                <span style={{ color: '#818cf8', fontSize: '0.75rem', fontWeight: '800' }}>{hearing.date.split(' ')[0]}</span>
                                <span style={{ color: 'white', fontSize: '1.25rem', fontWeight: '800' }}>{hearing.date.split(' ')[1]}</span>
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>{hearing.caseTitle}</h3>
                                    <div style={{
                                        padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.65rem', fontWeight: '800',
                                        background: hearing.status === 'Urgent' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                        color: hearing.status === 'Urgent' ? '#ef4444' : '#818cf8',
                                        border: `1px solid ${hearing.status === 'Urgent' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`
                                    }}>
                                        {hearing.status.toUpperCase()}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                                        <Clock size={14} color="#6366f1" /> {hearing.time}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                                        <MapPin size={14} color="#6366f1" /> {hearing.type}: {hearing.room}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                                        <User size={14} color="#6366f1" /> Client: {hearing.party}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {hearing.type === 'Virtual' ? (
                                    <button style={{
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        color: 'white', border: 'none', borderRadius: '0.75rem',
                                        padding: '0.6rem 1.25rem', fontWeight: '700', fontSize: '0.85rem',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                                    }}>
                                        <Video size={16} /> Join Room
                                    </button>
                                ) : (
                                    <button style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        color: 'white', border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '0.75rem', padding: '0.6rem 1.25rem', fontWeight: '700',
                                        fontSize: '0.85rem', cursor: 'pointer'
                                    }}>
                                        View Details
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar: Calendar & Quick Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={glassStyle}>
                        <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={18} color="#818cf8" /> Weekly Overview
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                <div key={i} style={{ textAlign: 'center', color: '#64748b', fontSize: '0.75rem', fontWeight: '800' }}>{day}</div>
                            ))}
                            {Array.from({ length: 31 }).slice(20, 27).map((date, i) => (
                                <div key={i} style={{
                                    height: '35px', borderRadius: '8px',
                                    background: i === 1 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                                    border: i === 1 ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                                    color: i === 1 ? '#818cf8' : '#e2e8f0',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.85rem', fontWeight: '700'
                                }}>{date}</div>
                            ))}
                        </div>
                        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Today's Sessions</span>
                                <span style={{ color: 'white', fontWeight: '700' }}>2</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>This Week</span>
                                <span style={{ color: 'white', fontWeight: '700' }}>8</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ ...glassStyle, background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <div style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={14} /> Attention Required
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
                            Briefing for <b>Sharma Property Dispute</b> is due by 5 PM today. The opposite counsel has uploaded 3 new evidence files.
                        </p>
                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
                            Open Dossier <ArrowUpRight size={14} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
