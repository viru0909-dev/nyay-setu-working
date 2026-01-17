import { useState, useEffect } from 'react';
import {
    Video,
    Calendar,
    Clock,
    MapPin,
    User,
    Activity,
    ArrowUpRight,
    Loader2
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
                    fullDate: scheduledDate,
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
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'var(--glass-blur)',
        border: 'var(--border-glass-strong)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-glass-strong)'
    };

    // Calendar & filtering logic
    const today = new Date();
    // Generate current week (Mon-Sun)
    const currentDay = today.getDay(); // 0 is Sunday
    const diffToMon = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMon);

    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });

    const hearingDates = new Set(hearings.map(h => h.fullDate ? h.fullDate.toDateString() : ''));

    const filteredHearings = hearings.filter(h =>
        h.caseTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '16px',
                        background: 'var(--color-accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'var(--shadow-glass)'
                    }}>
                        <Video size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                            Hearing Schedule
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Upcoming court dates and virtual sessions
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
                {/* Main: Hearings List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ ...glassStyle, padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <input
                                type="text"
                                placeholder="Search hearings..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    background: 'var(--bg-glass)',
                                    border: 'var(--border-glass)',
                                    borderRadius: '0.75rem',
                                    padding: '0.6rem 1rem 0.6rem 2.5rem',
                                    color: 'var(--text-main)',
                                    outline: 'none',
                                    width: '300px'
                                }}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ ...glassStyle, padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                            <p>Loading your schedule...</p>
                            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : filteredHearings.length === 0 ? (
                        <div style={{ ...glassStyle, padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <p>No hearings found.</p>
                        </div>
                    ) : (
                        filteredHearings.map(hearing => (
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
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: '600', textTransform: 'uppercase' }}>
                                        {hearing.date === 'TBD' ? 'TBD' : new Date(hearing.date).toLocaleString('default', { month: 'short' })}
                                    </span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1 }}>
                                        {hearing.date === 'TBD' ? '-' : new Date(hearing.date).getDate()}
                                    </span>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.25rem' }}>
                                            {hearing.caseTitle}
                                        </h3>
                                        <span style={{
                                            padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.65rem', fontWeight: '800',
                                            background: hearing.status === 'Urgent' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                            color: hearing.status === 'Urgent' ? 'var(--color-error)' : 'var(--color-accent)',
                                            border: `1px solid ${hearing.status === 'Urgent' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`
                                        }}>
                                            {hearing.status}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            <Clock size={14} /> {hearing.time}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            <MapPin size={14} /> {hearing.type}: {hearing.room}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            <User size={14} /> Client: {hearing.party}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {hearing.type === 'Virtual' ? (
                                        <button
                                            onClick={() => window.open('https://meet.jit.si/' + hearing.room, '_blank')}
                                            style={{
                                                background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                                                color: 'white', border: 'none', borderRadius: '0.75rem',
                                                padding: '0.6rem 1.25rem', fontWeight: '700', fontSize: '0.85rem',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                                            }}>
                                            <Video size={16} /> Join Room
                                        </button>
                                    ) : (
                                        <button style={{
                                            background: 'var(--bg-glass-subtle)',
                                            color: 'var(--text-main)', border: 'var(--border-glass-subtle)',
                                            borderRadius: '0.75rem', padding: '0.6rem 1.25rem', fontWeight: '700',
                                            fontSize: '0.85rem', cursor: 'pointer'
                                        }}>
                                            View Details
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Sidebar: Calendar & Quick Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={glassStyle}>
                        <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={18} color="#818cf8" /> Weekly Overview
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                <div key={i} style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '800' }}>{day}</div>
                            ))}
                            {weekDates.map((date, i) => {
                                const isToday = date.toDateString() === today.toDateString();
                                const hasHearing = hearingDates.has(date.toDateString());
                                return (
                                    <div key={i} style={{
                                        height: '35px', borderRadius: '8px',
                                        background: isToday ? 'rgba(99, 102, 241, 0.2)' : (hasHearing ? 'rgba(76, 209, 55, 0.1)' : 'rgba(255, 255, 255, 0.03)'),
                                        border: isToday ? '1px solid rgba(99, 102, 241, 0.4)' : (hasHearing ? '1px solid rgba(76, 209, 55, 0.2)' : '1px solid transparent'),
                                        color: isToday ? '#818cf8' : (hasHearing ? '#4cd137' : 'var(--text-secondary)'),
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.85rem', fontWeight: '700'
                                    }}>{date.getDate()}</div>
                                );
                            })}
                        </div>
                        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Today's Sessions</span>
                                <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>
                                    {hearings.filter(h => h.fullDate && h.fullDate.toDateString() === today.toDateString()).length}
                                </span>
                            </div>
                            {hearings.filter(h => h.fullDate && h.fullDate.toDateString() === today.toDateString()).length === 0 ? (
                                <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    No hearings today
                                </div>
                            ) : (
                                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {hearings.filter(h => h.fullDate && h.fullDate.toDateString() === today.toDateString()).map(h => (
                                        <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }}></div>
                                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-main)' }}>{h.caseTitle}</span>
                                            <span style={{ color: 'var(--text-secondary)' }}>{h.time}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ ...glassStyle, background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <div style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={14} /> Attention Required
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
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
