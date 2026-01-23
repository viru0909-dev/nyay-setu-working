import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, FileText, Calendar, User, Scale, Clock,
    Download, AlertCircle, CheckCircle, Loader2,
    Gavel, FileCheck, MessageSquare, Shield, Lock,
    Link2, RefreshCw, Eye, CheckCircle2, AlertTriangle,
    Upload, Trash2, Search, Filter, Grid, List as ListIcon, X,
    Edit, Sparkles, Save
} from 'lucide-react';
import { caseAPI, documentAPI, brainAPI, caseAssignmentAPI } from '../../services/api';
import { API_BASE_URL } from '../../config/apiConfig';
import CaseChatWidget from '../../components/CaseChatWidget';

// -----------------------------------------------------------------------------
// HELPER CONSTANTS & FUNCTIONS
// -----------------------------------------------------------------------------

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

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
};

const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

export default function CaseDetailPage() {
    const { caseId } = useParams();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);
    const [refining, setRefining] = useState(false);

    // Hire Lawyer State
    const [showHireModal, setShowHireModal] = useState(false);
    const [availableLawyers, setAvailableLawyers] = useState([]);
    const [lawyerLoading, setLawyerLoading] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        fetchCaseDetails();
    }, [caseId]);

    const handleEditClick = () => {
        setEditData({
            title: caseData.title,
            description: caseData.description,
            urgency: caseData.urgency
        });
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        setSaving(true);
        try {
            await caseAPI.update(caseId, editData);
            setCaseData({ ...caseData, ...editData });
            setIsEditing(false);
            alert('Case updated successfully!');
        } catch (e) {
            console.error('Update failed:', e);
            alert('Failed to update case.');
        } finally {
            setSaving(false);
        }
    };

    const handleRefineDescription = async () => {
        if (!editData.description) return;
        setRefining(true);
        try {
            const response = await brainAPI.analyzeCase(editData.description);
            if (response.data && response.data.description) {
                setEditData({ ...editData, description: response.data.description });
            }
        } catch (e) {
            console.error(e);
            alert('AI Refinement failed. Please try again.');
        } finally {
            setRefining(false);
        }
    };

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

    const handleHireLawyer = async () => {
        setLawyerLoading(true);
        setShowHireModal(true);
        try {
            const response = await caseAssignmentAPI.getAvailableLawyers();
            setAvailableLawyers(response.data || []);
        } catch (error) {
            console.error('Error fetching lawyers:', error);
            alert('Failed to load available lawyers');
        } finally {
            setLawyerLoading(false);
        }
    };

    const submitProposal = async (lawyerId) => {
        try {
            await caseAssignmentAPI.proposeLawyer(caseId, lawyerId);
            alert('✅ Proposal sent successfully! The lawyer will review and accept/decline your case.');
            setShowHireModal(false);
            fetchCaseDetails(); // Refresh to see if status updated
        } catch (error) {
            console.error('Error sending proposal:', error);
            alert('Failed to send proposal. This case might already have a pending proposal.');
        }
    };

    const downloadCaseReport = () => {
        if (!caseData) return;
        const text = `CASE REPORT: ${caseData.title}\nID: ${caseData.id}\nStatus: ${caseData.status}\n\nDescription:\n${caseData.description}`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Case_${caseData.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Loader2 size={48} style={{ color: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error || !caseData) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <AlertCircle size={64} style={{ color: '#ef4444', marginBottom: '1rem' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{error || 'Case Not Found'}</h2>
                <button
                    onClick={() => navigate('/litigant/case-diary')}
                    style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: 'var(--color-accent)', border: 'none', borderRadius: '0.5rem', color: 'white', cursor: 'pointer' }}
                >
                    Back to Case Diary
                </button>
            </div>
        );
    }

    const statusStyle = statusColors[caseData.status] || statusColors['PENDING'];
    const urgencyStyle = urgencyColors[caseData.urgency] || urgencyColors['NORMAL'];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            {/* 1. Header Section */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', position: 'relative', zIndex: 9999, pointerEvents: 'auto' }}>
                    <button
                        onClick={() => navigate('/litigant/case-diary')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={20} /> Back to Diary
                    </button>
                    <div style={{ display: 'flex', gap: '0.5rem', position: 'relative', zIndex: 9999, pointerEvents: 'auto' }}>
                        <button
                            onClick={downloadCaseReport}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '0.5rem', color: '#10b981', fontWeight: '600', cursor: 'pointer' }}
                        >
                            <Download size={16} /> Download Report
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{caseData.title}</h1>
                            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', background: statusStyle.bg, border: `1px solid ${statusStyle.border}`, color: statusStyle.text, fontSize: '0.75rem', fontWeight: '700' }}>
                                {caseData.status.replace(/_/g, ' ')}
                            </span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Case ID: {caseData.id}</p>
                    </div>
                    <span style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', background: urgencyStyle.bg, color: urgencyStyle.text, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        ⚡ {caseData.urgency} Priority
                    </span>
                </div>
            </div>

            {/* 2. Tabs Navigation */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', marginBottom: '2rem', gap: '2rem' }}>
                {[
                    { id: 'overview', label: 'Overview', icon: FileText },
                    { id: 'files', label: 'Case Files', icon: FileCheck },
                    { id: 'timeline', label: 'Timeline', icon: Clock }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '1rem 0',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid var(--color-accent)' : '2px solid transparent',
                            color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--text-secondary)',
                            fontWeight: activeTab === tab.id ? '700' : '500',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <tab.icon size={18} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* 3. Tab Content */}

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && <OverviewTab caseData={caseData} onHireLawyer={handleHireLawyer} />}

            {/* CASE FILES TAB */}
            {activeTab === 'files' && <CaseFilesTab caseId={caseId} />}

            {/* TIMELINE TAB */}
            {activeTab === 'timeline' && <TimelineTab caseData={caseData} />}

            {/* Chat Widget always visible */}
            <CaseChatWidget caseId={caseId} caseTitle={caseData.title} />
        </div>
    );
}

