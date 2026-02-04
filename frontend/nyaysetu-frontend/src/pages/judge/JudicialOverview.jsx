import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { judgeAPI } from '../../services/api';
import {
    Gavel, Calendar, AlertTriangle, Clock, ChevronRight, Loader2, Scale, Users, CalendarDays, AlertOctagon
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
                <Loader2 size={48} className="spin" style={{ color: 'var(--color-primary)' }} />
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '2rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.5rem' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '1.25rem',
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, #4338ca 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)'
                    }}>
                        <Gavel size={32} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                            Judicial Overview
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                            Your bench dashboard and urgent matters
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {/* Total Assigned Cases */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
                    borderRadius: '1.5rem',
                    padding: '2rem',
                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.3)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer'
                }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '1rem',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <Scale size={28} color="white" />
                        </div>
                        <span style={{ fontSize: '3rem', fontWeight: '800', color: 'white', lineHeight: 1 }}>{stats.totalCases}</span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                        Total Assigned Cases
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
                        Active matters pending review
                    </p>
                </div>

                {/* Hearings Today */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.8) 0%, rgba(4, 120, 87, 0.9) 100%)',
                    borderRadius: '1.5rem',
                    padding: '2rem',
                    boxShadow: '0 20px 40px -10px rgba(5, 150, 105, 0.3)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer'
                }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(255, 255, 255, 0.15)',
                            borderRadius: '1rem',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <Calendar size={28} color="white" />
                        </div>
                        <span style={{ fontSize: '3rem', fontWeight: '800', color: 'white', lineHeight: 1 }}>{stats.hearingsToday}</span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                        Hearings Today
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
                        {new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Urgent Matters */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.8) 0%, rgba(185, 28, 28, 0.9) 100%)',
                    borderRadius: '1.5rem',
                    padding: '2rem',
                    boxShadow: '0 20px 40px -10px rgba(220, 38, 38, 0.3)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer'
                }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(255, 255, 255, 0.15)',
                            borderRadius: '1rem',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <AlertTriangle size={28} color="white" />
                        </div>
                        <span style={{ fontSize: '3rem', fontWeight: '800', color: 'white', lineHeight: 1 }}>{stats.pendingActions}</span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                        Urgent Matters
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
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
                    boxShadow: 'var(--shadow-glass)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <div style={{
                                    padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem'
                                }}>
                                    <AlertOctagon size={24} color="#ef4444" />
                                </div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                                    Urgent Attention
                                </h2>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                                High-priority cases requiring immediate review
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/judge/docket')}
                            style={{
                                padding: '0.75rem 1.25rem',
                                background: 'transparent',
                                border: '1px solid var(--color-primary)',
                                borderRadius: '0.75rem',
                                color: 'var(--color-primary)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => {
                                e.currentTarget.style.background = 'var(--color-primary)';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--color-primary)';
                            }}
                        >
                            View All <ChevronRight size={18} />
                        </button>
                    </div>

                    {urgentCases.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '4rem 2rem',
                            background: 'var(--bg-glass)',
                            borderRadius: '1rem',
                            border: 'var(--border-glass)'
                        }}>
                            <AlertTriangle size={48} color="var(--text-tertiary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <h3 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.1rem' }}>No Urgent Cases</h3>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
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
                                        padding: '1.25rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    onClick={() => navigate(`/judge/case/${caseItem.id}`)}
                                    onMouseOver={e => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                                        e.currentTarget.style.borderColor = '#ef4444';
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
                                        background: caseItem.urgency === 'CRITICAL' ? '#dc2626' : '#ef4444'
                                    }} />

                                    <div style={{ paddingLeft: '0.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span style={{
                                                    padding: '0.2rem 0.6rem',
                                                    background: caseItem.urgency === 'CRITICAL' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    color: caseItem.urgency === 'CRITICAL' ? '#dc2626' : '#ef4444',
                                                    borderRadius: '0.5rem',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '700',
                                                    letterSpacing: '0.025em'
                                                }}>
                                                    {caseItem.urgency}
                                                </span>
                                                <span style={{
                                                    padding: '0.2rem 0.6rem',
                                                    background: 'var(--bg-glass-strong)',
                                                    color: 'var(--text-secondary)',
                                                    borderRadius: '0.5rem',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {caseItem.caseType}
                                                </span>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                                                {caseItem.id.substring(0, 8)}...
                                            </span>
                                        </div>

                                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
                                            {caseItem.title}
                                        </h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                                            {caseItem.petitioner} vs {caseItem.respondent}
                                        </p>

                                        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Clock size={14} color="var(--color-primary)" />
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                                Next Hearing: <span style={{ color: 'var(--text-main)' }}>{formatDate(caseItem.nextHearing)}</span>
                                            </span>
                                        </div>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <CalendarDays size={24} color="var(--color-primary)" />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                            Today's Schedule
                        </h2>
                    </div>
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
