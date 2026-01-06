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
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
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
        } catch (error) {
            console.error('Error generating draft:', error);
            alert('AI Drafting failed. Please try again.');
        } finally {
            setIsDrafting(false);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
                    }}>
                        <FileText size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'white', margin: 0 }}>
                            Case Preparation & Drafting
                        </h1>
                        <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0 }}>
                            Generate, refine, and manage legal petitions and pleadings with AI assistance
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
                {/* Left: Templates Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ ...glassStyle, padding: '1.25rem' }}>
                        <h3 style={{ color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Layers size={18} color="#818cf8" /> Document Templates
                        </h3>
                        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Search templates..."
                                style={{
                                    width: '100%',
                                    background: 'rgba(15, 23, 42, 0.4)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    borderRadius: '0.6rem',
                                    padding: '0.6rem 0.6rem 0.6rem 2.2rem',
                                    color: 'white',
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
                                        background: selectedTemplate?.id === t.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                                        border: `1px solid ${selectedTemplate?.id === t.id ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.05)'}`,
                                        borderRadius: '0.75rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.2rem' }}>{t.name}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{t.category}</span>
                                        <span style={{
                                            fontSize: '0.65rem',
                                            padding: '0.1rem 0.4rem',
                                            borderRadius: '4px',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: '#94a3b8'
                                        }}>{t.complexity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ ...glassStyle, padding: '1.25rem' }}>
                        <h3 style={{ color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Briefcase size={18} color="#818cf8" /> Link to Case
                        </h3>
                        <select
                            value={selectedCaseId || ''}
                            onChange={(e) => setSelectedCaseId(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'rgba(15, 23, 42, 0.4)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '0.6rem',
                                padding: '0.75rem',
                                color: 'white',
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

                    <div style={{ ...glassStyle, padding: '1.25rem', background: 'rgba(99, 102, 241, 0.1)' }}>
                        <h4 style={{ color: '#818cf8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={16} /> AI Assistant Tip
                        </h4>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
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
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                        <div>
                            <h3 style={{ color: 'white', margin: 0, fontSize: '1.25rem' }}>
                                {selectedTemplate ? selectedTemplate.name : 'Choose a Template to Begin'}
                            </h3>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock size={12} /> Last edited: Never
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <CheckCircle2 size={12} /> Auto-saved
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={handleAutoDraft}
                                disabled={!selectedTemplate || isDrafting}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    background: 'rgba(99, 102, 241, 0.15)',
                                    color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)',
                                    padding: '0.6rem 1rem', borderRadius: '0.75rem', fontWeight: '700',
                                    fontSize: '0.85rem', cursor: (selectedTemplate && !isDrafting) ? 'pointer' : 'not-allowed'
                                }}
                            >
                                {isDrafting ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
                                {isDrafting ? 'Drafting...' : 'AI Auto-Draft'}
                            </button>
                            <button style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                background: '#334155', color: 'white', border: 'none',
                                padding: '0.6rem 1rem', borderRadius: '0.75rem', fontWeight: '700',
                                fontSize: '0.85rem', cursor: 'pointer'
                            }}>
                                <Save size={16} /> Save
                            </button>
                            <button style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                color: 'white', border: 'none',
                                padding: '0.6rem 1rem', borderRadius: '0.75rem', fontWeight: '700',
                                fontSize: '0.85rem', cursor: 'pointer'
                            }}>
                                <Download size={16} /> Export
                            </button>
                        </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                        {!selectedTemplate && (
                            <div style={{
                                position: 'absolute', inset: 0, zIndex: 10,
                                background: 'rgba(15, 23, 42, 0.6)', borderRadius: '1rem',
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center', textAlign: 'center', padding: '2rem'
                            }}>
                                <Type size={48} color="#1e293b" style={{ marginBottom: '1rem' }} />
                                <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>No Template Selected</h3>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '300px' }}>
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
                                background: 'rgba(15, 23, 42, 0.4)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '1rem',
                                padding: '2rem',
                                color: '#e2e8f0',
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
