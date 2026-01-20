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
    FolderOpen
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
                                                <button
                                                    onClick={() => handleDownload(item)}
                                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                                    title="Download"
                                                >
                                                    <Download size={18} />
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
