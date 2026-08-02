import SkeletonCard from '../../components/common/SkeletonCard';
import CaseCard from '../../components/dashboard/CaseCard';
import CaseStepper from '../../components/common/CaseStepper';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { useState, useEffect } from 'react';
import { FolderOpen, Video, FileText, TrendingUp, Clock, Bot, MessageCircle, MessageSquare, Loader2, Scale, AlertCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { caseAPI, hearingAPI, documentAPI } from '../../services/api';

export default function LitigantDashboard() {
    const navigate = useNavigate();
    const { t } = useTranslation('dashboard');

    const [showReviewAction, setShowReviewAction] = useState(true);
    const [recentCases, setRecentCases] = useState([]);
    const [upcomingHearings, setUpcomingHearings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([
        { labelKey: 'litigant.myCases', value: '0', icon: FolderOpen, color: 'var(--color-primary)', changeKey: 'litigant.loading' },
        { labelKey: 'litigant.upcomingHearings', value: '0', icon: Video, color: 'var(--color-primary)', changeKey: 'litigant.loading' },
        { labelKey: 'litigant.documents', value: '0', icon: FileText, color: 'var(--color-primary)', changeKey: 'litigant.loading' },
        { labelKey: 'litigant.legalChat', value: t('litigant.active'), icon: MessageSquare, color: '#f59e0b', changeKey: 'litigant.chatWithLawyer', link: '/litigant/chat' }
    ]);

    const [pendingDrafts, setPendingDrafts] = useState([]);

    const handleApprove = async (caseId) => {
        if (window.confirm("Do you want to digitally sign and approve this draft? This action cannot be undone.")) {
            try {
                await caseAPI.reviewDraft(caseId, true, "Approved by client");
                alert("Document Signed & Approved! It has been moved to your 'Documents' folder and submitted to court.");
                // Refresh data
                const casesResponse = await caseAPI.list();
                const cases = casesResponse.data || [];
                const drafts = cases.filter(c => c.status === 'DRAFT_PENDING_CLIENT');
                setPendingDrafts(drafts);
            } catch (error) {
                console.error("Error approving draft:", error);
                alert("Failed to approve draft.");
            }
        }
    };

    const handleReject = async (caseId) => {
        const comments = prompt("Please enter your feedback/changes requested:");
        if (comments) {
            try {
                await caseAPI.reviewDraft(caseId, false, comments);
                alert("Changes requested. Sent back to lawyer.");
                // Refresh data
                const casesResponse = await caseAPI.list();
                const cases = casesResponse.data || [];
                const drafts = cases.filter(c => c.status === 'DRAFT_PENDING_CLIENT');
                setPendingDrafts(drafts);
            } catch (error) {
                console.error("Error rejecting draft:", error);
                alert("Failed to request changes.");
            }
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                const casesResponse = await caseAPI.list();
                const cases = casesResponse.data || [];

                // 1. Identify Pending Drafts for Handover C
                const drafts = cases.filter(c => c.status === 'DRAFT_PENDING_CLIENT');
                setPendingDrafts(drafts);
                setShowReviewAction(drafts.length > 0);

                const sortedCases = cases.sort((a, b) =>
                    new Date(b.filedDate || b.createdAt) - new Date(a.filedDate || a.createdAt)
                ).slice(0, 3);
                // ... existing code ...
                setRecentCases((sortedCases ?? []).map(c => ({
                    id: c.id?.substring(0, 8) || 'CS-' + Math.random().toString(36).substr(2, 6),
                    fullId: c.id,
                    title: c.title || 'Untitled Case',
                    status: c.status || 'PENDING',
                    date: c.filedDate ? new Date(c.filedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'
                })));

                const hearingsResponse = await hearingAPI.getMyHearings();
                const hearings = hearingsResponse.data || [];
                setUpcomingHearings(hearings.map(h => {
                    const scheduledDate = new Date(h.scheduledDate);
                    return {
                        id: h.id,
                        caseId: h.caseId || 'UNKNOWN',
                        title: h.caseTitle || 'Scheduled Hearing',
                        type: h.caseType || 'Regular Hearing',
                        date: scheduledDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                        time: scheduledDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                        judge: h.judgeName || 'TBA',
                        status: h.status
                    };
                }));

                // Update Stats
                setStats([
                    { labelKey: 'litigant.myCases', value: cases.length.toString(), icon: FolderOpen, color: 'var(--color-primary)', changeKey: 'litigant.thisMonth' },
                    { labelKey: 'litigant.upcomingHearings', value: hearings.length.toString(), icon: Video, color: 'var(--color-primary)', change: 'Next: ' + (hearings[0]?.date || 'None') },
                    { labelKey: 'litigant.documents', value: cases.reduce((acc, c) => acc + (c.documents?.length || 1), 0).toString(), icon: FileText, color: 'var(--color-primary)', changeKey: 'litigant.newDocs' },
                    { labelKey: 'litigant.legalChat', value: t('litigant.active'), icon: MessageSquare, color: '#f59e0b', changeKey: 'litigant.chatWithLawyer', link: '/litigant/chat' }
                ]);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div>
            {/* ... CTA Banner ... */}
            <div
                onClick={() => navigate('/litigant/file')}
                // ... (keep existing banner styles)
                style={{
                    background: 'linear-gradient(135deg, rgba(30, 42, 68, 0.1) 0%, rgba(30, 42, 68, 0.05) 100%)',
                    border: 'var(--border-glass)',
                    borderRadius: '1.5rem',
                    padding: '1.5rem 2rem',
                    marginBottom: '2rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-glass)'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-glass-strong)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-glass)';
                }}
            >
                {/* ... (Banner Content) ... */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 20px rgba(30, 42, 68, 0.4)'
                    }}>
                        <Scale size={32} color="white" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                            📋 {t('litigant.fileCaseFIR')}
                        </h2>
                        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                            {t('litigant.fileCaseDesc')}
                        </p>
                    </div>
                </div>
                <div style={{
                    padding: '0.75rem 1.5rem',
                    background: 'var(--color-primary)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <Bot size={20} />
                    {t('litigant.getStarted')}
                </div>
            </div>

            {/* Pending Action Items (Workflow) - Acceptance Loop */}
            {pendingDrafts.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1rem' }}>
                        {t('litigant.pendingApprovals')} ({pendingDrafts.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {pendingDrafts.map(draft => (
                            <div key={draft.id} style={{
                                gridColumn: '1 / -1',
                                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(245, 158, 11, 0.05))',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                borderRadius: '1rem',
                                padding: '1.25rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1.5rem',
                                boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.1)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '12px',
                                        background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#f59e0b'
                                    }}>
                                        <AlertCircle size={24} />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.2rem' }}>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1f2937' }}>
                                                {t('litigant.reviewDraft')}: {draft.title}
                                            </h4>
                                            <span style={{ fontSize: '0.7rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', fontWeight: '700' }}>{t('litigant.actionRequired')}</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#4b5563' }}>
                                            {t('litigant.sentBy')} <b>{draft.lawyerName || 'Your Lawyer'}</b> • {t('litigant.awaitingSignature')}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={() => {
                                            navigate(`/litigant/case-diary/${draft.caseId || draft.id}`);
                                        }}
                                        style={{
                                            padding: '0.6rem 1.2rem', background: 'white', border: '1px solid #e5e7eb',
                                            color: '#374151', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: '600',
                                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                                        }}>
                                        <Eye size={16} /> {t('litigant.viewDetails')}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Are you sure you want to approve this draft? This will notify your lawyer.')) {
                                                import('../../services/api').then(({ default: api }) => {
                                                .catch(err => console.error(err))