import { useState, useEffect, useCallback } from 'react';
import { judgeAPI, hearingAPI } from '../../services/api';
import {
    Video,
    Users,
    Mic,
    MicOff,
    VideoOff,
    Phone,
    Clock,
    MessageCircle,
    Loader2,
    ArrowLeft,
    Monitor,
    Shield
} from 'lucide-react';

export default function ConductHearingPage() {
    const [hearings, setHearings] = useState([]);
    const [activeHearing, setActiveHearing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inCall, setInCall] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [showAiScheduler, setShowAiScheduler] = useState(false);
    const [waitingParticipants, setWaitingParticipants] = useState([]);
    const [waitingRoomLoading, setWaitingRoomLoading] = useState(false);
    const [hearingActionError, setHearingActionError] = useState('');
    const [startingHearingId, setStartingHearingId] = useState(null);
    const [participantActionId, setParticipantActionId] = useState(null);
    const [endingHearing, setEndingHearing] = useState(false);

    const handleAiSchedule = async (e) => {
        e.preventDefault();
        if (!aiPrompt.trim()) return;

        setAiLoading(true);
        try {
            await judgeAPI.scheduleHearingAI(aiPrompt);
            setAiPrompt('');
            setShowAiScheduler(false);
            fetchTodaysHearings(); // Refresh list
        } catch (error) {
            console.error('Error scheduling hearing:', error);
            alert('Failed to schedule hearing. Please try again.');
        } finally {
            setAiLoading(false);
        }
    };

    useEffect(() => {
        fetchTodaysHearings();
    }, []);

    const fetchTodaysHearings = async () => {
        try {
            const response = await judgeAPI.getTodaysHearings();
            if (Array.isArray(response.data)) {
                setHearings(response.data);
            } else {
                console.error('Invalid hearings data:', response.data);
                setHearings([]);
            }
        } catch (error) {
            console.error('Error fetching hearings:', error);
            setHearings([]);
        } finally {
            setLoading(false);
        }
    };

    const getActionError = (error, fallback) =>
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.message ||
        fallback;

    const fetchWaitingParticipants = useCallback(
        async (hearingId, showLoading = false) => {
            if (!hearingId) {
                return;
            }

            if (showLoading) {
                setWaitingRoomLoading(true);
            }

            try {
                const response =
                    await hearingAPI.getWaitingRoom(hearingId);

                setWaitingParticipants(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );

                setHearingActionError('');
            } catch (error) {
                setHearingActionError(
                    getActionError(
                        error,
                        'Unable to load the waiting room.'
                    )
                );
            } finally {
                if (showLoading) {
                    setWaitingRoomLoading(false);
                }
            }
        },
        []
    );

    const startHearing = async (hearing) => {
        setStartingHearingId(hearing.id);
        setHearingActionError('');

        try {
            const response =
                await hearingAPI.start(hearing.id);

            const videoRoomId =
                response.data?.videoRoomId;

            if (!videoRoomId) {
                throw new Error(
                    'The server did not return the judge room.'
                );
            }

            const startedHearing = {
                ...hearing,
                status:
                    response.data?.status ||
                    'IN_PROGRESS',
                videoRoomId
            };

            setActiveHearing(startedHearing);
            setInCall(true);

            setHearings(current =>
                current.map(item =>
                    item.id === hearing.id
                        ? {
                            ...item,
                            status: 'IN_PROGRESS'
                        }
                        : item
                )
            );
        } catch (error) {
            setHearingActionError(
                getActionError(
                    error,
                    'Unable to start this hearing.'
                )
            );
        } finally {
            setStartingHearingId(null);
        }
    };

    const admitParticipant = async (participantId) => {
        if (!activeHearing) {
            return;
        }

        setParticipantActionId(participantId);
        setHearingActionError('');

        try {
            await hearingAPI.admitParticipant(
                activeHearing.id,
                participantId
            );

            await fetchWaitingParticipants(
                activeHearing.id
            );
        } catch (error) {
            setHearingActionError(
                getActionError(
                    error,
                    'Unable to admit this participant.'
                )
            );
        } finally {
            setParticipantActionId(null);
        }
    };

    const rejectParticipant = async (participantId) => {
        if (!activeHearing) {
            return;
        }

        setParticipantActionId(participantId);
        setHearingActionError('');

        try {
            await hearingAPI.rejectParticipant(
                activeHearing.id,
                participantId
            );

            await fetchWaitingParticipants(
                activeHearing.id
            );
        } catch (error) {
            setHearingActionError(
                getActionError(
                    error,
                    'Unable to reject this participant.'
                )
            );
        } finally {
            setParticipantActionId(null);
        }
    };

    const leaveHearingView = () => {
        setInCall(false);
        setActiveHearing(null);
        setWaitingParticipants([]);
        setHearingActionError('');
    };

    const endHearing = async () => {
        if (!activeHearing) {
            return;
        }

        setEndingHearing(true);
        setHearingActionError('');

        try {
            await hearingAPI.end(activeHearing.id);

            setHearings(current =>
                current.map(item =>
                    item.id === activeHearing.id
                        ? {
                            ...item,
                            status: 'COMPLETED'
                        }
                        : item
                )
            );

            leaveHearingView();
        } catch (error) {
            setHearingActionError(
                getActionError(
                    error,
                    'Unable to end this hearing.'
                )
            );
        } finally {
            setEndingHearing(false);
        }
    };

    useEffect(() => {
        if (!inCall || !activeHearing?.id) {
            return undefined;
        }

        fetchWaitingParticipants(
            activeHearing.id,
            true
        );

        const intervalId = window.setInterval(
            () =>
                fetchWaitingParticipants(
                    activeHearing.id
                ),
            3000
        );

        return () =>
            window.clearInterval(intervalId);
    }, [
        inCall,
        activeHearing?.id,
        fetchWaitingParticipants
    ]);
    const canJoin = (scheduledDate) => {
        const now = new Date();
        const hearingTime = new Date(scheduledDate);
        const diff = (hearingTime - now) / (1000 * 60); // minutes
        return diff <= 15; // Can join 15 minutes before
    };

    const glassStyle = {
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'var(--glass-blur)',
        border: 'var(--border-glass-strong)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-glass)'
    };

    const primaryButtonStyle = {
        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.25rem',
        borderRadius: '0.75rem',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)',
        transition: 'all 0.2s'
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Loader2 size={48} className="spin" style={{ color: 'var(--color-accent)' }} />
                <style>{`
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .spin { animation: spin 1s linear infinite; }
                `}</style>
            </div>
        );
    }

    // Active Video Call View
    if (inCall && activeHearing) {
        return (
            <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Video Header Area */}
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
                            onClick={leaveHearingView}
                            aria-label="Leave hearing"
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

                {/* Secure hearing room and judge waiting-room controls */}
                <div
                    style={{
                        flex: 1,
                        minHeight: 0,
                        display: 'grid',
                        gridTemplateColumns:
                            'minmax(0, 1fr) 340px',
                        gap: '1rem'
                    }}
                >
                    <div
                        style={{
                            position: 'relative',
                            minHeight: 0,
                            borderRadius: '1.5rem',
                            overflow: 'hidden',
                            border:
                                'var(--border-glass-strong)',
                            boxShadow:
                                'var(--shadow-glass)'
                        }}
                    >
                        <iframe
                            src={`https://meet.jit.si/${activeHearing.videoRoomId}#config.prejoinConfig.enabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera","closedcaptions","desktop","embedmeeting","fullscreen","fodeviceselection","hangup","profile","chat","recording","livestreaming","etherpad","sharedvideo","settings","raisehand","videoquality","filmstrip","invite","feedback","stats","shortcuts","tileview","videobackgroundblur","download","help","mute-everyone","security"]`}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none'
                            }}
                            allow="camera; microphone; fullscreen; display-capture; autoplay"
                            title="Court Hearing"
                        />
                    </div>

                    <aside
                        style={{
                            ...glassStyle,
                            padding: '1rem',
                            minHeight: 0,
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent:
                                    'space-between',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}
                        >
                            <div>
                                <h3
                                    style={{
                                        margin: 0,
                                        color:
                                            'var(--text-main)',
                                        fontSize: '1rem'
                                    }}
                                >
                                    Waiting Room
                                </h3>

                                <div
                                    style={{
                                        marginTop: '0.25rem',
                                        color:
                                            'var(--text-secondary)',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    {
                                        waitingParticipants.length
                                    } participant
                                    {
                                        waitingParticipants.length ===
                                        1
                                            ? ''
                                            : 's'
                                    } waiting
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    fetchWaitingParticipants(
                                        activeHearing.id,
                                        true
                                    )
                                }
                                disabled={waitingRoomLoading}
                                style={{
                                    border:
                                        'var(--border-glass)',
                                    background:
                                        'var(--bg-glass)',
                                    color:
                                        'var(--text-main)',
                                    borderRadius: '0.6rem',
                                    padding: '0.5rem',
                                    cursor:
                                        waitingRoomLoading
                                            ? 'wait'
                                            : 'pointer'
                                }}
                            >
                                {waitingRoomLoading
                                    ? '...'
                                    : 'Refresh'}
                            </button>
                        </div>

                        {hearingActionError && (
                            <div
                                role="alert"
                                style={{
                                    padding: '0.75rem',
                                    borderRadius:
                                        '0.75rem',
                                    background:
                                        'rgba(239, 68, 68, 0.1)',
                                    border:
                                        '1px solid rgba(239, 68, 68, 0.3)',
                                    color: '#ef4444',
                                    fontSize: '0.85rem'
                                }}
                            >
                                {hearingActionError}
                            </div>
                        )}

                        {waitingRoomLoading &&
                        waitingParticipants.length === 0 ? (
                            <div
                                style={{
                                    padding: '2rem 1rem',
                                    textAlign: 'center',
                                    color:
                                        'var(--text-secondary)'
                                }}
                            >
                                <Loader2
                                    size={24}
                                    className="spin"
                                    style={{
                                        margin:
                                            '0 auto 0.75rem'
                                    }}
                                />

                                Loading waiting room...
                            </div>
                        ) : waitingParticipants.length === 0 ? (
                            <div
                                style={{
                                    padding: '2rem 1rem',
                                    textAlign: 'center',
                                    color:
                                        'var(--text-secondary)',
                                    border:
                                        '1px dashed var(--border-glass)',
                                    borderRadius: '0.75rem'
                                }}
                            >
                                <Users
                                    size={28}
                                    style={{
                                        margin:
                                            '0 auto 0.75rem',
                                        opacity: 0.6
                                    }}
                                />

                                No participants are waiting.
                            </div>
                        ) : (
                            waitingParticipants.map(
                                participant => (
                                    <div
                                        key={
                                            participant.participantId
                                        }
                                        style={{
                                            padding: '0.85rem',
                                            borderRadius:
                                                '0.75rem',
                                            border:
                                                'var(--border-glass)',
                                            background:
                                                'var(--bg-glass)',
                                            display: 'flex',
                                            flexDirection:
                                                'column',
                                            gap: '0.75rem'
                                        }}
                                    >
                                        <div>
                                            <div
                                                style={{
                                                    color:
                                                        'var(--text-main)',
                                                    fontWeight:
                                                        '700'
                                                }}
                                            >
                                                {
                                                    participant.name ||
                                                    participant.email ||
                                                    'Participant'
                                                }
                                            </div>

                                            <div
                                                style={{
                                                    color:
                                                        'var(--text-secondary)',
                                                    fontSize:
                                                        '0.75rem',
                                                    marginTop:
                                                        '0.2rem'
                                                }}
                                            >
                                                {
                                                    participant.role
                                                }
                                                {
                                                    participant.email
                                                        ? ` • ${participant.email}`
                                                        : ''
                                                }
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns:
                                                    '1fr 1fr',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    admitParticipant(
                                                        participant.participantId
                                                    )
                                                }
                                                disabled={
                                                    participantActionId ===
                                                    participant.participantId
                                                }
                                                style={{
                                                    border: 'none',
                                                    borderRadius:
                                                        '0.6rem',
                                                    padding:
                                                        '0.55rem',
                                                    background:
                                                        '#16a34a',
                                                    color: 'white',
                                                    fontWeight:
                                                        '700',
                                                    cursor:
                                                        participantActionId ===
                                                        participant.participantId
                                                            ? 'wait'
                                                            : 'pointer'
                                                }}
                                            >
                                                Admit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    rejectParticipant(
                                                        participant.participantId
                                                    )
                                                }
                                                disabled={
                                                    participantActionId ===
                                                    participant.participantId
                                                }
                                                style={{
                                                    border: 'none',
                                                    borderRadius:
                                                        '0.6rem',
                                                    padding:
                                                        '0.55rem',
                                                    background:
                                                        '#dc2626',
                                                    color: 'white',
                                                    fontWeight:
                                                        '700',
                                                    cursor:
                                                        participantActionId ===
                                                        participant.participantId
                                                            ? 'wait'
                                                            : 'pointer'
                                                }}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                )
                            )
                        )}
                    </aside>
                </div>
                {/* Bottom Control Bar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '0.5rem'
                }}>
                    <button
                        onClick={endHearing}
                        disabled={endingHearing}
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
                        END JUDICIAL SESSION
                    </button>
                </div>

                <style>{`
                    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
                `}</style>
            </div>
        );
    }



    // Hearings List View
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(6, 182, 212, 0.2)'
                    }}>
                        <Video size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                            Conduct Hearing
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Upcoming virtual court sessions (Next 7 Days) • SECURE-SYNC Enabled
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setShowAiScheduler(!showAiScheduler)}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: showAiScheduler ? 'var(--bg-glass)' : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                        border: showAiScheduler ? '1px solid var(--border-glass)' : 'none',
                        borderRadius: '0.75rem',
                        color: showAiScheduler ? 'var(--text-main)' : 'white',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <MessageCircle size={18} />
                    {showAiScheduler ? 'Close Assistant' : 'AI Scheduler'}
                </button>
            </div>

            {/* AI Scheduler Section */}
            {showAiScheduler && (
                <div style={{ ...glassStyle, marginBottom: '2rem', animation: 'slideDown 0.3s ease-out' }}>
                    <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                        <span style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            AI Judicial Assistant
                        </span>
                    </h3>
                    <form onSubmit={handleAiSchedule} style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="text"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="e.g., Schedule a hearing for case 101 next Friday at 10 AM for 45 minutes..."
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                border: 'var(--border-glass)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--text-main)',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                            disabled={aiLoading}
                        />
                        <button
                            type="submit"
                            disabled={aiLoading || !aiPrompt.trim()}
                            style={{
                                ...primaryButtonStyle,
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                                opacity: aiLoading || !aiPrompt.trim() ? 0.7 : 1
                            }}
                        >
                            {aiLoading ? (
                                <>
                                    <Loader2 size={20} className="spin" />
                                    Scheduling...
                                </>
                            ) : (
                                <>
                                    <MessageCircle size={20} />
                                    Process Request
                                </>
                            )}
                        </button>
                    </form>
                    <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        * Intelligent parsing of case references, dates, and durations.
                    </p>
                </div>
            )}

            {/* Today's Hearings List */}
            {hearings.length === 0 ? (
                <div style={{ ...glassStyle, textAlign: 'center', padding: '5rem 2rem' }}>
                    <Monitor size={64} color="#475569" style={{ margin: '0 auto 1.5rem' }} />
                    <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>No hearings scheduled for today</h3>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>You have no virtual sessions pending at this moment.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {hearings.map(hearing => {
                        const canJoinNow = canJoin(hearing.scheduledDate);
                        const time = new Date(hearing.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        return (
                            <div key={hearing.id} style={{ ...glassStyle, transition: 'transform 0.2s' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div style={{ flex: 1, minWidth: '300px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                                                {hearing.caseTitle}
                                            </h3>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                background: hearing.status === 'SCHEDULED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                border: `1px solid ${hearing.status === 'SCHEDULED' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                                                borderRadius: '9999px',
                                                fontSize: '0.7rem',
                                                fontWeight: '800',
                                                color: hearing.status === 'SCHEDULED' ? '#4ade80' : '#fbbf24',
                                                textTransform: 'uppercase'
                                            }}>
                                                {hearing.status}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Clock size={16} color="var(--color-accent)" />
                                                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{time}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Users size={16} color="var(--color-accent)" />
                                                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{hearing.durationMinutes} minutes</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Shield size={16} color="var(--color-accent)" />
                                                <span style={{ color: 'var(--text-secondary)' }}>Verified Session</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => startHearing(hearing)}
                                        disabled={!canJoinNow || startingHearingId === hearing.id}
                                        style={{
                                            ...primaryButtonStyle,
                                            padding: '1rem 2rem',
                                            opacity: canJoinNow ? 1 : 0.5,
                                            cursor: canJoinNow ? 'pointer' : 'not-allowed',
                                            background: canJoinNow ? primaryButtonStyle.background : 'rgba(71, 85, 105, 0.4)',
                                            boxShadow: canJoinNow ? primaryButtonStyle.boxShadow : 'none'
                                        }}
                                        onMouseOver={e => canJoinNow && (e.currentTarget.style.transform = 'translateY(-2px)')}
                                        onMouseOut={e => canJoinNow && (e.currentTarget.style.transform = 'translateY(0)')}
                                    >
                                        <Video size={20} />
                                        {
                                            startingHearingId === hearing.id
                                                ? 'STARTING...'
                                                : canJoinNow
                                                    ? hearing.status === 'IN_PROGRESS'
                                                        ? 'REJOIN SESSION'
                                                        : 'START SESSION'
                                                    : 'COMING UP'
                                        }
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
