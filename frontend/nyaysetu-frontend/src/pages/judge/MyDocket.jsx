import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { judgeAPI } from '../../services/api';
import {
    Scale, Calendar, User, Users, ChevronRight, Briefcase
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import ApiStateWrapper from '../../components/common/ApiStateWrapper';

const statusColors = {
    'PENDING': { bg: '#f5930020', border: '#f59e0b', text: '#f59e0b' },
    'IN_PROGRESS': { bg: '#3b82f620', border: '#3b82f6', text: '#3b82f6' },
    'UNDER_REVIEW': { bg: '#8b5cf620', border: '#8b5cf6', text: '#8b5cf6' },
    'AWAITING_DOCUMENTS': { bg: '#ef444420', border: '#ef4444', text: '#ef4444' },
    'COMPLETED': { bg: '#10b98120', border: '#10b981', text: '#10b981' },
    'CLOSED': { bg: '#64748b20', border: '#64748b', text: '#64748b' }
};

const urgencyColors = {
    'NORMAL': { bg: '#10b98120', text: '#10b981' },
    'URGENT': { bg: '#f5930020', text: '#f59e0b' },
    'CRITICAL': { bg: '#ef444420', text: '#ef4444' }
};

export default function MyDocket() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('active');

    // Fetch all cases once; filter client-side per tab to avoid redundant API calls.
    const { data: allCases, loading, error, refetch } = useApi(
        () => judgeAPI.getCases(),
        []
    );

    const cases = useMemo(() => {
        const all = allCases || [];
        if (activeTab === 'active') {
            return all.filter(c => c.status !== 'CLOSED' && c.status !== 'COMPLETED');
        }
        if (activeTab === 'pending_judgment') {
            return all.filter(c => c.status === 'UNDER_REVIEW' || c.status === 'PENDING');
        }
        if (activeTab === 'closed') {
            return all.filter(c => c.status === 'CLOSED' || c.status === 'COMPLETED');
        }
        return all;
    }, [allCases, activeTab]);

    const formatDate = (dateString) => {
        if (!dateString) return 'TBA';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const glassStyle = {
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'var(--glass-blur)',
        border: 'var(--border-glass-strong)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-glass)'
    };

    const tabLabel = activeTab === 'active'
        ? 'active'
        : activeTab === 'pending_judgment'
            ? 'pending judgment'
            : 'closed';

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '1.25rem',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)'
                    }}>
                        <Briefcase size={32} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                            My Docket
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                            Cases assigned to your bench
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { id: 'active', label: 'Active Cases' },
                        { id: 'pending_judgment', label: 'Pending Judgment' },
                        { id: 'closed', label: 'Closed' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: activeTab === tab.id ? 'var(--color-primary)' : 'var(--bg-glass)',
                                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none',
                                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                                border: activeTab === tab.id ? 'none' : 'var(--border-glass)',
                                borderRadius: '0.75rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cases List */}
            <ApiStateWrapper
                loading={loading}
                error={error}
                data={cases}
                onRetry={refetch}
                emptyTitle={`No ${tabLabel} cases`}
                emptyDescription={
                    activeTab === 'active'
                        ? 'New cases will appear here once assigned to your bench'
                        : 'No cases in this category yet'
                }
                emptyIcon={Scale}
            >
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {cases.map(caseItem => {
                        const statusStyle = statusColors[caseItem.status] || statusColors['PENDING'];
                        const urgencyStyle = urgencyColors[caseItem.urgency] || urgencyColors['NORMAL'];

                        return (
                            <div key={caseItem.id} style={{
                                ...glassStyle,
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                borderLeft: `5px solid ${statusStyle.border}`,
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                                onMouseOver={e => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 12px 30px -10px rgba(0, 0, 0, 0.15)';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-glass)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div style={{ flex: 1, minWidth: '300px' }}>
                                        {/* Title and Badges */}
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                                <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.01em' }}>
                                                    {caseItem.title}
                                                </h3>
                                                <span style={{
                                                    padding: '0.3rem 0.8rem',
                                                    background: statusStyle.bg,
                                                    border: `1px solid ${statusStyle.border}40`,
                                                    borderRadius: '0.5rem',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '700',
                                                    color: statusStyle.text,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em'
                                                }}>
                                                    {caseItem.status.replace(/_/g, ' ')}
                                                </span>
                                                <span style={{
                                                    padding: '0.3rem 0.8rem',
                                                    background: urgencyStyle.bg,
                                                    color: urgencyStyle.text,
                                                    borderRadius: '0.5rem',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '700',
                                                    border: `1px solid ${urgencyStyle.text}40`
                                                }}>
                                                    {caseItem.urgency || 'NORMAL'}
                                                </span>
                                                <span style={{
                                                    padding: '0.3rem 0.8rem',
                                                    background: 'rgba(99, 102, 241, 0.1)',
                                                    border: '1px solid rgba(99, 102, 241, 0.2)',
                                                    borderRadius: '0.5rem',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '700',
                                                    color: '#818cf8'
                                                }}>
                                                    {caseItem.caseType}
                                                </span>
                                            </div>
                                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', margin: '0', fontFamily: 'monospace' }}>
                                                CASE ID: {caseItem.id}
                                            </p>
                                        </div>

                                        {/* Description */}
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 1.5rem 0' }}>
                                            {caseItem.description?.substring(0, 150)}
                                            {caseItem.description?.length > 150 ? '...' : ''}
                                        </p>

                                        {/* Meta Info */}
                                        <div style={{
                                            display: 'flex',
                                            gap: '2rem',
                                            paddingTop: '1.25rem',
                                            borderTop: '1px solid var(--border-glass)',
                                            fontSize: '0.9rem',
                                            flexWrap: 'wrap'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                                                <div style={{ padding: '0.4rem', background: 'var(--bg-glass)', borderRadius: '0.4rem' }}>
                                                    <User size={16} />
                                                </div>
                                                <div>
                                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Petitioner</span>
                                                    <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{caseItem.petitioner}</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                                                <div style={{ padding: '0.4rem', background: 'var(--bg-glass)', borderRadius: '0.4rem' }}>
                                                    <Users size={16} />
                                                </div>
                                                <div>
                                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Respondent</span>
                                                    <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{caseItem.respondent}</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                                                <div style={{ padding: '0.4rem', background: 'var(--bg-glass)', borderRadius: '0.4rem' }}>
                                                    <Calendar size={16} />
                                                </div>
                                                <div>
                                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Next Hearing</span>
                                                    <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{formatDate(caseItem.nextHearing)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => navigate(`/judge/case/${caseItem.id}`)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'var(--color-primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '0.75rem',
                                            fontWeight: '700',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)',
                                            transition: 'all 0.2s',
                                            alignSelf: 'flex-start',
                                            marginTop: '0.5rem'
                                        }}
                                        onMouseOver={e => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(79, 70, 229, 0.5)';
                                        }}
                                        onMouseOut={e => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(79, 70, 229, 0.3)';
                                        }}
                                    >
                                        Open Workspace
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ApiStateWrapper>
        </div>
    );
}
