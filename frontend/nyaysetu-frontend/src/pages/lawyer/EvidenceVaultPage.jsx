import { useState, useEffect, useRef } from 'react';
import {
    Archive,
    Search,
    Upload,
    File,
    ShieldCheck,
    Lock,
    MoreHorizontal,
    Filter,
    ArrowUpRight,
    Download,
    Eye,
    CheckCircle2,
    AlertCircle,
    Database,
    Loader2,
    X,
    FolderOpen,
    Shield,
    Bot,
    Eye,
    CheckCircle,
    AlertTriangle,
    FileCheck
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { documentAPI, lawyerAPI } from '../../services/api';

export default function EvidenceVaultPage() {
    const location = useLocation();
    const filterCaseId = location.state?.caseId || null;
    const [searchTerm, setSearchTerm] = useState('');
    const [evidenceItems, setEvidenceItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadCategory, setUploadCategory] = useState('EVIDENCE');
    const [uploadDescription, setUploadDescription] = useState('');
    const [cases, setCases] = useState([]);
    const [selectedCaseId, setSelectedCaseId] = useState(filterCaseId || '');

    // Document Analysis State
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [documentAnalysis, setDocumentAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchEvidence();
        fetchCases();
    }, [filterCaseId]);

    const fetchCases = async () => {
        try {
            const response = await lawyerAPI.getCases();
            setCases(response.data || []);
        } catch (error) {
            console.error('Error fetching cases:', error);
        }
    };

    const fetchEvidence = async () => {
        setLoading(true);
        try {
            const response = filterCaseId
                ? await documentAPI.getByCase(filterCaseId)
                : await documentAPI.list();
            setEvidenceItems(response.data || []);
        } catch (error) {
            console.error('Error fetching evidence:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!uploadFile) return;

        setUploading(true);
        try {
            await documentAPI.upload(uploadFile, {
                category: uploadCategory,
                description: uploadDescription,
                caseId: selectedCaseId || undefined
            });

            // Refresh evidence list
            await fetchEvidence();

            // Reset form
            setShowUploadModal(false);
            setUploadFile(null);
            setUploadCategory('EVIDENCE');
            setUploadDescription('');
            setSelectedCaseId(filterCaseId || '');
        } catch (error) {
            console.error('Error uploading evidence:', error);
            alert('Failed to upload document. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (item) => {
        try {
            const response = await documentAPI.download(item.id);
            const blob = new Blob([response.data], { type: item.contentType });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = item.fileName || 'download';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error('Error downloading:', error);
            alert('Failed to download document.');
        }
    };

    const handleDownloadCertificate = async (item) => {
        try {
            const response = await documentAPI.downloadCertificate(item.id);
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Certificate_${item.fileName || item.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error('Error downloading certificate:', error);
            alert('Failed to download certificate. It might not be generated yet.');
        }
    };

    const handleViewAnalysis = async (item) => {
        try {
            setIsAnalyzing(true);
            const response = await documentAPI.getAnalysis(item.id);
            setDocumentAnalysis(response.data);
            setShowAnalysisModal(true);
        } catch (error) {
            console.error('Error fetching analysis:', error);
            alert('No AI analysis found for this document. You may need to trigger it first.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Calculate real stats
    const stats = [
        {
            label: 'Total Files',
            value: String(evidenceItems.length),
            icon: File,
            color: 'var(--color-accent-light)'
        },
        {
            label: 'Verified',
            value: String(evidenceItems.filter(e => e.status === 'Verified' || e.verificationStatus === 'VERIFIED').length),
            icon: ShieldCheck,
            color: 'var(--color-success)'
        },
        {
            label: 'Encrypted',
            value: evidenceItems.length > 0 ? '100%' : '0%',
            icon: Lock,
            color: 'var(--color-warning)'
        },
        {
            label: 'Linked Cases',
            value: String(new Set(evidenceItems.filter(e => e.caseId).map(e => e.caseId)).size),
            icon: Database,
            color: 'var(--color-error)'
        },
    ];

    // Filter items by search term
    const filteredItems = evidenceItems.filter(item =>
        item.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const glassStyle = {
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'var(--glass-blur)',
        border: 'var(--border-glass-strong)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-glass-strong)'
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* AI Analysis Modal */}
            {showAnalysisModal && documentAnalysis && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(30, 42, 68, 0.4)',
                        zIndex: 10001,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '2rem',
                        backdropFilter: 'blur(8px)'
                    }}
                    onClick={() => setShowAnalysisModal(false)}
                >
                    <div
                        style={{
                            width: '580px',
                            maxWidth: '95vw',
                            maxHeight: '90vh',
                            background: '#ffffff',
                            borderRadius: '2rem',
                            padding: '2.4rem',
                            overflowY: 'auto',
                            border: '1px solid rgba(30, 42, 68, 0.08)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                            position: 'relative'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Shield size={22} style={{ color: '#10b981' }} />
                                    <h3 style={{ color: '#1e2a44', fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>AI Document Analysis</h3>
                                </div>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.25rem 0 0', fontWeight: '500' }}>
                                    {documentAnalysis.documentName || 'Analyzing Document...'}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAnalysisModal(false)}
                                style={{
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.75rem',
                                    padding: '0.6rem',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* SHA-256 Hash Section */}
                        <div style={{
                            background: '#f8fafc',
                            borderRadius: '1.25rem',
                            padding: '1.25rem',
                            marginBottom: '1.5rem',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                                <Shield size={16} style={{ color: '#10b981' }} />
                                <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.75rem', letterSpacing: '0.05em' }}>SHA-256 PROTECTED</span>
                            </div>
                            <div style={{ color: '#334155', fontSize: '0.8rem', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                                {documentAnalysis.sha256Hash}
                            </div>
                        </div>

                        {/* Status Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                            {/* Validity */}
                            <div style={{ background: 'rgba(16, 185, 129, 0.04)', borderRadius: '1.25rem', padding: '1.25rem 0.75rem', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CheckCircle size={20} color="#10b981" />
                                </div>
                                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700' }}>Validity</div>
                                <div style={{ color: '#10b981', fontWeight: '800', fontSize: '0.95rem' }}>{documentAnalysis.validityStatus || 'VALID'}</div>
                            </div>
                            {/* Usefulness */}
                            <div style={{ background: 'rgba(99, 102, 241, 0.04)', borderRadius: '1.25rem', padding: '1.25rem 0.75rem', textAlign: 'center', border: '1px solid rgba(99, 102, 241, 0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Eye size={20} color="#6366f1" />
                                </div>
                                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700' }}>Usefulness</div>
                                <div style={{ color: '#6366f1', fontWeight: '800', fontSize: '0.95rem' }}>{documentAnalysis.usefulnessLevel || 'HIGH'}</div>
                            </div>
                            {/* Vault Status */}
                            <div style={{ background: '#f8fafc', borderRadius: '1.25rem', padding: '1.25rem 0.75rem', textAlign: 'center', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Shield size={20} color="#64748b" />
                                </div>
                                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700' }}>Evidence Vault</div>
                                <div style={{ color: '#475569', fontWeight: '800', fontSize: '0.95rem' }}>STORED</div>
                            </div>
                        </div>

                        {/* Document Details */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid #e2e8f0' }}>
                                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: '700' }}>Document Type</div>
                                <div style={{ color: '#1e2a44', fontWeight: '700', fontSize: '1rem' }}>{documentAnalysis.documentType || 'Legal Document'}</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid #e2e8f0' }}>
                                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: '700' }}>Category</div>
                                <div style={{ color: '#1e2a44', fontWeight: '700', fontSize: '1rem' }}>{documentAnalysis.suggestedCategory || 'EVIDENCE'}</div>
                            </div>
                        </div>

                        {/* AI Summary */}
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.75rem' }}>AI Summary</div>
                            <p style={{ color: '#334155', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                                {documentAnalysis.summary || 'Analytical summary pending...'}
                            </p>
                        </div>

                        {/* Key Points */}
                        {documentAnalysis.keyPoints && documentAnalysis.keyPoints.length > 0 && (
                            <div style={{ background: 'rgba(99, 102, 241, 0.03)', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid rgba(99, 102, 241, 0.1)', marginBottom: '2.4rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', color: '#6366f1' }}>
                                    <Bot size={18} />
                                    <span style={{ fontWeight: '800', fontSize: '0.9rem', letterSpacing: '0.02em' }}>Key Points</span>
                                </div>
                                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {documentAnalysis.keyPoints.map((point, idx) => (
                                        <li key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', marginTop: '0.6rem', flexShrink: 0 }} />
                                            <span style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            onClick={() => setShowAnalysisModal(false)}
                            style={{
                                width: '100%',
                                padding: '1.1rem',
                                background: '#1e2a44',
                                border: 'none',
                                borderRadius: '1rem',
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 10px 15px -3px rgba(30, 42, 68, 0.2)'
                            }}
                        >
                            Close Analysis
                        </button>
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }} onClick={() => setShowUploadModal(false)}>
                    <div style={{
                        ...glassStyle,
                        width: '500px',
                        maxWidth: '90vw'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                                Upload Evidence
                            </h2>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* File Input */}
                        <div style={{ marginBottom: '1rem' }}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={(e) => setUploadFile(e.target.files[0])}
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: '2px dashed var(--border-glass)',
                                    borderRadius: '1rem',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: uploadFile ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-glass)'
                                }}
                            >
                                {uploadFile ? (
                                    <div style={{ color: 'var(--color-success)' }}>
                                        <CheckCircle2 size={32} style={{ marginBottom: '0.5rem' }} />
                                        <p style={{ fontWeight: '600' }}>{uploadFile.name}</p>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {(uploadFile.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{ color: 'var(--text-secondary)' }}>
                                        <Upload size={32} style={{ marginBottom: '0.5rem' }} />
                                        <p>Click to select a file</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Category */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Category
                            </label>
                            <select
                                value={uploadCategory}
                                onChange={(e) => setUploadCategory(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'var(--bg-glass)',
                                    border: 'var(--border-glass)',
                                    borderRadius: '0.75rem',
                                    color: 'var(--text-main)',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <option value="EVIDENCE">Evidence</option>
                                <option value="LEGAL_DOCUMENTS">Legal Documents</option>
                                <option value="CASE_DOCUMENT">Case Document</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        {/* Case Selection */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Link to Case (Optional)
                            </label>
                            <select
                                value={selectedCaseId}
                                onChange={(e) => setSelectedCaseId(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'var(--bg-glass)',
                                    border: 'var(--border-glass)',
                                    borderRadius: '0.75rem',
                                    color: 'var(--text-main)',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <option value="">-- No Case --</option>
                                {cases.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Description (Optional)
                            </label>
                            <textarea
                                value={uploadDescription}
                                onChange={(e) => setUploadDescription(e.target.value)}
                                placeholder="Brief description of the evidence..."
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'var(--bg-glass)',
                                    border: 'var(--border-glass)',
                                    borderRadius: '0.75rem',
                                    color: 'var(--text-main)',
                                    fontSize: '0.9rem',
                                    minHeight: '80px',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        {/* Upload Button */}
                        <button
                            onClick={handleUpload}
                            disabled={!uploadFile || uploading}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                background: uploadFile && !uploading
                                    ? 'var(--color-accent)'
                                    : 'var(--bg-glass)',
                                color: uploadFile && !uploading ? 'white' : 'var(--text-secondary)',
                                border: 'none',
                                borderRadius: '0.75rem',
                                fontWeight: '700',
                                fontSize: '1rem',
                                cursor: uploadFile && !uploading ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload size={18} />
                                    Upload Evidence
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        background: 'var(--color-accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'var(--shadow-glass)'
                    }}>
                        <Archive size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                            Evidence Vault
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Secure, blockchain-verified repository for sensitive case material
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'var(--color-accent)',
                        color: 'white', border: 'none', borderRadius: '0.75rem',
                        padding: '0.8rem 1.5rem', fontWeight: '700', cursor: 'pointer',
                        boxShadow: 'var(--shadow-glass)'
                    }}>
                    <Upload size={18} /> Upload New Evidence
                </button>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                {stats.map((stat, i) => (
                    <div key={i} style={{ ...glassStyle, padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '10px',
                                background: `${stat.color}15`, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', color: stat.color
                            }}>
                                <stat.icon size={20} />
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)' }}>STATISTICS</span>
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{stat.value}</h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div style={glassStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ position: 'relative', width: '400px' }}>
                        <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search by file name or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'var(--bg-glass)',
                                border: 'var(--border-glass)',
                                borderRadius: '0.75rem',
                                padding: '0.7rem 1rem 0.7rem 3rem',
                                color: 'var(--text-main)',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                        <Loader2 size={32} style={{ color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                        <FolderOpen size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>No Evidence Found</h3>
                        <p>Upload your first evidence file to get started</p>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            style={{
                                marginTop: '1rem',
                                padding: '0.75rem 1.5rem',
                                background: 'var(--color-accent)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.75rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            <Upload size={16} style={{ marginRight: '0.5rem' }} />
                            Upload Evidence
                        </button>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
                            <thead>
                                <tr style={{ borderBottom: 'var(--border-glass-subtle)' }}>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '800' }}>ITEM NAME</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '800' }}>CATEGORY</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '800' }}>DATE ADDED</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '800' }}>VERIFICATION</th>
                                    <th style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '800' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map(item => (
                                    <tr key={item.id} style={{ borderBottom: 'var(--border-glass-subtle)', transition: 'background 0.2s' }}
                                        onMouseOver={e => e.currentTarget.style.background = 'var(--bg-glass-subtle)'}
                                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '36px', height: '36px', borderRadius: '8px',
                                                    background: 'var(--bg-glass-subtle)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'var(--color-accent)'
                                                }}>
                                                    <File size={18} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.fileName}</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{item.contentType}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.category || 'General'}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(item.uploadDate).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                                                    color: item.status === 'Verified' || item.verificationStatus === 'VERIFIED' ? 'var(--color-success)' : 'var(--color-warning)',
                                                    fontSize: '0.75rem', fontWeight: '700'
                                                }}>
                                                    {item.status === 'Verified' || item.verificationStatus === 'VERIFIED' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                                    {item.status || item.verificationStatus || 'Pending'}
                                                </div>
                                                {item.blockchain && (
                                                    <div style={{
                                                        fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px',
                                                        background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-accent)', fontWeight: '800'
                                                    }}>BC-SECURED</div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                                                {/* AI Insights Button */}
                                                <button
                                                    onClick={() => handleViewAnalysis(item)}
                                                    disabled={isAnalyzing}
                                                    style={{
                                                        background: 'rgba(99, 102, 241, 0.1)',
                                                        border: '1px solid rgba(99, 102, 241, 0.2)',
                                                        color: '#6366f1',
                                                        borderRadius: '0.5rem',
                                                        padding: '0.4rem 0.75rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    title="View AI Analysis"
                                                >
                                                    <Bot size={14} />
                                                    AI Insights
                                                </button>

                                                {/* Certificate Button (Only for Hashed Documents) */}
                                                {(item.sha256Hash || item.blockchain) && (
                                                    <button
                                                        onClick={() => handleDownloadCertificate(item)}
                                                        style={{
                                                            background: 'rgba(16, 185, 129, 0.1)',
                                                            border: '1px solid rgba(16, 185, 129, 0.2)',
                                                            color: '#10b981',
                                                            borderRadius: '0.5rem',
                                                            padding: '0.4rem 0.75rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.4rem',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '700',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        title="Download Evidence Certificate"
                                                    >
                                                        <FileCheck size={14} />
                                                        Certificate
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleDownload(item)}
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.05)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        color: 'var(--text-secondary)',
                                                        borderRadius: '0.5rem',
                                                        padding: '0.4rem 0.6rem',
                                                        cursor: 'pointer'
                                                    }}
                                                    title="Download File"
                                                >
                                                    <Download size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* CSS for animations */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
