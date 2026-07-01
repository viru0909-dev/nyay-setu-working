import React, { useState } from 'react';
import { ShieldCheck, Eye, Trash2, CheckCircle, AlertTriangle, Loader2, FileText, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

const ENTITY_COLORS = {
    PERSON: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.4)', badge: '#ef4444', label: 'Name' },
    ORGANIZATION: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.4)', badge: '#f59e0b', label: 'Org' },
    ADDRESS: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.4)', badge: '#3b82f6', label: 'Address' },
    PHONE: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.4)', badge: '#10b981', label: 'Phone' },
    EMAIL: { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.4)', badge: '#8b5cf6', label: 'Email' },
};

const EntityBadge = ({ type }) => {
    const style = ENTITY_COLORS[type] || { badge: '#6b7280', label: type };
    return (
        <span style={{
            background: style.badge + '22',
            color: style.badge,
            border: `1px solid ${style.badge}44`,
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: '700',
            padding: '1px 7px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
        }}>
            {style.label}
        </span>
    );
};

export default function RedactionReviewPage() {
    const [documentText, setDocumentText] = useState('');
    const [minorProtection, setMinorProtection] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [approvedSpans, setApprovedSpans] = useState(new Set());
    const [rejectedSpans, setRejectedSpans] = useState(new Set());
    const [published, setPublished] = useState(false);

    const handleAnalyze = async () => {
        if (!documentText.trim()) return;
        setLoading(true);
        setError(null);
        setResult(null);
        setApprovedSpans(new Set());
        setRejectedSpans(new Set());
        setPublished(false);

        try {
            const resp = await api.post('/internal/pii/anonymize', {
                text: documentText,
                minor_protection: minorProtection,
            });
            setResult(resp.data);
            // Default: all spans approved
            const ids = new Set(resp.data.redacted_spans.map((_, i) => i));
            setApprovedSpans(ids);
        } catch (err) {
            setError(err.response?.data?.detail || 'Anonymization service unavailable.');
        } finally {
            setLoading(false);
        }
    };

    const toggleApproval = (idx) => {
        setApprovedSpans(prev => {
            const next = new Set(prev);
            if (next.has(idx)) {
                next.delete(idx);
                setRejectedSpans(r => { const nr = new Set(r); nr.add(idx); return nr; });
            } else {
                next.add(idx);
                setRejectedSpans(r => { const nr = new Set(r); nr.delete(idx); return nr; });
            }
            return next;
        });
    };

    // Build final published text: rejected spans restore original, approved spans keep placeholder
    const buildPublishedText = () => {
        if (!result) return '';
        let text = result.anonymized_text;
        // Re-insert originals for rejected spans (right-to-left to keep offsets valid)
        const rejected = result.redacted_spans
            .map((s, i) => ({ ...s, idx: i }))
            .filter(s => rejectedSpans.has(s.idx))
            .sort((a, b) => b.start - a.start);

        for (const span of rejected) {
            text = text.slice(0, span.start) + span.original + text.slice(span.end);
        }
        return text;
    };

    const glassStyle = {
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'var(--glass-blur)',
        border: 'var(--border-glass-strong)',
        borderRadius: '1.5rem',
        padding: '2rem',
        boxShadow: 'var(--shadow-glass-strong)',
    };

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ShieldCheck size={32} style={{ color: 'var(--color-accent-light)' }} />
                    Legal Document Redaction Review
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    Paste or type court document text below. The NER pipeline will detect and propose redactions for sensitive entities. Review each redaction before publishing.
                </p>
            </div>

            {/* Input Panel */}
            <div style={glassStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ color: 'var(--text-main)', fontWeight: '700', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={20} /> Source Document
                    </h2>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={minorProtection}
                            onChange={e => setMinorProtection(e.target.checked)}
                            style={{ width: '16px', height: '16px' }}
                        />
                        Enhanced minor protection
                    </label>
                </div>
                <textarea
                    value={documentText}
                    onChange={e => setDocumentText(e.target.value)}
                    placeholder="Paste legal document text here (e.g., court order, FIR, judgment)..."
                    rows={8}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        border: '1px solid var(--border-glass)',
                        background: 'rgba(255,255,255,0.04)',
                        color: 'var(--text-main)',
                        fontSize: '0.95rem',
                        lineHeight: '1.6',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                        outline: 'none',
                    }}
                />
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !documentText.trim()}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 2rem', borderRadius: '0.75rem',
                            border: 'none', background: 'var(--color-accent)',
                            color: 'var(--text-main)', fontWeight: '700', cursor: 'pointer',
                            opacity: loading || !documentText.trim() ? 0.6 : 1,
                        }}
                    >
                        {loading ? <Loader2 size={18} className="spin" /> : <ShieldCheck size={18} />}
                        Detect & Anonymize
                    </button>
                    {result && (
                        <button
                            onClick={() => { setResult(null); setDocumentText(''); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
                                border: '1px solid var(--border-glass)', background: 'transparent',
                                color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600',
                            }}
                        >
                            <RefreshCw size={16} /> Reset
                        </button>
                    )}
                </div>
                <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.spin{animation:spin 1s linear infinite}`}</style>
            </div>

            {error && (
                <div style={{ ...glassStyle, padding: '1rem 1.5rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <AlertTriangle size={20} /> {error}
                </div>
            )}

            {result && !published && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Redaction Audit Panel */}
                    <div style={glassStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h2 style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Eye size={18} /> Redaction Review
                                <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '400' }}>
                                    ({approvedSpans.size}/{result.redacted_spans.length} approved)
                                </span>
                            </h2>
                        </div>
                        {result.redacted_spans.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>No sensitive entities detected.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto' }}>
                                {result.redacted_spans.map((span, idx) => {
                                    const approved = approvedSpans.has(idx);
                                    const colors = ENTITY_COLORS[span.entity_type] || { bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)', badge: '#6b7280', label: span.entity_type };
                                    return (
                                        <div key={idx} style={{
                                            background: approved ? colors.bg : 'rgba(107,114,128,0.06)',
                                            border: `1px solid ${approved ? colors.border : 'rgba(107,114,128,0.2)'}`,
                                            borderRadius: '0.75rem',
                                            padding: '0.85rem 1rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            opacity: approved ? 1 : 0.6,
                                            transition: 'all 0.2s',
                                        }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                                    <EntityBadge type={span.entity_type} />
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600', wordBreak: 'break-word' }}>
                                                    {span.original}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                                                    → <code style={{ fontSize: '0.78rem' }}>{span.replacement}</code>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleApproval(idx)}
                                                title={approved ? 'Click to reject this redaction' : 'Click to approve this redaction'}
                                                style={{
                                                    flexShrink: 0,
                                                    width: '32px', height: '32px',
                                                    borderRadius: '50%',
                                                    border: 'none',
                                                    background: approved ? '#10b981' : 'rgba(107,114,128,0.2)',
                                                    color: approved ? '#fff' : '#6b7280',
                                                    cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                {approved ? <CheckCircle size={16} /> : <Trash2 size={16} />}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <button
                            onClick={() => setPublished(true)}
                            style={{
                                marginTop: '1.5rem',
                                width: '100%',
                                padding: '0.85rem',
                                borderRadius: '0.75rem',
                                border: 'none',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: '#fff',
                                fontWeight: '700',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                            }}
                        >
                            <CheckCircle size={18} /> Approve & Publish
                        </button>
                    </div>

                    {/* Preview Panel */}
                    <div style={glassStyle}>
                        <h2 style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '1.25rem' }}>
                            🔍 Live Preview
                        </h2>
                        <pre style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            fontSize: '0.88rem',
                            lineHeight: '1.75',
                            color: 'var(--text-secondary)',
                            maxHeight: '540px',
                            overflowY: 'auto',
                        }}>
                            {buildPublishedText()}
                        </pre>
                    </div>
                </div>
            )}

            {published && (
                <div style={{ ...glassStyle, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.3)', textAlign: 'center' }}>
                    <CheckCircle size={48} style={{ color: '#10b981', marginBottom: '1rem' }} />
                    <h2 style={{ color: 'var(--text-main)', fontWeight: '700', fontSize: '1.4rem', marginBottom: '0.5rem' }}>Document Published</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        {approvedSpans.size} redaction(s) applied. {rejectedSpans.size} entity/entities restored by reviewer.
                    </p>
                    <pre style={{
                        textAlign: 'left',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontSize: '0.88rem',
                        lineHeight: '1.75',
                        background: 'rgba(0,0,0,0.15)',
                        borderRadius: '0.75rem',
                        padding: '1.25rem',
                        color: 'var(--text-secondary)',
                        maxHeight: '400px',
                        overflowY: 'auto',
                    }}>
                        {buildPublishedText()}
                    </pre>
                </div>
            )}
        </div>
    );
}