// -----------------------------------------------------------------------------
// SUB-COMPONENTS (TABS)
// -----------------------------------------------------------------------------

function OverviewTab({ caseData, onHireLawyer }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Description */}
                <div style={{ background: 'var(--bg-glass-strong)', padding: '2rem', borderRadius: '1.5rem', border: 'var(--border-glass-strong)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1rem' }}>Case Description</h3>
                    <p style={{ lineHeight: '1.7', color: 'var(--text-secondary)' }}>{caseData.description}</p>
                </div>

                {/* AI Summary */}
                {caseData.aiGeneratedSummary && (
                    <div style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(99, 102, 241, 0.05))', padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <MessageSquare size={24} style={{ color: '#8b5cf6' }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#8b5cf6', margin: 0 }}>Vakil Friend Analysis</h3>
                        </div>
                        <p style={{ lineHeight: '1.7', color: 'var(--text-main)' }}>{caseData.aiGeneratedSummary}</p>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Key Details Card */}
                <div style={{ background: 'var(--bg-glass-strong)', padding: '1.5rem', borderRadius: '1.5rem', border: 'var(--border-glass-strong)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Key Details</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Case Type</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Scale size={16} color="var(--color-accent)" />
                                <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{caseData.caseType}</span>
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Filed Date</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calendar size={16} color="#10b981" />
                                <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{formatDate(caseData.filedDate)}</span>
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Next Hearing</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={16} color="#ef4444" />
                                <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{formatDate(caseData.nextHearing) || 'TBA'}</span>
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Assigned Judge</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Gavel size={16} color="#f59e0b" />
                                <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{caseData.assignedJudge || 'Pending Assignment'}</span>
                            </div>
                        </div>

                        {/* Hire Lawyer Button in Key Details - Hide if pending */}
                        {!caseData.assignedLawyer && caseData.status !== 'CLOSED' && caseData.lawyerProposalStatus !== 'PENDING' && (
                            <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: 'var(--border-glass)' }}>
                                <button
                                    onClick={onHireLawyer}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        color: 'white',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)'
                                    }}
                                >
                                    <Gavel size={18} />
                                    Hire Lawyer
                                </button>
                            </div>
                        )}

                        {/* Proposal Sent Status */}
                        {!caseData.assignedLawyer && caseData.lawyerProposalStatus === 'PENDING' && (
                            <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: 'var(--border-glass)' }}>
                                <div style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    border: '1px solid rgba(245, 158, 11, 0.3)',
                                    borderRadius: '0.75rem',
                                    color: '#d97706',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <Clock size={18} />
                                    Proposal Sent
                                </div>
                                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Waiting for lawyer response</p>
                            </div>
                        )}

                        {/* Assigned Lawyer Display */}
                        {caseData.assignedLawyer && (
                            <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: 'var(--border-glass)' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Legal Representative</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontWeight: '700'
                                    }}>
                                        <Scale size={20} />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                                            {caseData.lawyerName || 'Private Counsel'}
                                        </p>
                                        <p style={{ fontSize: '0.8rem', color: '#10b981', margin: 0 }}>
                                            ✓ Case Accepted
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Parties Card */}
                <div style={{ background: 'var(--bg-glass-strong)', padding: '1.5rem', borderRadius: '1.5rem', border: 'var(--border-glass-strong)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Parties Involved</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <p style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '700', marginBottom: '0.25rem' }}>PETITIONER</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <User size={18} color="var(--text-secondary)" />
                                <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>{caseData.petitioner}</span>
                            </div>
                        </div>
                        <div style={{ height: '1px', background: 'var(--border-glass)' }}></div>
                        <div>
                            <p style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: '700', marginBottom: '0.25rem' }}>RESPONDENT</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <User size={18} color="var(--text-secondary)" />
                                <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>{caseData.respondent}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

