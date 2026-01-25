import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { judgeAPI } from '../../services/api';
import {
    Scale, Calendar, User, Users, Loader2, ChevronRight, AlertTriangle, Briefcase
} from 'lucide-react';

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
    const [activeTab, setActiveTab] = useState('active'); // 'active', 'pending_judgment', 'closed'
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCases();
    }, [activeTab]);

    const fetchCases = async () => {
        setLoading(true);
        try {
            const response = await judgeAPI.getCases();
            let filteredCases = response.data || [];

            // Filter based on active tab
            if (activeTab === 'active') {
                filteredCases = filteredCases.filter(c =>
                    c.status !== 'CLOSED' && c.status !== 'COMPLETED'
                );
            } else if (activeTab === 'pending_judgment') {
                filteredCases = filteredCases.filter(c =>
                    c.status === 'UNDER_REVIEW' || c.status === 'PENDING'
                );
            } else if (activeTab === 'closed') {
                filteredCases = filteredCases.filter(c =>
                    c.status === 'CLOSED' || c.status === 'COMPLETED'
                );
            }

            setCases(filteredCases);
        } catch (error) {
            console.error('Error fetching cases:', error);
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

    const glassStyle = {
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'var(--glass-blur)',
        border: 'var(--border-glass-strong)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-glass)'
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
                    }}>
                        <Briefcase size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                            My Docket
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Cases assigned to your bench
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { id: 'active', label: 'Active Cases', count: null },
                        { id: 'pending_judgment', label: 'Pending Judgment', count: null },
                        { id: 'closed', label: 'Closed', count: null }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: activeTab === tab.id ? 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)' : 'var(--bg-glass)',
                                boxShadow: activeTab === tab.id ? 'var(--shadow-glass)' : 'none',
                                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                                border: activeTab === tab.id ? 'none' : 'var(--border-glass)',
                                borderRadius: '0.75rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                fontSize: '0.95rem'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cases List */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                    <Loader2 size={48} className="spin" style={{ color: 'var(--color-accent)' }} />
                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
                </div>
            ) : cases.length === 0 ? (
                <div style={{ ...glassStyle, textAlign: 'center', padding: '5rem 2rem' }}>
                    <Scale size={64} color="#475569" style={{ margin: '0 auto 1.5rem' }} />
                    <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>
                        No {activeTab === 'active' ? 'active' : activeTab === 'pending_judgment' ? 'pending judgment' : 'closed'} cases
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                        {activeTab === 'active' ? 'New cases will appear here once assigned' : 'No cases in this category yet'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {cases.map(caseItem => {
                        const statusStyle = statusColors[caseItem.status] || statusColors['PENDING'];
                        const urgencyStyle = urgencyColors[caseItem.urgency] || urgencyColors['NORMAL'];

                        return (
                            <div key={caseItem.id} style={{ ...glassStyle, transition: 'transform 0.2s', cursor: 'pointer' }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div style={{ flex: 1, minWidth: '300px' }}>
                                        {/* Title and Badges */}
                                        <div style={{ marginBottom: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                                                    {caseItem.title}
                                                </h3>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    background: statusStyle.bg,
                                                    border: `1px solid ${statusStyle.border}`,
                                                    borderRadius: '9999px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '700',
                                                    color: statusStyle.text,
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {caseItem.status.replace(/_/g, ' ')}
                                                </span>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    background: urgencyStyle.bg,
                                                    color: urgencyStyle.text,
                                                    borderRadius: '9999px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '700',
                                                    border: `1px solid ${urgencyStyle.text}40`
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
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.5rem 0 0 0' }}>
                                                Case ID: {caseItem.id.substring(0, 13)}...
                                            </p>
                                        </div>

                                        {/* Description */}
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', margin: '0.75rem 0 1.25rem 0' }}>
                                            {caseItem.description?.substring(0, 150)}
                                            {caseItem.description?.length > 150 ? '...' : ''}
                                        </p>

                                        {/* Meta Info */}
                                        <div style={{
                                            display: 'flex',
                                            gap: '2rem',
                                            paddingTop: '1rem',
                                            borderTop: '1px solid rgba(148, 163, 184, 0.1)',
                                            fontSize: '0.875rem',
                                            flexWrap: 'wrap'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                                                <User size={14} />
                                                <span><strong>Petitioner:</strong> <span style={{ color: 'var(--text-main)' }}>{caseItem.petitioner}</span></span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                                                <Users size={14} />
                                                <span><strong>Respondent:</strong> <span style={{ color: 'var(--text-main)' }}>{caseItem.respondent}</span></span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                                                <Calendar size={14} />
                                                <span><strong>Next Hearing:</strong> <span style={{ color: 'var(--text-main)' }}>{formatDate(caseItem.nextHearing)}</span></span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => navigate(`/judge/case/${caseItem.id}`)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '0.75rem',
                                            fontWeight: '700',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                                            transition: 'all 0.2s'
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
            )}
        </div>
    );
}
