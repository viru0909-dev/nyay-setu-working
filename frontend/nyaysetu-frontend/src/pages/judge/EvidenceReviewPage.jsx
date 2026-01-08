import { useState, useEffect } from 'react';
import { judgeAPI } from '../../services/api';
import axios from 'axios';
import {
    Shield,
    CheckCircle2,
    AlertTriangle,
    FileText,
    Link2,
    RefreshCw,
    Loader2,
    Eye,
    ChevronDown,
    Search,
    Database,
    Binary,
    Clock
} from 'lucide-react';

export default function EvidenceReviewPage() {
    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [evidence, setEvidence] = useState([]);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [chainStatus, setChainStatus] = useState(null);

    useEffect(() => {
        fetchCases();
    }, []);

    useEffect(() => {
        if (selectedCase) {
            fetchEvidence(selectedCase);
        }
    }, [selectedCase]);

    const fetchCases = async () => {
        try {
            const response = await judgeAPI.getCases();
            setCases(response.data || []);
        } catch (error) {
            console.error('Error fetching cases:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEvidence = async (caseId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/evidence/case/${caseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvidence(response.data.evidence || []);
            setChainStatus(null);
        } catch (error) {
            console.error('Error fetching evidence:', error);
            setEvidence([]);
        }
    };

    const verifyChain = async () => {
        if (!selectedCase) return;
        setVerifying(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:8080/api/evidence/case/${selectedCase}/verify-chain`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setChainStatus(response.data);
        } catch (error) {
            console.error('Chain verification failed:', error);
            setChainStatus({ isValid: false, message: 'Verification failed' });
        } finally {
            setVerifying(false);
        }
    };

    const verifySingle = async (evidenceId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:8080/api/evidence/${evidenceId}/verify`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(response.data.isValid
                ? '✅ Evidence integrity verified!'
                : '❌ WARNING: Evidence may have been tampered with!');
            fetchEvidence(selectedCase);
        } catch (error) {
            console.error('Verification failed:', error);
        }
    };

    const glassStyle = {
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'var(--glass-blur)',
        border: 'var(--border-glass-strong)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-glass)'
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Loader2 size={48} className="spin" style={{ color: 'var(--color-accent)' }} />
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
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)'
                    }}>
                        <Shield size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                            Evidence Vault
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Blockchain-secured evidence verification • Tamper-proof records
                        </p>
                    </div>
                </div>
            </div>

            {/* Case Selector */}
            <div style={{
                ...glassStyle,
                marginBottom: '1.5rem',
                border: 'var(--border-glass-strong)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Search size={20} color="#64748b" />
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'block' }}>
                            Select Judicial Case File
                        </label>
                        <select
                            value={selectedCase || ''}
                            onChange={(e) => setSelectedCase(e.target.value || null)}
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-main)',
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                outline: 'none',
                                cursor: 'pointer',
                                padding: '0.25rem 0',
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                                appearance: 'none'
                            }}
                        >
                            <option value="" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-main)' }}>-- Choose a case file to review --</option>
                            {cases.map(c => (
                                <option key={c.id} value={c.id} style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-main)' }}>
                                    {c.title} ({c.caseType})
                                </option>
                            ))}
                        </select>
                    </div>
                    <ChevronDown size={20} color="#64748b" />
                </div>
            </div>

            {selectedCase && (
                <>
                    {/* Chain Verification Card */}
                    <div style={{
                        ...glassStyle,
                        marginBottom: '1.5rem',
                        border: 'var(--border-glass-strong)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px',
                                    background: 'rgba(99, 102, 241, 0.1)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Database size={20} color="#818cf8" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                                        Blockchain Ledger Integrity
                                    </h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Verify complete cryptographic chain sequence</p>
                                </div>
                            </div>
                            <button
                                onClick={verifyChain}
                                disabled={verifying}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    color: 'white',
                                    fontWeight: '700',
                                    cursor: verifying ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    boxShadow: 'var(--shadow-glass)'
                                }}
                            >
                                <RefreshCw size={18} className={verifying ? "spin" : ""} />
                                {verifying ? 'Verifying Ledger...' : 'Verify Cryptographic Chain'}
                            </button>
                        </div>

                        {chainStatus && (
                            <div style={{
                                marginTop: '1.5rem',
                                padding: '1.25rem',
                                background: chainStatus.isValid ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                                border: `1px solid ${chainStatus.isValid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                borderRadius: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                {chainStatus.isValid ? (
                                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '50%' }}>
                                        <CheckCircle2 size={24} color="#10b981" />
                                    </div>
                                ) : (
                                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '50%' }}>
                                        <AlertTriangle size={24} color="#ef4444" />
                                    </div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <h4 style={{
                                        margin: 0, fontSize: '1rem', fontWeight: '700',
                                        color: chainStatus.isValid ? '#4ade80' : '#f87171'
                                    }}>
                                        {chainStatus.message}
                                    </h4>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                                        Total verified blocks in sequence: <strong style={{ color: 'var(--text-main)' }}>{chainStatus.totalRecords}</strong>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Evidence List */}
                    <div style={{ ...glassStyle }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                                Evidence Records
                            </h3>
                            <span style={{
                                padding: '0.2rem 0.6rem', background: 'rgba(99, 102, 241, 0.2)',
                                color: '#818cf8', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: '700'
                            }}>
                                {evidence.length} FILE{evidence.length !== 1 ? 'S' : ''}
                            </span>
                        </div>

                        {evidence.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem' }}>
                                <FileText size={64} color="var(--text-secondary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                                <h4 style={{ color: 'var(--text-secondary)', margin: 0 }}>No evidence found in this case</h4>
                                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Blockchain verification is pending upload</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '1.25rem' }}>
                                {evidence.map((item) => (
                                    <div key={item.id} style={{
                                        background: 'var(--bg-glass)',
                                        border: `1px solid ${item.isVerified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                        borderRadius: '1.25rem',
                                        padding: '1.5rem',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Verification Badge */}
                                        <div style={{
                                            position: 'absolute', top: 0, right: 0, padding: '0.5rem 1rem',
                                            background: item.isVerified ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            borderLeft: `1px solid ${item.isVerified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                            borderBottom: `1px solid ${item.isVerified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                            borderBottomLeftRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                        }}>
                                            {item.isVerified ? <CheckCircle2 size={14} color="#10b981" /> : <AlertTriangle size={14} color="#ef4444" />}
                                            <span style={{
                                                fontSize: '0.7rem', fontWeight: '800',
                                                color: item.isVerified ? '#4ade80' : '#f87171'
                                            }}>
                                                {item.verificationStatus?.toUpperCase()}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                                            <div style={{
                                                width: '56px', height: '56px', borderRadius: '12px',
                                                background: 'var(--bg-glass-strong)', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                            }}>
                                                <FileText size={28} color="var(--text-secondary)" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                    <span style={{ color: '#6366f1', fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: '700' }}>BLOCK #{item.blockIndex}</span>
                                                    <h4 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                                                        {item.title}
                                                    </h4>
                                                </div>

                                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0.5rem 0' }}>
                                                    {item.description}
                                                </p>

                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <Binary size={14} />
                                                        <span>{item.evidenceType}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <Link2 size={14} />
                                                        <span style={{ fontFamily: 'monospace' }}>{item.blockHash?.substring(0, 16)}...</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <Clock size={14} />
                                                        <span>{item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => verifySingle(item.id)}
                                                style={{
                                                    alignSelf: 'center',
                                                    width: '44px', height: '44px', borderRadius: '12px',
                                                    background: 'rgba(16, 185, 129, 0.1)',
                                                    border: '1px solid rgba(16, 185, 129, 0.2)',
                                                    color: '#10b981', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
                                                onMouseOut={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                                                title="Confirm block integrity"
                                            >
                                                <Shield size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
}
