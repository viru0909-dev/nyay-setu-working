import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';
import {
    Calendar, Clock, Video, ChevronRight, Loader2, ArrowLeft,
    CheckCircle, AlertCircle, CalendarDays, Filter, Search
} from 'lucide-react';

export default function JudgeHearingsPage() {
    const navigate = useNavigate();
    const [hearings, setHearings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, today, upcoming, past
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchAllHearings();
    }, []);

    const fetchAllHearings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/hearings/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHearings(response.data || []);
        } catch (error) {
            console.error('Error fetching hearings:', error);
            setHearings([]);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredHearings = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let filtered = hearings;

        // Apply date filter
        if (filter === 'today') {
            filtered = hearings.filter(h => {
                const hearingDate = new Date(h.scheduledDate);
                return hearingDate >= today && hearingDate < tomorrow;
            });
        } else if (filter === 'upcoming') {
            filtered = hearings.filter(h => new Date(h.scheduledDate) >= now);
        } else if (filter === 'past') {
            filtered = hearings.filter(h => new Date(h.scheduledDate) < now);
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(h =>
                (h.caseTitle && h.caseTitle.toLowerCase().includes(query)) ||
                (h.caseNumber && h.caseNumber.toLowerCase().includes(query))
            );
        }

        return filtered;
    };

    const groupHearingsByDate = (hearingsList) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const groups = {
            past: [],
            today: [],
            upcoming: []
        };

        hearingsList.forEach(hearing => {
            const hearingDate = new Date(hearing.scheduledDate);
            if (hearingDate < today) {
                groups.past.push(hearing);
            } else if (hearingDate >= today && hearingDate < tomorrow) {
                groups.today.push(hearing);
            } else {
                groups.upcoming.push(hearing);
            }
        });

        return groups;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'SCHEDULED': return '#3b82f6';
            case 'IN_PROGRESS': return '#f59e0b';
            case 'COMPLETED': return '#10b981';
            default: return '#64748b';
        }
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const joinHearing = (hearing) => {
        // Navigate to the case workspace and auto-join
        navigate(`/judge/case/${hearing.caseId}`);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Loader2 size={48} className="spin" style={{ color: 'var(--color-primary)' }} />
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
            </div>
        );
    }

    const filteredHearings = getFilteredHearings();
    const groupedHearings = groupHearingsByDate(filteredHearings);

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{
                marginBottom: '2rem',
                background: 'var(--bg-glass-strong)',
                padding: '2rem',
                borderRadius: '1.5rem',
                border: 'var(--border-glass-strong)',
                boxShadow: 'var(--shadow-glass)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <button
                        onClick={() => navigate('/judge/overview')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: '500'
                        }}
                    >
                        <ArrowLeft size={18} /> Back to Overview
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '1.25rem',
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, #4338ca 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)'
                    }}>
                        <CalendarDays size={32} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                            All Hearings
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                            Manage all hearings across your assigned cases
                        </p>
                    </div>
                </div>

                {/* Filters and Search */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Filter Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-glass)', padding: '0.5rem', borderRadius: '0.75rem', border: 'var(--border-glass)' }}>
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'today', label: 'Today' },
                            { id: 'upcoming', label: 'Upcoming' },
                            { id: 'past', label: 'Past' }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: filter === f.id ? 'var(--color-primary)' : 'transparent',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    color: filter === f.id ? 'white' : 'var(--text-secondary)',
                                    fontWeight: filter === f.id ? '700' : '500',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search by case title or number..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 3rem',
                                background: 'var(--bg-glass)',
                                border: 'var(--border-glass)',
                                borderRadius: '0.75rem',
                                color: 'var(--text-main)',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'var(--bg-glass-strong)', padding: '1.25rem', borderRadius: '1rem', border: 'var(--border-glass-strong)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Hearings</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>{hearings.length}</div>
                </div>
                <div style={{ background: 'var(--bg-glass-strong)', padding: '1.25rem', borderRadius: '1rem', border: 'var(--border-glass-strong)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Today</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>{groupedHearings.today.length}</div>
                </div>
                <div style={{ background: 'var(--bg-glass-strong)', padding: '1.25rem', borderRadius: '1rem', border: 'var(--border-glass-strong)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Upcoming</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#3b82f6' }}>{groupedHearings.upcoming.length}</div>
                </div>
            </div>

            {/* Hearings List */}
            {filteredHearings.length === 0 ? (
                <div style={{
                    background: 'var(--bg-glass-strong)',
                    padding: '4rem 2rem',
                    borderRadius: '1.5rem',
                    border: 'var(--border-glass-strong)',
                    textAlign: 'center'
                }}>
                    <Calendar size={64} color="var(--text-secondary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                    <h3 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.25rem' }}>No Hearings Found</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        {searchQuery ? 'Try adjusting your search or filters' : 'No hearings scheduled for the selected filter'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '2rem' }}>
                    {/* Today's Hearings */}
                    {groupedHearings.today.length > 0 && (filter === 'all' || filter === 'today') && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '4px', height: '24px', background: '#10b981', borderRadius: '2px' }} />
                                Today's Hearings
                            </h2>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {groupedHearings.today.map(hearing => (
                                    <HearingCard key={hearing.id} hearing={hearing} getStatusColor={getStatusColor} formatDateTime={formatDateTime} joinHearing={joinHearing} navigate={navigate} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upcoming Hearings */}
                    {groupedHearings.upcoming.length > 0 && (filter === 'all' || filter === 'upcoming') && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '4px', height: '24px', background: '#3b82f6', borderRadius: '2px' }} />
                                Upcoming Hearings
                            </h2>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {groupedHearings.upcoming.map(hearing => (
                                    <HearingCard key={hearing.id} hearing={hearing} getStatusColor={getStatusColor} formatDateTime={formatDateTime} joinHearing={joinHearing} navigate={navigate} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Past Hearings */}
                    {groupedHearings.past.length > 0 && (filter === 'all' || filter === 'past') && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '4px', height: '24px', background: '#64748b', borderRadius: '2px' }} />
                                Past Hearings
                            </h2>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {groupedHearings.past.map(hearing => (
                                    <HearingCard key={hearing.id} hearing={hearing} getStatusColor={getStatusColor} formatDateTime={formatDateTime} joinHearing={joinHearing} navigate={navigate} isPast />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function HearingCard({ hearing, getStatusColor, formatDateTime, joinHearing, navigate, isPast }) {
    const statusColor = getStatusColor(hearing.status);
    const canJoin = hearing.status === 'SCHEDULED' && !isPast;

    return (
        <div style={{
            background: 'var(--bg-glass-strong)',
            border: 'var(--border-glass-strong)',
            borderRadius: '1.25rem',
            padding: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1.5rem',
            transition: 'all 0.2s',
            cursor: 'pointer'
        }}
            onClick={() => navigate(`/judge/case/${hearing.caseId}`)}
            onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
            }}
            onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div style={{
                        padding: '0.75rem',
                        background: `${statusColor}20`,
                        borderRadius: '0.75rem',
                        border: `2px solid ${statusColor}40`
                    }}>
                        <Calendar size={24} color={statusColor} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                            {hearing.caseTitle || 'Untitled Case'}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                Case #{hearing.caseNumber}
                            </span>
                            <span style={{
                                padding: '0.2rem 0.6rem',
                                background: `${statusColor}20`,
                                color: statusColor,
                                borderRadius: '0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: '700'
                            }}>
                                {hearing.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={16} />
                        <span>{formatDateTime(hearing.scheduledDate)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Duration: {hearing.durationMinutes} min</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {canJoin && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            joinHearing(hearing);
                        }}
                        style={{
                            padding: '0.75rem 1.25rem',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            borderRadius: '0.75rem',
                            color: 'white',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <Video size={18} /> Join Hearing
                    </button>
                )}
                <ChevronRight size={20} color="var(--text-secondary)" />
            </div>
        </div>
    );
}
