import { useState, useEffect } from 'react';
import { FolderOpen, Video, FileText, TrendingUp, Clock, Bot, MessageCircle, MessageSquare, Loader2, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { caseAPI, hearingAPI, documentAPI } from '../../services/api';

export default function LitigantDashboard() {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [recentCases, setRecentCases] = useState([]);
    const [upcomingHearings, setUpcomingHearings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([
        { label: 'My Cases', value: '0', icon: FolderOpen, color: 'var(--color-primary)', change: 'Loading...' },
        { label: 'Upcoming Hearings', value: '0', icon: Video, color: '#8b5cf6', change: 'Loading...' },
        { label: 'Documents', value: '0', icon: FileText, color: '#10b981', change: 'Loading...' },
        { label: 'Legal Chat', value: 'Active', icon: MessageSquare, color: '#f59e0b', change: 'Chat with Lawyer', link: '/litigant/chat' }
    ]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                const casesResponse = await caseAPI.list();
                const cases = casesResponse.data || [];

                const sortedCases = cases.sort((a, b) =>
                    new Date(b.filedDate || b.createdAt) - new Date(a.filedDate || a.createdAt)
                ).slice(0, 3);

                setRecentCases(sortedCases.map(c => ({
                    id: c.id?.substring(0, 8) || 'CS-' + Math.random().toString(36).substr(2, 6),
                    fullId: c.id,
                    title: c.title || 'Untitled Case',
                    status: c.status || 'PENDING',
                    date: c.filedDate ? new Date(c.filedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'
                })));

                const hearingsResponse = await hearingAPI.getMyHearings();
                const hearings = hearingsResponse.data || [];

                const now = new Date();
                const upcoming = hearings.filter(h => new Date(h.scheduledAt) > now)
                    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
                    .slice(0, 2);

                setUpcomingHearings(upcoming.map(h => ({
                    caseId: h.caseId?.substring(0, 8) || 'N/A',
                    fullCaseId: h.caseId,
                    title: h.title || 'Hearing',
                    date: new Date(h.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                    time: new Date(h.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                    type: h.type || 'Virtual'
                })));

                let docCount = 0;
                try {
                    const docsResponse = await documentAPI.list();
                    docCount = (docsResponse.data || []).length;
                } catch (e) {
                    console.log('Documents API not available');
                }

                const nextHearing = upcoming.length > 0
                    ? new Date(upcoming[0].scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : 'None scheduled';

                setStats([
                    {
                        label: 'My Cases',
                        value: String(cases.length),
                        icon: FolderOpen,
                        color: 'var(--color-primary)',
                        change: cases.length > 0 ? `${cases.filter(c => c.status === 'OPEN' || c.status === 'PENDING').length} active` : 'No cases yet',
                        link: '/litigant/case-diary'
                    },
                    {
                        label: 'Upcoming Hearings',
                        value: String(upcoming.length),
                        icon: Video,
                        color: '#8b5cf6',
                        change: `Next: ${nextHearing}`,
                        link: '/litigant/hearings'
                    },
                    {
                        label: 'Documents',
                        value: String(docCount),
                        icon: FileText,
                        color: '#10b981',
                        change: docCount > 0 ? 'All accessible' : 'No documents',
                        link: '/litigant/case-diary'
                    },
                    {
                        label: 'Legal Chat',
                        value: 'Active',
                        icon: MessageSquare,
                        color: '#f59e0b',
                        change: 'Chat with Lawyer',
                        link: '/litigant/chat'
                    }
                ]);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div>
            {/* File Case / FIR CTA Banner */}
            <div
                onClick={() => navigate('/litigant/file')}
                style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                    border: 'var(--border-glass)',
                    borderRadius: '1.5rem',
                    padding: '1.5rem 2rem',
                    marginBottom: '2rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-glass)'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-glass-strong)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-glass)';
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
                    }}>
                        <Scale size={32} color="white" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                            📋 {t('File Case / FIR')}
                        </h2>
                        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                            {t('File a civil case or criminal FIR with AI assistance from Vakil Friend')}
                        </p>
                    </div>
                </div>
                <div style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <Bot size={20} />
                    {t('Get Started')}
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            onClick={() => stat.link && navigate(stat.link)}
                            style={{
                                background: 'var(--bg-glass-strong)',
                                border: 'var(--border-glass-strong)',
                                borderRadius: '1.5rem',
                                padding: '1.5rem',
                                transition: 'all 0.3s',
                                cursor: 'pointer'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.borderColor = 'var(--color-accent)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = '';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                        {t(stat.label)}
                                    </p>
                                    <h3 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)' }}>
                                        {stat.value}
                                    </h3>
                                </div>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '14px',
                                    background: 'var(--bg-glass)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon size={28} color={stat.color} />
                                </div>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: stat.color, fontWeight: '600' }}>
                                {stat.change}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Recent Cases & Hearings Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Recent Cases */}
                <div style={{
                    background: 'var(--bg-glass-strong)',
                    border: 'var(--border-glass-strong)',
                    borderRadius: '1.5rem',
                    padding: '1.5rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>
                            {t('Recent Cases')}
                        </h3>
                        <button
                            onClick={() => navigate('/litigant/case-diary')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'var(--bg-glass)',
                                border: 'var(--border-glass)',
                                borderRadius: '0.5rem',
                                color: 'var(--color-accent)',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            View All
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                <Loader2 size={24} style={{ color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
                            </div>
                        ) : recentCases.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                <FolderOpen size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                <p>No cases filed yet</p>
                                <button
                                    onClick={() => navigate('/litigant/file')}
                                    style={{
                                        marginTop: '0.75rem',
                                        padding: '0.5rem 1rem',
                                        background: 'var(--color-accent)',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    File Your First Case
                                </button>
                            </div>
                        ) : (
                            recentCases.map((caseItem, index) => (
                                <div
                                    key={index}
                                    onClick={() => navigate(`/litigant/case-diary/${caseItem.fullId}`)}
                                    style={{
                                        padding: '1rem',
                                        background: 'var(--bg-glass)',
                                        borderRadius: '0.75rem',
                                        border: 'var(--border-glass)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--color-accent)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.borderColor = '';
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: '600' }}>
                                            {caseItem.id}
                                        </span>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '9999px',
                                            background: caseItem.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' :
                                                caseItem.status === 'OPEN' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                            color: caseItem.status === 'PENDING' ? '#f59e0b' :
                                                caseItem.status === 'OPEN' ? '#3b82f6' : '#10b981',
                                            fontWeight: '600'
                                        }}>
                                            {caseItem.status}
                                        </span>
                                    </div>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                        {caseItem.title}
                                    </h4>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        Filed: {caseItem.date}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Upcoming Hearings */}
                <div style={{
                    background: 'var(--bg-glass-strong)',
                    border: 'var(--border-glass-strong)',
                    borderRadius: '1.5rem',
                    padding: '1.5rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>
                            {t('Upcoming Hearings')}
                        </h3>
                        <button
                            onClick={() => navigate('/litigant/hearings')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'var(--bg-glass)',
                                border: 'var(--border-glass)',
                                borderRadius: '0.5rem',
                                color: 'var(--color-accent)',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            View All
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                <Loader2 size={24} style={{ color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
                            </div>
                        ) : upcomingHearings.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                <Video size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                <p>No upcoming hearings</p>
                                <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Hearings will appear here once scheduled</p>
                            </div>
                        ) : (
                            upcomingHearings.map((hearing, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: '1rem',
                                        background: 'var(--bg-glass)',
                                        borderRadius: '0.75rem',
                                        border: 'var(--border-glass)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '10px',
                                            background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Video size={20} color="white" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                                                {hearing.title}
                                            </h4>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--color-accent)' }}>
                                                {hearing.caseId}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                                <Clock size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                                {hearing.date} at {hearing.time}
                                            </p>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                background: 'rgba(139, 92, 246, 0.1)',
                                                color: 'var(--color-accent)',
                                                fontWeight: '600'
                                            }}>
                                                {hearing.type}
                                            </span>
                                        </div>
                                        <button style={{
                                            padding: '0.5rem 1rem',
                                            background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            color: 'white',
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}>
                                            {t('Join')}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
