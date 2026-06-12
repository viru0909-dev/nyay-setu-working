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
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../config/apiConfig';
import CaseChatWidget from '../../components/CaseChatWidget';
import { useTranslation } from 'react-i18next';
import CaseStepper from '../../components/common/CaseStepper';
import { t } from 'i18next';

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

// const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString('en-IN', {
//         day: 'numeric', month: 'short', year: 'numeric'
//     });
// };

const formatDate = (dateString, language = 'en') => {
    if (!dateString) return '-';

    const localeMap = {
        en: 'en-US',
        hi: 'hi-IN',
        mr: 'mr-IN',
        ta: 'ta-IN',
        te: 'te-IN'
    };

    const locale =
        localeMap[language] || 'en-US';

    return new Date(dateString).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
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
    const { t } = useTranslation('litigant');
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
            alert(t('caseDetail.caseUpdatedSuccessfully'));
        } catch (e) {
            console.error('Update failed:', e);
            alert(t('caseDetail.failedToUpdateCase'));
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
            alert(t('caseDetail.aiRefinementFailed'));
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
            setError(t('caseDetail.failedToLoadCaseDetails'));
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
            alert(t('caseDetail.failedToLoadLawyers'));
        } finally {
            setLawyerLoading(false);
        }
    };

    const submitProposal = async (lawyerId) => {
        try {
            await caseAssignmentAPI.proposeLawyer(caseId, lawyerId);
            alert(t('caseDetail.proposalSentSuccess'));
            setShowHireModal(false);
            fetchCaseDetails(); // Refresh to see if status updated
        } catch (error) {
            console.error('Error sending proposal:', error);
            alert(t('caseDetail.proposalSendFailed'));
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
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{error || t('caseDiary.caseNotFound')}</h2>
                <button
                    onClick={() => navigate('/litigant/case-diary')}
                    style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: 'var(--color-primary)', border: 'none', borderRadius: '0.5rem', color: 'white', cursor: 'pointer' }}
                >
                    {t('caseDiary.backToCaseDiary')}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <button
                        onClick={() => navigate('/litigant/case-diary')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={20} /> {t('caseDiary.backToDiary')}
                    </button>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={downloadCaseReport}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '0.5rem', color: '#10b981', fontWeight: '600', cursor: 'pointer' }}
                        >
                            <Download size={16} /> {t('caseDiary.downloadReport')}
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
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('caseDetail.caseId')}: {caseData.id}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <span style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', background: urgencyStyle.bg, color: urgencyStyle.text, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            ⚡ {t(`caseDetail.priority.${caseData.urgency.toLowerCase()}`)}
                        </span>
                        {/* Computed Status Heartbeat */}
                        {caseData.summonsStatus === 'PENDING' && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '0.35rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                {t('caseDiary.statusOverrideAdmission')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Tabs Navigation */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', marginBottom: '2rem', gap: '2rem' }}>
                {[
                    { id: 'overview', label: t('caseDetail.tabs.overview'), icon: FileText },
                    { id: 'files', label: t('caseDetail.tabs.caseFiles'), icon: FileCheck },
                    { id: 'timeline', label: t('caseDetail.tabs.timeline'), icon: Clock },
                    { id: 'health', label: t('caseDetail.tabs.proceduralHealth'), icon: Shield }
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
            {activeTab === 'overview' && <OverviewTab caseData={caseData} onHireLawyer={handleHireLawyer} onRefresh={fetchCaseDetails} />}

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
                                    ⚖️ {t('caseDetail.hireLawyer')}
                                </h2>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                                    {t('caseDetail.selectVerifiedLawyer')}
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
                                    <h4 style={{ color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>{t('caseDetail.noLawyersAvailable')}</h4>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        {t('caseDetail.noLawyersAvailableDescription')}
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
                                                <Gavel size={16} /> {t('caseDetail.sendProposal')}
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

function OverviewTab({ caseData, onHireLawyer, onRefresh }) {
    const { t, i18n } = useTranslation('litigant');
    return (
        <div>
            {/* 7-Stage Judicial Workflow Stepper */}
            <CaseStepper currentStatus={caseData.status} judicialStage={caseData.currentJudicialStage} />

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Description */}
                    <div style={{ background: 'var(--bg-glass-strong)', padding: '2rem', borderRadius: '1.5rem', border: 'var(--border-glass-strong)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1rem' }}>{t('caseDetail.caseDescription')} </h3>
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
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>{t('caseDetail.aiAnalysis')}</h3>
                            </div>
                            <div style={{ lineHeight: '1.8', color: 'var(--text-main)', fontSize: '1rem' }}>
                                <ReactMarkdown>{caseData.aiGeneratedSummary}</ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {/* Client Consent Portal (Review & Approve Petition) */}
                    {((caseData.status === 'DRAFT_PENDING_CLIENT') || (caseData.aiGeneratedSummary && caseData.status === 'PENDING')) && (
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
                                    {caseData.aiGeneratedSummary && caseData.status === 'PENDING' ? t('caseDetail.aiDraftReady') : t('caseDetail.reviewApprovePetition')}
                                </h4>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                {caseData.aiGeneratedSummary && caseData.status === 'PENDING'
                                    ? t('caseDetail.aiDraftDescription')
                                    : t('caseDetail.lawyerDraftDescription')}
                            </p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => {
                                        if (confirm(t('caseDetail.confirmApproveDraft'))) {
                                            caseAPI.reviewDraft(caseData.id, true, "Approved by client")
                                                .then(() => {
                                                    alert(t('caseDetail.draftApproved'));
                                                    if (onRefresh) onRefresh();
                                                })
                                                .catch(err => {
                                                    console.error('Failed to approve:', err);
                                                    alert(t('caseDetail.failedApproveDraft'));
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
                                    {t('caseDetail.approveESign')}
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
                                    {t('caseDetail.requestChanges')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>


                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Key Details Card */}
                    <div style={{ background: 'var(--bg-glass-strong)', padding: '1.5rem', borderRadius: '1.5rem', border: 'var(--border-glass-strong)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>{t('caseDetail.keyDetails')}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{t('caseDetail.caseType')}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Scale size={16} color="var(--color-primary)" />
                                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{caseData.caseType}</span>
                                </div>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{t('caseDetail.filedDate')}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Calendar size={16} color="#10b981" />
                                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{formatDate(caseData.filedDate)}</span>
                                </div>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{t('caseDetail.nextHearing')}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Clock size={16} color="#ef4444" />
                                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{formatDate(caseData.nextHearing) || t('caseDetail.toBeAnnounced')}</span>
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
                                            📹 {t('caseDetail.joinVirtualCourt')}
                                        </button>
                                    ) : null;
                                })()}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{t('caseDetail.assignedJudge')}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Gavel size={16} color="#f59e0b" />
                                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{caseData.assignedJudge || t('caseDetail.pendingAssignment')}</span>
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
                                        {t('caseDetail.hireLawyer')}
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
                                        {t('caseDetail.proposalSent')}
                                    </div>
                                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{t('caseDetail.waitingLawyerResponse')} </p>
                                </div>
                            )}

                            {/* Assigned Lawyer Display */}
                            {caseData.assignedLawyer && (
                                <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: 'var(--border-glass)' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('caseDetail.legalRepresentative')} </p>
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
                                                {caseData.lawyerName || t('caseDetail.privateCounsel')}
                                            </p>
                                            <p style={{ fontSize: '0.8rem', color: '#10b981', margin: 0 }}>
                                                {t('caseDetail.caseAccepted')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Parties Card */}
                    <div style={{ background: 'var(--bg-glass-strong)', padding: '1.5rem', borderRadius: '1.5rem', border: 'var(--border-glass-strong)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>{t('caseDetail.partiesInvolved')}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '700', marginBottom: '0.25rem' }}>{t('caseDetail.petitioner')}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <User size={18} color="var(--text-secondary)" />
                                    <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>{caseData.petitioner}</span>
                                </div>
                            </div>
                            <div style={{ height: '1px', background: 'var(--border-glass)' }}></div>
                            <div>
                                <p style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: '700', marginBottom: '0.25rem' }}>{t('caseDetail.respondent')}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <User size={18} color="var(--text-secondary)" />
                                    <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>{caseData.respondent}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div>
    );
}

function CaseFilesTab({ caseId, caseType, caseDescription }) {
    const { t,i18n } = useTranslation('litigant');
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
            // Use dedicated suggestion endpoint
            const response = await brainAPI.getSuggestedDocuments({
                caseType: caseType || 'Legal Case',
                description: caseDescription || ''
            });

            if (response.data && response.data.suggestions) {
                setSuggestions(response.data.suggestions);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error("Failed to fetch suggestions:", error);
            // Fallback defaults based on case type if API fails
            if (caseType === 'CIVIL') setSuggestions(["Property Deed", "Identity Proof", "Affidavit"]);
            else if (caseType === 'CRIMINAL') setSuggestions(["FIR Copy", "Witness Statements", "Medical Report"]);
            else setSuggestions(["Identity Proof", "Address Proof", "Relevant Contracts"]);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    // Smart Deduplication Logic (Token Overlap)
    const isDocumentPresent = (suggestion, uploadedFiles) => {
        // Normalize: lowercase, remove special chars
        const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9\s]/g, '');
        const suggestionTokens = normalize(suggestion).split(/\s+/).filter(t => t.length > 2); // Filter small words

        return uploadedFiles.some(file => {
            const fileTokens = normalize(file.fileName).split(/\s+/).concat(
                file.description ? normalize(file.description).split(/\s+/) : []
            );

            // Check for overlap
            const matchCount = suggestionTokens.filter(token => fileTokens.includes(token)).length;

            // Match if > 50% of significant suggestion tokens are present
            return matchCount >= Math.ceil(suggestionTokens.length * 0.5);
        });
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
            const res = await documentAPI.upload(file, { caseId, category: 'CASE_DOCUMENT', description: t('caseDetail.uploadedFromCaseFiles') });
            if (res.data) {
                setFiles(prev => [{ ...res.data, type: 'DOCUMENT', source: 'docs' }, ...prev]);
                pollForAnalysis(res.data.id);
            } else {
                fetchAllFiles();
            }
        } catch (error) {
            console.error(error);
            alert(t('caseDetail.uploadFailed'));
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
            alert(t('caseDetail.analysisNotAvailable'))
        }
    };

    const downloadDoc = async (doc) => {
        try {
            if (doc.source === 'evidence') {
                alert(t('caseDetail.evidenceDownloadUnavailable'));
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
        } catch (e) { console.error(e); alert(t('caseDetail.downloadFailed'));; }
    };

    const viewCertificate = async (doc) => {
        setCertLoading(true);
        try {
            // Use different endpoint based on doc type
            const url = doc.source === 'evidence'
                ? `${API_BASE_URL}/api/v1/evidence/${doc.id}/certificate`
                : `${API_BASE_URL}/api/v1/documents/${doc.id}/certificate`;

            const response = await axios.get(url, {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            setCertUrl(blobUrl);
            setShowCertModal(true);
        } catch (e) {
            console.error('Certificate fetch failed:', e);
            alert(t('caseDetail.certificateLoadFailed'));
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
                            {t('caseDetail.aiSuggestedDocuments')}
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                            {t('caseDetail.basedOnCaseType')} <strong>{caseType}</strong>, {t('caseDetail.aiRecommendsDocuments')}
                        </p>
                    </div>
                </div>

                {loadingSuggestions ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.9rem', padding: '1rem 0' }}>
                        <Loader2 size={18} className="animate-spin" />
                        {t('caseDetail.analyzingCaseDetails')}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        <AnimatePresence>
                            {suggestions.length > 0 ? suggestions.map((doc, idx) => {
                                const isUploaded = isDocumentPresent(doc, files);

                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        style={{
                                            background: isUploaded ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.6)',
                                            border: isUploaded ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(99, 102, 241, 0.15)',
                                            borderRadius: '0.75rem',
                                            padding: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            backdropFilter: 'blur(8px)',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                                            {isUploaded ? (
                                                <div style={{ padding: '0.25rem', background: '#d1fae5', borderRadius: '50%' }}>
                                                    <CheckCircle2 size={18} color="#059669" />
                                                </div>
                                            ) : (
                                                <div style={{
                                                    width: '20px', height: '20px', borderRadius: '50%',
                                                    border: '2px solid #cbd5e1', background: 'white'
                                                }} />
                                            )}
                                            <span style={{
                                                fontWeight: '600',
                                                fontSize: '0.9rem',
                                                color: isUploaded ? '#059669' : '#1e293b',
                                                textDecoration: isUploaded ? 'line-through' : 'none',
                                                opacity: isUploaded ? 0.8 : 1
                                            }}>
                                                {doc}
                                            </span>
                                        </div>
                                        {!isUploaded && (
                                            <label style={{ cursor: 'pointer', display: 'flex', padding: '0.4rem', borderRadius: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', transition: 'background 0.2s' }} title={t('caseDetail.uploadThisDocument')}>
                                                <Upload size={16} color="#6366f1" />
                                                <input
                                                    type="file"
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => {
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
                                    </motion.div>
                                );
                            }) : (
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{t('caseDetail.noSuggestionsFound')}</p>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Upload & List Section (Existing) */}
            <div style={{ background: 'var(--bg-glass-strong)', borderRadius: '1.5rem', border: 'var(--border-glass-strong)', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                        {t('caseDetail.uploadedFiles')} ({files.length})
                    </h3>
                    <label style={{
                        padding: '0.75rem 1.5rem', background: 'var(--color-primary)', borderRadius: '0.5rem',
                        color: 'white', fontWeight: '600', cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                        {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                        {uploading ? t('caseDetail.uploading') : t('caseDetail.uploadFile')}
                        <input type="file" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
                    </label>
                </div>

                {loading ? <Loader2 size={32} style={{ margin: '2rem auto', display: 'block' }} className="animate-spin" /> :
                    files.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{t('caseDetail.noFilesFound')}</p> :
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {files.map(doc => {
                                // Check if document has hash verification
                                const isVerified = doc.type === 'EVIDENCE' || verificationMap[doc.id] === true || !!doc.fileHash;
                                const showCertificate = doc.type === 'EVIDENCE' || verificationMap[doc.id] === true || !!doc.fileHash;

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
                                                        <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem', background: '#10b981', color: 'white', borderRadius: '99px', fontWeight: 'bold' }}>{t('caseDetail.verified')}</span>
                                                    )}
                                                </div>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                                                    {doc.type === 'EVIDENCE'
                                                        ? `Hash: ${doc.blockHash?.substring(0, 16)}...`
                                                        : doc.fileHash
                                                            ? `Hash: ${doc.fileHash.substring(0, 16)}... • ${formatFileSize(doc.size)}`
                                                            : `${formatFileSize(doc.size)} • ${formatDate(doc.uploadedAt,i18n.language)}`
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            {doc.source === 'docs' && (
                                                analysisMap[doc.id] ? (
                                                    <button onClick={() => viewAnalysis(doc)} style={{ padding: '0.5rem 0.75rem', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '0.5rem', color: '#8b5cf6', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', fontWeight: '600' }}>
                                                        <Sparkles size={14} /> {t('caseDetail.aiInsights')}
                                                    </button>
                                                ) : analyzingIds.includes(doc.id) ? (
                                                    <div style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.5rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
                                                        <Loader2 size={14} className="animate-spin" /> {t('caseDetail.certificate')}
                                                    </div>
                                                ) : null
                                            )}

                                            {showCertificate && (
                                                <button onClick={() => viewCertificate(doc)} style={{ padding: '0.5rem 0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '0.5rem', color: '#10b981', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', fontWeight: '600' }}>
                                                    <FileCheck size={14} /> {t('caseDetail.certificate')}
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
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>{t('caseDetail.aiDocumentAnalysis')}</h3>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedAnalysis.docName}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowAnalysisModal(false)}><X size={24} color="var(--text-secondary)" /></button>
                            </div>
                            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{t('caseDetail.documentType')}</h4>
                                    <div style={{ padding: '0.75rem', background: 'var(--bg-glass)', borderRadius: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>
                                        {selectedAnalysis.documentType || t('caseDetail.generalDocument')}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{t('caseDetail.keyEntitiesExtracted')}</h4>
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
                                        ) : <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>{t('caseDetail.noEntitiesDetected')}</span>}
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{t('caseDetail.analysisSummary')}</h4>
                                    <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: '0.5rem', color: 'var(--text-main)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                        {selectedAnalysis.summary || t('caseDetail.noSummaryAvailable')}
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
                                    <Shield size={20} color="#10b981" /> {t('caseDetail.evidenceCertificate')}
                                </h3>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <a href={certUrl} download="Admissibility_Certificate.pdf" style={{
                                        padding: '0.5rem 1rem', background: '#10b981', color: 'white', borderRadius: '0.5rem',
                                        textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                    }}>
                                        <Download size={16} /> {t('caseDetail.downloadPdf')}
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
                                    title={t('caseDetail.certificatePreview')}
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
    const { t,i18n } = useTranslation('litigant');
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [prepKitOpen, setPrepKitOpen] = useState(false);
    const [selectedStage, setSelectedStage] = useState(null);

    // Standard lifecycles
    const standardStages = {
        CRIMINAL: [
            {
                id: 'FIR_FILED',
                label: t('caseDetail.timelineStages.firFiled'),
                desc: t('caseDetail.timelineStages.caseInitiation')
            },
            {
                id: 'PENDING_COGNIZANCE',
                label: t('caseDetail.timelineStages.cognizance'),
                desc: t('caseDetail.timelineStages.magistrateReviewsFir')
            },
            {
                id: 'APPEARANCE',
                label: t('caseDetail.timelineStages.appearance'),
                desc: t('caseDetail.timelineStages.accusedAppears')
            },
            {
                id: 'CHARGES',
                label: t('caseDetail.timelineStages.framingCharges'),
                desc: t('caseDetail.timelineStages.chargesRead')
            },
            {
                id: 'EVIDENCE',
                label: t('caseDetail.timelineStages.prosecutionEvidence'),
                desc: t('caseDetail.timelineStages.witnessProof')
            },
            {
                id: 'DEFENCE',
                label: t('caseDetail.timelineStages.defenceEvidence'),
                desc: t('caseDetail.timelineStages.accusedDefence')
            },
            {
                id: 'ARGUMENTS',
                label: t('caseDetail.timelineStages.finalArguments'),
                desc: t('caseDetail.timelineStages.lawyersDebate')
            },
            {
                id: 'JUDGMENT',
                label: t('caseDetail.timelineStages.judgment'),
                desc: t('caseDetail.timelineStages.finalVerdict')
            }
        ],

        CIVIL: [
            {
                id: 'FILING',
                label: t('caseDetail.timelineStages.plaintFiled'),
                desc: t('caseDetail.timelineStages.caseInitiation')
            },
            {
                id: 'SUMMONS',
                label: t('caseDetail.timelineStages.summonsServed'),
                desc: t('caseDetail.timelineStages.noticeRespondent')
            },
            {
                id: 'WRITTEN_STATEMENT',
                label: t('caseDetail.timelineStages.writtenStatement'),
                desc: t('caseDetail.timelineStages.replyFiled')
            },
            {
                id: 'ISSUES',
                label: t('caseDetail.timelineStages.framingIssues'),
                desc: t('caseDetail.timelineStages.keyDisputePoints')
            },
            {
                id: 'EVIDENCE',
                label: t('caseDetail.timelineStages.evidence'),
                desc: t('caseDetail.timelineStages.documentsWitnesses')
            },
            {
                id: 'ARGUMENTS',
                label: t('caseDetail.timelineStages.arguments'),
                desc: t('caseDetail.timelineStages.finalHearing')
            },
            {
                id: 'JUDGMENT',
                label: t('caseDetail.timelineStages.judgment'),
                desc: t('caseDetail.timelineStages.decreePassed')
            }
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
                axios.get(`${API_BASE_URL}/api/v1/timeline/${caseData.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/api/v1/cases/${caseData.id}/events`, {
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
                subtitle: `${e.actorRole}: ${e.actorName || t('caseDetail.system')}`,
                type: 'completed',
                icon: getEventIcon(e.eventType),
                eventType: e.eventType,
                actorRole: e.actorRole
            }));

            // Combine and deduplicate
            const actualEvents = [...legacyEvents.map(e => ({
                date: e.timestamp,
                title: e.event,
                subtitle: e.description || t('caseDetail.completed'),
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
                    subtitle: e.description || t('caseDetail.completed'),
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
                        description: `${t('caseDetail.step')} ${index + 1}: ${stage.desc}`
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
                title: t('caseDetail.timeline.caseFiled'),
                subtitle: t('caseDetail.timeline.initialFilingCompleted'),
                type: 'completed',
                icon: FileText
            });

            // If Judge has taken cognizance (status is not just PENDING or FIR_FILED)
            if (['IN_PROGRESS', 'SUMMONS_SERVED', 'PENDING_COGNIZANCE'].includes(caseData.status)) {
                mockEvents.push({
                    date: new Date(Date.now() - 86400000 * 5).toISOString(),
                    title: caseData.caseType === 'CRIMINAL' ? t('caseDetail.timeline.cognizanceTaken'): t('caseDetail.timeline.caseAdmitted'),
                    subtitle: t('caseDetail.timeline.courtAcceptedCase'),
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '2rem' }}>{t('caseDetail.timeline.liveCaseRoadmap')}</h3>

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
                                {event.type === 'active' && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: '#f59e0b', color: 'white', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>{t('caseDetail.timeline.currentStage')}</span>}
                            </h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
                                {event.subtitle}
                            </p>
                            {event.date && (
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                    {formatDate(event.date,i18n.language)}
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
                                    <Sparkles size={12} /> {t('caseDetail.timeline.viewPreparationKit')}
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
                                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>{t('caseDetail.preparationKit.title')}</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('caseDetail.preparationKit.for')} {selectedStage.title}</p>
                            </div>
                        </div>

                        <div style={{ background: 'var(--bg-glass)', padding: '1rem', borderRadius: '1rem', marginBottom: '1rem' }}>
                            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{t('caseDetail.preparationKit.whatToExpect')}</h4>
                            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
                                {selectedStage.desc || selectedStage.description || t('caseDetail.preparationKit.prepareDocuments')}
                            </p>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{t('caseDetail.preparationKit.recommendedActions')}</h4>
                            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                <li>{t('caseDetail.preparationKit.reviewDocuments')}</li>
                                <li>{t('caseDetail.preparationKit.consultLawyer')}</li>
                                <li>{t('caseDetail.preparationKit.consultLawyer')}</li>
                            </ul>
                        </div>

                        <button onClick={() => setPrepKitOpen(false)} style={{
                            width: '100%', padding: '0.75rem', background: 'var(--color-accent)',
                            color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 'bold', cursor: 'pointer'
                        }}>
                            {t('caseDetail.preparationKit.gotIt')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

{/* Preparation Kit Modal - RE-ADDED CORRECTLY */ }
function PrepKitModal({ isOpen, onClose, stage }) {
    const { t } = useTranslation('litigant');
    if (!isOpen || !stage) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }} onClick={onClose}>
            <div style={{ background: 'var(--bg-glass-strong)', border: 'var(--border-glass-strong)', borderRadius: '1.5rem', width: '90%', maxWidth: '500px', padding: '2rem', boxShadow: 'var(--shadow-glass-strong)' }} onClick={e => e.stopPropagation()}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: 'white' }}>
                        <Sparkles size={30} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{t('caseDetail.aiPrepKit.title')}</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{t('caseDetail.aiPrepKit.forStage')}{stage.title}</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('caseDetail.aiPrepKit.whatToExpect')}</h4>
                    <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                        <li>{t('caseDetail.aiPrepKit.judgeReview')}{' '}{stage.subtitle?.toLowerCase() || t('caseDetail.aiPrepKit.thisStage')}.</li>
                        <li>{t('caseDetail.aiPrepKit.physicalPresence')}</li>
                        <li>{t('caseDetail.aiPrepKit.ensureDocuments')}</li>
                    </ul>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('caseDetail.aiPrepKit.recommendedActions')}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle size={16} /> {t('caseDetail.aiPrepKit.reviewEvidence')}
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertCircle size={16} /> {t('caseDetail.aiPrepKit.dontMissCourt')}
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    aria-label="Close"
                    style={{ width: '100%', padding: '1rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: '700', fontSize: '1rem', cursor: 'pointer' }}>
                    {t('caseDetail.aiPrepKit.gotIt')}
                </button>
            </div>
        </div>
    );
}


{/* BSA 63(4) Generator Component - Mock Implementation of Section 63(4) Evidence Certification */ }
function BSA634GeneratorModal({ isOpen, onClose }) {
    const { t } = useTranslation('litigant');
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
                <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={24} /></button>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Shield size={48} color={step === 'DONE' ? '#10b981' : '#3b82f6'} style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>{t('caseDetail.bsaGenerator.title')}</h2>
                    <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>{t('caseDetail.bsaGenerator.subtitle')}</p>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', update: '1rem', marginBottom: '1rem', opacity: step === 'SCAN' ? 1 : 0.5 }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step === 'SCAN' ? '#3b82f6' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>1</div>
                        <div style={{ color: 'white' }}>{t('caseDetail.bsaGenerator.scanMetadata')}</div>
                        {step === 'SCAN' && <Loader2 size={16} className="spin" color="#3b82f6" />}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', opacity: step === 'HASH' ? 1 : 0.5 }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step === 'HASH' ? '#3b82f6' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>2</div>
                        <div style={{ color: 'white' }}>{t('caseDetail.bsaGenerator.generateHash')}</div>
                        {step === 'HASH' && <Loader2 size={16} className="spin" color="#3b82f6" />}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: (step === 'SIGN' || step === 'DONE') ? 1 : 0.5 }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: (step === 'SIGN' || step === 'DONE') ? '#3b82f6' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>3</div>
                        <div style={{ color: 'white' }}>{t('caseDetail.bsaGenerator.esignVerification')}</div>
                    </div>
                </div>

                {step === 'SIGN' && (
                    <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '1rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                            {t('caseDetail.bsaGenerator.authenticate')}
                        </p>
                        <button
                            onClick={() => {
                                setStep('DONE');
                                // Mock API call update
                                setTimeout(() => {
                                    alert(t('caseDetail.bsaGenerator.certificateGenerated'));
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
                            {t('caseDetail.bsaGenerator.esignWithAadhaar')}
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
    const { t } = useTranslation('litigant');
    const [lang, setLang] = useState('en');
    const [showBsaModal, setShowBsaModal] = useState(false); // NEW STATE

    useEffect(() => { if (localStorage.getItem('lang') === 'hi') setLang('hi'); }, []);
    

    return (
        <div style={{ padding: '1rem' }}>
            {/* Modal */}
            <BSA634GeneratorModal isOpen={showBsaModal} onClose={() => setShowBsaModal(false)} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Shield size={28} color="#10b981" />
                        {t('caseDetail.proceduralHealth.title')}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {t('caseDetail.proceduralHealth.subtitle')}
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
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{t('caseDetail.proceduralHealth.criticalRequirements')}</h3>

                    <div style={{ background: caseData.hasBsaCert ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)', border: caseData.hasBsaCert ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: caseData.hasBsaCert ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                                {caseData.hasBsaCert ? <CheckCircle2 size={24} color="#10b981" /> : <AlertTriangle size={24} color="#ef4444" />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>{t('caseDetail.proceduralHealth.bsaCertificate')}</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>
                                    {caseData.hasBsaCert ? t('caseDetail.proceduralHealth.certificateVerified') : t('caseDetail.proceduralHealth.certificateMissing')}
                                </p>
                                {!caseData.hasBsaCert && (
                                    <button onClick={() => setShowBsaModal(true)} style={{ padding: '0.75rem 1.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FileText size={16} /> {t('caseDetail.proceduralHealth.generateCertificate')}
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
                                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>{t('caseDetail.proceduralHealth.summonsStatus')}</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>
                                    {caseData.summonsStatus === 'SERVED' ? t('caseDetail.proceduralHealth.summonsServed') : t('caseDetail.proceduralHealth.summonsPending') }
                                </p>
                                {caseData.summonsStatus !== 'SERVED' && (
                                    <button style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#f59e0b', border: '1px solid #f59e0b', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>{t('caseDetail.proceduralHealth.trackStatus')}</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ background: 'var(--bg-glass-strong)', borderRadius: '1.5rem', padding: '2rem', border: 'var(--border-glass-strong)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '1.5rem' }}>{t('caseDetail.proceduralHealth.readinessScore')}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                        <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#334155" strokeWidth="3" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={caseData.hasBsaCert && caseData.summonsStatus === 'SERVED' ? '#10b981' : '#f59e0b'} strokeWidth="3" strokeDasharray={`${(caseData.hasBsaCert ? 50 : 0) + (caseData.summonsStatus === 'SERVED' ? 50 : 0)}, 100`} />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>{(caseData.hasBsaCert ? 50 : 0) + (caseData.summonsStatus === 'SERVED' ? 50 : 0)}%</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('caseDetail.proceduralHealth.ready')}</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: '1rem' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('caseDetail.proceduralHealth.impactAnalysis')}</h4>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontStyle: 'italic' }}>{t('caseDetail.proceduralHealth.impactDescription')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}



