import { useState, useEffect } from 'react';
import { FolderOpen, Video, FileText, TrendingUp, Clock, CheckCircle2, Bot, MessageCircle, MessageSquare, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { caseAPI, hearingAPI, documentAPI } from '../../services/api';

export default function ClientDashboard() {
    const navigate = useNavigate();
    const { t } = useLanguage();

    // State for real data
    const [recentCases, setRecentCases] = useState([]);
    const [upcomingHearings, setUpcomingHearings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([
        { label: 'My Cases', value: '0', icon: FolderOpen, color: 'var(--color-primary)', change: 'Loading...' },
        { label: 'Upcoming Hearings', value: '0', icon: Video, color: '#8b5cf6', change: 'Loading...' },
        { label: 'Documents', value: '0', icon: FileText, color: '#10b981', change: 'Loading...' },
        { label: 'Legal Chat', value: 'Active', icon: MessageSquare, color: '#f59e0b', change: 'Chat with Lawyer', link: '/client/chat' }
    ]);

    // Fetch real data on mount
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch cases
                const casesResponse = await caseAPI.list();
                const cases = casesResponse.data || [];

                // Sort by date and take recent 3
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

                // Fetch hearings
                const hearingsResponse = await hearingAPI.getMyHearings();
                const hearings = hearingsResponse.data || [];

                // Filter upcoming hearings (future dates)
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
                    type: h.type || 'Virtual',
                    meetingLink: h.meetingLink
                })));

                // Fetch documents count
                let docCount = 0;
                try {
                    const docsResponse = await documentAPI.list();
                    docCount = (docsResponse.data || []).length;
                } catch (e) {
                    console.log('Documents API not available');
                }

                // Calculate next hearing date
                const nextHearing = upcoming.length > 0
                    ? new Date(upcoming[0].scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : 'None scheduled';

                // Update stats with real data
                setStats([
                    {
                        label: 'My Cases',
                        value: String(cases.length),
                        icon: FolderOpen,
                        color: 'var(--color-primary)',
                        change: cases.length > 0 ? `${cases.filter(c => c.status === 'OPEN' || c.status === 'PENDING').length} active` : 'No cases yet'
                    },
                    {
                        label: 'Upcoming Hearings',
                        value: String(upcoming.length),
                        icon: Video,
                        color: '#8b5cf6',
                        change: `Next: ${nextHearing}`
                    },
                    {
                        label: 'Documents',
                        value: String(docCount),
                        icon: FileText,
                        color: '#10b981',
                        change: docCount > 0 ? 'All accessible' : 'No documents'
                    },
                    {
                        label: 'Legal Chat',
                        value: 'Active',
                        icon: MessageSquare,
                        color: '#f59e0b',
                        change: 'Chat with Lawyer',
                        link: '/client/chat'
                    }
                ]);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                // Keep empty arrays on error
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);


    return (
        <div>
            {/* Vakil-Friend CTA Banner */}
            <div
                onClick={() => navigate('/client/vakil-friend')}
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
                    e.currentTarget.style.borderColor = 'var(--color-accent)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-glass)';
                    e.currentTarget.style.borderColor = 'var(--border-glass)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)';
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
                        <Bot size={32} color="white" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                            🤖 {t('File Case with Vakil-Friend AI')}
                        </h2>
                        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                            {t('Simply describe your legal issue and our AI will guide you through filing')}
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
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                }}>
                    <MessageCircle size={20} />
                    {t('Start Chat')}
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
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
                                backdropFilter: 'var(--glass-blur)',
                                border: 'var(--border-glass-strong)',
                                borderRadius: '1.5rem',
                                padding: '1.5rem',
                                transition: 'all 0.3s',
                                boxShadow: 'var(--shadow-glass)',
                                cursor: 'pointer'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-glass-strong)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-glass)';
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
                                    border: 'var(--border-glass)',
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

            {/* Quick Actions */}
            <div style={{
                background: 'var(--bg-glass-strong)',
                backdropFilter: 'var(--glass-blur)',
                border: 'var(--border-glass-strong)',
                borderRadius: '1.5rem',
                padding: '1.5rem',
                marginBottom: '2rem',
                boxShadow: 'var(--shadow-glass)'
            }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1rem' }}>
                    {t('Quick Actions')}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {[
                        { label: 'Traditional Filing', icon: FileText, path: '/client/file-case' },
                        { label: 'Upload Documents', icon: FileText, path: '/client/documents' },
                        { label: 'AI Document Review', icon: TrendingUp, path: '/client/ai-review' },
                        { label: 'My Cases', icon: FolderOpen, path: '/client/cases' }
                    ].map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={index}
                                onClick={() => navigate(action.path)}
                                style={{
                                    padding: '1rem',
                                    background: 'var(--bg-glass)',
                                    border: 'var(--border-glass)',
                                    borderRadius: '0.75rem',
                                    color: 'var(--text-secondary)',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'var(--bg-glass-hover)';
                                    e.currentTarget.style.borderColor = 'var(--color-accent)';
                                    e.currentTarget.style.color = 'var(--color-accent)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'var(--bg-glass)';
                                    e.currentTarget.style.borderColor = 'var(--border-glass)';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }}
                            >
                                <Icon size={20} />
                                {t(action.label)}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Recent Cases & Hearings Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Recent Cases */}
                <div style={{
                    background: 'var(--bg-glass-strong)',
                    backdropFilter: 'var(--glass-blur)',
                    border: 'var(--border-glass-strong)',
                    borderRadius: '1.5rem',
                    padding: '1.5rem',
                    boxShadow: 'var(--shadow-glass)'
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
                        {t('Recent Cases')}
                    </h3>
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
                                    onClick={() => navigate('/client/file-case')}
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
                                    onClick={() => navigate(`/client/case/${caseItem.fullId}`)}
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
                                        e.currentTarget.style.background = 'var(--bg-glass-hover)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--border-glass)';
                                        e.currentTarget.style.background = 'var(--bg-glass)';
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
                                            border: `1px solid ${caseItem.status === 'PENDING' ? 'rgba(245, 158, 11, 0.2)' :
                                                caseItem.status === 'OPEN' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
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
                    backdropFilter: 'var(--glass-blur)',
                    border: 'var(--border-glass-strong)',
                    borderRadius: '1.5rem',
                    padding: '1.5rem',
                    boxShadow: 'var(--shadow-glass)'
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
                        {t('Upcoming Hearings')}
                    </h3>
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
                                                fontWeight: '600',
                                                border: '1px solid rgba(139, 92, 246, 0.2)'
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
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
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

            {/* CSS for loading animation */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
