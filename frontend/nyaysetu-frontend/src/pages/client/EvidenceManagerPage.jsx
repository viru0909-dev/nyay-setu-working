import { useState, useEffect } from 'react';
import {
    Shield, Upload, CheckCircle2, AlertTriangle, FileText,
    Lock, Link2, Eye, Download, Loader, RefreshCw, ChevronDown
} from 'lucide-react';
import axios from 'axios';

export default function EvidenceManagerPage() {
    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [evidence, setEvidence] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [chainStatus, setChainStatus] = useState(null);

    // Upload form state
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadDescription, setUploadDescription] = useState('');
    const [uploadType, setUploadType] = useState('DOCUMENT');

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
            const token = localStorage.getItem('token');
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
            const response = await axios.get(`${API_BASE_URL}/api/cases`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCases(response.data || []);
        } catch (error) {
            console.error('Failed to fetch cases:', error);
        }
    };

    const fetchEvidence = async (caseId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const response = await axios.get(`${API_BASE_URL}/api/evidence/case/${caseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvidence(response.data.evidence || []);
        } catch (error) {
            console.error('Failed to fetch evidence:', error);
            setEvidence([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!uploadFile || !uploadTitle || !selectedCase) {
            alert('Please select a case, file, and enter a title');
            return;
        }

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', uploadFile);
            formData.append('caseId', selectedCase);
            formData.append('title', uploadTitle);
            formData.append('description', uploadDescription);
            formData.append('evidenceType', uploadType);

            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

            await axios.post(`${API_BASE_URL}/api/evidence/upload`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Reset form
            setUploadFile(null);
            setUploadTitle('');
            setUploadDescription('');

            // Refresh evidence list
            fetchEvidence(selectedCase);
            alert('✅ Evidence uploaded and secured with blockchain hash!');
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload evidence');
        } finally {
            setUploading(false);
        }
    };

    const verifyChain = async () => {
        if (!selectedCase) return;

        setVerifying(true);
        try {
            const token = localStorage.getItem('token');
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const response = await axios.get(
                `${API_BASE_URL}/api/evidence/case/${selectedCase}/verify-chain`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setChainStatus(response.data);
        } catch (error) {
            console.error('Chain verification failed:', error);
        } finally {
            setVerifying(false);
        }
    };

    const verifySingle = async (evidenceId) => {
        try {
            const token = localStorage.getItem('token');
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const response = await axios.get(
                `${API_BASE_URL}/api/evidence/${evidenceId}/verify`,
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

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleString();
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-glass)'
                    }}>
                        <Shield size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                            Evidence Manager
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Blockchain-secured evidence storage • Tamper-proof records
                        </p>
                    </div>
                </div>
            </div>

            {/* Case Selector */}
            <div style={{
                background: 'var(--bg-glass-strong)',
                backdropFilter: 'var(--glass-blur)',
                border: 'var(--border-glass-strong)',
                borderRadius: '1rem',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                boxShadow: 'var(--shadow-glass)'
            }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                    Select Case
                </label>
                <select
                    value={selectedCase || ''}
                    onChange={(e) => setSelectedCase(e.target.value || null)}
                    style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'var(--bg-glass)',
                        border: 'var(--border-glass)',
                        borderRadius: '0.5rem',
                        color: 'var(--text-main)',
                        fontSize: '1rem'
                    }}
                >
                    <option value="">-- Select a case --</option>
                    {cases.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.caseNumber || c.id} - {c.title}
                        </option>
                    ))}
                </select>
            </div>

            {selectedCase && (
                <>
                    {/* Upload Section */}
                    <div style={{
                        background: 'var(--bg-glass-strong)',
                        backdropFilter: 'var(--glass-blur)',
                        border: 'var(--border-glass-strong)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                        boxShadow: 'var(--shadow-glass)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <Upload size={20} color="#10b981" />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                                Upload New Evidence
                            </h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>
                                    Evidence Title *
                                </label>
                                <input
                                    type="text"
                                    value={uploadTitle}
                                    onChange={(e) => setUploadTitle(e.target.value)}
                                    placeholder="e.g., Contract Agreement"
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem',
                                        background: 'var(--bg-glass)',
                                        border: 'var(--border-glass)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-main)',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>
                                    Evidence Type
                                </label>
                                <select
                                    value={uploadType}
                                    onChange={(e) => setUploadType(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem',
                                        background: 'var(--bg-glass)',
                                        border: 'var(--border-glass)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text-main)',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    <option value="DOCUMENT">Document</option>
                                    <option value="IMAGE">Image</option>
                                    <option value="AUDIO">Audio</option>
                                    <option value="VIDEO">Video</option>
                                    <option value="TESTIMONY">Testimony</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>
                                Description
                            </label>
                            <textarea
                                value={uploadDescription}
                                onChange={(e) => setUploadDescription(e.target.value)}
                                placeholder="Brief description of the evidence..."
                                rows={2}
                                style={{
                                    width: '100%',
                                    padding: '0.625rem',
                                    background: 'var(--bg-glass)',
                                    border: 'var(--border-glass)',
                                    borderRadius: '0.5rem',
                                    color: 'var(--text-main)',
                                    fontSize: '0.875rem',
                                    resize: 'none'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.375rem' }}>
                                File *
                            </label>
                            <input
                                type="file"
                                onChange={(e) => setUploadFile(e.target.files[0])}
                                style={{
                                    width: '100%',
                                    padding: '0.625rem',
                                    background: 'var(--bg-glass)',
                                    border: 'var(--border-glass)',
                                    borderRadius: '0.5rem',
                                    color: 'var(--text-main)',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={uploading || !uploadFile || !uploadTitle}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: (uploading || !uploadFile || !uploadTitle)
                                    ? 'var(--bg-glass)'
                                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                border: 'none',
                                borderRadius: '0.5rem',
                                color: (uploading || !uploadFile || !uploadTitle) ? 'var(--text-secondary)' : 'white',
                                fontWeight: '700',
                                cursor: (uploading || !uploadFile || !uploadTitle) ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: (uploading || !uploadFile || !uploadTitle) ? 'none' : 'var(--shadow-glass-strong)'
                            }}
                        >
                            {uploading ? (
                                <>
                                    <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                    Uploading & Hashing...
                                </>
                            ) : (
                                <>
                                    <Lock size={18} />
                                    Upload with Blockchain Security
                                </>
                            )}
                        </button>
                    </div>

                    {/* Chain Verification */}
                    <div style={{
                        background: 'var(--bg-glass-strong)',
                        backdropFilter: 'var(--glass-blur)',
                        border: 'var(--border-glass-strong)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                        boxShadow: 'var(--shadow-glass)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Link2 size={20} color="#10b981" />
                                <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                                    Evidence Chain Integrity
                                </h2>
                            </div>
                            <button
                                onClick={verifyChain}
                                disabled={verifying}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    borderRadius: '0.5rem',
                                    color: '#10b981',
                                    fontWeight: '600',
                                    fontSize: '0.875rem',
                                    cursor: verifying ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <RefreshCw size={16} style={{ animation: verifying ? 'spin 1s linear infinite' : 'none' }} />
                                Verify Chain
                            </button>
                        </div>

                        {chainStatus && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                background: chainStatus.isValid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                border: `1px solid ${chainStatus.isValid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                borderRadius: '0.5rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {chainStatus.isValid ? (
                                        <CheckCircle2 size={20} color="#10b981" />
                                    ) : (
                                        <AlertTriangle size={20} color="#ef4444" />
                                    )}
                                    <span style={{
                                        fontWeight: '700',
                                        color: chainStatus.isValid ? '#10b981' : '#ef4444'
                                    }}>
                                        {chainStatus.message}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                                    Total records: {chainStatus.totalRecords}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Evidence List */}
                    <div style={{
                        background: 'var(--bg-glass-strong)',
                        backdropFilter: 'var(--glass-blur)',
                        border: 'var(--border-glass-strong)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        boxShadow: 'var(--shadow-glass)'
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
                            Evidence Records ({evidence.length})
                        </h2>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                <Loader size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                                Loading evidence...
                            </div>
                        ) : evidence.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                No evidence uploaded yet
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {evidence.map((item, index) => (
                                    <div key={item.id} style={{
                                        background: 'var(--bg-glass)',
                                        border: `1px solid ${item.isVerified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.3)'}`,
                                        borderRadius: '0.75rem',
                                        padding: '1.25rem'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                    <span style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '50%',
                                                        background: 'rgba(16, 185, 129, 0.2)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '700',
                                                        color: '#10b981'
                                                    }}>
                                                        #{item.blockIndex}
                                                    </span>
                                                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                                                        {item.title}
                                                    </h3>
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem',
                                                        background: item.isVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                        border: `1px solid ${item.isVerified ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                                        borderRadius: '9999px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: '600',
                                                        color: item.isVerified ? '#10b981' : '#ef4444'
                                                    }}>
                                                        {item.verificationStatus}
                                                    </span>
                                                </div>

                                                {item.description && (
                                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
                                                        {item.description}
                                                    </p>
                                                )}

                                                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>
                                                    <span>📄 {item.fileName}</span>
                                                    <span>{formatFileSize(item.fileSize)}</span>
                                                    <span>{item.evidenceType}</span>
                                                    <span>{formatDate(item.createdAt)}</span>
                                                </div>

                                                <div style={{
                                                    marginTop: '0.75rem',
                                                    padding: '0.5rem',
                                                    background: 'rgba(0,0,0,0.2)',
                                                    borderRadius: '0.375rem',
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.65rem',
                                                    color: '#94a3b8'
                                                }}>
                                                    🔗 Block Hash: {item.blockHash?.substring(0, 32)}...
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => verifySingle(item.id)}
                                                style={{
                                                    padding: '0.5rem',
                                                    background: 'rgba(16, 185, 129, 0.1)',
                                                    border: '1px solid rgba(16, 185, 129, 0.2)',
                                                    borderRadius: '0.5rem',
                                                    color: '#10b981',
                                                    cursor: 'pointer'
                                                }}
                                                title="Verify integrity"
                                            >
                                                <CheckCircle2 size={18} />
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
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
