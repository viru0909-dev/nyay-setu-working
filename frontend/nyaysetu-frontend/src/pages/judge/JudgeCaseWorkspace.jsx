import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, FileText, Calendar, User, Scale, Clock,
    Download, AlertCircle, CheckCircle, Loader2,
    Gavel, FileCheck, MessageSquare, Shield, Lock,
    Link2, RefreshCw, Eye, CheckCircle2, AlertTriangle,
    Upload, Trash2, Search, Filter, Grid, List as ListIcon, X,
    Edit, Sparkles, Save, Video, Users
} from 'lucide-react';
import { caseAPI, judgeAPI, documentAPI } from '../../services/api';
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
// HELPER COMPONENTS
// -----------------------------------------------------------------------------

const CaseLifecycleStepper = ({ currentStage }) => {
    const stages = ['COGNIZANCE', 'APPEARANCE', 'FRAMING_OF_CHARGES', 'EVIDENCE', 'ARGUMENTS', 'JUDGMENT', 'VERDICT'];
    // Default to first stage if undefined or not found
    const safeStage = currentStage || 'COGNIZANCE';
    const currentIndex = stages.indexOf(safeStage) !== -1 ? stages.indexOf(safeStage) : 0;

    return (
        <div style={{ marginTop: '2rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', minWidth: '800px' }}>
                {stages.map((stage, index) => (
                    <div key={stage} style={{ display: 'flex', alignItems: 'center', flex: index === stages.length - 1 ? 0 : 1 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: index <= currentIndex ? 'var(--color-accent)' : 'var(--bg-glass-strong)',
                                border: index <= currentIndex ? 'none' : '2px solid var(--border-glass)',
                                color: index <= currentIndex ? 'white' : 'var(--text-secondary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: '700', fontSize: '0.8rem', zIndex: 2,
                                boxShadow: index === currentIndex ? '0 0 0 4px rgba(99, 102, 241, 0.2)' : 'none'
                            }}>
                                {index + 1}
                            </div>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: index === currentIndex ? '800' : '600',
                                color: index === currentIndex ? 'var(--color-accent)' :
                                    index < currentIndex ? 'var(--text-main)' : 'var(--text-secondary)',
                                whiteSpace: 'nowrap'
                            }}>
                                {stage.replace(/_/g, ' ')}
                            </span>
                        </div>
                        {index < stages.length - 1 && (
                            <div style={{
                                height: '3px',
                                flex: 1,
                                background: index < currentIndex ? 'var(--color-accent)' : 'var(--border-glass)',
                                margin: '0 0.5rem',
                                transform: 'translateY(-14px)',
                                borderRadius: '2px'
                            }} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

export default function JudgeCaseWorkspace() {
    const { caseId } = useParams();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial Data Fetch
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
                    onClick={() => navigate('/judge/docket')}
                    style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: 'var(--color-accent)', border: 'none', borderRadius: '0.5rem', color: 'white', cursor: 'pointer' }}
                >
                    Back to My Docket
                </button>
            </div>
        );
    }

    const statusStyle = statusColors[caseData.status] || statusColors['PENDING'];
    const urgencyStyle = urgencyColors[caseData.urgency] || urgencyColors['NORMAL'];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '4rem' }}>
            {/* 1. Header Section */}
            <div style={{
                marginBottom: '2rem',
                background: 'linear-gradient(180deg, rgba(30, 42, 68, 0.03) 0%, rgba(255,255,255,0) 100%)',
                padding: '1.5rem',
                borderRadius: '1.5rem',
                border: '1px solid rgba(30, 42, 68, 0.05)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <button
                        onClick={() => navigate('/judge/docket')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={20} /> Back to Docket
                    </button>
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

                {/* Case Lifecycle Stepper */}
                <CaseLifecycleStepper currentStage={caseData.stage} />
            </div>

            {/* 2. Tabs Navigation */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', marginBottom: '2rem', gap: '2rem' }}>
                {[
                    { id: 'overview', label: 'Overview & AI Brief', icon: FileText },
                    { id: 'evidence', label: 'Evidence Vault', icon: Shield },
                    { id: 'orders', label: 'Orders & Judgments', icon: Gavel },
                    { id: 'hearings', label: 'Hearings', icon: Calendar },
                    { id: 'parties', label: 'Parties & Chat', icon: Users }
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
            {activeTab === 'overview' && <OverviewTab caseData={caseData} />}
            {activeTab === 'evidence' && <EvidenceTab caseId={caseId} />}
            {activeTab === 'orders' && <OrdersTab caseId={caseId} />}
            {activeTab === 'hearings' && <HearingsTab caseId={caseId} caseData={caseData} />}
            {activeTab === 'parties' && <PartiesTab caseData={caseData} caseId={caseId} />}

            {/* Chat Widget always visible */}
            <CaseChatWidget caseId={caseId} caseTitle={caseData.title} />
        </div>
    );
}

// -----------------------------------------------------------------------------
// TAB COMPONENTS
// -----------------------------------------------------------------------------

function OverviewTab({ caseData }) {
    const [aiSummary, setAiSummary] = useState(null);
    const [loadingAI, setLoadingAI] = useState(true);

    useEffect(() => {
        fetchAISummary();
    }, [caseData.id]);

    const fetchAISummary = async () => {
        try {
            const response = await judgeAPI.getAICaseSummary(caseData.id);
            setAiSummary(response.data);
        } catch (error) {
            console.error('Error fetching AI summary:', error); setAiSummary({ summary: 'AI summary unavailable. Please try regenerating.' });
        } finally {
            setLoadingAI(false);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
            {/* Left Column: Case Details & AI Brief */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Case Information */}
                <div style={{ background: 'var(--bg-glass-strong)', padding: '2rem', borderRadius: '1.5rem', border: 'var(--border-glass-strong)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Case Information</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                        <div style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '1rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <h4 style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '700', marginBottom: '0.5rem' }}>PETITIONER</h4>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)' }}>{caseData.petitioner}</div>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <h4 style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: '700', marginBottom: '0.5rem' }}>RESPONDENT</h4>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)' }}>{caseData.respondent}</div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Case Description</h4>
                        <p style={{ lineHeight: '1.7', color: 'var(--text-main)' }}>{caseData.description}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Case Type</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Scale size={16} color="var(--color-accent)" />
                                <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{caseData.caseType}</span>
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Filed Date</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calendar size={16} color="#10b981" />
                                <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{formatDate(caseData.filedDate)}</span>
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Next Hearing</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={16} color="#ef4444" />
                                <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{formatDate(caseData.nextHearing) || 'TBA'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Digital Court Master (Moved to Left) */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(99, 102, 241, 0.05))',
                    padding: '2rem',
                    borderRadius: '1.5rem',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(139, 92, 246, 0.2)' }}>
                        <div style={{ padding: '0.5rem', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', borderRadius: '0.75rem' }}>
                            <Sparkles size={24} color="white" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#8b5cf6', margin: 0 }}>AI Digital Court Master</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Pre-Hearing Briefing</p>
                        </div>
                    </div>

                    {loadingAI ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                            <Loader2 size={32} className="animate-spin" style={{ color: '#8b5cf6' }} />
                        </div>
                    ) : (
                        <div style={{
                            color: 'var(--text-main)',
                            lineHeight: '1.8',
                            fontSize: '0.95rem'
                        }}>
                            {(() => {
                                const summary = aiSummary?.summary || 'No AI summary available';
                                const lines = summary.split('\n');
                                return lines.map((line, idx) => {
                                    const trimmed = line.trim();
                                    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                                        const text = trimmed.replace(/\*\*/g, '');
                                        return (
                                            <h4 key={idx} style={{
                                                fontSize: '1.1rem', fontWeight: '700', color: '#8b5cf6',
                                                marginTop: idx === 0 ? 0 : '1.5rem', marginBottom: '0.75rem',
                                                paddingBottom: '0.5rem', borderBottom: '1px solid rgba(139, 92, 246, 0.15)'
                                            }}>{text}</h4>
                                        );
                                    }
                                    if (/^\d+\./.test(trimmed) || trimmed.startsWith('•') || trimmed.startsWith('-')) {
                                        return (
                                            <div key={idx} style={{
                                                marginLeft: '1.25rem', marginBottom: '0.5rem', paddingLeft: '0.75rem',
                                                borderLeft: '2px solid rgba(139, 92, 246, 0.2)'
                                            }}>{trimmed}</div>
                                        );
                                    }
                                    if (trimmed.includes('**')) {
                                        const parts = trimmed.split('**');
                                        return (
                                            <p key={idx} style={{ marginBottom: '0.75rem' }}>
                                                {parts.map((part, i) =>
                                                    i % 2 === 1 ? <strong key={i} style={{ color: '#6366f1' }}>{part}</strong> : part
                                                )}
                                            </p>
                                        );
                                    }
                                    if (trimmed.length > 0) {
                                        return <p key={idx} style={{ marginBottom: '0.75rem', color: 'var(--text-main)' }}>{trimmed}</p>;
                                    }
                                    return null;
                                });
                            })()}
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(139, 92, 246, 0.2)' }}>
                        <button onClick={fetchAISummary} style={{
                            flex: 1, padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '0.75rem',
                            color: '#8b5cf6', fontWeight: '600', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s'
                        }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'}
                            onMouseOut={e => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'}
                        >
                            <RefreshCw size={16} /> Regenerate
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Timeline (Moved to Right) */}
            <div style={{
                background: 'var(--bg-glass-strong)',
                padding: '2rem',
                borderRadius: '1.5rem',
                border: 'var(--border-glass-strong)',
                height: 'fit-content',
                maxHeight: '1000px',
                overflowY: 'auto'
            }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Case Timeline</h3>
                <TimelineDisplay caseId={caseData.id} />
            </div>
        </div>
    );
}

function EvidenceTab({ caseId }) {
    const [evidence, setEvidence] = useState([]);
    const [loading, setLoading] = useState(true);

    // AI Analysis State
    const [analysisMap, setAnalysisMap] = useState({});
    const [verificationMap, setVerificationMap] = useState({}); // Stores hash match result
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);

    // Certificate Modal State
    const [showCertModal, setShowCertModal] = useState(false);
    const [certUrl, setCertUrl] = useState(null);
    const [certLoading, setCertLoading] = useState(false);

    useEffect(() => {
        fetchEvidence();
    }, [caseId]);

    const fetchEvidence = async () => {
        try {
            const token = localStorage.getItem('token');
            const [evidenceRes, documentsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/evidence/case/${caseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/api/documents/case/${caseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const blockchainEvidence = (evidenceRes.data?.evidence || []).map(item => ({
                ...item,
                source: 'blockchain',
                isVerified: true, // Blockchain items are inherently verified
                evidenceType: 'BLOCKCHAIN_RECORD'
            }));

            const documents = (documentsRes.data || []).map(item => ({
                ...item,
                source: 'document',
                isVerified: false, // Will be updated by dynamic check
                evidenceType: 'CASE_DOCUMENT',
                createdAt: item.uploadedAt // Normalize date field
            }));

            // Merge and sort by date
            const merged = [...blockchainEvidence, ...documents]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setEvidence(merged);

            // Trigger dynamic checks
            documents.forEach(doc => {
                checkAnalysis(doc);
                verifyHash(doc);
            });

        } catch (error) {
            console.error('Error fetching evidence:', error);
            setEvidence([]);
        } finally {
            setLoading(false);
        }
    };

    const verifyHash = async (doc) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/api/documents/${doc.id}/verify-hash`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVerificationMap(prev => ({ ...prev, [doc.id]: res.data.valid }));
        } catch (e) {
            setVerificationMap(prev => ({ ...prev, [doc.id]: false }));
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

    const viewAnalysis = async (doc) => {
        try {
            const res = await documentAPI.getAnalysis(doc.id);
            setSelectedAnalysis({ ...res.data, docName: doc.title || doc.fileName });
            setShowAnalysisModal(true);
        } catch (e) {
            alert('Analysis not available yet');
        }
    };

    const downloadDoc = async (doc) => {
        try {
            if (doc.source === 'blockchain') {
                alert('Blockchain record cannot be downloaded as file. View Certificate instead.');
                return;
            }
            const res = await documentAPI.download(doc.id);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.fileName || `Document_${doc.id}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            console.error('Download error:', e);
            const msg = e.response?.data?.error || e.message || 'Unknown error';
            alert(`Download failed: ${msg}`);
        }
    };

    const viewCertificate = async (item) => {
        setCertLoading(true);
        try {
            const url = item.source === 'blockchain'
                ? `${API_BASE_URL}/api/evidence/${item.id}/certificate`
                : `${API_BASE_URL}/api/documents/${item.id}/certificate`;

            const token = localStorage.getItem('token');
            const response = await axios.get(url, {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` }
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const blobUrl = window.URL.createObjectURL(blob);
            setCertUrl(blobUrl);
            setShowCertModal(true);
        } catch (error) {
            console.error('Certificate fetch failed:', error);
            const msg = error.response?.statusText || error.message || 'Unknown error';
            alert(`❌ Failed to load certificate: ${msg}. This evidence may not have verification data.`);
        } finally {
            setCertLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
            </div>
        );
    }

    return (
        <>
            <div style={{ background: 'var(--bg-glass-strong)', borderRadius: '1.5rem', border: 'var(--border-glass-strong)', padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Evidence Vault</h3>
                        <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: '700' }}>
                            {evidence.length} FILE{evidence.length !== 1 ? 'S' : ''}
                        </span>
                    </div>
                    <label style={{
                        padding: '0.6rem 1rem', background: 'var(--color-primary)', borderRadius: '0.5rem',
                        color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        fontSize: '0.9rem'
                    }}>
                        <Upload size={16} /> Quick Upload
                        <input type="file" style={{ display: 'none' }} onChange={async (e) => {
                            if (!e.target.files[0]) return;
                            try {
                                const res = await documentAPI.upload(e.target.files[0], { caseId, category: 'EVIDENCE', description: 'Uploaded by Judge' });
                                alert('✅ File uploaded successfully!');
                                fetchEvidence(); // Refresh list
                            } catch (err) {
                                alert('Upload failed');
                                console.error(err);
                            }
                        }} />
                    </label>
                </div>

                {evidence.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <FileText size={64} color="var(--text-secondary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                        <h4 style={{ color: 'var(--text-secondary)', margin: 0 }}>No evidence found in this case</h4>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Evidence will appear here once uploaded</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1.25rem' }}>
                        {evidence.map((item) => {
                            const isVerifiedStatus = item.source === 'blockchain' || verificationMap[item.id];
                            const verificationText = item.source === 'blockchain'
                                ? 'TAMPER-PROOF'
                                : (verificationMap[item.id] === true
                                    ? 'TAMPER-PROOF'
                                    : (verificationMap[item.id] === false
                                        ? 'TAMPERED / UNVERIFIED'
                                        : 'VERIFYING...'));

                            return (
                                <div key={item.id} style={{
                                    background: 'var(--bg-glass)',
                                    border: `1px solid ${isVerifiedStatus ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                    borderRadius: '1.25rem',
                                    padding: '1.5rem',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* Verification Badge */}
                                    <div style={{
                                        position: 'absolute', top: 0, right: 0, padding: '0.5rem 1rem',
                                        background: isVerifiedStatus ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        borderBottomLeftRadius: '1rem',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        borderLeft: 'var(--border-glass)', borderBottom: 'var(--border-glass)'
                                    }}>
                                        {isVerifiedStatus ? <CheckCircle2 size={14} color="#10b981" /> : <AlertTriangle size={14} color="#ef4444" />}
                                        <span style={{
                                            fontSize: '0.7rem', fontWeight: '800',
                                            color: isVerifiedStatus ? '#4ade80' : '#f87171'
                                        }}>
                                            {verificationText}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                        <div style={{
                                            width: '56px', height: '56px', borderRadius: '12px',
                                            background: isVerifiedStatus ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                            border: `2px solid ${isVerifiedStatus ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                                        }}>
                                            {item.source === 'blockchain' ? <Shield size={28} color="#10b981" /> : (isVerifiedStatus ? <FileCheck size={28} color="#10b981" /> : <AlertTriangle size={28} color="#ef4444" />)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                                {item.blockIndex != null && (
                                                    <span style={{ color: '#6366f1', fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: '700' }}>BLOCK #{item.blockIndex}</span>
                                                )}
                                                <h4 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                                                    {item.title || item.fileName}
                                                </h4>
                                            </div>

                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0.5rem 0' }}>
                                                {item.description}
                                            </p>

                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <FileText size={14} />
                                                    <span>{item.evidenceType}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Link2 size={14} />
                                                    <span style={{ fontFamily: 'monospace' }}>{(item.blockHash || item.fileHash)?.substring(0, 16)}...</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Clock size={14} />
                                                    <span>{item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            {/* AI Analysis Button */}
                                            {item.source === 'document' && analysisMap[item.id] && (
                                                <button onClick={() => viewAnalysis(item)} style={{ padding: '0.5rem 0.75rem', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '0.5rem', color: '#8b5cf6', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', fontWeight: '600' }}>
                                                    <Sparkles size={14} /> AI Insights
                                                </button>
                                            )}

                                            {/* Certificate Button - Show for all hashed docs */}
                                            {(item.fileHash || item.blockHash) && (
                                                <button
                                                    onClick={() => viewCertificate(item)}
                                                    style={{
                                                        padding: '0.5rem 0.75rem',
                                                        background: 'rgba(16, 185, 129, 0.1)',
                                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                                        borderRadius: '0.5rem',
                                                        color: '#10b981',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        gap: '0.5rem',
                                                        alignItems: 'center',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                    title="Download Section 63(4) Certificate"
                                                >
                                                    <FileCheck size={14} />
                                                    View Certificate
                                                </button>
                                            )}

                                            {/* Download Button */}
                                            {item.source === 'document' && (
                                                <button
                                                    onClick={() => downloadDoc(item)}
                                                    style={{
                                                        padding: '0.5rem',
                                                        background: 'var(--bg-glass)',
                                                        border: '1px solid var(--border-glass)',
                                                        borderRadius: '0.5rem',
                                                        color: 'var(--text-secondary)',
                                                        cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}
                                                    title="Download Document"
                                                >
                                                    <Download size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Certificate Viewer Modal */}
            {showCertModal && certUrl && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                }} onClick={() => setShowCertModal(false)}>
                    <div style={{
                        background: '#1e1e1e', width: '90%', maxWidth: '900px', height: '90vh',
                        borderRadius: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }} onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '1rem 1.5rem', background: '#2d2d2d', borderBottom: '1px solid #404040',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Shield size={20} color="#10b981" /> Section 63(4) Evidence Certificate
                            </h3>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <a href={certUrl} download="Admissibility_Certificate.pdf" style={{
                                    padding: '0.5rem 1rem', background: '#10b981', color: 'white', borderRadius: '0.5rem',
                                    textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}>
                                    <Download size={16} /> Download PDF
                                </a>
                                <button onClick={() => setShowCertModal(false)} style={{
                                    background: 'none', border: 'none', color: '#a0a0a0', cursor: 'pointer'
                                }}>
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        {/* PDF View Area */}
                        <div style={{ flex: 1, background: '#525659' }}>
                            <iframe
                                src={certUrl}
                                title="Certificate Preview"
                                width="100%"
                                height="100%"
                                style={{ border: 'none' }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* AI Analysis Modal */}
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
                                    {Object.entries(selectedAnalysis.entities || {}).map(([key, value]) => (
                                        <span key={key} style={{ padding: '0.25rem 0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '0.25rem', fontSize: '0.8rem' }}>
                                            {key}: {value}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Summary & Key Points</h4>
                                <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: '0.75rem', lineHeight: '1.6', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                    {selectedAnalysis.summary}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function OrdersTab({ caseId }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDraftModal, setShowDraftModal] = useState(false);
    const [draftOrder, setDraftOrder] = useState({
        orderType: 'INTERIM',
        content: ''
    });

    const orderTemplates = {
        INTERIM: `IN THE HIGH COURT OF [STATE]

CASE NO: [CASE ID]

INTERIM ORDER

The Court, having heard the submissions and perused the records, is pleased to pass the following interim order:

1. [Order details]

2. This order shall remain in effect until [date/condition].

Date: ${new Date().toLocaleDateString('en-IN')}
[Judge Name]
Presiding Officer`,

        FINAL: `IN THE HIGH COURT OF [STATE]

CASE NO: [CASE ID]

FINAL JUDGMENT

Having considered all evidence, submissions, and applicable law, the Court hereby delivers its final judgment:

FINDINGS:
1. [Finding 1]
2. [Finding 2]

DECISION:
[Final decision]

RELIEF GRANTED:
[Relief details]

Date: ${new Date().toLocaleDateString('en-IN')}
[Judge Name]
Presiding Officer`,

        NOTICE: `IN THE HIGH COURT OF [STATE]

CASE NO: [CASE ID]

NOTICE

To: [Party Name]

You are hereby notified that:

[Notice content]

Failure to comply may result in [consequences].

Date: ${new Date().toLocaleDateString('en-IN')}
[Judge Name]
Presiding Officer`
    };

    useEffect(() => {
        fetchOrders();
    }, [caseId]);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/orders/case/${caseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(response.data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const openDraftModal = (type) => {
        setDraftOrder({
            orderType: type,
            content: orderTemplates[type]
        });
        setShowDraftModal(true);
    };

    const saveDraft = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/api/orders`, {
                caseId,
                orderType: draftOrder.orderType,
                content: draftOrder.content,
                status: 'DRAFT'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('✅ Order draft saved successfully!');
            setShowDraftModal(false);
            fetchOrders();
        } catch (error) {
            console.error('Error saving order:', error);
            alert('Failed to save order draft');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
            </div>
        );
    }

    return (
        <>
            <div style={{ background: 'var(--bg-glass-strong)', borderRadius: '1.5rem', border: 'var(--border-glass-strong)', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Orders & Judgments</h3>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={() => openDraftModal('INTERIM')}
                            style={{
                                padding: '0.75rem 1rem',
                                background: 'rgba(99, 102, 241, 0.1)',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                borderRadius: '0.75rem',
                                color: 'var(--color-accent)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            + Interim Order
                        </button>
                        <button
                            onClick={() => openDraftModal('FINAL')}
                            style={{
                                padding: '0.75rem 1rem',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                border: 'none',
                                borderRadius: '0.75rem',
                                color: 'white',
                                fontWeight: '700',
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                                fontSize: '0.9rem'
                            }}
                        >
                            + Final Judgment
                        </button>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <Gavel size={64} color="var(--text-secondary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                        <h4 style={{ color: 'var(--text-secondary)', margin: 0 }}>No orders drafted yet</h4>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Create your first order using the buttons above</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {orders.map(order => {
                            const statusColor = order.status === 'PUBLISHED' ? '#10b981' : order.status === 'DRAFT' ? '#f59e0b' : '#64748b';
                            return (
                                <div key={order.id} style={{
                                    background: 'var(--bg-glass)',
                                    border: 'var(--border-glass)',
                                    borderRadius: '1rem',
                                    padding: '1.5rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                                                    {order.orderType} Order
                                                </h4>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    background: `${statusColor}20`,
                                                    color: statusColor,
                                                    borderRadius: '9999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '700'
                                                }}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                                                Created: {new Date(order.createdAt).toLocaleDateString('en-IN')}
                                            </p>
                                        </div>
                                        <button style={{
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(99, 102, 241, 0.1)',
                                            border: '1px solid rgba(99, 102, 241, 0.3)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--color-accent)',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <Edit size={14} /> Edit
                                        </button>
                                    </div>
                                    <div style={{
                                        background: 'var(--bg-glass)',
                                        padding: '1rem',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.9rem',
                                        color: 'var(--text-secondary)',
                                        maxHeight: '150px',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                                            {order.content.substring(0, 300)}...
                                        </pre>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Draft Modal */}
            {showDraftModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setShowDraftModal(false)}>
                    <div style={{
                        background: 'var(--bg-glass-strong)', width: '90%', maxWidth: '800px', maxHeight: '90vh',
                        padding: '2rem', borderRadius: '1.5rem', border: 'var(--border-glass-strong)', overflow: 'auto'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                                📝 Draft {draftOrder.orderType} Order
                            </h2>
                            <button onClick={() => setShowDraftModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <textarea
                            value={draftOrder.content}
                            onChange={e => setDraftOrder({ ...draftOrder, content: e.target.value })}
                            style={{
                                width: '100%',
                                height: '400px',
                                padding: '1rem',
                                background: 'var(--bg-glass)',
                                border: 'var(--border-glass)',
                                borderRadius: '0.75rem',
                                color: 'var(--text-main)',
                                fontSize: '0.95rem',
                                fontFamily: 'monospace',
                                resize: 'vertical',
                                outline: 'none'
                            }}
                        />

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button
                                onClick={() => setShowDraftModal(false)}
                                style={{
                                    flex: 1, padding: '0.875rem', borderRadius: '0.75rem',
                                    background: 'var(--bg-glass)', border: 'var(--border-glass)',
                                    color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveDraft}
                                style={{
                                    flex: 2, padding: '0.875rem', borderRadius: '0.75rem',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                    border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                }}
                            >
                                <Save size={18} /> Save Draft
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function HearingsTab({ caseId, caseData }) {
    const navigate = useNavigate();
    const [hearings, setHearings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Schedule Modal State
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [hearingData, setHearingData] = useState({
        scheduledDate: '',
        scheduledTime: '10:00',
        durationMinutes: 60
    });

    // Jitsi State
    const [activeHearing, setActiveHearing] = useState(null);

    // Outcome / Daily Order Modal State
    const [showOutcomeModal, setShowOutcomeModal] = useState(false);
    const [selectedHearingForOutcome, setSelectedHearingForOutcome] = useState(null);
    const [outcomeData, setOutcomeData] = useState({
        outcomeType: 'HEARD',
        judgeNotes: '',
        nextStage: caseData?.stage || 'EVIDENCE',
        nextHearingDate: ''
    });

    useEffect(() => {
        fetchHearings();
    }, [caseId]);

    const fetchHearings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/hearings/case/${caseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHearings(response.data || []);
        } catch (error) {
            console.error('Error fetching hearings:', error);
        } finally {
            setLoading(false);
        }
    };

    const scheduleHearing = async () => {
        try {
            const dateTime = new Date(`${hearingData.scheduledDate}T${hearingData.scheduledTime}`);
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/api/hearings/schedule`, {
                caseId,
                scheduledDate: dateTime.toISOString(),
                durationMinutes: hearingData.durationMinutes
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('✅ Hearing scheduled successfully!');
            setShowScheduleModal(false);
            fetchHearings();
        } catch (error) {
            console.error('Error scheduling hearing:', error);
            alert('Failed to schedule hearing');
        }
    };

    const recordOutcome = async () => {
        try {
            const token = localStorage.getItem('token');

            const payload = {
                outcomeType: outcomeData.outcomeType,
                judgeNotes: outcomeData.judgeNotes,
                nextStage: outcomeData.nextStage,
            };

            if (outcomeData.outcomeType !== 'FINAL_VERDICT' && outcomeData.nextHearingDate) {
                payload.nextHearingDate = new Date(outcomeData.nextHearingDate).toISOString();
            }

            await axios.post(`${API_BASE_URL}/api/hearings/${selectedHearingForOutcome.id}/outcome`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('✅ Order recorded successfully & Case updated!');
            setShowOutcomeModal(false);
            fetchHearings();
            // Trigger a refresh of the parent page case details ideally, but for now we rely on user refresh or context
            window.location.reload();
        } catch (error) {
            console.error('Error recording outcome:', error);
            alert('Failed to record outcome. Please try again.');
        }
    };

    const openScheduleModal = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setHearingData({
            scheduledDate: tomorrow.toISOString().split('T')[0],
            scheduledTime: '10:00',
            durationMinutes: 60
        });
        setShowScheduleModal(true);
    };

    const openOutcomeModal = (hearing) => {
        setSelectedHearingForOutcome(hearing);
        // Pre-fill next hearing date to min 1 day after
        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 1);

        setOutcomeData({
            outcomeType: 'HEARD',
            judgeNotes: '',
            nextStage: caseData?.stage || 'EVIDENCE',
            nextHearingDate: nextDay.toISOString().split('T')[0]
        });
        setShowOutcomeModal(true);
    };

    const joinHearing = (hearing) => {
        setActiveHearing(hearing);
    };

    const endCall = () => {
        setActiveHearing(null);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
            </div>
        );
    }

    return (
        <>
            <div style={{ background: 'var(--bg-glass-strong)', borderRadius: '1.5rem', border: 'var(--border-glass-strong)', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Hearings</h3>
                    <button
                        onClick={openScheduleModal}
                        style={{
                            padding: '0.75rem 1.25rem',
                            background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                            border: 'none',
                            borderRadius: '0.75rem',
                            color: 'white',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Calendar size={18} /> Schedule Hearing
                    </button>
                </div>

                {hearings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <Calendar size={64} color="var(--text-secondary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                        <h4 style={{ color: 'var(--text-secondary)', margin: 0 }}>No hearings scheduled</h4>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Click "Schedule Hearing" to add one</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {hearings.map(hearing => {
                            const isPast = new Date(hearing.scheduledDate) < new Date();
                            const statusColor = hearing.status === 'COMPLETED' ? '#10b981' : isPast ? '#ef4444' : '#f59e0b';
                            // Show "Record Order" if scheduled or in progress, and not completed
                            const canRecordOrder = hearing.status !== 'COMPLETED';

                            return (
                                <div key={hearing.id} style={{
                                    background: 'var(--bg-glass)',
                                    border: 'var(--border-glass)',
                                    borderRadius: '1rem',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                            <Clock size={18} color={statusColor} />
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                                                {new Date(hearing.scheduledDate).toLocaleString('en-IN', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                })}
                                            </h4>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                background: `${statusColor}20`,
                                                color: statusColor,
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '700'
                                            }}>
                                                {hearing.status}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                                            Duration: {hearing.durationMinutes} minutes
                                            {hearing.judgeNotes && <span style={{ marginLeft: '1rem', color: 'var(--text-main)' }}>• Judge's Note: {hearing.judgeNotes}</span>}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        {!isPast && hearing.status === 'SCHEDULED' && (
                                            <button
                                                onClick={() => joinHearing(hearing)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: 'rgba(99, 102, 241, 0.1)',
                                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                                    borderRadius: '0.5rem',
                                                    color: 'var(--color-accent)',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}>
                                                <Video size={16} /> Join Hearing
                                            </button>
                                        )}

                                        {canRecordOrder && (
                                            <button
                                                onClick={() => openOutcomeModal(hearing)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: 'rgba(59, 130, 246, 0.1)', // Blue
                                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                                    borderRadius: '0.5rem',
                                                    color: '#3b82f6',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}>
                                                <Gavel size={16} /> Record Order
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Active Jitsi Video Call Modal - SAME AS BEFORE */}
            {activeHearing && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: '#0a0a0f',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 9999
                }}>
                    <div style={{
                        padding: '1rem 1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(20, 20, 30, 0.9)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: '800', fontSize: '0.875rem' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', animation: 'blink 1.5s infinite' }} />
                                LIVE SESSION
                            </div>
                            <div style={{ height: '20px', width: '1px', background: 'rgba(255, 255, 255, 0.2)' }} />
                            <span style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem' }}>
                                {caseData?.title || 'Court Hearing'}
                            </span>
                        </div>
                        <button
                            onClick={endCall}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                                border: 'none',
                                borderRadius: '0.75rem',
                                color: 'white',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
                            }}
                        >
                            <X size={18} /> End Session
                        </button>
                    </div>
                    <div style={{ flex: 1 }}>
                        <iframe
                            src={`https://meet.jit.si/${activeHearing.videoRoomId || 'nyaysetu-hearing-' + activeHearing.id}#config.prejoinConfig.enabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera","closedcaptions","desktop","fullscreen","fodeviceselection","hangup","chat","recording","raisehand","videoquality","filmstrip","tileview","settings"]`}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            allow="camera; microphone; fullscreen; display-capture; autoplay"
                            title="Court Hearing - NyaySetu"
                        />
                    </div>
                    <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
                </div>
            )}

            {/* Schedule Modal */}
            {showScheduleModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setShowScheduleModal(false)}>
                    <div style={{
                        background: 'var(--bg-glass-strong)', width: '100%', maxWidth: '480px', padding: '2rem',
                        borderRadius: '1.5rem', border: 'var(--border-glass-strong)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                                📅 Schedule Hearing
                            </h2>
                            <button onClick={() => setShowScheduleModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Case</label>
                                <input
                                    type="text"
                                    value={caseData?.title || ''}
                                    disabled
                                    style={{
                                        width: '100%', padding: '0.875rem', borderRadius: '0.75rem',
                                        background: 'var(--bg-glass)', border: 'var(--border-glass)',
                                        color: 'var(--text-secondary)', cursor: 'not-allowed'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Date</label>
                                    <input
                                        type="date"
                                        value={hearingData.scheduledDate}
                                        onChange={e => setHearingData({ ...hearingData, scheduledDate: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        style={{
                                            width: '100%', padding: '0.875rem', borderRadius: '0.75rem',
                                            background: 'var(--bg-glass)', border: 'var(--border-glass)',
                                            color: 'var(--text-main)', outline: 'none'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Time</label>
                                    <input
                                        type="time"
                                        value={hearingData.scheduledTime}
                                        onChange={e => setHearingData({ ...hearingData, scheduledTime: e.target.value })}
                                        style={{
                                            width: '100%', padding: '0.875rem', borderRadius: '0.75rem',
                                            background: 'var(--bg-glass)', border: 'var(--border-glass)',
                                            color: 'var(--text-main)', outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Duration</label>
                                <select
                                    value={hearingData.durationMinutes}
                                    onChange={e => setHearingData({ ...hearingData, durationMinutes: parseInt(e.target.value) })}
                                    style={{
                                        width: '100%', padding: '0.875rem', borderRadius: '0.75rem',
                                        background: 'var(--bg-glass)', border: 'var(--border-glass)',
                                        color: 'var(--text-main)', outline: 'none'
                                    }}
                                >
                                    <option value={30}>30 minutes</option>
                                    <option value={60}>1 hour</option>
                                    <option value={90}>1.5 hours</option>
                                    <option value={120}>2 hours</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    onClick={() => setShowScheduleModal(false)}
                                    style={{
                                        flex: 1, padding: '0.875rem', borderRadius: '0.75rem',
                                        background: 'var(--bg-glass)', border: 'var(--border-glass)',
                                        color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={scheduleHearing}
                                    style={{
                                        flex: 2, padding: '0.875rem', borderRadius: '0.75rem',
                                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                        border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                                    }}
                                >
                                    Schedule
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hearing Outcome / Record Order Modal */}
            {showOutcomeModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setShowOutcomeModal(false)}>
                    <div style={{
                        background: 'var(--bg-glass-strong)', width: '100%', maxWidth: '600px', padding: '2rem',
                        borderRadius: '1.5rem', border: 'var(--border-glass-strong)', maxHeight: '90vh', overflowY: 'auto'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    <Gavel size={20} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                                        Record Daily Order
                                    </h2>
                                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        Record findings and move case to next stage
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setShowOutcomeModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {/* Outcome Type */}
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                    Hearing Outcome
                                </label>
                                <select
                                    value={outcomeData.outcomeType}
                                    onChange={e => setOutcomeData({ ...outcomeData, outcomeType: e.target.value })}
                                    style={{
                                        width: '100%', padding: '0.875rem', borderRadius: '0.75rem',
                                        background: 'var(--bg-glass)', border: 'var(--border-glass)',
                                        color: 'var(--text-main)', outline: 'none'
                                    }}
                                >
                                    <option value="ADJOURNED">Adjourned</option>
                                    <option value="HEARD">Heard & Proceeded</option>
                                    <option value="EVIDENCE_RECORDED">Evidence Recorded</option>
                                    <option value="INTERIM_ORDER">Interim Order Passed</option>
                                    <option value="FINAL_VERDICT">Final Verdict</option>
                                </select>
                            </div>

                            {/* Status Stepper - Case Stage */}
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                    Move Case To Stage
                                </label>
                                <select
                                    value={outcomeData.nextStage}
                                    onChange={e => setOutcomeData({ ...outcomeData, nextStage: e.target.value })}
                                    style={{
                                        width: '100%', padding: '0.875rem', borderRadius: '0.75rem',
                                        background: 'var(--bg-glass)', border: 'var(--border-glass)',
                                        color: 'var(--text-main)', outline: 'none'
                                    }}
                                >
                                    <option value="COGNIZANCE">Cognizance</option>
                                    <option value="APPEARANCE">Appearance</option>
                                    <option value="FRAMING_OF_CHARGES">Framing of Charges</option>
                                    <option value="EVIDENCE">Evidence</option>
                                    <option value="ARGUMENTS">Arguments</option>
                                    <option value="JUDGMENT">Judgment</option>
                                    <option value="VERDICT">Verdict</option>
                                    <option value="CLOSED">Closed/Disposed</option>
                                </select>
                            </div>

                            {/* Judge Notes */}
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                    Bench Note / Summary (Roznama)
                                </label>
                                <textarea
                                    value={outcomeData.judgeNotes}
                                    onChange={e => setOutcomeData({ ...outcomeData, judgeNotes: e.target.value })}
                                    placeholder="Enter brief summary of proceedings..."
                                    rows={4}
                                    style={{
                                        width: '100%', padding: '0.875rem', borderRadius: '0.75rem',
                                        background: 'var(--bg-glass)', border: 'var(--border-glass)',
                                        color: 'var(--text-main)', outline: 'none', resize: 'vertical'
                                    }}
                                />
                            </div>

                            {/* Next Hearing Date */}
                            {outcomeData.outcomeType !== 'FINAL_VERDICT' && (
                                <div>
                                    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                        Next Hearing Date
                                    </label>
                                    <input
                                        type="date"
                                        value={outcomeData.nextHearingDate}
                                        onChange={e => setOutcomeData({ ...outcomeData, nextHearingDate: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        style={{
                                            width: '100%', padding: '0.875rem', borderRadius: '0.75rem',
                                            background: 'var(--bg-glass)', border: 'var(--border-glass)',
                                            color: 'var(--text-main)', outline: 'none'
                                        }}
                                    />
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    onClick={() => setShowOutcomeModal(false)}
                                    style={{
                                        flex: 1, padding: '0.875rem', borderRadius: '0.75rem',
                                        background: 'var(--bg-glass)', border: 'var(--border-glass)',
                                        color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={recordOutcome}
                                    style={{
                                        flex: 2, padding: '0.875rem', borderRadius: '0.75rem',
                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                        border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
                                    }}
                                >
                                    {outcomeData.outcomeType === 'FINAL_VERDICT' ? 'Pronounce Verdict' : 'Record Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Timeline Display Component
// Timeline Display Component
function TimelineDisplay({ caseId }) {
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTimeline();
    }, [caseId]);

    const fetchTimeline = async () => {
        try {
            const token = localStorage.getItem('token');
            // Fetch both standard timeline and audit logs
            const [timelineRes, auditRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/timeline/${caseId}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/audit/case/${caseId}`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const timelineEvents = (timelineRes.data || []).map(e => ({
                id: e.id,
                date: e.timestamp,
                title: e.event,
                source: 'SYSTEM',
                description: ''
            }));

            const auditEvents = (auditRes.data || []).map(e => ({
                id: e.id,
                date: e.timestamp,
                title: formatAuditTitle(e),
                source: e.role || 'SYSTEM',
                description: e.description
            }));

            // Merge and Sort with Filtering for "Message sent" spam
            const merged = [...timelineEvents, ...auditEvents]
                .filter(e => {
                    const title = (e.title || '').toLowerCase();
                    const desc = (e.description || '').toLowerCase();
                    const isSpam = title.includes('message sent') ||
                        title.includes('msg') ||
                        desc.includes('message sent') ||
                        (e.source === 'POLICE' && e.title === 'MESSAGE_SENT');
                    return !isSpam;
                })
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            // Remove duplicates if any
            setTimeline(merged);
        } catch (error) {
            console.error('Error fetching timeline:', error);
            setTimeline([]);
        } finally {
            setLoading(false);
        }
    };

    const formatAuditTitle = (e) => {
        if (e.role === 'POLICE' && (e.action === 'FIR_REGISTERED' || e.action === 'CASE_CREATED')) {
            return `POLICE: ${e.action}`;
        }
        if (e.role === 'JUDGE' && e.action === 'SUMMONS_ISSUED') {
            return `JUDGE: SUMMONS ISSUED`;
        }
        return e.action.replace(/_/g, ' ');
    };

    const getEventIcon = (event) => {
        const title = event.title.toLowerCase();
        const src = (event.source || '').toLowerCase();

        if (src === 'police') return Shield; // Badge for police
        if (title.includes('hearing')) return Clock;
        if (title.includes('filed')) return FileText;
        if (title.includes('judge') || src === 'judge') return Gavel;
        if (title.includes('summons')) return Gavel;
        return CheckCircle2;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
            </div>
        );
    }

    if (timeline.length === 0) {
        return (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                No timeline events yet
            </p>
        );
    }

    return (
        <div style={{ position: 'relative', borderLeft: '2px solid var(--border-glass)', paddingLeft: '2rem', marginLeft: '0.5rem' }}>
            {timeline.map((event, i) => {
                const Icon = getEventIcon(event);
                const isPast = new Date(event.date) < new Date();

                return (
                    <div key={event.id || i} style={{ marginBottom: '2rem', position: 'relative' }}>
                        <div style={{
                            position: 'absolute', left: '-2.5rem', top: '0',
                            width: '2rem', height: '2rem', borderRadius: '50%',
                            background: event.source === 'POLICE' ? '#ef4444' : (isPast ? 'var(--color-accent)' : 'var(--bg-glass)'),
                            border: `2px solid ${event.source === 'POLICE' ? '#ef4444' : 'var(--color-accent)'}`,
                            color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1
                        }}>
                            <Icon size={14} />
                        </div>
                        <div style={{ background: 'var(--bg-glass)', padding: '1rem', borderRadius: '0.75rem', border: 'var(--border-glass)' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                                {new Date(event.date).toLocaleString('en-IN', {
                                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', margin: '0.5rem 0 0 0' }}>
                                    {event.title}
                                </h4>
                                {event.source === 'POLICE' && <span style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', background: '#ef4444', color: 'white', fontWeight: 'bold' }}>POLICE</span>}
                            </div>
                            {event.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>{event.description}</p>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}


function PartiesTab({ caseData, caseId }) {
    const issueSummons = async () => {
        if (confirm("Issue digital summons to the Respondent? Task will be assigned to Police.")) {
            try {
                const token = localStorage.getItem('token');
                await axios.post(`${API_BASE_URL}/api/judge/cases/${caseId}/issue-summons`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Summons Issued! Police Dashboard updated.");
                window.location.reload();
            } catch (e) {
                console.error(e);
                alert("Failed to issue summons.");
            }
        }
    };

    return (
        <div style={{ background: 'var(--bg-glass-strong)', borderRadius: '1.5rem', border: 'var(--border-glass-strong)', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1rem' }}>Parties Involved</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                    <h4 style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '700', marginBottom: '0.5rem' }}>PETITIONER</h4>
                    <p style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)' }}>{caseData.petitioner}</p>
                    {caseData.lawyerName && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Represented by: {caseData.lawyerName}</p>}
                </div>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: '700', marginBottom: '0.5rem' }}>RESPONDENT</h4>
                        <button
                            onClick={issueSummons}
                            style={{
                                padding: '0.5rem 1rem', background: '#ef4444', color: 'white',
                                border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer',
                                fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}>
                            <Gavel size={14} /> Issue Digital Summons
                        </button>
                    </div>
                    <p style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)' }}>{caseData.respondent}</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Status: {caseData.summonsStatus || 'Not Served'}</p>
                </div>
            </div>
        </div>
    );
}
