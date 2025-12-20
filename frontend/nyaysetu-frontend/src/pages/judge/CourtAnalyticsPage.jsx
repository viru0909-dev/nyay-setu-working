import { useState, useEffect } from 'react';
import { judgeAPI } from '../../services/api';
import {
    BarChart3,
    TrendingUp,
    Scale,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    Calendar,
    PieChart,
    Activity,
    Box,
    FileBarChart
} from 'lucide-react';

export default function CourtAnalyticsPage() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await judgeAPI.getAnalytics();
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        'PENDING': '#f59e0b',
        'OPEN': '#3b82f6',
        'IN_PROGRESS': '#6366f1',
        'UNDER_REVIEW': '#8b5cf6',
        'COMPLETED': '#10b981',
        'CLOSED': '#64748b',
        'ON_HOLD': '#ef4444'
    };

    const typeColors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    const totalCases = analytics?.totalCases || 0;
    const maxByType = Math.max(...Object.values(analytics?.byType || { default: 1 }));

    const glassStyle = {
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Loader2 size={48} className="spin" style={{ color: '#6366f1' }} />
                <style>{`
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .spin { animation: spin 1s linear infinite; }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
                    }}>
                        <BarChart3 size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'white', margin: 0 }}>
                            Judicial Intelligence
                        </h1>
                        <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0 }}>
                            Real-time courtroom analytics and case distribution metrics
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <StatCard
                    icon={<Scale size={24} />}
                    value={analytics?.totalCases || 0}
                    label="Docket Size"
                    color="#6366f1"
                    description="Total cases recorded"
                />
                <StatCard
                    icon={<Clock size={24} />}
                    value={analytics?.pendingCases || 0}
                    label="Awaiting Action"
                    color="#f59e0b"
                    description="New case filings"
                />
                <StatCard
                    icon={<TrendingUp size={24} />}
                    value={analytics?.activeCases || 0}
                    label="In Litigation"
                    color="#06b6d4"
                    description="Ongoing hearings"
                />
                <StatCard
                    icon={<CheckCircle2 size={24} />}
                    value={analytics?.closedCases || 0}
                    label="Resolved"
                    color="#10b981"
                    description="Final judgments issued"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
                {/* Cases by Status */}
                <div style={glassStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.75rem' }}>
                            <Activity size={20} color="#818cf8" />
                        </div>
                        <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
                            Lifecycle Distribution
                        </h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {Object.entries(analytics?.byStatus || {}).map(([status, count]) => (
                            <div key={status}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColors[status] || '#6366f1' }} />
                                        <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>{status.replace('_', ' ')}</span>
                                    </div>
                                    <span style={{ color: 'white', fontWeight: '700' }}>{count}</span>
                                </div>
                                <div style={{
                                    height: '10px',
                                    background: 'rgba(15, 23, 42, 0.4)',
                                    borderRadius: '5px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255, 255, 255, 0.05)'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${(count / (totalCases || 1)) * 100}%`,
                                        background: `linear-gradient(90deg, ${statusColors[status]}88, ${statusColors[status]})`,
                                        borderRadius: '5px',
                                        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cases by Type */}
                <div style={glassStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.75rem' }}>
                            <PieChart size={20} color="#818cf8" />
                        </div>
                        <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
                            Judicial Classification
                        </h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.25rem', height: '220px', paddingBottom: '2rem' }}>
                        {Object.entries(analytics?.byType || {}).map(([type, count], i) => (
                            <div key={type} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '0.4rem',
                                    marginBottom: '0.5rem'
                                }}>
                                    <span style={{ color: 'white', fontWeight: '800', fontSize: '0.8rem' }}>{count}</span>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: `${(count / (maxByType || 1)) * 160}px`,
                                    background: `linear-gradient(to top, ${typeColors[i % typeColors.length]}88, ${typeColors[i % typeColors.length]})`,
                                    borderRadius: '0.75rem 0.75rem 4px 4px',
                                    transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: `0 4px 12px ${typeColors[i % typeColors.length]}33`
                                }} />
                                <span style={{
                                    color: '#64748b',
                                    fontSize: '0.65rem',
                                    fontWeight: '700',
                                    marginTop: '0.75rem',
                                    textAlign: 'center',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.02em',
                                    height: '2.5rem',
                                    overflow: 'hidden'
                                }}>
                                    {type}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Monthly Trend */}
            <div style={{
                ...glassStyle,
                marginTop: '1.5rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                    <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.75rem' }}>
                        <TrendingUp size={20} color="#818cf8" />
                    </div>
                    <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
                        Temporal Case Progression (6 Months)
                    </h3>
                </div>
                {Object.keys(analytics?.monthlyTrend || {}).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <FileBarChart size={48} color="#334155" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p style={{ color: '#64748b', fontSize: '1rem' }}>No historical data available for trend analysis</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2.5rem', height: '180px', justifyContent: 'center', paddingBottom: '1rem' }}>
                        {Object.entries(analytics?.monthlyTrend || {}).map(([month, count], i) => {
                            const maxMonth = Math.max(...Object.values(analytics?.monthlyTrend || { default: 1 }));
                            return (
                                <div key={month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '80px' }}>
                                    <div style={{ color: 'white', fontWeight: '800', marginBottom: '0.75rem', fontSize: '0.9rem' }}>{count}</div>
                                    <div style={{
                                        width: '100%',
                                        height: `${(count / (maxMonth || 1)) * 120}px`,
                                        background: 'linear-gradient(to top, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.8) 100%)',
                                        borderRadius: '0.5rem',
                                        minHeight: '8px',
                                        border: '1px solid rgba(99, 102, 241, 0.3)',
                                        transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }} />
                                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', marginTop: '1rem', textTransform: 'uppercase' }}>{month}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon, value, label, color, description }) {
    return (
        <div style={{
            background: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '1.25rem',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
        }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: `${color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: color,
                border: `1px solid ${color}33`
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '1.75rem', fontWeight: '900', color: 'white', lineHeight: '1' }}>{value}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'white', marginTop: '0.35rem' }}>{label}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem' }}>{description}</div>
            </div>
        </div>
    );
}
