import { useState, useEffect } from 'react';
import {
    Video, Calendar, Clock, Play, PhoneOff, Users,
    ExternalLink, CheckCircle2, AlertCircle, Loader
} from 'lucide-react';
import axios from 'axios';

export default function HearingsPage() {
    const [hearings, setHearings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCall, setActiveCall] = useState(null);
    const [joining, setJoining] = useState(null);

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
            setHearings(response.data || []);
        } catch (error) {
            console.error('Failed to fetch hearings:', error);
            setHearings([]);
        } finally {
            setLoading(false);
        }
    };

    const joinHearing = async (hearing) => {
        setJoining(hearing.id);

        // Check if we can join (within 10 minutes of scheduled time)
        const scheduledTime = new Date(hearing.scheduledDate);
        const now = new Date();
        const diffMinutes = (scheduledTime - now) / (1000 * 60);

        if (diffMinutes > 10) {
            alert(`This hearing is scheduled for ${formatDateTime(hearing.scheduledDate)}.\nYou can join 10 minutes before the scheduled time.`);
            setJoining(null);
            return;
        }

        // Create Jitsi meeting
        setActiveCall({
            hearingId: hearing.id,
            roomId: hearing.videoRoomId || `nyaysetu-${hearing.id.substring(0, 8)}`,
            caseTitle: hearing.caseTitle,
            caseNumber: hearing.caseNumber
        });
        setJoining(null);
    };

    const endCall = () => {
        setActiveCall(null);
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-IN', { dateStyle: 'medium' });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleTimeString('en-IN', { timeStyle: 'short' });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'SCHEDULED': return { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', text: '#3b82f6' };
            case 'IN_PROGRESS': return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', text: '#10b981' };
            case 'COMPLETED': return { bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.3)', text: '#94a3b8' };
            case 'CANCELLED': return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' };
            default: return { bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.3)', text: '#94a3b8' };
        }
    };

    const canJoin = (hearing) => {
        if (hearing.status === 'COMPLETED' || hearing.status === 'CANCELLED') return false;
        const scheduledTime = new Date(hearing.scheduledDate);
        const now = new Date();
        const diffMinutes = (scheduledTime - now) / (1000 * 60);
        return diffMinutes <= 10; // Can join 10 minutes before
    };

    const isUpcoming = (hearing) => {
        const scheduledTime = new Date(hearing.scheduledDate);
        return scheduledTime > new Date();
    };

    // Separate upcoming and past hearings
    const upcomingHearings = hearings.filter(h => isUpcoming(h) && h.status !== 'COMPLETED');
    const pastHearings = hearings.filter(h => !isUpcoming(h) || h.status === 'COMPLETED');

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Active Video Call Modal */}
            {activeCall && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.95)',
                    zIndex: 99999,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Call Header */}
                    <div style={{
                        padding: '1rem 2rem',
                        background: 'rgba(30, 41, 59, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Video size={24} color="#10b981" />
                            <div>
                                <h2 style={{ color: 'white', margin: 0, fontSize: '1.125rem', fontWeight: '700' }}>
                                    {activeCall.caseTitle || 'Court Hearing'}
                                </h2>
                                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.875rem' }}>
                                    Case: {activeCall.caseNumber || 'N/A'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={endCall}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#ef4444',
                                border: 'none',
                                borderRadius: '0.5rem',
                                color: 'white',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <PhoneOff size={18} />
                            End Call
                        </button>
                    </div>

                    {/* Jitsi Meet Embed */}
                    <div style={{ flex: 1 }}>
                        <iframe
                            src={`https://meet.jit.si/${activeCall.roomId}#config.prejoinPageEnabled=false&config.disableDeepLinking=true`}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none'
                            }}
                            allow="camera; microphone; fullscreen; display-capture; autoplay"
                            allowFullScreen
                            title="Court Hearing Video Call"
                        />
                    </div>
                </div>
            )}

            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-glass)'
                    }}>
                        <Video size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                            Hearings
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Virtual court hearings • Jitsi Meet video conferencing
                        </p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                    <Loader size={40} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                    Loading hearings...
                </div>
            ) : hearings.length === 0 ? (
                <div style={{
                    background: 'var(--bg-glass-strong)',
                    border: 'var(--border-glass-strong)',
                    borderRadius: '1rem',
                    padding: '4rem',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow-glass)'
                }}>
                    <Calendar size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--text-main)', margin: '0 0 0.5rem' }}>No Hearings Scheduled</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        When your case is scheduled for a hearing, it will appear here.
                    </p>
                </div>
            ) : (
                <>
                    {/* Upcoming Hearings */}
                    {upcomingHearings.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1rem' }}>
                                Upcoming Hearings ({upcomingHearings.length})
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {upcomingHearings.map(hearing => {
                                    const statusColors = getStatusColor(hearing.status);
                                    const joinable = canJoin(hearing);

                                    return (
                                        <div key={hearing.id} style={{
                                            background: 'var(--bg-glass-strong)',
                                            border: 'var(--border-glass-strong)',
                                            borderRadius: '1rem',
                                            padding: '1.5rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            boxShadow: 'var(--shadow-glass)'
                                        }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                    <h3 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.125rem', fontWeight: '700' }}>
                                                        {hearing.caseTitle || 'Case Hearing'}
                                                    </h3>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        background: statusColors.bg,
                                                        border: `1px solid ${statusColors.border}`,
                                                        borderRadius: '9999px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        color: statusColors.text
                                                    }}>
                                                        {hearing.status}
                                                    </span>
                                                </div>

                                                <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0', fontSize: '0.875rem' }}>
                                                    Case: {hearing.caseNumber || 'N/A'}
                                                </p>

                                                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                        <Calendar size={14} />
                                                        {formatDate(hearing.scheduledDate)}
                                                    </span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                        <Clock size={14} />
                                                        {formatTime(hearing.scheduledDate)}
                                                    </span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                        <Users size={14} />
                                                        {hearing.durationMinutes || 60} min
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => joinHearing(hearing)}
                                                disabled={!joinable || joining === hearing.id}
                                                style={{
                                                    padding: '0.75rem 1.5rem',
                                                    background: joinable
                                                        ? 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)'
                                                        : 'var(--bg-glass)',
                                                    border: 'none',
                                                    borderRadius: '0.5rem',
                                                    color: joinable ? 'white' : 'var(--text-secondary)',
                                                    fontWeight: '700',
                                                    cursor: joinable ? 'pointer' : 'not-allowed',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    boxShadow: joinable ? 'var(--shadow-glass-strong)' : 'none'
                                                }}
                                            >
                                                {joining === hearing.id ? (
                                                    <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                                ) : (
                                                    <Play size={18} />
                                                )}
                                                {joinable ? 'Join Now' : 'Not Yet'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Past Hearings */}
                    {pastHearings.length > 0 && (
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1rem' }}>
                                Past Hearings ({pastHearings.length})
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {pastHearings.map(hearing => {
                                    const statusColors = getStatusColor(hearing.status);

                                    return (
                                        <div key={hearing.id} style={{
                                            background: 'var(--bg-glass)',
                                            border: 'var(--border-glass)',
                                            borderRadius: '1rem',
                                            padding: '1.25rem'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                <h3 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                                                    {hearing.caseTitle || 'Case Hearing'}
                                                </h3>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    background: statusColors.bg,
                                                    border: `1px solid ${statusColors.border}`,
                                                    borderRadius: '9999px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '600',
                                                    color: statusColors.text
                                                }}>
                                                    {hearing.status}
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                <span>Case: {hearing.caseNumber || 'N/A'}</span>
                                                <span>{formatDateTime(hearing.scheduledDate)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
