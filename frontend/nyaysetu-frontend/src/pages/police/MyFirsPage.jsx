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
            case 'SEALED': return '#10b981';
            case 'LINKED_TO_CASE': return '#8b5cf6';
            case 'VERIFIED': return '#3b82f6';
            default: return 'var(--text-secondary)';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'SEALED': return Shield;
            case 'LINKED_TO_CASE': return ExternalLink;
            case 'VERIFIED': return CheckCircle2;
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--color-accent)',
                                            fontWeight: '600',
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

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
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
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>File</p>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>{fir.fileName}</p>
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
