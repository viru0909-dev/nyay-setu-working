import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { judgeAPI } from '../../services/api';
import { Scale, AlertCircle, ChevronRight, Loader2, Clock, User, Users } from 'lucide-react';

export default function UnassignedPool() {
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUnassignedCases();
    }, []);

    const fetchUnassignedCases = async () => {
        try {
            // Use the dedicated unassigned endpoint instead of filtering client-side
            const response = await judgeAPI.getUnassignedCases();
            console.log('Unassigned cases from API:', response.data);
            setCases(response.data || []);
        } catch (error) {
            console.error('Error fetching unassigned cases:', error);
        } finally {
            setLoading(false);
        }
    };

    const takeCognizance = async (caseId) => {
        try {
            const response = await judgeAPI.claimCase(caseId);
            if (response.status === 200) {
                alert('✅ Cognizance Taken! Case moved to Review.');
                fetchUnassignedCases();
            }
        } catch (error) {
            console.error('Error assigning case:', error);
            alert('Failed to assign case: ' + (error.response?.data?.error || error.message));
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.5rem' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '1.25rem',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.4)'
                    }}>
                        <Scale size={32} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                            Unassigned Pool
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                            New cases awaiting judicial assignment
                        </p>
                    </div>
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
                    <Scale size={64} color="#475569" style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
                    <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>
                        No Unassigned Cases
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                        All cases have been assigned to judges
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {cases.map(caseItem => (
                        <div key={caseItem.id} style={{
                            ...glassStyle,
                            transition: 'all 0.3s ease',
                            cursor: 'default',
                            borderLeft: '5px solid #f59e0b',
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1.5rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '300px' }}>
                                    {/* Title and Badges */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                            <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.01em' }}>
                                                {caseItem.title}
                                            </h3>
                                            <span style={{
                                                padding: '0.3rem 0.8rem',
                                                background: 'rgba(245, 158, 11, 0.1)',
                                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.7rem',
                                                fontWeight: '700',
                                                color: '#f59e0b',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}>
                                                UNASSIGNED
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
                                                <Clock size={16} />
                                            </div>
                                            <div>
                                                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Filed</span>
                                                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{formatDate(caseItem.filedDate)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    <button
                                        onClick={() => takeCognizance(caseItem.id)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '0.75rem',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                                            transition: 'all 0.2s',
                                            whiteSpace: 'nowrap',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                        onMouseOver={e => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.5)';
                                        }}
                                        onMouseOut={e => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
                                        }}
                                    >
                                        <Scale size={18} />
                                        Take Cognizance
                                    </button>
                                    <button
                                        onClick={() => navigate(`/judge/case/${caseItem.id}`)}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'var(--bg-glass)',
                                            color: 'var(--color-primary)',
                                            border: '1px solid var(--border-glass)',
                                            borderRadius: '0.75rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            whiteSpace: 'nowrap',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={e => {
                                            e.currentTarget.style.background = 'var(--color-primary)';
                                            e.currentTarget.style.color = 'white';
                                        }}
                                        onMouseOut={e => {
                                            e.currentTarget.style.background = 'var(--bg-glass)';
                                            e.currentTarget.style.color = 'var(--color-primary)';
                                        }}
                                    >
                                        View Details <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
