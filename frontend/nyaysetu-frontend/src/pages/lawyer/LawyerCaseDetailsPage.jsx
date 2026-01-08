import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, FileText, Calendar, User, Scale, Clock,
    Download, AlertCircle, CheckCircle, Loader2,
    Gavel, MessageSquare, Sparkles, ShieldCheck
} from 'lucide-react';
import { caseAPI, lawyerAPI } from '../../services/api';

const statusColors = {
    'PENDING': { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)', text: 'var(--color-warning)' },
    'IN_PROGRESS': { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6' },
    'UNDER_REVIEW': { bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.2)', text: 'var(--color-accent)' },
    'AWAITING_DOCUMENTS': { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', text: 'var(--color-error)' },
    'COMPLETED': { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)', text: 'var(--color-success)' },
    'CLOSED': { bg: 'var(--bg-glass)', border: 'var(--border-glass)', text: 'var(--text-secondary)' }
};

const urgencyColors = {
    'NORMAL': { bg: 'rgba(16, 185, 129, 0.1)', text: 'var(--color-success)' },
    'URGENT': { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--color-warning)' },
    'CRITICAL': { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--color-error)' }
};

export default function LawyerCaseDetailsPage() {
    const { caseId } = useParams();
    const navigate = useNavigate();
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCaseDetails();
    }, [caseId]);

    const fetchCaseDetails = async () => {
        setLoading(true);
        try {
            const response = await caseAPI.getById(caseId);
            setCaseData(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching case:', err);
            setError('Failed to load case details');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader2 size={48} className="spin" style={{ color: 'var(--color-accent)' }} />
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
            </div>
        );
    }

    if (error || !caseData) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <AlertCircle size={64} style={{ color: 'var(--color-error)', marginBottom: '1rem' }} />
                <h2 style={{ color: 'var(--text-main)' }}>{error || 'Case not found'}</h2>
                <button onClick={() => navigate('/lawyer/cases')} style={{
                    marginTop: '1rem', padding: '0.75rem 1.5rem',
                    background: 'var(--color-accent)',
                    border: 'none', borderRadius: '0.5rem', color: 'var(--text-main)', cursor: 'pointer'
                }}>Back to My Cases</button>
            </div>
        );
    }

    const statusStyle = statusColors[caseData.status] || statusColors['PENDING'];
    const urgencyStyle = urgencyColors[caseData.urgency] || urgencyColors['NORMAL'];

    const glassStyle = {
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'var(--glass-blur)',
        border: 'var(--border-glass-strong)',
        borderRadius: '1.5rem',
        padding: '2rem',
        boxShadow: 'var(--shadow-glass-strong)'
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/lawyer/cases')} style={{
                        background: 'var(--bg-glass)',
                        border: 'var(--border-glass)',
                        borderRadius: '0.5rem', padding: '0.5rem',
                        cursor: 'pointer', color: 'var(--color-accent-light)', display: 'flex', alignItems: 'center'
                    }}><ArrowLeft size={20} /></button>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                            Case Overview (Lawyer View)
                        </h1>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Managing case for client: <span style={{ color: 'var(--color-accent-light)', fontWeight: '600' }}>{caseData.clientName}</span>
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/lawyer/preparation', { state: { caseId: caseData.id } })}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            background: 'var(--bg-glass)',
                            border: 'var(--border-glass)',
                            borderRadius: '0.75rem', color: 'var(--color-accent-light)',
                            fontWeight: '600', cursor: 'pointer'
                        }}
                    >
                        <Sparkles size={18} /> Prepare Draft
                    </button>
                    <button
                        onClick={() => navigate('/lawyer/evidence', { state: { caseId: caseData.id } })}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            background: 'var(--color-accent)',
                            border: 'none', borderRadius: '0.75rem', color: 'var(--text-main)',
                            fontWeight: '600', cursor: 'pointer'
                        }}
                    >
                        <ShieldCheck size={18} /> Evidence Vault
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Left Column: Case Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={glassStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                                {caseData.title}
                            </h2>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <span style={{
                                    padding: '0.4rem 0.8rem', borderRadius: '9999px', fontSize: '0.75rem',
                                    background: statusStyle.bg, border: `1px solid ${statusStyle.border}`,
                                    color: statusStyle.text, fontWeight: '700'
                                }}>{caseData.status}</span>
                                <span style={{
                                    padding: '0.4rem 0.8rem', borderRadius: '9999px', fontSize: '0.75rem',
                                    background: urgencyStyle.bg, color: urgencyStyle.text, fontWeight: '700'
                                }}>⚡ {caseData.urgency}</span>
                            </div>
                        </div>

                        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '2rem' }}>
                            {caseData.description}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ background: 'var(--bg-glass-subtle)', padding: '1.25rem', borderRadius: '1rem', border: 'var(--border-glass-subtle)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-success)' }}>
                                    <User size={16} /> <span style={{ fontSize: '0.8rem', fontWeight: '800' }}>PETITIONER</span>
                                </div>
                                <p style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>{caseData.petitioner}</p>
                            </div>
                            <div style={{ background: 'var(--bg-glass-subtle)', padding: '1.25rem', borderRadius: '1rem', border: 'var(--border-glass-subtle)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-error)' }}>
                                    <Scale size={16} /> <span style={{ fontSize: '0.8rem', fontWeight: '800' }}>RESPONDENT</span>
                                </div>
                                <p style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>{caseData.respondent}</p>
                            </div>
                        </div>
                    </div>

                    {caseData.aiGeneratedSummary && (
                        <div style={{ ...glassStyle, background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <Sparkles size={20} style={{ color: 'var(--color-accent-light)' }} />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-accent-light)', margin: 0 }}>Vakil-Friend Extraction</h3>
                            </div>
                            <pre style={{
                                color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6',
                                whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0
                            }}>{caseData.aiGeneratedSummary}</pre>
                        </div>
                    )}
                </div>

                {/* Right Column: Sidebar Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={glassStyle}>
                        <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '1.25rem', fontWeight: '700' }}>Timeline & Schedule</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.6rem', borderRadius: '0.5rem', color: 'var(--color-success)' }}>
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '700' }}>FILED DATE</div>
                                    <div style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{formatDate(caseData.filedDate)}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.6rem', borderRadius: '0.5rem', color: 'var(--color-warning)' }}>
                                    <Gavel size={18} />
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '700' }}>JUDGE</div>
                                    <div style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{caseData.assignedJudge || 'Awaiting Assignment'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.6rem', borderRadius: '0.5rem', color: 'var(--color-accent-light)' }}>
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '700' }}>NEXT HEARING</div>
                                    <div style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{formatDate(caseData.nextHearing) || 'Not Scheduled'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '1.5rem', padding: '1.5rem'
                    }}>
                        <h3 style={{ color: 'var(--color-success)', fontSize: '1rem', marginBottom: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle size={18} /> Lawyer Quick Checklist
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {[
                                'Review Vakil-Friend transcript',
                                'Verify petitioner identity',
                                'Draft Initial Writ Petition',
                                'Upload POA (Power of Attorney)',
                                'Schedule client briefing'
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontSize: '0.85rem' }}>
                                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--color-success)' }} />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
