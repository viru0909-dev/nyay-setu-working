import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Video, Calendar, Clock, Users, Loader2, ExternalLink, X, Shield, Phone } from 'lucide-react';
import { API_BASE_URL } from '../../config/apiConfig';
import { judgeAPI } from '../../services/api';

export default function LiveHearing() {
    const navigate = useNavigate();
    const [hearings, setHearings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeHearing, setActiveHearing] = useState(null);

    useEffect(() => {
        fetchUpcomingHearings();
        // Refresh every 30 seconds
        const interval = setInterval(fetchUpcomingHearings, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchUpcomingHearings = async () => {
        try {
            // Use the correct endpoint
            const response = await judgeAPI.getTodaysHearings();
            setHearings(response.data || []);
        } catch (error) {
            console.error('Error fetching hearings:', error);
            setHearings([]);
        } finally {
            setLoading(false);
        }
    };

    const joinHearing = (hearing) => {
        setActiveHearing(hearing);
    };

    const endCall = () => {
        setActiveHearing(null);
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    const isUpcoming = (scheduledDate) => {
        const now = new Date();
        const hearing = new Date(scheduledDate);
        const diffHours = (hearing - now) / (1000 * 60 * 60);
        return diffHours > 0 && diffHours <= 24; // Within next 24 hours
    };

    const isLive = (scheduledDate, duration) => {
        const now = new Date();
        const start = new Date(scheduledDate);
        const end = new Date(start.getTime() + duration * 60000);
        return now >= start && now <= end;
    };

    const canJoin = (scheduledDate) => {
        const now = new Date();
        const hearing = new Date(scheduledDate);
        const diffMinutes = (hearing - now) / (1000 * 60);
        // Can join 15 minutes before to any time after
        return diffMinutes <= 15;
    };

    // Active Video Call - Full Screen
    if (activeHearing) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: '#0a0a0f',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Video Header */}
                <div style={{
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)',
                    borderBottom: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: '800', fontSize: '0.9rem' }}>
                            <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: '#ef4444',
                                boxShadow: '0 0 10px #ef4444',
                                animation: 'pulse 1.5s infinite'
                            }} />
                            LIVE SESSION
                        </div>
                        <div style={{ height: '24px', width: '1px', background: 'rgba(255, 255, 255, 0.2)' }} />
                        <div>
                            <span style={{ color: 'white', fontWeight: '700', fontSize: '1.25rem' }}>
                                {activeHearing.caseTitle}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                <Shield size={12} color="#4ade80" />
                                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>End-to-End Encrypted Judicial Session</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ color: '#94a3b8', fontWeight: '600' }}>
                            {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                        <button
                            onClick={endCall}
                            style={{
                                padding: '0.875rem 2rem',
                                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                                border: 'none',
                                borderRadius: '0.75rem',
                                color: 'white',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
                                transition: 'transform 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <Phone size={18} /> End Session
                        </button>
                    </div>
                </div>

                {/* Jitsi Iframe - Full Height */}
                <div style={{ flex: 1, background: '#000' }}>
                    <iframe
                        src={`https://meet.jit.si/${activeHearing.videoRoomId || 'nyaysetu-court-' + activeHearing.id}#config.prejoinConfig.enabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_BRAND_WATERMARK=false`}
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none'
                        }}
                        allow="camera; microphone; fullscreen; display-capture; autoplay"
                        title="NyaySetu Court Hearing"
                    />
                </div>

                <style>{`
                    @keyframes pulse { 
                        0%, 100% { opacity: 1; box-shadow: 0 0 10px #ef4444; } 
                        50% { opacity: 0.5; box-shadow: 0 0 20px #ef4444; } 
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '2rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
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
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                            🔴 Live Hearings
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Today's scheduled virtual court sessions • {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Hearings List */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                    <Loader2 size={48} className="spin" style={{ color: 'var(--color-accent)' }} />
                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
                </div>
            ) : hearings.length === 0 ? (
                <div style={{
                    background: 'var(--bg-glass-strong)',
                    borderRadius: '1.5rem',
                    border: 'var(--border-glass-strong)',
                    padding: '5rem 2rem',
                    textAlign: 'center'
                }}>
                    <Calendar size={80} color="#64748b" style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
                    <h3 style={{ color: 'var(--text-main)', fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>
                        No Hearings Scheduled Today
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.1rem' }}>
                        All court sessions for today have been completed or no hearings are scheduled
                    </p>
                    <button
                        onClick={() => navigate('/judge/docket')}
                        style={{
                            marginTop: '1.5rem',
                            padding: '0.75rem 1.5rem',
                            background: 'var(--color-accent)',
                            border: 'none',
                            borderRadius: '0.75rem',
                            color: 'white',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        View My Docket
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {hearings.map(hearing => {
                        const live = isLive(hearing.scheduledDate, hearing.durationMinutes);
                        const upcoming = isUpcoming(hearing.scheduledDate);
                        const joinable = canJoin(hearing.scheduledDate);

                        return (
                            <div key={hearing.id} style={{
                                background: live ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)' : 'var(--bg-glass-strong)',
                                border: live ? '2px solid #ef4444' : 'var(--border-glass-strong)',
                                borderRadius: '1.5rem',
                                padding: '2rem',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {live && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        padding: '0.5rem 1rem',
                                        background: '#ef4444',
                                        color: 'white',
                                        borderRadius: '9999px',
                                        fontSize: '0.85rem',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        animation: 'pulse-badge 2s infinite'
                                    }}>
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: 'white',
                                            animation: 'blink 1s infinite'
                                        }} />
                                        LIVE NOW
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '2rem', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: '300px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                            <Clock size={20} color={live ? '#ef4444' : '#6366f1'} />
                                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                                                {formatDate(hearing.scheduledDate)} • {formatTime(hearing.scheduledDate)}
                                            </h3>
                                            {upcoming && !live && (
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    background: 'rgba(245, 158, 11, 0.1)',
                                                    color: '#f59e0b',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '700'
                                                }}>
                                                    UPCOMING
                                                </span>
                                            )}
                                        </div>

                                        <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 0.75rem 0' }}>
                                            {hearing.caseTitle}
                                        </h4>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Users size={16} />
                                                <span>Case: {hearing.caseId?.substring(0, 13)}...</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Clock size={16} />
                                                <span>Duration: {hearing.durationMinutes} minutes</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignSelf: 'center' }}>
                                        <button
                                            onClick={() => joinHearing(hearing)}
                                            disabled={!joinable}
                                            style={{
                                                padding: '1rem 2rem',
                                                background: live
                                                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                                    : joinable
                                                        ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                                                        : 'rgba(100, 116, 139, 0.3)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '0.75rem',
                                                fontWeight: '700',
                                                cursor: joinable ? 'pointer' : 'not-allowed',
                                                boxShadow: joinable
                                                    ? (live ? '0 4px 20px rgba(239, 68, 68, 0.4)' : '0 4px 20px rgba(99, 102, 241, 0.4)')
                                                    : 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                fontSize: '1rem',
                                                whiteSpace: 'nowrap',
                                                transition: 'transform 0.2s',
                                                opacity: joinable ? 1 : 0.6
                                            }}
                                            onMouseOver={e => joinable && (e.currentTarget.style.transform = 'scale(1.05)')}
                                            onMouseOut={e => joinable && (e.currentTarget.style.transform = 'scale(1)')}
                                        >
                                            <Video size={20} />
                                            {live ? 'Join Now' : joinable ? 'Join Hearing' : 'Starts Soon'}
                                            {joinable && <ExternalLink size={16} />}
                                        </button>

                                        {hearing.status === 'COMPLETED' && (
                                            <div style={{
                                                padding: '0.75rem 1.5rem',
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                color: '#10b981',
                                                borderRadius: '0.75rem',
                                                fontWeight: '600',
                                                textAlign: 'center'
                                            }}>
                                                ✓ Completed
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
                @keyframes pulse-icon {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                @keyframes pulse-badge {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
            `}</style>
        </div>
    );
}
