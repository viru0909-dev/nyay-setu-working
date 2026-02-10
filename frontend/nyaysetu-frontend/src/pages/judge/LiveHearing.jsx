import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Calendar, Clock, Loader2, ExternalLink, Shield, Phone, MapPin, User, Activity, ArrowUpRight, Search, ArrowLeft } from 'lucide-react';
import { judgeAPI } from '../../services/api';

export default function LiveHearing() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [hearings, setHearings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeHearing, setActiveHearing] = useState(null);

    useEffect(() => {
        fetchUpcomingHearings();
        const interval = setInterval(fetchUpcomingHearings, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchUpcomingHearings = async () => {
        try {
            const response = await judgeAPI.getTodaysHearings();
            const rawHearings = response.data || [];

            // Format for UI
            const formatted = rawHearings.map(h => {
                const date = new Date(h.scheduledDate);
                return {
                    ...h,
                    caseTitle: h.caseEntity?.title || 'Untitled Case',
                    caseId: h.caseEntity?.id || h.id,
                    fullDate: date,
                    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
                    dateStr: date.toLocaleDateString([], { month: 'short', day: '2-digit' }),
                    isLive: isLive(date, h.durationMinutes),
                    isUpcoming: isUpcoming(date)
                };
            });

            setHearings(formatted);
        } catch (error) {
            console.error('Error fetching hearings:', error);
            setHearings([]);
        } finally {
            setLoading(false);
        }
    };

    const isUpcoming = (date) => {
        const now = new Date();
        const diffHours = (date - now) / (1000 * 60 * 60);
        return diffHours > 0 && diffHours <= 24;
    };

    const isLive = (date, duration) => {
        const now = new Date();
        const end = new Date(date.getTime() + duration * 60000);
        return now >= date && now <= end;
    };

    const canJoin = (hearing) => {
        const now = new Date();
        const start = new Date(hearing.scheduledDate);
        const diffMinutes = (start - now) / (1000 * 60);
        return diffMinutes <= 15; // 15 mins before
    };

    const joinHearing = (hearing) => {
        setActiveHearing(hearing);
    };

    const endCall = () => {
        setActiveHearing(null);
    };

    // Calendar Logic
    const today = new Date();
    const currentDay = today.getDay();
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
        (h.caseTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.caseId || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const glassStyle = {
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'var(--glass-blur)',
        border: 'var(--border-glass-strong)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-glass-strong)'
    };

    // Active Video Call View
    if (activeHearing) {
        return (
            <div style={{ maxWidth: '1400px', margin: '0 auto', paddingTop: '2rem', paddingBottom: '2rem' }}>
                <div style={{ height: '75vh', display: 'flex', flexDirection: 'column', background: '#0a0a0f', borderRadius: '1.5rem', overflow: 'hidden', border: '2px solid rgba(99, 102, 241, 0.3)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
                    {/* Video Header Area */}
                    <div style={{
                        padding: '1rem 1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(17, 24, 39, 0.95)',
                        borderBottom: '1px solid rgba(99, 102, 241, 0.2)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button
                                onClick={endCall}
                                style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h2 style={{ color: 'white', margin: 0, fontSize: '1.125rem', fontWeight: '700' }}>
                                    {activeHearing.caseTitle}
                                </h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.75rem' }}>
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
                            <div style={{ height: '24px', width: '1px', background: 'rgba(148, 163, 184, 0.3)' }} />
                            <span style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: '600' }}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>

                    {/* Jitsi Video Container */}
                    <div style={{ flex: 1, position: 'relative', background: '#1a1a1f', minHeight: 0 }}>
                        <iframe
                            src={`https://meet.jit.si/${activeHearing.videoRoomId || 'nyaysetu-court-' + activeHearing.id}#config.prejoinConfig.enabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera","closedcaptions","desktop","embedmeeting","fullscreen","fodeviceselection","hangup","profile","chat","recording","livestreaming","etherpad","sharedvideo","settings","raisehand","videoquality","filmstrip","invite","feedback","stats","shortcuts","tileview","videobackgroundblur","download","help","mute-everyone","security"]`}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                border: 'none'
                            }}
                            allow="camera; microphone; fullscreen; display-capture; autoplay"
                            title="NyaySetu Court Hearing"
                        />
                    </div>

                    {/* Bottom Control Bar */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '1rem',
                        background: 'rgba(17, 24, 39, 0.95)',
                        borderTop: '1px solid rgba(99, 102, 241, 0.2)'
                    }}>
                        <button
                            onClick={endCall}
                            style={{
                                padding: '0.875rem 2rem',
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
                            END SESSION
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '2rem' }}>
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(239, 68, 68, 0.3)',
                        animation: 'pulse-icon 2s infinite'
                    }}>
                        <Video size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                            Live Hearings
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Manage and conduct virtual court sessions
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '2rem' }}>
                {/* Main: Hearings List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ ...glassStyle, padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <input
                                type="text"
                                placeholder="Search case name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem',
                                    padding: '0.6rem 1rem 0.6rem 2.5rem', color: 'var(--text-main)', outline: 'none', width: '300px'
                                }}
                            />
                            <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ ...glassStyle, padding: '3rem', textAlign: 'center' }}>
                            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--color-accent)' }} />
                            <p style={{ color: 'var(--text-secondary)' }}>Loading schedule...</p>
                        </div>
                    ) : filteredHearings.length === 0 ? (
                        <div style={{ ...glassStyle, padding: '4rem', textAlign: 'center' }}>
                            <Calendar size={48} color="var(--text-secondary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                            <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem' }}>No hearings found</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>No sessions match your criteria.</p>
                        </div>
                    ) : (
                        filteredHearings.map(hearing => {
                            const isToday = hearing.fullDate.toDateString() === today.toDateString();
                            const joinable = canJoin(hearing);

                            return (
                                <div key={hearing.id} style={{
                                    ...glassStyle, padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center',
                                    border: hearing.isLive ? '1px solid rgba(239, 68, 68, 0.4)' : 'var(--border-glass-strong)',
                                    background: hearing.isLive ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(255, 255, 255, 0.05) 100%)' : 'var(--bg-glass-strong)'
                                }}>
                                    <div style={{
                                        width: '70px', height: '70px', borderRadius: '15px',
                                        background: isToday ? 'rgba(74, 222, 128, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                        border: isToday ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid rgba(139, 92, 246, 0.2)',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                    }}>
                                        <span style={{ fontSize: '0.8rem', color: isToday ? '#22c55e' : 'var(--color-accent)', fontWeight: '600', textTransform: 'uppercase' }}>
                                            {hearing.dateStr}
                                        </span>
                                        <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1 }}>
                                            {hearing.fullDate.getDate()}
                                        </span>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.25rem' }}>
                                                {hearing.caseTitle}
                                            </h3>
                                            {hearing.isLive && (
                                                <span style={{
                                                    padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.65rem', fontWeight: '800',
                                                    background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', gap: '0.25rem'
                                                }}>
                                                    <div style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%', animation: 'blink 1s infinite' }} /> LIVE
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                <Clock size={14} /> {hearing.time} ({hearing.durationMinutes} mins)
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                <MapPin size={14} /> Virtual Court
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                <User size={14} /> Case ID: {hearing.caseId?.substring(0, 8)}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => joinHearing(hearing)}
                                        disabled={!joinable}
                                        style={{
                                            background: hearing.isLive
                                                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                                : joinable
                                                    ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                                                    : 'rgba(100, 116, 139, 0.2)',
                                            color: joinable ? 'white' : 'var(--text-secondary)',
                                            border: 'none', borderRadius: '0.75rem', padding: '0.75rem 1.5rem',
                                            fontWeight: '700', fontSize: '0.9rem', cursor: joinable ? 'pointer' : 'not-allowed',
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            boxShadow: joinable ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
                                        }}
                                    >
                                        <Video size={18} /> {hearing.isLive ? 'Join Now' : 'Start Session'}
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Sidebar */}
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
                                const isDateToday = date.toDateString() === today.toDateString();
                                const hasHearing = hearingDates.has(date.toDateString());
                                return (
                                    <div key={i} style={{
                                        height: '35px', borderRadius: '8px',
                                        background: isDateToday ? 'rgba(99, 102, 241, 0.2)' : (hasHearing ? 'rgba(76, 209, 55, 0.1)' : 'rgba(255, 255, 255, 0.03)'),
                                        border: isDateToday ? '1px solid rgba(99, 102, 241, 0.4)' : (hasHearing ? '1px solid rgba(76, 209, 55, 0.2)' : '1px solid transparent'),
                                        color: isDateToday ? '#818cf8' : (hasHearing ? '#4cd137' : 'var(--text-secondary)'),
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700'
                                    }}>{date.getDate()}</div>
                                );
                            })}
                        </div>
                        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Today's Sessions</span>
                                <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{hearings.filter(h => h.fullDate && h.fullDate.toDateString() === today.toDateString()).length}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ ...glassStyle, background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <div style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={14} /> Judge Actions
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
                            You have <b>3</b> cases awaiting judgment review today. Please clear pending orders before the end of the day.
                        </p>
                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }} onClick={() => navigate('/judge/docket')}>
                            View Docket <ArrowUpRight size={14} />
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 1; box-shadow: 0 0 10px #ef4444; } 50% { opacity: 0.5; box-shadow: 0 0 20px #ef4444; } }
                @keyframes pulse-icon { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
            `}</style>
        </div>
    );
}
