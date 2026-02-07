import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
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
    'IN_PROGRESS': { bg: 'rgba(30, 42, 68, 0.1)', border: 'var(--color-primary)', text: 'var(--color-primary)' },
    'UNDER_REVIEW': { bg: 'rgba(30, 42, 68, 0.1)', border: 'var(--color-primary)', text: 'var(--color-primary)' },
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
                    style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: 'var(--color-primary)', border: 'none', borderRadius: '0.5rem', color: 'white', cursor: 'pointer' }}
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
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <span style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', background: urgencyStyle.bg, color: urgencyStyle.text, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            ⚡ {caseData.urgency} Priority
                        </span>
                        {/* Computed Status Heartbeat */}
                        {caseData.summonsStatus === 'PENDING' && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '0.35rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                ⚠️ Status Override: IN ADMISSION (Summons Pending)
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Tabs Navigation */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', marginBottom: '2rem', gap: '2rem' }}>
                {[
                    { id: 'overview', label: 'Overview', icon: FileText },
                    { id: 'files', label: 'Case Files', icon: FileCheck },
                    { id: 'timeline', label: 'Timeline', icon: Clock },
                    { id: 'health', label: 'Procedural Health', icon: Shield }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '1rem 0',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                            color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--text-secondary)',
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
            {activeTab === 'files' && <CaseFilesTab caseId={caseId} caseType={caseData.caseType} caseDescription={caseData.description} />}

            {/* TIMELINE TAB */}
            {activeTab === 'timeline' && <TimelineTab caseData={caseData} />}

            {/* PROCEDURAL HEALTH TAB */}
            {activeTab === 'health' && <ProceduralHealthTab caseData={caseData} />}

            {/* Chat Widget always visible */}
            <CaseChatWidget caseId={caseId} caseTitle={caseData.title} />

            {/* Hire Lawyer Modal */}
            {showHireModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setShowHireModal(false)}>
                    <div style={{
                        background: 'var(--bg-glass-strong)', width: '100%', maxWidth: '600px', maxHeight: '80vh',
                        padding: '2rem', borderRadius: '1.5rem', border: 'var(--border-glass-strong)',
                        overflow: 'hidden', display: 'flex', flexDirection: 'column'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                                    ⚖️ Hire a Lawyer
                                </h2>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                                    Select a verified legal professional
                                </p>
                            </div>
                            <button
                                onClick={() => setShowHireModal(false)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {lawyerLoading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                                    <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
                                </div>
                            ) : availableLawyers.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem' }}>
                                    <User size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
                                    <h4 style={{ color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>No Lawyers Available</h4>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        There are no verified lawyers accepting cases at the moment.
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {availableLawyers.map(lawyer => (
                                        <div key={lawyer.id} style={{
                                            background: 'var(--bg-glass)', border: 'var(--border-glass)',
                                            borderRadius: '1rem', padding: '1.25rem',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            transition: 'all 0.2s'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{
                                                    width: '50px', height: '50px', borderRadius: '50%',
                                                    background: 'var(--color-primary)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'white', fontWeight: '700', fontSize: '1.25rem'
                                                }}>
                                                    {lawyer.name?.charAt(0) || 'L'}
                                                </div>
                                                <div>
                                                    <h4 style={{ fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                                                        {lawyer.name}
                                                    </h4>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                                                        {lawyer.email}
                                                    </p>
                                                    {lawyer.specialization && (
                                                        <span style={{
                                                            display: 'inline-block', marginTop: '0.5rem',
                                                            padding: '0.2rem 0.5rem', background: 'rgba(30, 42, 68, 0.1)',
                                                            color: 'var(--color-primary)', borderRadius: '0.25rem',
                                                            fontSize: '0.75rem', fontWeight: '600'
                                                        }}>
                                                            {lawyer.specialization}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => submitProposal(lawyer.id)}
                                                style={{
                                                    padding: '0.625rem 1.25rem',
                                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                    border: 'none',
                                                    borderRadius: '0.5rem',
                                                    color: 'white',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                                }}
                                            >
                                                <Gavel size={16} /> Send Proposal
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
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
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(30, 42, 68, 0.03) 0%, rgba(30, 42, 68, 0.01) 100%)',
                        padding: '2rem',
                        borderRadius: '1.5rem',
                        border: '1px solid rgba(30, 42, 68, 0.1)',
                        boxShadow: '0 4px 20px rgba(30, 42, 68, 0.05)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '4px', height: '100%',
                            background: 'var(--color-primary)'
                        }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: 'rgba(30, 42, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Sparkles size={20} style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Vakil Friend Analysis</h3>
                        </div>
                        <div style={{ lineHeight: '1.8', color: 'var(--text-main)', fontSize: '1rem' }}>
                            <ReactMarkdown>{caseData.aiGeneratedSummary}</ReactMarkdown>
                        </div>
                    </div>
                )}

                {/* Client Consent Portal (Review & Approve Petition) */}
                {(caseData.documentStatus === 'PENDING_REVIEW' || caseData.status === 'DRAFT_PENDING_CLIENT' || (caseData.aiGeneratedSummary && caseData.status === 'PENDING')) && (
                    <div style={{
                        padding: '1.5rem',
                        borderRadius: '0.75rem',
                        background: 'rgba(30, 42, 68, 0.05)',
                        border: '1px solid rgba(30, 42, 68, 0.3)',
                        marginTop: '0.5rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <FileText size={24} color="var(--color-primary)" />
                            <h4 style={{ margin: 0, color: 'var(--text-main)' }}>
                                {caseData.aiGeneratedSummary && caseData.status === 'PENDING' ? 'AI Draft Ready for Review' : 'Review & Approve Petition'}
                            </h4>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            {caseData.aiGeneratedSummary && caseData.status === 'PENDING'
                                ? 'Vakil Friend has generated a case analysis. Approve it to create a formal case draft.'
                                : 'Your lawyer has submitted a draft petition. Please review and approve it to trigger the "Submit to Court" action for your lawyer.'}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to approve this draft? This will notify your lawyer.')) {
                                        import('../../services/api').then(({ caseAssignmentAPI, default: api }) => {
                                            api.put(`/api/cases/${caseData.id}/approve-draft`, { approved: true })
                                                .then(() => {
                                                    alert('Draft Approved! Your lawyer can now submit to court.');
                                                    window.location.reload();
                                                });
                                        });
                                    }
                                }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}>
                                Approve & E-Sign
                            </button>
                            <button style={{
                                padding: '0.5rem 1rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '0.5rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}>
                                Request Changes
                            </button>
                        </div>
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
                                <Scale size={16} color="var(--color-primary)" />
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
                            {/* Virtual Court Join Button - appears 15 min before hearing */}
                            {caseData.nextHearing && (() => {
                                const hearingTime = new Date(caseData.nextHearing);
                                const now = new Date();
                                const timeDiff = (hearingTime - now) / (1000 * 60); // difference in minutes
                                const showJoinButton = timeDiff <= 15 && timeDiff > -60; // 15 min before to 60 min after

                                return showJoinButton ? (
                                    <button
                                        onClick={() => window.open('https://meet.google.com/new', '_blank')}
                                        style={{
                                            marginTop: '0.5rem',
                                            padding: '0.5rem 1rem',
                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            color: 'white',
                                            fontWeight: '700',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            animation: 'pulse 2s infinite'
                                        }}
                                    >
                                        📹 Join VOIS 5G Virtual Court
                                    </button>
                                ) : null;
                            })()}
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
                                        background: 'var(--color-primary)',
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

function CaseFilesTab({ caseId, caseType, caseDescription }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Analysis & Verification state
    const [analysisMap, setAnalysisMap] = useState({});
    const [verificationMap, setVerificationMap] = useState({}); // Stores hash match result
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [analyzingIds, setAnalyzingIds] = useState([]);

    // Certificate Modal State
    const [showCertModal, setShowCertModal] = useState(false);
    const [certUrl, setCertUrl] = useState(null);
    const [certLoading, setCertLoading] = useState(false);

    // AI Suggestions State
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    useEffect(() => {
        fetchAllFiles();
        if (caseType && caseDescription) {
            fetchSuggestions();
        }
    }, [caseId, caseType]);

    const fetchSuggestions = async () => {
        setLoadingSuggestions(true);
        try {
            // We use the chat endpoint to get structured suggestions
            const prompt = `For a legal case of type '${caseType}' and description '${caseDescription ? caseDescription.substring(0, 200) : ''}...', list the top 3-5 mandatory documents required. Return ONLY a JSON array of strings, e.g., ["Driving License", "Insurance Policy"]. Do not include any other text.`;

            const response = await brainAPI.chat(prompt);
            const content = response.data.message || response.data.reply;

            // Try to extract JSON array from response
            const match = content.match(/\[.*\]/s);
            if (match) {
                const parsed = JSON.parse(match[0]);
                setSuggestions(parsed);
            } else {
                // Fallback: split by newlines if not JSON
                const lines = content.split('\n').filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./));
                setSuggestions(lines.map(l => l.replace(/^[-\d\.]+\s*/, '').trim()));
            }
        } catch (error) {
            console.error("Failed to fetch suggestions:", error);
            // Fallback defaults based on case type
            if (caseType === 'CIVIL') setSuggestions(["Property Deed", "Identity Proof", "Affidavit"]);
            else if (caseType === 'CRIMINAL') setSuggestions(["FIR Copy", "Witness Statements", "Medical Report"]);
            else setSuggestions(["Identity Proof", "Address Proof", "Relevant Contracts"]);
        } finally {
            setLoadingSuggestions(false);
        }
    };

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

            // Check analysis and verify hashes for docs
            docs.forEach(doc => {
                checkAnalysis(doc);
                verifyHash(doc);
            });
        } catch (e) {
            console.error(e);
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

    const viewCertificate = async (doc) => {
        setCertLoading(true);
        try {
            // Use different endpoint based on doc type
            const url = doc.source === 'evidence'
                ? `${API_BASE_URL}/api/evidence/${doc.id}/certificate`
                : `${API_BASE_URL}/api/documents/${doc.id}/certificate`;

            const response = await axios.get(url, {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            setCertUrl(blobUrl);
            setShowCertModal(true);
        } catch (e) {
            console.error('Certificate fetch failed:', e);
            alert('❌ Failed to load certificate. This document may not have verification data.');
        } finally {
            setCertLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* AI Suggested Documents Section */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '1rem',
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                    }}>
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e2a44', margin: 0 }}>
                            AI Suggested Documents
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                            Based on your case type <strong>{caseType}</strong>, Groq AI recommends uploading these:
                        </p>
                    </div>
                </div>

                {loadingSuggestions ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.9rem', padding: '1rem 0' }}>
                        <Loader2 size={18} className="animate-spin" />
                        Analyzing case details...
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                        {suggestions.length > 0 ? suggestions.map((doc, idx) => {
                            // Check if this document type is already uploaded (fuzzy match)
                            const isUploaded = files.some(f =>
                                f.fileName.toLowerCase().includes(doc.toLowerCase()) ||
                                (f.description && f.description.toLowerCase().includes(doc.toLowerCase()))
                            );

                            return (
                                <div key={idx} style={{
                                    background: isUploaded ? 'rgba(16, 185, 129, 0.1)' : 'white',
                                    border: isUploaded ? '1px solid #10b981' : '1px solid rgba(99, 102, 241, 0.2)',
                                    borderRadius: '0.75rem',
                                    padding: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transition: 'all 0.2s',
                                    opacity: isUploaded ? 0.8 : 1
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        {isUploaded ? (
                                            <CheckCircle2 size={18} color="#10b981" />
                                        ) : (
                                            <div style={{
                                                width: '18px', height: '18px', borderRadius: '50%',
                                                border: '2px solid #cbd5e1'
                                            }} />
                                        )}
                                        <span style={{
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            color: isUploaded ? '#059669' : '#334155',
                                            textDecoration: isUploaded ? 'line-through' : 'none'
                                        }}>
                                            {doc}
                                        </span>
                                    </div>
                                    {!isUploaded && (
                                        <label style={{ cursor: 'pointer', display: 'flex' }} title="Upload this document">
                                            <Upload size={16} color="#6366f1" />
                                            <input
                                                type="file"
                                                style={{ display: 'none' }}
                                                onChange={(e) => {
                                                    // Auto-fill description with suggestion name for better tracking
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setUploading(true);
                                                        documentAPI.upload(file, {
                                                            caseId,
                                                            category: 'EVIDENCE',
                                                            description: doc
                                                        }).then(res => {
                                                            setFiles(prev => [{ ...res.data, type: 'DOCUMENT', source: 'docs' }, ...prev]);
                                                            setUploading(false);
                                                        });
                                                    }
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                            );
                        }) : (
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No specific suggestions found.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Upload & List Section (Existing) */}
            <div style={{ background: 'var(--bg-glass-strong)', borderRadius: '1.5rem', border: 'var(--border-glass-strong)', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                        Uploaded Files ({files.length})
                    </h3>
                    <label style={{
                        padding: '0.75rem 1.5rem', background: 'var(--color-primary)', borderRadius: '0.5rem',
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
                            {files.map(doc => {
                                // Check if document has hash verification
                                const isVerified = doc.type === 'EVIDENCE' || verificationMap[doc.id] === true;
                                const showCertificate = doc.type === 'EVIDENCE' || verificationMap[doc.id] === true;

                                return (
                                    <div key={`${doc.source}-${doc.id}`} style={{ background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '1rem', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ padding: '0.75rem', background: isVerified ? 'rgba(16, 185, 129, 0.1)' : 'rgba(139, 92, 246, 0.1)', borderRadius: '0.75rem' }}>
                                                {isVerified ? <Shield size={24} color="#10b981" /> : <FileText size={24} color="#8b5cf6" />}
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <p style={{ fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>{doc.fileName}</p>
                                                    {isVerified && (
                                                        <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem', background: '#10b981', color: 'white', borderRadius: '99px', fontWeight: 'bold' }}>VERIFIED</span>
                                                    )}
                                                </div>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                                                    {doc.type === 'EVIDENCE'
                                                        ? `Hash: ${doc.blockHash?.substring(0, 16)}...`
                                                        : doc.fileHash
                                                            ? `Hash: ${doc.fileHash.substring(0, 16)}... • ${formatFileSize(doc.size)}`
                                                            : `${formatFileSize(doc.size)} • ${formatDate(doc.uploadedAt)}`
                                                    }
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

                                            {showCertificate && (
                                                <button onClick={() => viewCertificate(doc)} style={{ padding: '0.5rem 0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '0.5rem', color: '#10b981', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', fontWeight: '600' }}>
                                                    <FileCheck size={14} /> Certificate
                                                </button>
                                            )}

                                            <button onClick={() => downloadDoc(doc)} style={{ padding: '0.5rem', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '0.5rem', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
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
                                        background: 'none', border: 'none', color: '#a0a0a0', cursor: 'pointer', fontSize: '1.5rem'
                                    }}>
                                        ×
                                    </button>
                                </div>
                            </div>
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
            </div>
        </div>
    );
}

// Helper: Map event types to icons for Timeline
const getEventIcon = (eventType) => {
    const iconMap = {
        'POLICE_SUBMIT': FileText,
        'LAWYER_DRAFT_SAVE': Edit,
        'LITIGANT_APPROVE': CheckCircle2,
        'LITIGANT_REJECT': AlertTriangle,
        'JUDGE_COGNIZANCE': Gavel,
        'EVIDENCE_UPLOADED': Upload,
        'BSA_VALIDATED': Shield,
        'BSA_FAILED': AlertCircle,
        'SUMMONS_ISSUED': FileCheck,
        'SUMMONS_SERVED': CheckCircle,
        'HEARING_SCHEDULED': Calendar,
        'STATUS_CHANGE': RefreshCw,
        'STAGE_CHANGE': Gavel,
        'CASE_CREATED': FileText,
        'DOCUMENT_ANALYZED': Sparkles,
    };
    return iconMap[eventType] || Clock;
};

function TimelineTab({ caseData }) {
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [prepKitOpen, setPrepKitOpen] = useState(false);
    const [selectedStage, setSelectedStage] = useState(null);

    // Standard lifecycles
    const standardStages = {
        'CRIMINAL': [
            { id: 'FIR_FILED', label: 'FIR / Complaint Filed', desc: 'Case initiation' },
            { id: 'PENDING_COGNIZANCE', label: 'Cognizance', desc: 'Magistrate reviews FIR' },
            { id: 'APPEARANCE', label: 'Appearance', desc: 'Accused appears in court' },
            { id: 'CHARGES', label: 'Framing of Charges', desc: 'Charges read against accused' },
            { id: 'EVIDENCE', label: 'Prosecution Evidence', desc: 'Witnesses & Proof' },
            { id: 'DEFENCE', label: 'Defence Evidence', desc: 'Accused defence' },
            { id: 'ARGUMENTS', label: 'Final Arguments', desc: 'Lawyers debate merits' },
            { id: 'JUDGMENT', label: 'Judgment', desc: 'Final Verdict' }
        ],
        'CIVIL': [
            { id: 'FILING', label: 'Plaint Filed', desc: 'Case initiation' },
            { id: 'SUMMONS', label: 'Summons Served', desc: 'Notice to Respondent' },
            { id: 'WRITTEN_STATEMENT', label: 'Written Statement', desc: 'Reply filed' },
            { id: 'ISSUES', label: 'Framing of Issues', desc: 'Key points of dispute' },
            { id: 'EVIDENCE', label: 'Evidence', desc: 'Documents & Witnesses' },
            { id: 'ARGUMENTS', label: 'Arguments', desc: 'Final hearing' },
            { id: 'JUDGMENT', label: 'Judgment', desc: 'Decree passed' }
        ]
    };

    useEffect(() => {
        fetchTimeline();
    }, [caseData.id]);

    const fetchTimeline = async () => {
        try {
            const token = localStorage.getItem('token');

            // Fetch from BOTH legacy timeline AND new CaseEvents API
            const [timelineRes, eventsRes] = await Promise.allSettled([
                axios.get(`${API_BASE_URL}/api/timeline/${caseData.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/api/cases/${caseData.id}/events`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            // Merge both sources of events
            const legacyEvents = timelineRes.status === 'fulfilled' ? (timelineRes.value.data || []) : [];
            const caseEvents = eventsRes.status === 'fulfilled' ? (eventsRes.value.data || []) : [];

            // Map CaseEvents to timeline format
            const mappedCaseEvents = caseEvents.map(e => ({
                date: e.timestamp,
                title: e.summary || e.eventType.replace(/_/g, ' '),
                subtitle: `${e.actorRole}: ${e.actorName || 'System'}`,
                type: 'completed',
                icon: getEventIcon(e.eventType),
                eventType: e.eventType,
                actorRole: e.actorRole
            }));

            // Combine and deduplicate
            const actualEvents = [...legacyEvents.map(e => ({
                date: e.timestamp,
                title: e.event,
                subtitle: e.description || 'Completed',
                type: 'completed',
                icon: CheckCircle2
            })), ...mappedCaseEvents];

            // Sort by date
            actualEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

            // Determine lifecycle
            const lifecycle = standardStages[caseData.caseType] || standardStages['CIVIL'];

            // This is a simplification; in production, backend should return 'currentStageIndex'
            let currentStageIndex = 0;
            if (caseData.status === 'FIR_FILED') currentStageIndex = 1;
            else if (caseData.status === 'PENDING_COGNIZANCE') currentStageIndex = 1;
            else if (caseData.status === 'IN_PROGRESS') currentStageIndex = 2; // Appearance
            // ... logic to map status to stage ...

            const finalTimeline = [];

            {/* 1. Add Actual Past Events */ }
            actualEvents.forEach(e => {
                finalTimeline.push({
                    date: e.timestamp,
                    title: e.event,
                    subtitle: e.description || 'Completed',
                    type: 'completed',
                    icon: CheckCircle2
                });
            });

            // 2. Add Future Stages Logic (Roadmap Sync)
            // We map the caseData.status to an index in the standardStages array.
            // If status is specific (e.g. SUMMONS_SERVED), we know we are past that stage.

            let passedStageIndex = -1;

            // Map statuses to stages (Simple State Machine Mapper)
            if (caseData.status === 'FIR_FILED') passedStageIndex = 0;
            else if (caseData.status === 'PENDING_COGNIZANCE') passedStageIndex = 0;
            else if (caseData.status === 'SUMMONS_SERVED') passedStageIndex = 2; // Past Summons (Index 2 in Civil, check below)
            else if (caseData.status === 'READY_FOR_COURT') passedStageIndex = 0;
            else if (caseData.status === 'IN_PROGRESS') passedStageIndex = 1;

            // Adjust for Case Type specific mapping
            // CIVIL: Filing(0) -> Summons(1) -> Written Statement(2)...
            // CRIMINAL: FIR(0) -> Cognizance(1) -> Appearance(2)...

            // Dynamic check: Iterate standard stages and check if we have a matching 'completed' event
            lifecycle.forEach((stage, index) => {
                // Check if this stage is already covered by an actual event
                const isCompleted = finalTimeline.some(e =>
                    e.title.toUpperCase() === stage.label.toUpperCase() ||
                    e.title.includes(stage.id) ||
                    (stage.id === 'FILING' && caseData.filedDate) ||
                    (stage.id === 'COGNIZANCE' && caseData.status !== 'PENDING' && caseData.status !== 'FIR_FILED')
                );

                if (!isCompleted) {
                    finalTimeline.push({
                        date: null,
                        title: stage.label,
                        subtitle: stage.desc,
                        type: index === passedStageIndex + 1 ? 'active' : 'future', // Highlight next immediate step
                        icon: Clock,
                        stageId: stage.id,
                        description: `Step ${index + 1}: ${stage.desc}`
                    });
                }
            });

            setTimeline(finalTimeline);
        } catch (error) {
            console.error('Error fetching timeline:', error);
            // ... fallback logic remains ...

            // (Existing fallback logic preserved but omitted for brevity in replacement)
            const lifecycle = standardStages[caseData.caseType] || standardStages['CIVIL'];
            const mockEvents = [];

            // 1. Generate Past Events
            mockEvents.push({
                date: caseData.filedDate || new Date(Date.now() - 86400000 * 10).toISOString(),
                title: 'Case Filed',
                subtitle: 'Initial filing completed',
                type: 'completed',
                icon: FileText
            });

            // If Judge has taken cognizance (status is not just PENDING or FIR_FILED)
            if (['IN_PROGRESS', 'SUMMONS_SERVED', 'PENDING_COGNIZANCE'].includes(caseData.status)) {
                mockEvents.push({
                    date: new Date(Date.now() - 86400000 * 5).toISOString(),
                    title: caseData.caseType === 'CRIMINAL' ? 'Cognizance Taken' : 'Case Admitted',
                    subtitle: 'Court has accepted the case',
                    type: 'completed',
                    icon: Gavel
                });
            }

            // 2. Future Stages
            lifecycle.forEach((stage, i) => {
                // Skip if it looks like we already added it as past
                if (i === 0) return; // Alien assumption that filing determines 0
                if (i === 1 && mockEvents.length > 1) return; // Cognizance done

                mockEvents.push({
                    date: null,
                    title: stage.label,
                    subtitle: stage.desc,
                    type: 'future',
                    icon: Clock,
                    stageId: stage.id
                });
            });
            setTimeline(mockEvents);
        } finally {
            setLoading(false);
        }
    };

    const handleNodeClick = (event) => {
        if (event.type === 'future' || event.type === 'active') { // Enable for active too
            setSelectedStage(event);
            setPrepKitOpen(true);
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
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '2rem' }}>Live Case Roadmap</h3>

            <div style={{ position: 'relative', borderLeft: '2px solid var(--border-glass)', paddingLeft: '2rem', marginLeft: '1rem' }}>
                {timeline.map((event, i) => (
                    <div key={i} style={{ marginBottom: '2rem', position: 'relative' }}>
                        {/* Icon Node */}
                        <div
                            onClick={() => handleNodeClick(event)}
                            style={{
                                position: 'absolute', left: '-2.6rem', top: '0',
                                width: '2rem', height: '2rem', borderRadius: '50%',
                                background: event.type === 'completed' ? '#10b981' : (event.type === 'active' ? '#f59e0b' : 'var(--bg-glass)'),
                                border: `2px solid ${event.type === 'completed' ? '#10b981' : (event.type === 'active' ? '#f59e0b' : 'var(--text-secondary)')}`,
                                color: event.type === 'future' ? 'var(--text-secondary)' : 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
                                cursor: 'pointer', boxShadow: event.type === 'active' ? '0 0 10px rgba(245, 158, 11, 0.5)' : 'none'
                            }}
                        >
                            <event.icon size={16} />
                        </div>

                        {/* Event Content */}
                        <div style={{
                            opacity: event.type === 'future' ? 0.7 : 1,
                            transform: event.type === 'active' ? 'scale(1.02)' : 'scale(1)',
                            transition: 'all 0.3s'
                        }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: event.type === 'future' ? 'var(--text-secondary)' : 'var(--text-main)', margin: 0 }}>
                                {event.title}
                                {event.type === 'active' && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: '#f59e0b', color: 'white', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>CURRENT STAGE</span>}
                            </h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
                                {event.subtitle}
                            </p>
                            {event.date && (
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                    {formatDate(event.date)}
                                </p>
                            )}

                            {/* Prep Kit Trigger for Future/Active Events */}
                            {(event.type === 'future' || event.type === 'active') && (
                                <button
                                    onClick={() => handleNodeClick(event)}
                                    style={{
                                        marginTop: '0.5rem',
                                        fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-accent)',
                                        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '0.25rem'
                                    }}
                                >
                                    <Sparkles size={12} /> View Preparation Kit
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Preparation Kit Modal */}
            {prepKitOpen && selectedStage && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setPrepKitOpen(false)}>
                    <div style={{
                        background: 'var(--bg-glass-strong)', width: '100%', maxWidth: '500px',
                        padding: '1.5rem', borderRadius: '1.5rem', border: 'var(--border-glass-strong)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '0.75rem', color: '#8b5cf6' }}>
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>Preparation Kit</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>For {selectedStage.title}</p>
                            </div>
                        </div>

                        <div style={{ background: 'var(--bg-glass)', padding: '1rem', borderRadius: '1rem', marginBottom: '1rem' }}>
                            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>What to expect</h4>
                            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
                                {selectedStage.desc || selectedStage.description || "Prepare your documents and be ready to answer questions regarding this stage."}
                            </p>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Recommended Actions</h4>
                            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                <li>Review all filed documents related to this stage.</li>
                                <li>Consult with your lawyer 2 days prior.</li>
                                <li>Organize original copies of evidence.</li>
                            </ul>
                        </div>

                        <button onClick={() => setPrepKitOpen(false)} style={{
                            width: '100%', padding: '0.75rem', background: 'var(--color-accent)',
                            color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 'bold', cursor: 'pointer'
                        }}>
                            Got it, thanks!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

{/* Preparation Kit Modal - RE-ADDED CORRECTLY */ }
function PrepKitModal({ isOpen, onClose, stage }) {
    if (!isOpen || !stage) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }} onClick={onClose}>
            <div style={{ background: 'var(--bg-glass-strong)', border: 'var(--border-glass-strong)', borderRadius: '1.5rem', width: '90%', maxWidth: '500px', padding: '2rem', boxShadow: 'var(--shadow-glass-strong)' }} onClick={e => e.stopPropagation()}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: 'white' }}>
                        <Sparkles size={30} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>AI Hearing Prep Kit</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>For Stage: {stage.title}</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>WHAT TO EXPECT</h4>
                    <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                        <li>The judge will review {stage.subtitle?.toLowerCase() || 'this stage'}.</li>
                        <li>Your physical presence might be required.</li>
                        <li>Ensure all related documents are uploaded.</li>
                    </ul>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>RECOMMENDED ACTIONS</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle size={16} /> Review submitted evidence with lawyer
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertCircle size={16} /> Don't miss court date
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    style={{ width: '100%', padding: '1rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: '700', fontSize: '1rem', cursor: 'pointer' }}>
                    Got it!
                </button>
            </div>
        </div>
    );
}


{/* BSA 63(4) Generator Component - Mock Implementation of Section 63(4) Evidence Certification */ }
function BSA634GeneratorModal({ isOpen, onClose }) {
    const [step, setStep] = useState('SCAN'); // SCAN, HASH, SIGN, DONE

    useEffect(() => {
        if (isOpen && step === 'SCAN') {
            setTimeout(() => setStep('HASH'), 2000);
        }
        if (step === 'HASH') {
            setTimeout(() => setStep('SIGN'), 2000);
        }
    }, [isOpen, step]);

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(8px)' }} onClick={onClose}>
            <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '1.5rem', width: '90%', maxWidth: '500px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={24} /></button>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Shield size={48} color={step === 'DONE' ? '#10b981' : '#3b82f6'} style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>BSA Section 63(4) Generator</h2>
                    <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Digital Evidence Certification Utility</p>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', update: '1rem', marginBottom: '1rem', opacity: step === 'SCAN' ? 1 : 0.5 }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step === 'SCAN' ? '#3b82f6' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>1</div>
                        <div style={{ color: 'white' }}>Scanning Evidence Metadata...</div>
                        {step === 'SCAN' && <Loader2 size={16} className="spin" color="#3b82f6" />}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', opacity: step === 'HASH' ? 1 : 0.5 }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step === 'HASH' ? '#3b82f6' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>2</div>
                        <div style={{ color: 'white' }}>Generating SHA-256 Hash...</div>
                        {step === 'HASH' && <Loader2 size={16} className="spin" color="#3b82f6" />}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: (step === 'SIGN' || step === 'DONE') ? 1 : 0.5 }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: (step === 'SIGN' || step === 'DONE') ? '#3b82f6' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>3</div>
                        <div style={{ color: 'white' }}>Aadhaar e-Sign Verification</div>
                    </div>
                </div>

                {step === 'SIGN' && (
                    <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '1rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                            Please authenticate using Aadhaar e-Sign to certify the integrity of 4 evidence files.
                        </p>
                        <button
                            onClick={() => {
                                setStep('DONE');
                                // Mock API call update
                                setTimeout(() => {
                                    alert("Certificate Generated Successfully! (Mock)");
                                    onClose();
                                    window.location.reload();
                                }, 1000);
                            }}
                            style={{
                                width: '100%', padding: '1rem', background: '#3b82f6', color: 'white',
                                border: 'none', borderRadius: '0.75rem', fontWeight: 'bold', fontSize: '1rem',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
                            }}>
                            <img src="https://upload.wikimedia.org/wikipedia/en/c/cf/Aadhaar_Logo.svg" alt="Aadhaar" style={{ width: '24px', height: '24px' }} />
                            e-Sign with Aadhaar
                        </button>
                    </div>
                )}
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
        </div>
    );
}

/* PROCEDURAL HEALTH DOCUMENTATION TAB - VAKIL FRIEND COMPLIANT */
function ProceduralHealthTab({ caseData }) {
    const [lang, setLang] = useState('en');
    const [showBsaModal, setShowBsaModal] = useState(false); // NEW STATE

    useEffect(() => { if (localStorage.getItem('lang') === 'hi') setLang('hi'); }, []);
    const t = (text, hindi) => lang === 'hi' ? hindi : text;

    return (
        <div style={{ padding: '1rem' }}>
            {/* Modal */}
            <BSA634GeneratorModal isOpen={showBsaModal} onClose={() => setShowBsaModal(false)} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Shield size={28} color="#10b981" />
                        {t('Procedural Health & Compliance', 'प्रक्रियात्मक स्वास्थ्य और अनुपालन')}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {t('Ensure your case is ready for the next hearing.', 'सुनिश्चित करें कि आपका केस अगली सुनवाई के लिए तैयार है।')}
                    </p>
                </div>
                <div style={{ background: 'var(--bg-glass)', padding: '0.25rem', borderRadius: '0.5rem', border: 'var(--border-glass)', display: 'flex' }}>
                    {['en', 'hi'].map(l => (
                        <button key={l} onClick={() => setLang(l)} style={{ padding: '0.5rem 1rem', borderRadius: '0.35rem', border: 'none', background: lang === l ? 'var(--color-accent)' : 'transparent', color: lang === l ? 'white' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer' }}>{l.toUpperCase()}</button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{t('CRITICAL REQUIREMENTS', 'महत्वपूर्ण आवश्यकताएँ')}</h3>

                    <div style={{ background: caseData.hasBsaCert ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)', border: caseData.hasBsaCert ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: caseData.hasBsaCert ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                                {caseData.hasBsaCert ? <CheckCircle2 size={24} color="#10b981" /> : <AlertTriangle size={24} color="#ef4444" />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>{t('Section 63(4) BSA Certificate', 'धारा 63(4) BSA प्रमाणपत्र')}</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>
                                    {caseData.hasBsaCert ? t('Certificate provided and verified on blockchain.', 'प्रमाणपत्र प्रदान किया गया और ब्लॉकचेन पर सत्यापित किया गया।') : t('Required for admissibility of digital evidence. Missing certificate may lead to evidence rejection.', 'डिजिटल साक्ष्य की स्वीकार्यता के लिए आवश्यक। प्रमाणपत्र गायब होने से साक्ष्य अस्वीकार हो सकता है।')}
                                </p>
                                {!caseData.hasBsaCert && (
                                    <button onClick={() => setShowBsaModal(true)} style={{ padding: '0.75rem 1.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FileText size={16} /> {t('Generate & Sign Certificate', 'प्रमाणपत्र उत्पन्न और हस्ताक्षर करें')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ background: caseData.summonsStatus === 'SERVED' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)', border: caseData.summonsStatus === 'SERVED' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: caseData.summonsStatus === 'SERVED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)' }}>
                                {caseData.summonsStatus === 'SERVED' ? <CheckCircle2 size={24} color="#10b981" /> : <Clock size={24} color="#f59e0b" />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>{t('Summons Service Status', 'समन तामील स्थिति')}</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>
                                    {caseData.summonsStatus === 'SERVED' ? t('Summons successfully served to all respondents.', 'सभी प्रतिवादियों को समन सफलतापूर्वक तामील किया गया।') : t('Pending service. Court will not proceed until summons are served.', 'तामील लंबित है। समन तामील होने तक अदालत आगे नहीं बढ़ेगी।')}
                                </p>
                                {caseData.summonsStatus !== 'SERVED' && (
                                    <button style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#f59e0b', border: '1px solid #f59e0b', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>{t('Track Status', 'स्थिति ट्रैक करें')}</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ background: 'var(--bg-glass-strong)', borderRadius: '1.5rem', padding: '2rem', border: 'var(--border-glass-strong)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '1.5rem' }}>{t('Readiness Score', 'तैयारी स्कोर')}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                        <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#334155" strokeWidth="3" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={caseData.hasBsaCert && caseData.summonsStatus === 'SERVED' ? '#10b981' : '#f59e0b'} strokeWidth="3" strokeDasharray={`${(caseData.hasBsaCert ? 50 : 0) + (caseData.summonsStatus === 'SERVED' ? 50 : 0)}, 100`} />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>{(caseData.hasBsaCert ? 50 : 0) + (caseData.summonsStatus === 'SERVED' ? 50 : 0)}%</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ready</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: '1rem' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>IMPACT ANALYSIS</h4>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontStyle: 'italic' }}>{t('"Your case is currently halted at the Admission stage due to pending procedures. Resolving the red items will improve your readiness score."', '"लंबित प्रक्रियाओं के कारण आपका मामला वर्तमान में प्रवेश चरण में रुका हुआ है। लाल मदों को हल करने से आपके तैयारी स्कोर में सुधार होगा।"')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}



