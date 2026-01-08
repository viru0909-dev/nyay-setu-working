import { useState, useEffect } from 'react';
import { judgeAPI, hearingAPI } from '../../services/api';
import {
    Clock,
    FileText,
    AlertTriangle,
    Calendar,
    ChevronRight,
    Loader2,
    Scale,
    X,
    User,
    Users
} from 'lucide-react';

export default function PendingCasesPage() {
    const [cases, setCases] = useState([]);
    const [unassignedCases, setUnassignedCases] = useState([]);
    const [activeTab, setActiveTab] = useState('my_pending'); // 'my_pending' or 'pool'
    const [loading, setLoading] = useState(true);
    const [selectedCase, setSelectedCase] = useState(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [hearingData, setHearingData] = useState({
        scheduledDate: '',
        scheduledTime: '10:00',
        durationMinutes: 60
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pendingRes, poolRes] = await Promise.all([
                judgeAPI.getPendingCases(),
                judgeAPI.getUnassignedCases()
            ]);
            setCases(pendingRes.data || []);
            setUnassignedCases(poolRes.data || []);
        } catch (error) {
            console.error('Error fetching cases:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClaimCase = async (caseId) => {
        try {
            await judgeAPI.claimCase(caseId);
            alert('✅ Case claimed successfully! It will now appear in your pending queue.');
            fetchData();
        } catch (error) {
            console.error('Error claiming case:', error);
            alert('Failed to claim case. It might have already been claimed.');
        }
    };

    const scheduleHearing = async () => {
        if (!selectedCase) return;

        try {
            const dateTime = new Date(`${hearingData.scheduledDate}T${hearingData.scheduledTime}`);
            await hearingAPI.schedule({
                caseId: selectedCase.id,
                scheduledDate: dateTime.toISOString(),
                durationMinutes: hearingData.durationMinutes
            });

            alert('✅ Hearing scheduled successfully!');
            setShowScheduleModal(false);
            fetchData();
        } catch (error) {
            console.error('Error scheduling hearing:', error);
            alert('Failed to schedule hearing');
        }
    };

    const openScheduleModal = (caseItem) => {
        setSelectedCase(caseItem);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setHearingData({
            scheduledDate: tomorrow.toISOString().split('T')[0],
            scheduledTime: '10:00',
            durationMinutes: 60
        });
        setShowScheduleModal(true);
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency?.toUpperCase()) {
            case 'CRITICAL': return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', color: '#f87171' };
            case 'URGENT': return { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', color: '#fbbf24' };
            default: return { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', color: '#4ade80' };
        }
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
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.25rem',
        borderRadius: '0.75rem',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
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

    const currentCases = activeTab === 'my_pending' ? cases : unassignedCases;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(245, 158, 11, 0.2)'
                    }}>
                        <Clock size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                            Judicial Queue
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Review pending cases and manage the judicial pool
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <button
                        onClick={() => setActiveTab('my_pending')}
                        style={{
                            ...primaryButtonStyle,
                            background: activeTab === 'my_pending' ? 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)' : 'var(--bg-glass)',
                            boxShadow: activeTab === 'my_pending' ? 'var(--shadow-glass)' : 'none',
                            color: activeTab === 'my_pending' ? 'white' : 'var(--text-secondary)',
                            border: activeTab === 'my_pending' ? 'none' : 'var(--border-glass)'
                        }}
                    >
                        <User size={18} />
                        My Assigned ({cases.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('pool')}
                        style={{
                            ...primaryButtonStyle,
                            background: activeTab === 'pool' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'var(--bg-glass)',
                            boxShadow: activeTab === 'pool' ? '0 4px 15px rgba(245, 158, 11, 0.4)' : 'none',
                            color: activeTab === 'pool' ? 'white' : 'var(--text-secondary)',
                            border: activeTab === 'pool' ? 'none' : 'var(--border-glass)'
                        }}
                    >
                        <Users size={18} />
                        Unassigned Pool ({unassignedCases.length})
                    </button>
                </div>
            </div>

            {/* Cases List */}
            {currentCases.length === 0 ? (
                <div style={{ ...glassStyle, textAlign: 'center', padding: '5rem 2rem' }}>
                    <Scale size={64} color="#475569" style={{ margin: '0 auto 1.5rem' }} />
                    <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>
                        {activeTab === 'my_pending' ? 'No assigned cases' : 'Central pool is empty'}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                        {activeTab === 'my_pending' ? 'Check the unassigned pool to find new cases to claim.' : 'Check back later for new filings.'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {currentCases.map(caseItem => {
                        const urgencyStyle = getUrgencyColor(caseItem.urgency);
                        return (
                            <div key={caseItem.id} style={{ ...glassStyle, transition: 'transform 0.2s' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div style={{ flex: 1, minWidth: '300px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                                                {caseItem.title}
                                            </h3>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                background: urgencyStyle.bg,
                                                border: `1px solid ${urgencyStyle.border}`,
                                                borderRadius: '9999px',
                                                fontSize: '0.7rem',
                                                fontWeight: '700',
                                                color: urgencyStyle.color,
                                                textTransform: 'uppercase'
                                            }}>
                                                {caseItem.urgency || 'NORMAL'}
                                            </span>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                                borderRadius: '9999px',
                                                fontSize: '0.7rem',
                                                fontWeight: '700',
                                                color: '#818cf8'
                                            }}>
                                                {caseItem.caseType}
                                            </span>
                                        </div>

                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', margin: '0.75rem 0 1.25rem 0' }}>
                                            {caseItem.description?.substring(0, 200)}
                                            {caseItem.description?.length > 200 ? '...' : ''}
                                        </p>

                                        <div style={{
                                            display: 'flex',
                                            gap: '2rem',
                                            marginTop: '1.25rem',
                                            paddingTop: '1.25rem',
                                            borderTop: '1px solid rgba(148, 163, 184, 0.1)',
                                            fontSize: '0.875rem'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                                                <User size={14} color="var(--text-secondary)" />
                                                <span><strong>Petitioner:</strong> <span style={{ color: 'var(--text-main)' }}>{caseItem.petitioner}</span></span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                                                <Users size={14} color="var(--text-secondary)" />
                                                <span><strong>Respondent:</strong> <span style={{ color: 'var(--text-main)' }}>{caseItem.respondent}</span></span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                                                <Calendar size={14} color="var(--text-secondary)" />
                                                <span><strong>Filed:</strong> <span style={{ color: 'var(--text-main)' }}>{caseItem.filedDate ? new Date(caseItem.filedDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}</span></span>
                                            </div>
                                        </div>
                                    </div>

                                    {activeTab === 'my_pending' ? (
                                        <button
                                            onClick={() => openScheduleModal(caseItem)}
                                            style={primaryButtonStyle}
                                        >
                                            <Calendar size={18} />
                                            Schedule Hearing
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleClaimCase(caseItem.id)}
                                            style={{
                                                ...primaryButtonStyle,
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                                            }}
                                        >
                                            <Scale size={18} />
                                            Claim Case
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}


            {/* Schedule Modal */}
            {showScheduleModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setShowScheduleModal(false)}>
                    <div style={{
                        ...glassStyle, width: '100%', maxWidth: '480px', padding: '2rem',
                        background: 'var(--bg-glass-strong)',
                        border: 'var(--border-glass-strong)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                                📅 Schedule Hearing
                            </h2>
                            <button onClick={() => setShowScheduleModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Case</label>
                                <input
                                    type="text"
                                    value={selectedCase?.title || ''}
                                    disabled
                                    style={{
                                        width: '100%', padding: '0.875rem', borderRadius: '0.75rem',
                                        background: 'var(--bg-glass)', border: 'var(--border-glass)',
                                        color: 'var(--text-secondary)', cursor: 'not-allowed'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Date</label>
                                    <input
                                        type="date"
                                        value={hearingData.scheduledDate}
                                        onChange={e => setHearingData({ ...hearingData, scheduledDate: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        style={{
                                            width: '100%', padding: '0.875rem', borderRadius: '0.75rem',
                                            background: 'var(--bg-glass)', border: 'var(--border-glass)',
                                            color: 'var(--text-main)',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Time</label>
                                    <input
                                        type="time"
                                        value={hearingData.scheduledTime}
                                        onChange={e => setHearingData({ ...hearingData, scheduledTime: e.target.value })}
                                        style={{
                                            width: '100%', padding: '0.875rem', borderRadius: '0.75rem',
                                            background: 'var(--bg-glass)', border: 'var(--border-glass)',
                                            color: 'var(--text-main)',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Duration</label>
                                <select
                                    value={hearingData.durationMinutes}
                                    onChange={e => setHearingData({ ...hearingData, durationMinutes: parseInt(e.target.value) })}
                                    style={{
                                        width: '100%', padding: '0.875rem', borderRadius: '0.75rem',
                                        background: 'var(--bg-glass)', border: 'var(--border-glass)',
                                        color: 'var(--text-main)',
                                        outline: 'none'
                                    }}
                                >
                                    <option value={30}>30 minutes</option>
                                    <option value={60}>1 hour</option>
                                    <option value={90}>1.5 hours</option>
                                    <option value={120}>2 hours</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    onClick={() => setShowScheduleModal(false)}
                                    style={{
                                        flex: 1, padding: '0.875rem', borderRadius: '0.75rem',
                                        background: 'var(--bg-glass)', border: 'var(--border-glass)',
                                        color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={scheduleHearing}
                                    style={{
                                        flex: 2, padding: '0.875rem', borderRadius: '0.75rem',
                                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                        border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                                    }}
                                >
                                    Schedule
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