function CaseFilesTab({ caseId }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Analysis & Verification state
    const [analysisMap, setAnalysisMap] = useState({});
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [analyzingIds, setAnalyzingIds] = useState([]);

    useEffect(() => {
        fetchAllFiles();
    }, [caseId]);

    const fetchAllFiles = async () => {
        try {
            // Fetch both Documents and Evidence
            const [docsRes, evidenceRes] = await Promise.all([
                documentAPI.getByCase(caseId),
                axios.get(`${API_BASE_URL}/api/evidence/case/${caseId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                })
            ]);

            const docs = docsRes.data || [];
            const evidence = evidenceRes.data?.evidence || [];

            // Normalize and merge
            const merged = [
                ...docs.map(d => ({ ...d, type: 'DOCUMENT', source: 'docs' })),
                ...evidence.map(e => ({
                    id: e.id,
                    fileName: e.title,
                    fileSize: 0,
                    uploadedAt: e.timestamp,
                    type: 'EVIDENCE',
                    source: 'evidence',
                    blockHash: e.blockHash,
                    blockIndex: e.blockIndex
                }))
            ].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

            setFiles(merged);

            // Check analysis for docs
            docs.forEach(checkAnalysis);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const checkAnalysis = async (doc) => {
        try {
            const res = await documentAPI.hasAnalysis(doc.id);
            if (res.data.hasAnalysis) {
                setAnalysisMap(prev => ({ ...prev, [doc.id]: true }));
            }
        } catch (e) { }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await documentAPI.upload(file, { caseId, category: 'CASE_DOCUMENT', description: 'Uploaded from Case Files' });
            if (res.data) {
                setFiles(prev => [{ ...res.data, type: 'DOCUMENT', source: 'docs' }, ...prev]);
                pollForAnalysis(res.data.id);
            } else {
                fetchAllFiles();
            }
        } catch (error) {
            console.error(error);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const pollForAnalysis = (docId) => {
        setAnalyzingIds(prev => [...prev, docId]);
        let attempts = 0;
        const interval = setInterval(async () => {
            attempts++;
            try {
                const res = await documentAPI.hasAnalysis(docId);
                if (res.data.hasAnalysis) {
                    setAnalysisMap(prev => ({ ...prev, [docId]: true }));
                    setAnalyzingIds(prev => prev.filter(id => id !== docId));
                    clearInterval(interval);
                }
            } catch (e) { }

            if (attempts > 20) {
                setAnalyzingIds(prev => prev.filter(id => id !== docId));
                clearInterval(interval);
            }
        }, 2000);
    };

    const viewAnalysis = async (doc) => {
        try {
            const res = await documentAPI.getAnalysis(doc.id);
            setSelectedAnalysis({ ...res.data, docName: doc.fileName });
            setShowAnalysisModal(true);
        } catch (e) {
            alert('Analysis not available yet');
        }
    };

    const downloadDoc = async (doc) => {
        try {
            if (doc.source === 'evidence') {
                alert('Evidence download not implemented yet. Verify on blockchain.');
                return;
            }
            const res = await documentAPI.download(doc.id);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) { console.error(e); alert('Download failed'); }
    };

    const downloadCertificate = (doc) => {
        alert(`Downloading Section 65B Certificate for: ${doc.fileName}\n(This would generate a signed PDF)`);
    };

    return (
        <div style={{ background: 'var(--bg-glass-strong)', borderRadius: '1.5rem', border: 'var(--border-glass-strong)', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>Case Files ({files.length})</h3>
                <label style={{
                    padding: '0.75rem 1.5rem', background: '#8b5cf6', borderRadius: '0.5rem',
                    color: 'white', fontWeight: '600', cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                    {uploading ? 'Uploading...' : 'Upload File'}
                    <input type="file" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
                </label>
            </div>

            {loading ? <Loader2 size={32} style={{ margin: '2rem auto', display: 'block' }} className="animate-spin" /> :
                files.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No files found.</p> :
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {files.map(doc => (
                            <div key={`${doc.source}-${doc.id}`} style={{ background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '1rem', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ padding: '0.75rem', background: doc.type === 'EVIDENCE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(139, 92, 246, 0.1)', borderRadius: '0.75rem' }}>
                                        {doc.type === 'EVIDENCE' ? <Shield size={24} color="#10b981" /> : <FileText size={24} color="#8b5cf6" />}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <p style={{ fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>{doc.fileName}</p>
                                            {doc.type === 'EVIDENCE' && (
                                                <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem', background: '#10b981', color: 'white', borderRadius: '99px', fontWeight: 'bold' }}>VERIFIED</span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                                            {doc.type === 'EVIDENCE' ? `Hash: ${doc.blockHash?.substring(0, 16)}...` : `${formatFileSize(doc.fileSize)} • ${formatDate(doc.uploadedAt)}`}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    {doc.source === 'docs' && (
                                        analysisMap[doc.id] ? (
                                            <button onClick={() => viewAnalysis(doc)} style={{ padding: '0.5rem 0.75rem', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '0.5rem', color: '#8b5cf6', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', fontWeight: '600' }}>
                                                <Sparkles size={14} /> AI Insights
                                            </button>
                                        ) : analyzingIds.includes(doc.id) ? (
                                            <div style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.5rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
                                                <Loader2 size={14} className="animate-spin" /> Analyzing...
                                            </div>
                                        ) : null
                                    )}

                                    {doc.type === 'EVIDENCE' && (
                                        <button onClick={() => downloadCertificate(doc)} style={{ padding: '0.5rem 0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '0.5rem', color: '#10b981', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', fontWeight: '600' }}>
                                            <FileCheck size={14} /> Certificate
                                        </button>
                                    )}

                                    <button onClick={() => downloadDoc(doc)} style={{ padding: '0.5rem', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '0.5rem', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Download size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>}

            {showAnalysisModal && selectedAnalysis && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }} onClick={() => setShowAnalysisModal(false)}>
                    <div style={{ background: 'var(--bg-glass-strong)', border: 'var(--border-glass-strong)', borderRadius: '1.5rem', width: '90%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-glass-strong)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '1.5rem', borderBottom: 'var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.5rem', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', borderRadius: '0.5rem', color: 'white' }}><Sparkles size={20} /></div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>AI Document Analysis</h3>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedAnalysis.docName}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAnalysisModal(false)}><X size={24} color="var(--text-secondary)" /></button>
                        </div>
                        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Document Type</h4>
                                <div style={{ padding: '0.75rem', background: 'var(--bg-glass)', borderRadius: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>
                                    {selectedAnalysis.documentType || 'General Document'}
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Key Entities Extracted</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {selectedAnalysis.extractedEntities ? (
                                        (typeof selectedAnalysis.extractedEntities === 'string'
                                            ? selectedAnalysis.extractedEntities.split(',')
                                            : Object.keys(selectedAnalysis.extractedEntities || {})
                                        ).map((entity, i) => (
                                            <span key={i} style={{ padding: '0.25rem 0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600' }}>
                                                {entity.replace(/[{}"]/g, '')}
                                            </span>
                                        ))
                                    ) : <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No entities detected</span>}
                                </div>
                            </div>

                            <div>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Analysis Summary</h4>
                                <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: '0.5rem', color: 'var(--text-main)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                    {selectedAnalysis.summary || 'No summary available.'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function TimelineTab({ caseData }) {
    // Generate dummy timeline for now based on case dates
    const timeline = [
        { date: caseData.nextHearing, title: 'Upcoming Hearing', type: 'future', icon: Clock },
        { date: new Date().toISOString(), title: 'Current Status: ' + caseData.status, type: 'current', icon: CheckCircle2 },
        { date: caseData.filedDate, title: 'Case Filed', type: 'past', icon: FileText },
    ].filter(e => e.date).sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '2rem' }}>Case Timeline</h3>
            <div style={{ position: 'relative', borderLeft: '2px solid var(--border-glass)', paddingLeft: '2rem', marginLeft: '1rem' }}>
                {timeline.map((event, i) => (
                    <div key={i} style={{ marginBottom: '2rem', position: 'relative' }}>
                        <div style={{
                            position: 'absolute', left: '-2.6rem', top: '0',
                            width: '2rem', height: '2rem', borderRadius: '50%',
                            background: event.type === 'future' ? 'var(--bg-glass)' : 'var(--color-accent)',
                            border: '2px solid var(--color-accent)', color: event.type === 'future' ? 'var(--color-accent)' : 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1
                        }}>
                            <event.icon size={14} />
                        </div>
                        <div style={{ background: 'var(--bg-glass-strong)', padding: '1.5rem', borderRadius: '1rem', border: 'var(--border-glass-strong)' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{formatDate(event.date)}</span>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', margin: '0.5rem 0' }}>{event.title}</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                {event.type === 'future' ? 'Scheduled event' : event.type === 'past' ? 'Completed successfully' : 'Ongoing phase'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
