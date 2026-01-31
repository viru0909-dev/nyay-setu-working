import { useState, useEffect } from 'react';
import {
    FileText,
    Sparkles,
    Save,
    Download,
    Type,
    Layers,
    ArrowRight,
    Search,
    Clock,
    CheckCircle2,
    Loader2,
    Briefcase
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { caseAPI, lawyerAPI } from '../../services/api';

export default function CasePreparationPage() {
    const location = useLocation();
    const [selectedCaseId, setSelectedCaseId] = useState(location.state?.caseId || null);
    const [caseDetails, setCaseDetails] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [draftContent, setDraftContent] = useState('');
    const [isDrafting, setIsDrafting] = useState(false);
    const [cases, setCases] = useState([]);

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (selectedCaseId) {
            fetchCaseDetails(selectedCaseId);
        }
        fetchCases();
    }, [selectedCaseId]);

    const fetchCases = async () => {
        try {
            const response = await lawyerAPI.getCases();
            setCases(response.data || []);
        } catch (error) {
            console.error('Error fetching cases:', error);
        }
    };

    const fetchCaseDetails = async (id) => {
        try {
            const response = await caseAPI.getById(id);
            setCaseDetails(response.data);
            if (response.data.draftPetition) {
                setDraftContent(response.data.draftPetition);
                // Try to infer template from content or just verify it's loaded
            }
        } catch (error) {
            console.error('Error fetching case details:', error);
        }
    };

    const templates = [
        { id: 1, name: 'Civil Writ Petition', category: 'High Court', complexity: 'High' },
        { id: 2, name: 'Interlocutory Application', category: 'General', complexity: 'Medium' },
        { id: 3, name: 'Notice of Appearance', category: 'Procedural', complexity: 'Low' },
        { id: 4, name: 'Consumer Complaint', category: 'Specialized', complexity: 'Medium' },
        { id: 5, name: 'Affidavit of Evidence', category: 'Trial', complexity: 'High' },
    ];

    const glassStyle = {
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'var(--glass-blur)',
        border: 'var(--border-glass-strong)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-glass-strong)'
    };

    const handleAutoDraft = async () => {
        if (!selectedTemplate || !selectedCaseId) {
            alert('Please select BOTH a case and a template first.');
            return;
        }
        setIsDrafting(true);
        try {
            const response = await lawyerAPI.generateDraft(selectedCaseId, selectedTemplate.name);
            setDraftContent(response.data.draft);
            // Auto-save after generation
            await lawyerAPI.saveDraft(selectedCaseId, response.data.draft);
        } catch (error) {
            console.error('Error generating draft:', error);
            alert('AI Drafting failed. Please try again.');
        } finally {
            setIsDrafting(false);
        }
    };

    const handleSave = async () => {
        if (!selectedCaseId) {
            alert('Please select a case first.');
            return;
        }
        setIsSaving(true);
        try {
            await lawyerAPI.saveDraft(selectedCaseId, draftContent);
            // Optional: Show toast success
        } catch (error) {
            console.error('Error saving draft:', error);
            alert('Failed to save draft.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = () => {
        if (!draftContent) {
            alert('No content to export.');
            return;
        }
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Legal Draft</title>');
        printWindow.document.write('<style>body { font-family: "Times New Roman", Times, serif; padding: 40px; line-height: 1.6; white-space: pre-wrap; }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(draftContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        background: 'var(--color-accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'var(--shadow-glass)'
                    }}>
                        <FileText size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                            Case Preparation & Drafting
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Generate, refine, and manage legal petitions and pleadings with AI assistance
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
                {/* Left: Templates Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ ...glassStyle, padding: '1.25rem' }}>
                        <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Layers size={18} color="var(--color-accent)" /> Document Templates
                        </h3>
                        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                            <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Search templates..."
                                style={{
                                    width: '100%',
                                    background: 'var(--bg-glass)',
                                    border: 'var(--border-glass)',
                                    borderRadius: '0.6rem',
                                    padding: '0.6rem 0.6rem 0.6rem 2.2rem',
                                    color: 'var(--text-main)',
                                    fontSize: '0.85rem'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {templates.map(t => (
                                <div
                                    key={t.id}
                                    onClick={() => setSelectedTemplate(t)}
                                    style={{
                                        padding: '0.875rem',
                                        background: selectedTemplate?.id === t.id ? 'var(--bg-glass-subtle)' : 'transparent',
                                        border: `1px solid ${selectedTemplate?.id === t.id ? 'var(--color-accent)' : 'var(--border-glass-subtle)'}`,
                                        borderRadius: '0.75rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.2rem' }}>{t.name}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{t.category}</span>
                                        <span style={{
                                            fontSize: '0.65rem',
                                            padding: '0.1rem 0.4rem',
                                            borderRadius: '4px',
                                            background: 'var(--bg-glass-subtle)',
                                            color: 'var(--text-secondary)'
                                        }}>{t.complexity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ ...glassStyle, padding: '1.25rem' }}>
                        <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Briefcase size={18} color="var(--color-accent)" /> Link to Case
                        </h3>
                        <select
                            value={selectedCaseId || ''}
                            onChange={(e) => setSelectedCaseId(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'var(--bg-glass)',
                                border: 'var(--border-glass)',
                                borderRadius: '0.6rem',
                                padding: '0.75rem',
                                color: 'var(--text-main)',
                                fontSize: '0.85rem',
                                outline: 'none'
                            }}
                        >
                            <option value="">Select an Active Case...</option>
                            {cases.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                        </select>
                        {caseDetails && (
                            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '800' }}>PETITIONER</div>
                                <div style={{ fontSize: '0.85rem', color: 'white' }}>{caseDetails.petitioner}</div>
                            </div>
                        )}
                    </div>

                    <div style={{ ...glassStyle, padding: '1.25rem', background: 'var(--bg-glass-subtle)' }}>
                        <h4 style={{ color: 'var(--color-accent)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={16} /> AI Assistant Tip
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                            To get the best draft, ensure you have linked the relevant case file from your dashboard. Our AI will automatically analyze the facts of the case to populate the template.
                        </p>
                    </div>
                </div>

                {/* Right: Editor Area */}
                <div style={glassStyle}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        paddingBottom: '1rem',
                        borderBottom: 'var(--border-glass-subtle)'
                    }}>
                        <div>
                            <h3 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.25rem' }}>
                                {selectedTemplate ? selectedTemplate.name : 'Choose a Template to Begin'}
                            </h3>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock size={12} /> Last edited: Never
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <CheckCircle2 size={12} /> Auto-saved
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={handleAutoDraft}
                                disabled={!selectedTemplate || isDrafting}
                                className="btn"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    background: 'rgba(124, 92, 255, 0.08)',
                                    color: 'var(--color-accent)', border: '1px solid rgba(124, 92, 255, 0.2)',
                                    padding: '0.6rem 1.25rem', borderRadius: '0.75rem', fontWeight: '700',
                                    fontSize: '0.85rem', cursor: (selectedTemplate && !isDrafting) ? 'pointer' : 'not-allowed'
                                }}
                            >
                                {isDrafting ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
                                {isDrafting ? 'Drafting...' : 'AI Auto-Draft'}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !selectedCaseId}
                                className="btn"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    background: '#F8FAFC', color: 'var(--color-primary)', border: '1px solid #E5E7EB',
                                    padding: '0.6rem 1.25rem', borderRadius: '0.75rem', fontWeight: '700',
                                    fontSize: '0.85rem', cursor: (isSaving || !selectedCaseId) ? 'not-allowed' : 'pointer'
                                }}>
                                {isSaving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>

                            {/* NEW: Send for Review Button */}
                            <button
                                onClick={async () => {
                                    if (!selectedCaseId) return;
                                    if (confirm("Send this draft to the client for approval?")) {
                                        try {
                                            await import('../../services/api').then(({ default: api }) =>
                                                api.post(`/api/cases/${selectedCaseId}/submit-draft`, { draftContent })
                                            );
                                            alert("Draft sent to client!");
                                            fetchCaseDetails(selectedCaseId);
                                        } catch (e) { console.error(e); alert("Failed to send"); }
                                    }
                                }}
                                className="btn"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    background: 'rgba(63, 93, 204, 0.08)',
                                    color: 'var(--color-secondary)', border: '1px solid rgba(63, 93, 204, 0.2)',
                                    padding: '0.6rem 1.25rem', borderRadius: '0.75rem', fontWeight: '700',
                                    fontSize: '0.85rem', cursor: 'pointer'
                                }}>
                                <ArrowRight size={16} /> Send for Review
                            </button>

                            <button
                                onClick={handleExport}
                                className="btn btn-primary"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    fontSize: '0.85rem', padding: '0.6rem 1.25rem', borderRadius: '0.75rem'
                                }}>
                                <Download size={16} /> Export
                            </button>
                        </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                        {!selectedTemplate && (
                            <div style={{
                                position: 'absolute', inset: 0, zIndex: 10,
                                background: 'var(--bg-glass-strong)', borderRadius: '1rem',
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center', textAlign: 'center', padding: '2rem'
                            }}>
                                <Type size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
                                <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>No Template Selected</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '300px' }}>
                                    Please select a document type from the sidebar to begin your professional draft.
                                </p>
                            </div>
                        )}
                        <textarea
                            value={draftContent}
                            onChange={(e) => setDraftContent(e.target.value)}
                            placeholder="Draft content will appear here..."
                            style={{
                                width: '100%',
                                height: '500px',
                                background: 'var(--bg-glass)',
                                border: 'var(--border-glass)',
                                borderRadius: '1rem',
                                padding: '2rem',
                                color: 'var(--text-main)',
                                fontFamily: '"Inter", "Courier New", monospace',
                                fontSize: '1rem',
                                lineHeight: '1.8',
                                outline: 'none',
                                resize: 'none'
                            }}
                        />
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
}
