import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, FileText, Upload, Shield, Scale,
    Bot, RefreshCw, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { policeAPI } from '../../services/api';

export default function InvestigationDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [fir, setFir] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiSummary, setAiSummary] = useState('');
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [draftSubmission, setDraftSubmission] = useState('');
    const [loadingDraft, setLoadingDraft] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [findings, setFindings] = useState('');

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const res = await policeAPI.getFir(id);
            setFir(res.data);
            if (res.data.investigationDetails) {
                setFindings(res.data.investigationDetails);
            }
        } catch (error) {
            console.error('Error fetching FIR details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateSummary = async () => {
        try {
            setLoadingSummary(true);
            const res = await policeAPI.generateAiSummary(id);
            setAiSummary(res.data.summary);
        } catch (error) {
            console.error('Error generating summary:', error);
        } finally {
            setLoadingSummary(false);
        }
    };

    const handleGenerateDraft = async () => {
        try {
            setLoadingDraft(true);
            const res = await policeAPI.draftCourtSubmission(id);
            setDraftSubmission(res.data.draft);
            setShowSubmitModal(true);
        } catch (error) {
            console.error('Error drafting submission:', error);
        } finally {
            setLoadingDraft(false);
        }
    };

    const handleSubmitToCourt = async () => {
        try {
            await policeAPI.submitInvestigation(id, draftSubmission || findings);
            setShowSubmitModal(false);
            navigate('/police/investigations');
        } catch (error) {
            console.error('Error submitting to court:', error);
        }
    };

    // Mock evidence upload handler
    const handleEvidenceUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', 'Evidence uploaded by investigator');

        policeAPI.uploadEvidence(id, formData)
            .then(() => {
                alert('Evidence uploaded successfully');
                fetchDetails();
            })
            .catch(err => console.error(err));
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading case details...</div>;
    if (!fir) return <div style={{ padding: '2rem' }}>Case not found.</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <button
                onClick={() => navigate('/police/investigations')}
                style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '1rem' }}
            >
                <ArrowLeft size={20} /> Back to List
            </button>

            {/* Header */}
            <div style={{
                background: 'var(--bg-glass-strong)',
                padding: '2rem',
                borderRadius: '1.5rem',
                border: 'var(--border-glass)',
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start'
            }}>
                <div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ background: '#3b82f6', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: '700' }}>{fir.firNumber}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{new Date(fir.uploadedAt).toLocaleString()}</span>
                    </div>
                    <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '1rem' }}>{fir.title}</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '800px' }}>{fir.description}</p>

                    <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Filed By</p>
                            <p style={{ margin: 0, fontWeight: '600' }}>{fir.filedByName || 'N/A'}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Incident Date</p>
                            <p style={{ margin: 0, fontWeight: '600' }}>{fir.incidentDate || 'N/A'}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Location</p>
                            <p style={{ margin: 0, fontWeight: '600' }}>{fir.incidentLocation || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#10b98115', color: '#10b981', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: '600' }}>
                        <Shield size={18} />
                        Evidence Sealed
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                {/* Left Column: Investigation & AI */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Quick AI Summary */}
                    <div style={{ background: 'var(--bg-glass)', padding: '1.5rem', borderRadius: '1rem', border: 'var(--border-glass)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Bot size={20} color="#8b5cf6" /> AI Case Analysis
                            </h3>
                            <button
                                onClick={handleGenerateSummary}
                                disabled={loadingSummary}
                                style={{
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    opacity: loadingSummary ? 0.7 : 1
                                }}
                            >
                                {loadingSummary ? 'Analyzing...' : 'Generate New Summary'}
                            </button>
                        </div>

                        {aiSummary ? (
                            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '0.5rem', whiteSpace: 'pre-wrap' }}>
                                {aiSummary}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                Generate an AI summary to get a quick overview of facts, missing evidence, and recommended next steps.
                            </p>
                        )}
                    </div>

                    {/* Investigation Notes / Timeline */}
                    <div style={{ background: 'var(--bg-glass)', padding: '1.5rem', borderRadius: '1rem', border: 'var(--border-glass)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={20} /> Investigation Notes (Case Diary)
                        </h3>
                        <div style={{ maxHeight: '300px', overflowY: 'auto', background: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-glass)', whiteSpace: 'pre-wrap' }}>
                            {fir.investigationDetails || "No notes recorded yet."}
                        </div>
                        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                            {/* Placeholder for adding manual note */}
                            <button style={{ background: 'var(--bg-glass-strong)', border: '1px solid var(--border-glass)', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}>+ Add Manual Note</button>
                        </div>
                    </div>

                </div>

                {/* Right Column: Evidence & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Evidence Vault */}
                    <div style={{ background: 'var(--bg-glass)', padding: '1.5rem', borderRadius: '1rem', border: 'var(--border-glass)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Shield size={20} color="#10b981" /> Evidence Vault
                        </h3>

                        <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'white', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                                <FileText size={16} color="var(--text-secondary)" />
                                <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {fir.fileName}
                                    <div style={{ fontSize: '0.75rem', color: '#10b981' }}>SHA-256 Verified</div>
                                </div>
                            </div>
                            {/* In real app, map over added evidence list here */}
                        </div>

                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '1rem',
                            border: '2px dashed var(--border-glass)',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)'
                        }}>
                            <Upload size={20} />
                            Upload Additional Evidence
                            <input type="file" hidden onChange={handleEvidenceUpload} />
                        </label>
                    </div>

                    {/* Submit Action */}
                    <div style={{ background: 'linear-gradient(135deg, #3b82f615 0%, #8b5cf615 100%)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #3b82f630' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#1e3a8a' }}>Ready to Submit?</h3>
                        <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '1rem' }}>
                            Conclude the investigation and submit the Final Report (Charge Sheet) to the court.
                        </p>
                        <button
                            onClick={handleGenerateDraft}
                            style={{
                                width: '100%',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                            }}
                        >
                            <Scale size={20} />
                            Draft Charge Sheet with AI
                        </button>
                    </div>

                </div>
            </div>

            {/* Submission Preview Modal */}
            {showSubmitModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '800px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Bot size={28} color="#8b5cf6" /> Review AI Draft
                        </h2>
                        <p style={{ color: '#666', marginBottom: '1rem' }}>Please review the AI-generated Charge Sheet before submitting to the Judge.</p>

                        <textarea
                            value={draftSubmission}
                            onChange={(e) => setDraftSubmission(e.target.value)}
                            style={{
                                width: '100%',
                                height: '400px',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #ddd',
                                fontFamily: 'monospace',
                                lineHeight: '1.5',
                                marginBottom: '1.5rem',
                                resize: 'vertical'
                            }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                onClick={() => setShowSubmitModal(false)}
                                style={{ padding: '0.75rem 1.5rem', background: 'none', border: '1px solid #ddd', borderRadius: '0.5rem', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitToCourt}
                                style={{ padding: '0.75rem 1.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Scale size={18} />
                                Confirm & Submit to Court
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
