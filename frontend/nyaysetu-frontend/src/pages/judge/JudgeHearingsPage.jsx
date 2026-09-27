import { judgeAPI, hearingAPI } from '../../services/api';
import {
    Calendar, Clock, Video, ChevronRight, Loader2, ArrowLeft,
    CheckCircle, AlertCircle, CalendarDays, Filter, Search, Plus, AlertTriangle, X
} from 'lucide-react';

export default function JudgeHearingsPage() {
    const navigate = useNavigate();
    const [hearings, setHearings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, today, upcoming, past
    const [searchQuery, setSearchQuery] = useState('');

    // Schedule modal state
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [myCases, setMyCases] = useState([]);
    const [selectedCaseId, setSelectedCaseId] = useState('');
    const [lawyerIdInput, setLawyerIdInput] = useState('');
    const [hearingDateInput, setHearingDateInput] = useState('');
    const [durationInput, setDurationInput] = useState(30);
    const [conflictInfo, setConflictInfo] = useState({ hasConflict: false, reason: null });
    const [scheduling, setScheduling] = useState(false);
    const [scheduleSuccess, setScheduleSuccess] = useState(null);

    useEffect(() => {
        fetchAllHearings();
        fetchJudgeCases();
    }, []);

    const fetchJudgeCases = async () => {
        try {
            const res = await judgeAPI.getCases();
            const list = res.data?.content || res.data || [];
            setMyCases(list);
        } catch (e) {
            console.error('Failed to fetch judge cases:', e);
        }
    };

    const handleCheckConflict = async (lawyerId, dateStr) => {
        if (!lawyerId || !dateStr) return;
        try {
            const res = await hearingAPI.checkConflict(lawyerId, dateStr);
            setConflictInfo(res.data || { hasConflict: false, reason: null });
        } catch (e) {
            console.error('Failed to check conflict:', e);
        }
    };

    const handleScheduleHearingSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCaseId || !hearingDateInput) return;
        setScheduling(true);
        try {
            await hearingAPI.schedule({
                caseId: selectedCaseId,
                scheduledDate: hearingDateInput,
                durationMinutes: Number(durationInput) || 30
            });
            setScheduleSuccess('Hearing scheduled successfully!');
            setShowScheduleModal(false);
            setSelectedCaseId('');
            setHearingDateInput('');
            setConflictInfo({ hasConflict: false, reason: null });
            await fetchAllHearings();
        } catch (err) {
            console.error('Failed to schedule hearing:', err);
        } finally {
            setScheduling(false);
        }
    };

    const fetchAllHearings = async () => {
        try {
            const response = await hearingAPI.getMyHearings();
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
                    <button
                        onClick={() => setShowScheduleModal(true)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                            border: 'none',
                            borderRadius: '0.75rem',
                            color: 'white',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                        }}
                    >
                        <Plus size={18} /> Schedule New Hearing
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

            {/* Schedule Hearing Modal */}
            {showScheduleModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1.5rem'
                }}>
                    <div style={{
                        background: 'var(--bg-glass-strong)',
                        border: 'var(--border-glass-strong)',
                        borderRadius: '1.5rem',
                        padding: '2rem',
                        maxWidth: '550px',
                        width: '100%',
                        boxShadow: 'var(--shadow-glass-strong)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                                🗓️ Schedule Court Hearing
                            </h2>
                            <button
                                onClick={() => setShowScheduleModal(false)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleScheduleHearingSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                    Select Case *
                                </label>
                                <select
                                    value={selectedCaseId}
                                    onChange={(e) => {
                                        const cId = e.target.value;
                                        setSelectedCaseId(cId);
                                        const selectedObj = myCases.find(c => String(c.id) === String(cId));
                                        if (selectedObj && selectedObj.lawyer) {
                                            const lId = selectedObj.lawyer.id;
                                            setLawyerIdInput(String(lId));
                                            if (hearingDateInput) handleCheckConflict(lId, hearingDateInput);
                                        }
                                    }}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: 'var(--bg-glass)',
                                        border: 'var(--border-glass)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-main)'
                                    }}
                                >
                                    <option value="">-- Choose Assigned Case --</option>
                                    {myCases.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.title} (#{String(c.id).substring(0, 8)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                    Assigned Lawyer ID (for conflict check)
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter Lawyer User ID"
                                    value={lawyerIdInput}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setLawyerIdInput(val);
                                        if (val && hearingDateInput) handleCheckConflict(val, hearingDateInput);
                                    }}
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
                                    Hearing Date & Time *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={hearingDateInput}
                                    onChange={(e) => {
                                        const dateVal = e.target.value;
                                        setHearingDateInput(dateVal);
                                        if (lawyerIdInput && dateVal) handleCheckConflict(lawyerIdInput, dateVal);
                                    }}
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

                            {/* Real-time Conflict Warning Banner */}
                            {conflictInfo.hasConflict && (
                                <div style={{
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    border: '1px solid rgba(239, 68, 68, 0.4)',
                                    borderRadius: '0.75rem',
                                    padding: '1rem',
                                    marginBottom: '1.25rem',
                                    display: 'flex',
                                    gap: '0.75rem',
                                    alignItems: 'flex-start'
                                }}>
                                    <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <div>
                                        <h4 style={{ color: '#ef4444', margin: '0 0 0.25rem 0', fontWeight: '700', fontSize: '0.9rem' }}>
                                            ⚠️ Scheduling Conflict Warning
                                        </h4>
                                        <p style={{ color: 'var(--text-main)', margin: 0, fontSize: '0.825rem' }}>
                                            Assigned lawyer is marked <b>Unavailable</b> on this date: <i>"{conflictInfo.reason}"</i>.
                                        </p>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                                            As a Judge, you have override authority to proceed if required.
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                    Duration (Minutes)
                                </label>
                                <input
                                    type="number"
                                    value={durationInput}
                                    onChange={(e) => setDurationInput(e.target.value)}
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
                                disabled={scheduling || !selectedCaseId || !hearingDateInput}
                                style={{
                                    width: '100%',
                                    padding: '0.9rem',
                                    background: conflictInfo.hasConflict
                                        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                        : 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    color: 'white',
                                    fontWeight: '800',
                                    cursor: 'pointer'
                                }}
                            >
                                {scheduling
                                    ? 'Scheduling...'
                                    : (conflictInfo.hasConflict ? 'Override Conflict & Schedule Hearing' : 'Schedule Hearing')}
                            </button>
                    </div>
                </div>
            )}

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

function HearingCard({
    hearing,
    getStatusColor,
    formatDateTime,
    joinHearing,
    navigate,
    isPast = false
}) {
   
      
    
   
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
            
        >
            <Video size={18} /> Join Hearing
        </button>
    )}

    <button
        onClick={(e) => {
            e.stopPropagation();
            scheduleHearingReminder(hearing);
        }}
        style={{
            padding: '0.75rem 1rem',
            background: 'var(--bg-glass-strong)',
            border: 'var(--border-glass-strong)',
            borderRadius: '0.75rem',
            color: 'var(--text-main)',
            fontWeight: '600',
            cursor: 'pointer'
        }}
    >
        Set Reminder
    </button>

    <ChevronRight size={20} color="var(--text-secondary)" />
</div>
</div>
    );
}
