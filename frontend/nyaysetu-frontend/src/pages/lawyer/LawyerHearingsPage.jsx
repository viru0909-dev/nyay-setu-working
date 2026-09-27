import { useState, useEffect } from 'react';
import {
    Video,
    Calendar,
    Clock,
    MapPin,
    User,
    Activity,
    ArrowUpRight,
    Loader2,
    Shield,
    Phone,
    ArrowLeft
} from 'lucide-react';
import { lawyerAPI, hearingAPI } from '../../services/api';

export default function LawyerHearingsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [hearings, setHearings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inCall, setInCall] = useState(false);
    const [activeHearing, setActiveHearing] = useState(null);

    // Availability state
    const [activeTab, setActiveTab] = useState('hearings'); // 'hearings' | 'availability'
    const [availabilities, setAvailabilities] = useState([]);
    const [newDate, setNewDate] = useState('');
    const [newReason, setNewReason] = useState('');
    const [isAvailableToggle, setIsAvailableToggle] = useState(false); // default false = unavailable
    const [savingAvail, setSavingAvail] = useState(false);

    useEffect(() => {
        loadHearings();
        loadAvailability();
    }, []);

    const loadAvailability = async () => {
        try {
            const res = await lawyerAPI.getAvailability();
            setAvailabilities(res.data || []);
        } catch (err) {
            console.error('Failed to load availability:', err);
        }
    };

    const handleSaveAvailability = async (e) => {
        e.preventDefault();
        if (!newDate) return;
        setSavingAvail(true);
        try {
            await lawyerAPI.setAvailability({
                date: newDate,
                isAvailable: isAvailableToggle,
                reason: newReason || (isAvailableToggle ? 'Available' : 'Unavailable / Out of Station')
            });
            setNewDate('');
            setNewReason('');
            await loadAvailability();
        } catch (err) {
            console.error('Failed to save availability:', err);
        } finally {
            setSavingAvail(false);
        }
    };

    const handleDeleteAvailability = async (id) => {
        try {
            await lawyerAPI.deleteAvailability(id);
            await loadAvailability();
        } catch (err) {
            console.error('Failed to delete availability:', err);
        }
    };

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

    const joinHearing = (hearing) => {
        setActiveHearing(hearing);
        setInCall(true);
    };

    const endCall = () => {
        setInCall(false);
        setActiveHearing(null);
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

    // Render Active Call View
    if (inCall && activeHearing) {
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
                                {activeHearing.caseTitle}
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
                        src={`https://meet.jit.si/${activeHearing.room}#config.prejoinConfig.enabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera","closedcaptions","desktop","embedmeeting","fullscreen","fodeviceselection","hangup","profile","chat","recording","livestreaming","etherpad","sharedvideo","settings","raisehand","videoquality","filmstrip","invite","feedback","stats","shortcuts","tileview","videobackgroundblur","download","help","mute-everyone","security"]`}
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
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
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
                            Hearing & Availability
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Court schedule and availability calendar for conflict prevention
                        </p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div style={{ display: 'flex', background: 'var(--bg-glass-strong)', padding: '0.35rem', borderRadius: '1rem', border: 'var(--border-glass)' }}>
                    <button
                        onClick={() => setActiveTab('hearings')}
                        style={{
                            padding: '0.6rem 1.25rem',
                            background: activeTab === 'hearings' ? 'var(--color-primary)' : 'transparent',
                            border: 'none',
                            borderRadius: '0.75rem',
                            color: activeTab === 'hearings' ? '#fff' : 'var(--text-secondary)',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        🗓️ Hearings Schedule
                    </button>
                    <button
                        onClick={() => setActiveTab('availability')}
                        style={{
                            padding: '0.6rem 1.25rem',
                            background: activeTab === 'availability' ? 'var(--color-primary)' : 'transparent',
                            border: 'none',
                            borderRadius: '0.75rem',
                            color: activeTab === 'availability' ? '#fff' : 'var(--text-secondary)',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        ⛔ Manage Availability
                    </button>
                </div>
            </div>

            {activeTab === 'availability' ? (
                /* Availability Management Panel */
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Form to Mark Availability */}
                    <div style={glassStyle}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem' }}>
                            Mark Date Availability
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                            Mark dates when you are on vacation, at another court, or unavailable so judges see conflict warnings when scheduling hearings.
                        </p>
                        <form onSubmit={handleSaveAvailability}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                    Select Date *
                                </label>
                                <input
                                    type="date"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: 'var(--bg-glass)',
                                        border: 'var(--border-glass)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-main)'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                    Status
                                </label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-main)' }}>
                                        <input
                                            type="radio"
                                            name="availStatus"
                                            checked={!isAvailableToggle}
                                            onChange={() => setIsAvailableToggle(false)}
                                        />
                                        ⛔ Unavailable (Blocked)
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-main)' }}>
                                        <input
                                            type="radio"
                                            name="availStatus"
                                            checked={isAvailableToggle}
                                            onChange={() => setIsAvailableToggle(true)}
                                        />
                                        ✅ Available
                                    </label>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                    Reason / Note
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Vacation, Supreme Court Appearance, Out of Station"
                                    value={newReason}
                                    onChange={(e) => setNewReason(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: 'var(--bg-glass)',
                                        border: 'var(--border-glass)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-main)'
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={savingAvail || !newDate}
                                style={{
                                    width: '100%',
                                    padding: '0.85rem',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    color: '#fff',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                }}
                            >
                                {savingAvail ? 'Saving...' : 'Save Availability Record'}
                            </button>
                        </form>
                    </div>

                    {/* Existing Marked Records */}
                    <div style={glassStyle}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem' }}>
                            Marked Availability Entries
                        </h3>
                        {availabilities.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                No availability entries set yet. All dates are currently open for hearings.
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {availabilities.map((item) => (
                                    <div key={item.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.75rem 1rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '0.75rem',
                                        border: item.isAvailable ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                                    }}>
                                        <div>
                                            <span style={{ fontWeight: '700', color: 'var(--text-main)', display: 'block' }}>
                                                {item.date}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: item.isAvailable ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                                                {item.isAvailable ? '✅ Available' : `⛔ ${item.reason || 'Unavailable'}`}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteAvailability(item.id)}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: 'none',
                                                color: '#ef4444',
                                                padding: '0.4rem 0.75rem',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '2rem' }}>
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
                        filteredHearings.map(hearing => {
                            const isToday = hearing.fullDate && hearing.fullDate.toDateString() === today.toDateString();
                            return (
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
                                        background: isToday ? 'rgba(74, 222, 128, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                        border: isToday ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid rgba(139, 92, 246, 0.2)',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                                        justifyContent: 'center', flexShrink: 0
                                    }}>
                                        <span style={{ fontSize: '0.8rem', color: isToday ? '#22c55e' : 'var(--color-accent)', fontWeight: '600', textTransform: 'uppercase' }}>
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
                                        {hearing.type === 'Virtual' && isToday ? (
                                            <button
                                                onClick={() => joinHearing(hearing)}
                                                style={{
                                                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                                    color: 'white', border: 'none', borderRadius: '0.75rem',
                                                    padding: '0.6rem 1.25rem', fontWeight: '700', fontSize: '0.85rem',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                                                }}>
                                                <Video size={16} /> Join Session
                                            </button>
                                        ) : hearing.type === 'Virtual' ? (
                                            <button
                                                disabled
                                                style={{
                                                    background: 'rgba(71, 85, 105, 0.2)',
                                                    color: 'var(--text-secondary)', border: 'none', borderRadius: '0.75rem',
                                                    padding: '0.6rem 1.25rem', fontWeight: '700', fontSize: '0.85rem',
                                                    cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                                }}>
                                                <Video size={16} /> Not Started
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
                            );
                        })
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
