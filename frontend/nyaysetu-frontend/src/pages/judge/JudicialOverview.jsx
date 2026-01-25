import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { judgeAPI } from '../../services/api';
import {
    Gavel, Calendar, AlertTriangle, Clock, ChevronRight, Loader2, Scale, Users
} from 'lucide-react';

export default function JudicialOverview() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalCases: 0, hearingsToday: 0, pendingActions: 0 });
    const [urgentCases, setUrgentCases] = useState([]);
    const [todayHearings, setTodayHearings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const casesResponse = await judgeAPI.getCases();
            const cases = casesResponse.data || [];

            // Calculate stats
            const totalCases = cases.filter(c => c.status !== 'CLOSED').length;
            const urgentCasesFiltered = cases.filter(c => c.urgency === 'URGENT' || c.urgency === 'CRITICAL');

            setStats({
                totalCases,
                hearingsToday: 0, // TODO: Connect to hearings API
                pendingActions: urgentCasesFiltered.length
            });

            setUrgentCases(urgentCasesFiltered.slice(0, 5));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'TBA';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Loader2 size={48} className="spin" style={{ color: 'var(--color-accent)' }} />
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
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
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
                    }}>
                        <Gavel size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                            Judicial Overview
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Your bench dashboard and urgent matters
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(79, 70, 229, 0.05))',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: '1.5rem',
                    padding: '2rem',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.75rem' }}>
                            <Scale size={24} color="#6366f1" />
                        </div>
                        <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#6366f1' }}>{stats.totalCases}</span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>
                        Total Assigned Cases
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Active matters pending review
                    </p>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(5, 150, 105, 0.05))',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '1.5rem',
                    padding: '2rem',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.75rem' }}>
                            <Calendar size={24} color="#10b981" />
                        </div>
                        <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#10b981' }}>{stats.hearingsToday}</span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>
                        Hearings Today
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Scheduled for {new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(220, 38, 38, 0.05))',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '1.5rem',
                    padding: '2rem',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.75rem' }}>
                            <AlertTriangle size={24} color="#ef4444" />
                        </div>
                        <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ef4444' }}>{stats.pendingActions}</span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>
                        Urgent Matters
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Require immediate attention
                    </p>
                </div>
            </div>

            {/* Urgent Attention Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                {/* Left: Urgent Cases */}
                <div style={{
                    background: 'var(--bg-glass-strong)',
                    borderRadius: '1.5rem',
                    border: 'var(--border-glass-strong)',
                    padding: '2rem',
                    backdropFilter: 'var(--glass-blur)',
                    boxShadow: 'var(--shadow-glass)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', margin: 0, marginBottom: '0.25rem' }}>
                                🚨 Urgent Attention Required
                            </h2>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                                High-priority cases requiring immediate review
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/judge/docket')}
                            style={{
                                padding: '0.75rem 1.25rem',
                                background: 'var(--bg-glass)',
                                border: 'var(--border-glass)',
                                borderRadius: '0.75rem',
                                color: 'var(--text-main)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            View All Cases <ChevronRight size={18} />
                        </button>
                    </div>

                    {urgentCases.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <AlertTriangle size={64} color="#64748b" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <h3 style={{ color: 'var(--text-main)', margin: 0 }}>No Urgent Cases</h3>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                All matters are within normal priority
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {urgentCases.map(caseItem => (
                                <div
                                    key={caseItem.id}
                                    style={{
                                        background: 'var(--bg-glass)',
                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                        borderRadius: '1rem',
                                        padding: '1.5rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => navigate(`/judge/case/${caseItem.id}`)}
                                    onMouseOver={e => e.currentTarget.style.transform = 'translateX(4px)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'translateX(0)'}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    background: caseItem.urgency === 'CRITICAL' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    color: caseItem.urgency === 'CRITICAL' ? '#dc2626' : '#ef4444',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '700',
                                                    border: `1px solid ${caseItem.urgency === 'CRITICAL' ? '#dc2626' : '#ef4444'}40`
                                                }}>
                                                    ⚡ {caseItem.urgency}
                                                </span>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    background: 'rgba(99, 102, 241, 0.1)',
                                                    color: '#6366f1',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '700'
                                                }}>
                                                    {caseItem.caseType}
                                                </span>
                                            </div>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', margin: '0.5rem 0' }}>
                                                {caseItem.title}
                                            </h3>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
                                                {caseItem.petitioner} vs {caseItem.respondent}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                                                <Clock size={14} color="var(--text-secondary)" />
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                    Next Hearing: {formatDate(caseItem.nextHearing)}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} color="var(--text-secondary)" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Today's Schedule */}
                <div style={{
                    background: 'var(--bg-glass-strong)',
                    borderRadius: '1.5rem',
                    border: 'var(--border-glass-strong)',
                    padding: '2rem',
                    backdropFilter: 'var(--glass-blur)',
                    boxShadow: 'var(--shadow-glass)'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: 0, marginBottom: '0.25rem' }}>
                        📅 Today's Schedule
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>

                    {/* Timeline */}
                    <div style={{ position: 'relative' }}>
                        {stats.hearingsToday === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                <Calendar size={48} color="#64748b" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                                    No hearings scheduled today
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {/* Example hearing slots - replace with actual data */}
                                {[
                                    { time: '10:00 AM', title: 'Case Hearing #1', type: 'CRIMINAL' },
                                    { time: '11:30 AM', title: 'Case Hearing #2', type: 'CIVIL' },
                                    { time: '02:00 PM', title: 'Case Hearing #3', type: 'FAMILY' }
                                ].map((slot, i) => (
                                    <div key={i} style={{
                                        background: 'var(--bg-glass)',
                                        border: 'var(--border-glass)',
                                        borderRadius: '0.75rem',
                                        padding: '1rem',
                                        borderLeft: '4px solid #6366f1'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                            <Clock size={16} color="#6366f1" />
                                            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>
                                                {slot.time}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)', margin: '0.25rem 0' }}>
                                            {slot.title}
                                        </p>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '0.2rem 0.5rem',
                                            background: 'rgba(99, 102, 241, 0.1)',
                                            color: '#6366f1',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.7rem',
                                            fontWeight: '700',
                                            marginTop: '0.5rem'
                                        }}>
                                            {slot.type}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
