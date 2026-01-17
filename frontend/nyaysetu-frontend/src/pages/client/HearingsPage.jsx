import { useState, useEffect } from 'react';
import {
    Video,
    Calendar,
    Clock,
    MapPin,
    User,
    Shield,
    Phone,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';

export default function HearingsPage() {
    const [hearings, setHearings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCall, setActiveCall] = useState(null);

    useEffect(() => {
        fetchHearings();
    }, []);

    const fetchHearings = async () => {
        try {
            const token = localStorage.getItem('token');
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const response = await axios.get(`${API_BASE_URL}/api/hearings/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Sort hearings: Upcoming first, then by date
            const sortedHearings = (response.data || []).sort((a, b) =>
                new Date(a.scheduledDate) - new Date(b.scheduledDate)
            );

            setHearings(sortedHearings);
        } catch (error) {
            console.error('Failed to fetch hearings:', error);
        } finally {
            setLoading(false);
        }
    };

    const joinHearing = (hearing) => {
        setActiveCall({
            ...hearing,
            roomId: hearing.videoRoomId || `nyaysetu-${hearing.id.substring(0, 8)}`
        });
    };

    const endCall = () => {
        setActiveCall(null);
    };

    const isUpcoming = (dateStr) => {
        return new Date(dateStr) > new Date();
    };

    const canJoin = (dateStr) => {
        const now = new Date();
        const hearingTime = new Date(dateStr);
        const diffMinutes = (hearingTime - now) / (1000 * 60);
        return diffMinutes <= 15; // Can join 15 minutes before
    };

    const glassStyle = {
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'var(--glass-blur)',
        border: 'var(--border-glass-strong)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-glass)'
    };

    if (activeCall) {
        return (
            <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Video Header Area */}
                <div style={{
                    ...glassStyle,
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--bg-glass-strong)',
                    borderRadius: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={endCall}
                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.125rem', fontWeight: '700' }}>
                                {activeCall.caseTitle || 'Court Hearing'}
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                <Shield size={12} color="#4ade80" />
                                <span>End-to-End Encrypted Secure Judicial Line</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: '800', fontSize: '0.875rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'blink 1.5s infinite' }} />
                            SESSION LIVE
                        </div>
                        <div style={{ height: '24px', width: '1px', background: 'var(--border-glass)' }} />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>

                {/* Jitsi Video Container */}
                <div style={{ flex: 1, position: 'relative', borderRadius: '1.5rem', overflow: 'hidden', border: 'var(--border-glass-strong)', boxShadow: 'var(--shadow-glass)' }}>
                    <iframe
                        src={`https://meet.jit.si/${activeCall.roomId}#config.prejoinConfig.enabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=true`}
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none'
                        }}
                        allow="camera; microphone; fullscreen; display-capture; autoplay"
                        title="Court Hearing"
                    />
                </div>

                {/* Bottom Control Bar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '0.5rem'
                }}>
                    <button
                        onClick={endCall}
                        style={{
                            padding: '1rem 2.5rem',
                            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                            border: 'none',
                            borderRadius: '9999px',
                            color: 'white',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)',
                            transition: 'all 0.2s',
                            letterSpacing: '0.5px'
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <Phone size={20} />
                        LEAVE SESSION
                    </button>
                    <style>{`
                        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
                    `}</style>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'var(--shadow-glass)'
                    }}>
                        <Video size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                            Hearings
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Your scheduled virtual court sessions
                        </p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ ...glassStyle, padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                    <p>Loading hearings...</p>
                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                </div>
            ) : hearings.length === 0 ? (
                <div style={{ ...glassStyle, padding: '4rem', textAlign: 'center' }}>
                    <Calendar size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1.5rem', opacity: 0.5 }} />
                    <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Hearings Scheduled</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>You don't have any upcoming hearings at the moment.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {hearings.map(hearing => {
                        const date = new Date(hearing.scheduledDate);
                        const isToday = date.toDateString() === new Date().toDateString();
                        const joinable = canJoin(hearing.scheduledDate);
                        const isPast = !isUpcoming(hearing.scheduledDate) && !joinable;

                        return (
                            <div key={hearing.id} style={{
                                ...glassStyle,
                                padding: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1.5rem',
                                transition: 'all 0.2s',
                                opacity: isPast ? 0.7 : 1,
                                filter: isPast ? 'grayscale(0.4)' : 'none'
                            }}
                                onMouseOver={e => !isPast && (e.currentTarget.style.transform = 'translateY(-2px)')}
                                onMouseOut={e => !isPast && (e.currentTarget.style.transform = 'translateY(0)')}
                            >
                                {/* Date Box */}
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '18px',
                                    background: isToday ? 'rgba(37, 99, 235, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                    border: isToday ? '1px solid rgba(37, 99, 235, 0.3)' : '1px solid var(--border-glass)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    justifyContent: 'center', flexShrink: 0
                                }}>
                                    <span style={{ fontSize: '0.85rem', color: isToday ? '#3b82f6' : 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>
                                        {date.toLocaleString('default', { month: 'short' })}
                                    </span>
                                    <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1 }}>
                                        {date.getDate()}
                                    </span>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: 'var(--text-main)' }}>
                                        {hearing.caseTitle || 'Case Hearing'}
                                    </h3>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Clock size={16} />
                                            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <MapPin size={16} />
                                            Virtual Court
                                        </div>
                                        {isToday && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: '600' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                                                Scheduled for Today
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    {joinable ? (
                                        <button
                                            onClick={() => joinHearing(hearing)}
                                            style={{
                                                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '0.75rem',
                                                padding: '0.75rem 1.5rem',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                                            }}
                                        >
                                            <Video size={18} />
                                            Join Now
                                        </button>
                                    ) : isPast ? (
                                        <div style={{
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '0.75rem',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            color: 'var(--text-secondary)',
                                            fontWeight: '600',
                                            fontSize: '0.9rem'
                                        }}>
                                            Completed
                                        </div>
                                    ) : (
                                        <div style={{
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '0.75rem',
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            color: '#3b82f6',
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <Clock size={16} />
                                            Upcoming
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
