import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Shield, CheckCircle2, Clock,
    Search, Eye, ExternalLink, Upload
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { policeAPI } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import ApiStateWrapper from '../../components/common/ApiStateWrapper';

export default function MyFirsPage() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');

    const { data: firs, loading, error, refetch } = useApi(
        () => policeAPI.listFirs(),
        []
    );

    // Filter client-side so we don't re-fetch on every keystroke.
    const filteredFirs = useMemo(() => {
        const all = firs || [];
        if (!searchTerm) return all;
        const lower = searchTerm.toLowerCase();
        return all.filter(
            fir =>
                fir.title?.toLowerCase().includes(lower) ||
                fir.firNumber?.toLowerCase().includes(lower)
        );
    }, [firs, searchTerm]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'DRAFT': return '#6b7280';
            case 'FILED': case 'PENDING_POLICE_REVIEW': return '#f59e0b';
            case 'ACCEPTED': case 'REGISTERED': case 'SEALED': return '#10b981';
            case 'LINKED_TO_CASE': case 'COURT_REVIEW_PENDING': return '#8b5cf6';
            case 'CLOSED': return '#64748b';
            default: return 'var(--text-secondary)';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'SEALED': case 'REGISTERED': case 'ACCEPTED': return Shield;
            case 'LINKED_TO_CASE': return ExternalLink;
            case 'VERIFIED': return CheckCircle2;
            case 'CLOSED': return CheckCircle2;
            default: return Clock;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const truncateHash = (hash) => {
        if (!hash) return 'N/A';
        return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
    };

    // Dynamic empty-state content depending on whether a search is active.
    const emptyTitle = searchTerm
        ? 'No FIRs found matching your search'
        : 'No FIRs uploaded yet';
    const emptyDescription = searchTerm
        ? 'Try a different search term'
        : 'Upload your first FIR to get started';
    const emptyAction = !searchTerm ? (
        <button
            onClick={() => navigate('/police/upload')}
            style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                borderRadius: '0.75rem',
                color: 'white',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}
        >
            <Upload size={16} />
            Upload First FIR
        </button>
    ) : null;

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    📋 {t('My FIR Records')}
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    {t('View all FIR documents you have uploaded with their digital fingerprints')}
                </p>
            </div>

            {/* Search Bar */}
            <div style={{
                background: 'var(--bg-glass-strong)',
                border: 'var(--border-glass)',
                borderRadius: '1rem',
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
            }}>
                <Search size={20} color="var(--text-secondary)" />
                <input
                    type="text"
                    placeholder="Search by FIR number or title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-main)',
                        fontSize: '1rem',
                        outline: 'none'
                    }}
                />
            </div>

            {/* FIR List */}
            <ApiStateWrapper
                loading={loading}
                error={error}
                data={filteredFirs}
                onRetry={refetch}
                emptyTitle={emptyTitle}
                emptyDescription={emptyDescription}
                emptyIcon={FileText}
                emptyAction={emptyAction}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredFirs.map((fir) => {
                        const StatusIcon = getStatusIcon(fir.status);
                        return (
                            <div
                                key={fir.id}
                                style={{
                                    background: 'var(--bg-glass-strong)',
                                    border: 'var(--border-glass)',
                                    borderRadius: '1rem',
                                    padding: '1.5rem',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}
                                onClick={() => navigate(`/police/investigation/${fir.id}`)}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--color-accent)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border-glass)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                    <div>
                                        <span style={{
                                            fontSize: '0.8rem',
                                            color: '#3b82f6',
                                            fontWeight: '700',
                                            fontFamily: 'monospace',
                                            marginBottom: '0.25rem',
                                            display: 'block'
                                        }}>
                                            {fir.firNumber}
                                        </span>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)' }}>
                                            {fir.title}
                                        </h3>
                                    </div>
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '9999px',
                                        background: `${getStatusColor(fir.status)}20`,
                                        color: getStatusColor(fir.status),
                                        fontSize: '0.75rem',
                                        fontWeight: '600'
                                    }}>
                                        <StatusIcon size={14} />
                                        {fir.status?.replace(/_/g, ' ')}
                                    </span>
                                </div>

                                {/* FIR Status Pipeline Tracker */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '1rem',
                                    padding: '0.5rem 0.75rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.75rem',
                                    color: 'var(--text-secondary)'
                                }}>
                                    <span style={{ fontWeight: '600' }}>Status Pipeline:</span>
                                    {['DRAFT', 'FILED', 'ACCEPTED', 'LINKED_TO_CASE', 'CLOSED'].map((step, idx) => {
                                        const isCurrent = fir.status === step || (step === 'ACCEPTED' && fir.status === 'REGISTERED') || (step === 'FILED' && fir.status === 'PENDING_POLICE_REVIEW');
                                        return (
                                            <span key={step} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <span style={{
                                                    padding: '0.15rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontWeight: isCurrent ? '700' : '500',
                                                    background: isCurrent ? 'var(--color-primary)' : 'transparent',
                                                    color: isCurrent ? '#fff' : 'var(--text-secondary)',
                                                }}>
                                                    {step.replace(/_/g, ' ')}
                                                </span>
                                                {idx < 4 && <span>→</span>}
                                            </span>
                                        );
                                    })}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Offence Sections</p>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600' }}>{fir.offenceSections || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Court Case Linkage</p>
                                        <p style={{ fontSize: '0.85rem', color: fir.caseId ? '#8b5cf6' : 'var(--text-secondary)', fontWeight: '600' }}>
                                            {fir.caseId ? `Linked: #${String(fir.caseId).substring(0, 8)}` : 'Not Linked'}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Digital Fingerprint</p>
                                        <code style={{
                                            fontSize: '0.75rem',
                                            color: '#10b981',
                                            fontFamily: 'monospace'
                                        }}>
                                            {truncateHash(fir.fileHash)}
                                        </code>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Uploaded</p>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>{formatDate(fir.uploadedAt)}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ApiStateWrapper>
        </div>
    );
}
