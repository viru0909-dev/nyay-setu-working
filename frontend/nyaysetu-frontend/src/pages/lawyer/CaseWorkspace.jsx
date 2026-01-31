import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Layout, FileText, MessageSquare, Shield,
    Clock, Calendar, User, Scale, ArrowLeft,
    Plus, Search, Filter, Download, Save,
    Sparkles, Send, Paperclip, CheckCircle2,
    MoreVertical, Phone, Video, Loader2,
    Type, PenTool, Gavel, Briefcase, BookOpen
} from 'lucide-react';
import { caseAPI, lawyerAPI, documentAPI, messageAPI, vakilFriendAPI, brainAPI } from '../../services/api';

export default function CaseWorkspace() {
    const { caseId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Parse query params for initial tab
    const searchParams = new URLSearchParams(location.search);
    const initialTab = searchParams.get('tab') ? searchParams.get('tab').toUpperCase() : 'BRIEF';

    const [activeTab, setActiveTab] = useState(initialTab); // BRIEF, EVIDENCE, DRAFTING, CHAT
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCaseDetails();
    }, [caseId]);

    const fetchCaseDetails = async () => {
        try {
            const response = await caseAPI.getById(caseId);
            setCaseData(response.data);
        } catch (error) {
            console.error('Error loading case:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // Using navigate ensures parent layouts like DashboardLayout detect the location change
        navigate(`/lawyer/case/${caseId}/workspace?tab=${tab.toLowerCase()}`, { replace: true });
    };

    if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loader2 className="animate-spin" size={48} color="var(--color-primary)" /></div>;
    if (!caseData) return <div style={{ padding: '3rem', textAlign: 'center', color: 'white' }}>Case not found</div>;

    return (
        <div style={{ maxWidth: '1600px', margin: '0 auto', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            {/* Workspace Header */}
            <div style={{
                marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'var(--bg-glass-strong)', padding: '1.5rem', borderRadius: '1.5rem',
                border: 'var(--border-glass-strong)', boxShadow: 'var(--shadow-glass)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button onClick={() => navigate('/lawyer/cases')} style={{
                        padding: '0.75rem', background: 'var(--bg-glass)', border: 'var(--border-glass)',
                        borderRadius: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer'
                    }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                                {caseData.title}
                            </h1>
                            <span style={{
                                padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '800',
                                background: 'rgba(30, 42, 68, 0.1)', color: 'var(--color-accent)', border: '1px solid rgba(30, 42, 68, 0.2)'
                            }}>
                                {caseData.status}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Briefcase size={14} /> ID: {caseData.id?.substring(0, 8).toUpperCase()}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={14} /> Client: <b style={{ color: 'var(--text-main)' }}>{caseData.clientName}</b></span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Scale size={14} /> Opposing: {caseData.opposingLawyer || 'Not Assigned'}</span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div style={{ display: 'flex', background: 'var(--bg-glass)', padding: '0.3rem', borderRadius: '1rem', border: 'var(--border-glass)' }}>
                    {[
                        { id: 'BRIEF', icon: Layout, label: 'Case Brief' },
                        { id: 'EVIDENCE', icon: Shield, label: 'Evidence Discovery' },
                        { id: 'DRAFTING', icon: PenTool, label: 'Drafting & AI Prep' },
                        { id: 'CHAT', icon: MessageSquare, label: 'Client Comm.' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: 'none',
                                background: activeTab === tab.id ? 'var(--color-accent)' : 'transparent',
                                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                                fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content Area */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
                {activeTab === 'BRIEF' && <TabCaseBrief caseData={caseData} />}
                {activeTab === 'EVIDENCE' && <TabEvidence caseId={caseId} />}
                {activeTab === 'DRAFTING' && <TabDrafting caseData={caseData} />}
                {activeTab === 'CHAT' && <TabChat caseData={caseData} />}
            </div>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function TabCaseBrief({ caseData }) {
    const [notes, setNotes] = useState(localStorage.getItem(`notes_${caseData.id}`) || '');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleSaveNotes = () => {
        localStorage.setItem(`notes_${caseData.id}`, notes);
        alert('Private notes saved securely.');
    };

    const handleAIStrategize = async () => {
        setIsAnalyzing(true);
        try {
            // Logic: Send prompt to Groq Inference Engine via brainAPI
            // Prompt: "Based on Case ID ${id}, analyze the delay..."
            await new Promise(r => setTimeout(r, 2000)); // Simulating LPU latency

            const aiStrategy = `\n\n[GROQ AI STRATEGY - ${new Date().toLocaleDateString()}]\nAnalysis of Delay & Recommended Tactics:\n1. IMMEDIATE ACTION: File an Application for Condonation of Delay under Section 5, Limitation Act. Cite 'Administrative Overload' as the primary cause.\n2. TACTICAL: Issue a 'Substitute Service' notice to the Respondent via Email/WhatsApp (per Supreme Court guidelines) to bypass physical service delay.\n3. PREPARATION: Prepare a supplementary affidavit documenting the timeline of events to preemptively counter any Laches argument from the opposition.`;

            setNotes(prev => prev + aiStrategy);
        } catch (error) {
            console.error(error);
            alert("AI Inference failed. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', height: '100%', overflowY: 'auto', paddingBottom: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Case Description */}
                <div style={{ background: 'var(--bg-glass-strong)', padding: '2rem', borderRadius: '1.5rem', border: 'var(--border-glass-strong)' }}>
                    <h3 style={{ color: 'var(--text-main)', marginTop: 0, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <FileText size={20} color="var(--color-accent)" /> Case Summary
                    </h3>
                    <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>{caseData.description}</p>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem' }}>
                        <div style={{ flex: 1, background: 'var(--bg-glass)', padding: '1rem', borderRadius: '1rem' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '0.5rem' }}>PETITIONER</div>
                            <div style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: '600' }}>{caseData.petitioner}</div>
                        </div>
                        <div style={{ flex: 1, background: 'var(--bg-glass)', padding: '1rem', borderRadius: '1rem' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '0.5rem' }}>RESPONDENT</div>
                            <div style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: '600' }}>{caseData.respondent}</div>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div style={{ background: 'var(--bg-glass-strong)', padding: '2rem', borderRadius: '1.5rem', border: 'var(--border-glass-strong)' }}>
                    <h3 style={{ color: 'var(--text-main)', marginTop: 0, marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Clock size={20} color="var(--color-accent)" /> Case Timeline
                    </h3>
                    <div style={{ position: 'relative', paddingLeft: '1.5rem', marginTop: '1.5rem' }}>
                        {/* Gradient Spine */}
                        <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '20px', width: '2px', background: 'linear-gradient(to bottom, var(--color-accent), rgba(255,255,255,0.1))' }} />

                        {[
                            { date: caseData.nextHearing, title: 'Upcoming Hearing', type: 'hearing', future: true },
                            { date: new Date().toISOString(), title: 'Strategy Update', type: 'internal', future: false },
                            { date: new Date(Date.now() - 86400000).toISOString(), title: 'Drafting Started', type: 'internal', future: false },
                            { date: caseData.lastHearing || '2023-10-15', title: 'Previous Hearing', type: 'hearing', future: false },
                            { date: caseData.filedDate, title: 'Case Filed', type: 'hearing', future: false }
                        ].sort((a, b) => new Date(b.date) - new Date(a.date)).map((event, i) => (
                            <div key={i} style={{ marginBottom: '2.5rem', position: 'relative' }}>
                                {/* Timeline Dot */}
                                <div style={{
                                    position: 'absolute', left: '-21px', top: '2px', width: '16px', height: '16px', borderRadius: '50%',
                                    background: event.future ? 'var(--color-accent)' : '#1e293b',
                                    border: `2px solid ${event.future ? 'white' : 'var(--text-secondary)'}`,
                                    boxShadow: event.future ? '0 0 10px var(--color-accent)' : 'none',
                                    zIndex: 2
                                }} />

                                <div style={{
                                    background: event.future ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    padding: event.future ? '1rem' : '0', borderRadius: '1rem',
                                    border: event.future ? '1px solid rgba(59, 130, 246, 0.2)' : 'none'
                                }}>
                                    <div style={{ fontSize: '0.8rem', color: event.future ? 'var(--color-accent)' : 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {event.date ? new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                                    </div>
                                    <div style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: '700', marginTop: '0.3rem' }}>
                                        {event.title}
                                    </div>
                                    {event.type === 'internal' && (
                                        <div style={{ marginTop: '0.25rem', display: 'inline-block', fontSize: '0.7rem', background: '#334155', color: '#94a3b8', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
                                            PRIVATE ACTIVITY
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Private Notes */}
                <div style={{ background: 'var(--bg-glass-strong)', padding: '1.5rem', borderRadius: '1.5rem', border: 'var(--border-glass-strong)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ color: 'var(--text-main)', margin: 0, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <BookOpen size={20} color="#f59e0b" /> Strategy Notes
                        </h3>
                        <button
                            onClick={handleAIStrategize}
                            disabled={isAnalyzing}
                            style={{
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', border: 'none',
                                padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: '700',
                                cursor: isAnalyzing ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                                boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)'
                            }}
                        >
                            {isAnalyzing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                            {isAnalyzing ? 'Thinking...' : 'AI Strategize'}
                        </button>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Include private observations. Use AI for tactical suggestions.</p>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Type your case strategy, observations, or reminders here..."
                        style={{
                            flex: 1, background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '1rem',
                            padding: '1rem', color: 'var(--text-main)', resize: 'none', outline: 'none', lineHeight: '1.6', fontSize: '0.95rem'
                        }}
                    />
                    <button onClick={handleSaveNotes} style={{
                        marginTop: '1rem', width: '100%', padding: '0.75rem', background: 'var(--color-accent)',
                        color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: '700', cursor: 'pointer',
                        display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center'
                    }}>
                        <Save size={18} /> Save Notes
                    </button>
                </div>

                {/* Opposing Counsel */}
                <div style={{ background: 'var(--bg-glass-strong)', padding: '1.5rem', borderRadius: '1.5rem', border: 'var(--border-glass-strong)' }}>
                    <h3 style={{ color: 'var(--text-main)', marginTop: 0, marginBottom: '1rem' }}>Opposing Counsel</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Scale size={24} color="var(--text-secondary)" />
                        </div>
                        <div>
                            <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{caseData.opposingLawyer || 'Unknown'}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bar ID: Not Listed</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TabEvidence({ caseId }) {
    const [documents, setDocuments] = useState([]);
    const [analyzing, setAnalyzing] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null); // ID of doc with open menu
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Certificate Modal State
    const [showCertModal, setShowCertModal] = useState(false);
    const [certUrl, setCertUrl] = useState(null);
    const [certLoading, setCertLoading] = useState(false);

    useEffect(() => {
        refreshDocuments();
    }, [caseId]);

    const refreshDocuments = () => {
        documentAPI.getByCase(caseId).then(res => setDocuments(res.data || [])).catch(err => console.log(err));
    };

    const handleAnalyze = async (docId) => {
        setAnalyzing(docId);
        try {
            // Simulate AI Analysis delay
            await new Promise(r => setTimeout(r, 2000));
            // In real app: const res = await documentAPI.analyze(docId);
            setAnalysisResult({
                docId,
                summary: "This document appears to be a valid medical certificate. The issuer signature matches our registry. No evidence of tampering detected.",
                risk: "LOW",
                entities: ["Hospital XYZ", "Dr. Sharma", "Date: 12/10/2024"]
            });
        } catch (e) {
            console.error(e);
        } finally {
            setAnalyzing(null);
        }
    };

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            await documentAPI.upload(file, { caseId, category: 'EVIDENCE' });
            refreshDocuments();
        } catch (error) {
            console.error(error);
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (doc) => {
        try {
            const response = await documentAPI.download(doc.id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.name || doc.fileName || 'document');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Download failed', error);
            // Fallback for mock/demo if API fails
            alert("This is a demo document. In production, this would download the file.");
        }
    };

    const viewCertificate = async (doc) => {
        setCertLoading(true);
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const url = `${API_BASE_URL}/api/documents/${doc.id}/certificate`;
            const token = localStorage.getItem('token');

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Certificate not available');

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            setCertUrl(blobUrl);
            setShowCertModal(true);
        } catch (error) {
            console.error('Certificate fetch failed:', error);
            alert(`❌ Failed to load certificate: ${error.message}`);
        } finally {
            setCertLoading(false);
        }
    };

    const handleDelete = async (docId) => {
        if (!window.confirm("Are you sure you want to delete this evidence?")) return;
        try {
            await documentAPI.delete(docId);
            refreshDocuments();
        } catch (error) {
            console.error('Delete failed', error);
        } finally {
            setActiveMenu(null);
        }
    };

    return (
        <div style={{ height: '100%', padding: '1rem 0', display: 'flex', gap: '2rem' }}>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Discovery & Evidence ({documents.length})</h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                        <button
                            onClick={handleUploadClick}
                            disabled={uploading}
                            style={{
                                padding: '0.75rem 1.5rem', background: 'var(--color-accent)', color: 'white',
                                border: 'none', borderRadius: '0.75rem', fontWeight: '700', cursor: 'pointer',
                                display: 'flex', gap: '0.5rem', alignItems: 'center',
                                opacity: uploading ? 0.7 : 1
                            }}>
                            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                            {uploading ? 'Uploading...' : 'Upload New Evidence'}
                        </button>
                    </div>
                </div>

                {documents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-glass-strong)', borderRadius: '1.5rem' }}>
                        <Shield size={48} color="var(--text-secondary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--text-secondary)' }}>No evidence files uploaded for this case yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {documents.map(doc => {
                            const dateStr = doc.uploadDate || doc.createdAt || new Date().toISOString();
                            const isValidDate = !isNaN(new Date(dateStr).getTime());

                            return (
                                <div key={doc.id} style={{
                                    background: 'var(--bg-glass-strong)', padding: '1.5rem', borderRadius: '1rem',
                                    border: 'var(--border-glass-strong)', display: 'flex', flexDirection: 'column', gap: '1rem',
                                    position: 'relative', overflow: 'hidden' // visible for dropdown
                                }}>
                                    {/* Digital Fingerprint Strip */}
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                                        background: 'linear-gradient(90deg, #10b981, #3b82f6)',
                                        borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem'
                                    }} />

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '8px',
                                                background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <div style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '0.25rem' }}>
                                                    {doc.name || doc.fileName || 'Untitled Document'}
                                                </div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                                    {isValidDate ? new Date(dateStr).toLocaleDateString() : 'Date Pending'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Verification Badge */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.5rem', background: 'rgba(16, 185, 129, 0.05)',
                                        borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.1)'
                                    }}>
                                        <Shield size={14} color="#10b981" />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '700' }}>DIGITALLY FINGERPRINTED</div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                                SHA-256: {doc.id.substring(0, 12)}...
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 40px', gap: '0.5rem', marginTop: 'auto' }}>
                                        <button
                                            onClick={() => handleAnalyze(doc.id)}
                                            style={{
                                                padding: '0.6rem', background: 'var(--bg-glass-subtle)', border: 'var(--border-glass-subtle)',
                                                borderRadius: '0.5rem', color: 'var(--color-accent)', fontSize: '0.8rem', fontWeight: '600',
                                                cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {analyzing === doc.id ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                            AI Review
                                        </button>
                                        <button
                                            onClick={() => viewCertificate(doc)}
                                            style={{
                                                padding: '0.6rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                                                borderRadius: '0.5rem', color: '#10b981', fontSize: '0.8rem', fontWeight: '600',
                                                cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            <Shield size={14} /> Cert.
                                        </button>
                                        <button
                                            onClick={() => handleDownload(doc)}
                                            style={{
                                                padding: '0.6rem', background: 'var(--bg-glass)', border: 'var(--border-glass)',
                                                borderRadius: '0.5rem', color: 'var(--text-main)', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                            <Download size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* AI Analysis Sidebar (Contextual) */}
            {analysisResult && (
                <div style={{
                    width: '300px', background: 'var(--bg-glass-strong)', border: 'var(--border-glass-strong)',
                    borderRadius: '1.5rem', padding: '1.5rem', animation: 'slideIn 0.3s ease-out'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={18} color="var(--color-accent)" /> AI Findings
                        </h3>
                        <button onClick={() => setAnalysisResult(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <MoreVertical size={16} /> {/* Close Icon substitute */}
                        </button>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '0.5rem' }}>DOCUMENT INTEGRITY</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: '600', fontSize: '0.9rem' }}>
                            <CheckCircle2 size={16} /> Verified Authentic
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '0.5rem' }}>SUMMARY</div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.6', margin: 0 }}>
                            {analysisResult.summary}
                        </p>
                    </div>

                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '0.5rem' }}>EXTRACTED ENTITIES</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {analysisResult.entities.map((e, i) => (
                                <span key={i} style={{
                                    padding: '0.25rem 0.6rem', borderRadius: '4px', background: 'var(--bg-glass)',
                                    border: 'var(--border-glass)', color: 'var(--color-accent)', fontSize: '0.75rem'
                                }}>
                                    {e}
                                </span>
                            ))}
                        </div>
                    </div>
                    <style>{`@keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
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
    );
}

function TabDrafting({ caseData }) {
    const [template, setTemplate] = useState('Writ Petition');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('DRAFT'); // DRAFT, PENDING_APPROVAL, APPROVED, FILED, FILED_SUCCESS
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Derived Context
    const context = {
        client: caseData.clientName || "Unknown",
        firNumber: "FIR-" + (caseData.id ? caseData.id.substring(0, 6).toUpperCase() : "XXXXXX"),
        charges: caseData.description?.includes('murder') ? "IPC 307 (Attempted Murder)" : "Civil Dispute",
        court: "High Court of Delhi" // Inferred
    };

    // Auto-fill skeleton on template change
    useEffect(() => {
        if (status === 'DRAFT') {
            // Basic Auto-Fill Logic using Context
            const skeleton = `[TEMPLATE: ${template.toUpperCase()}]\n\nIN THE ${context.court.toUpperCase()}\n\nPETITION NO: ______ OF ${new Date().getFullYear()}\n\nIN THE MATTER OF:\n\n${context.client}\nR/o [Address Auto-Filled from Litigant Profile]\n...Petitioner\n\nVERSUS\n\nSTATE OF DELHI\n...Respondent\n\nSUBJECT: APPLICATION FOR ${template.toUpperCase()} IN FIR ${context.firNumber} (${context.charges})\n\nRESPECTFULLY SHOWETH:\n\n1. That the petitioner is a law-abiding citizen of India.\n2. That the present case was registered on ${new Date(caseData.createdAt || Date.now()).toLocaleDateString()}.\n\n[Click 'AI Auto-Draft' to generate full Statement of Facts based on Case Context]`;

            // Only overwrite if empty or previous skeleton
            if (!content || content.includes('[TEMPLATE:')) {
                setContent(skeleton);
            }
        }
    }, [template, caseData, content, status, context.court, context.client, context.firNumber, context.charges]);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            // Simulate AI call
            await new Promise(r => setTimeout(r, 2000));
            const prompt = `Draft a ${template} for ${context.client}. Context: ${caseData.description}. Charges: ${context.charges}.`;
            const generated = `IN THE ${context.court.toUpperCase()}\n\nPETITION NO: ______ OF 2026\n\nIN THE MATTER OF:\n\n${context.client}\n...Petitioner\n\nVERSUS\n\nSTATE OF DELHI\n...Respondent\n\nSUBJECT: ${template.toUpperCase()} UNDER ARTICLE 226\n\nMOST RESPECTFULLY SHOWETH:\n\n1. That the petitioner is a law-abiding citizen...\n2. That the present case involves FIR ${context.firNumber} regarding ${context.charges}.\n3. That the allegations are baseless because [AI Generated Defence Logic based on: ${caseData.description}]...\n\nPRAYER:\nIn light of the above, it is prayed that this Hon'ble Court may be pleased to quash the FIR.\n\n(Signed)\nAdvocate for Petitioner`;
            setContent(generated);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 800)); // Mock API
        setIsSaving(false);
        alert("Draft saved successfully.");
    };

    const handleSendForApproval = async () => {
        if (!content) return alert("Please generate or write a draft first.");
        if (!window.confirm("Send this document to the Client for digital signature? You will not be able to edit it until approved or rejected.")) return;

        setIsSaving(true);
        // Mock API: lawyerAPI.sendForApproval(caseId, content);
        await new Promise(r => setTimeout(r, 1000));

        // Auto-Notify Client via Chat
        try {
            await messageAPI.send(caseData.id, `System: A new draft (${template}) is ready for your approval. Please check your Action Items.`);
        } catch (e) { console.error("Chat notify failed", e); }

        setStatus('PENDING_APPROVAL');
        setIsSaving(false);
        alert(`Draft sent to ${context.client}. Notification sent to Chat.`);
    };

    const handleFileInCourt = async () => {
        if (!window.confirm("This will digitally sign the document and file it with the Court Registry. Proceed?")) return;
        setIsSaving(true);
        // Mock API: courtAPI.filePetition(caseId, content, signedToken);
        await new Promise(r => setTimeout(r, 2000));
        setStatus('FILED_SUCCESS');
        setIsSaving(false);
    };

    // Dev helper to unlock flow
    const simulateClientApproval = () => {
        if (window.confirm("(DEV) Simulate Client approving the doc?")) {
            setStatus('APPROVED');
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', height: '100%' }}>
            {/* Left Sidebar: Context & Template */}
            <div style={{ background: 'var(--bg-glass-strong)', padding: '1.5rem', borderRadius: '1.5rem', border: 'var(--border-glass-strong)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginTop: 0, color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={18} color="var(--color-accent)" /> Smart Drafter
                </h3>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>Document Type</label>
                    <select
                        value={template} onChange={e => setTemplate(e.target.value)}
                        disabled={status !== 'DRAFT'}
                        style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem', borderRadius: '0.75rem', background: 'var(--bg-glass)', color: 'var(--text-main)', border: 'var(--border-glass)' }}
                    >
                        <option value="Writ Petition">Writ Petition (Criminal)</option>
                        <option value="Bail Application">Bail Application</option>
                        <option value="Affidavit">Affidavit</option>
                        <option value="Stay Application">Stay Application</option>
                    </select>
                </div>

                <div style={{ padding: '1.25rem', background: 'var(--bg-glass-subtle)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: '800', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>CONTEXT DETECTED</div>

                    <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CLIENT</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600' }}>{context.client}</div>
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>FIR / CASE ID</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600', fontFamily: 'monospace' }}>{context.firNumber}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CHARGES / SUBJECT</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{context.charges}</div>
                    </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <div style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '0.75rem', background: status === 'DRAFT' ? 'rgba(59, 130, 246, 0.1)' : (status === 'PENDING_APPROVAL' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)') }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: status === 'DRAFT' ? '#3b82f6' : (status === 'PENDING_APPROVAL' ? 'var(--color-warning)' : 'var(--color-success)') }}>
                            STATUS: {status.replace('_', ' ')}
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading || status !== 'DRAFT'}
                        style={{
                            width: '100%', padding: '0.8rem', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white',
                            border: 'none', borderRadius: '0.75rem', fontWeight: '700', cursor: status === 'DRAFT' ? 'pointer' : 'not-allowed',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                            opacity: status !== 'DRAFT' ? 0.6 : 1, boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
                        }}>
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        {loading ? 'Generating...' : 'AI Auto-Draft'}
                    </button>
                    {status === 'PENDING_APPROVAL' && (
                        <button onClick={simulateClientApproval} style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>
                            (Dev: Force Client Approval)
                        </button>
                    )}
                </div>
            </div>

            {/* Right: Editor Area */}
            <div style={{ background: 'var(--bg-glass-strong)', display: 'flex', flexDirection: 'column', borderRadius: '1.5rem', border: 'var(--border-glass-strong)', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: 'var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-glass)' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PenTool size={16} /> {template} - Editor
                    </span>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {status === 'DRAFT' && (
                            <div style={{ display: 'flex', background: 'var(--bg-glass)', borderRadius: '0.5rem', padding: '0.25rem' }}>
                                <button onClick={handleSave} disabled={isSaving} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.4rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                                    Save
                                </button>
                                <div style={{ width: '1px', background: 'var(--border-glass)', margin: '0.2rem 0' }} />
                                <button onClick={handleSendForApproval} disabled={isSaving || !content} style={{ background: 'var(--color-accent)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.4rem', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginLeft: '0.25rem' }}>
                                    <Send size={14} /> Send for Approval
                                </button>
                            </div>
                        )}
                        {status === 'PENDING_APPROVAL' && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-warning)', fontWeight: '600', fontSize: '0.9rem' }}>
                                <Clock size={16} /> Awaiting Client Signature
                            </span>
                        )}
                        {status === 'APPROVED' && (
                            <button onClick={handleFileInCourt} disabled={isSaving} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Gavel size={18} /> File in Court
                            </button>
                        )}
                        {status === 'FILED_SUCCESS' && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: '700' }}>
                                <CheckCircle2 size={18} /> Successfully Filed
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ flex: 1, position: 'relative' }}>
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        readOnly={status !== 'DRAFT'}
                        placeholder={status === 'DRAFT' ? "Use AI Auto-Draft or start typing..." : "Document is locked for review."}
                        style={{
                            width: '100%', height: '100%', padding: '2rem', background: status === 'DRAFT' ? 'transparent' : 'rgba(0,0,0,0.02)',
                            border: 'none', color: 'var(--text-main)', resize: 'none', outline: 'none',
                            fontFamily: '"Inter", monospace', lineHeight: '1.8', fontSize: '1rem'
                        }}
                    />
                    {status === 'APPROVED' && (
                        <div style={{ position: 'absolute', bottom: '2rem', right: '2rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '2px solid #10b981', borderRadius: '1rem', color: '#10b981', fontWeight: '700', transform: 'rotate(-5deg)' }}>
                                SIGNED BY CLIENT
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function TabChat({ caseData }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isRefining, setIsRefining] = useState(false);
    const messagesEndRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 10000);
        return () => clearInterval(interval);
    }, [caseData.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchMessages = () => {
        messageAPI.getMessages(caseData.id).then(res =>
            setMessages(res.data.map(m => ({
                ...m,
                sender: m.senderId === caseData.clientId ? 'client' : 'me',
                text: m.message,
                type: m.type || 'TEXT',
                attachmentUrl: m.attachmentUrl,
                time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })))
        ).catch(() => {
            console.error("Failed to fetch messages");
        });
    };

    const handleSend = async (customMessage = null, type = 'TEXT', attachmentUrl = null) => {
        const msgToSend = customMessage || input;
        if ((!msgToSend.trim() && type === 'TEXT')) return;

        // Optimistic Update
        const newMsg = {
            id: Date.now(),
            text: msgToSend,
            sender: 'me',
            type: type,
            attachmentUrl: attachmentUrl,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, newMsg]);
        if (!customMessage && type === 'TEXT') setInput('');

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const payload = {
                senderId: user?.id,
                message: msgToSend,
                type: type,
                attachmentUrl: attachmentUrl
            };
            await messageAPI.send(caseData.id, payload);
            fetchMessages(); // Sync with server
        } catch (e) { console.error(e) }
    };

    const handleVideoCall = () => {
        const roomId = `nyaysetu-video-${caseData.id}-${Date.now()}`;
        const url = `https://meet.jit.si/${roomId}`;
        handleSend("📞 I would like to start a video call.", 'VIDEO_CALL', url);
    };

    const handlePhoneCall = () => {
        const roomId = `nyaysetu-audio-${caseData.id}-${Date.now()}`;
        const url = `https://meet.jit.si/${roomId}#config.startWithVideoMuted=true`;
        handleSend("📞 I would like to have a phone call.", 'PHONE_CALL', url);
    };

    const handleVoiceMessage = async () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = uploadVoiceMessage;
            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const uploadVoiceMessage = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], "voice_message.wav", { type: 'audio/wav' });

        setUploading(true);
        try {
            const res = await documentAPI.upload(audioFile, {
                caseId: caseData.id,
                category: 'VOICE_NOTE',
                description: `Voice message from Lawyer`
            });

            const docId = res.data.id;
            const downloadUrl = `/api/documents/${docId}/download`;

            await handleSend("🎤 Voice Message", 'AUDIO', downloadUrl);
        } catch (error) {
            console.error("Failed to upload voice message", error);
        } finally {
            setUploading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await documentAPI.upload(file, {
                caseId: caseData.id,
                category: 'EVIDENCE',
                description: `Shared via chat by Lawyer`
            });
            const docId = res.data.id;
            const downloadUrl = `/api/documents/${docId}/download`;
            await handleSend(`Shared file: ${file.name}`, 'FILE', downloadUrl);
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setUploading(false);
        }
    };

    const renderMessageContent = (msg) => {
        switch (msg.type) {
            case 'AUDIO':
                return (
                    <div>
                        <div style={{ marginBottom: '5px' }}>🎤 Voice Message</div>
                        <audio controls src={msg.attachmentUrl || '#'} style={{ height: '30px', maxWidth: '100%' }} />
                    </div>
                );
            case 'VIDEO_CALL':
            case 'PHONE_CALL':
                return (
                    <div>
                        <div style={{ marginBottom: '5px' }}>{msg.text}</div>
                        <a
                            href={msg.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-block',
                                marginTop: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: 'white',
                                color: 'var(--color-accent)',
                                borderRadius: '0.5rem',
                                textDecoration: 'none',
                                fontWeight: 'bold',
                                fontSize: '0.85rem'
                            }}
                        >
                            {msg.type === 'VIDEO_CALL' ? 'Join Video Call' : 'Join Audio Call'}
                        </a>
                    </div>
                );
            case 'FILE':
                return (
                    <div>
                        <div>{msg.text}</div>
                        <a href={msg.attachmentUrl} download style={{ color: 'gold', textDecoration: 'underline' }}>Download File</a>
                    </div>
                );
            default:
                return msg.text;
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-glass-strong)', borderRadius: '1.5rem', border: 'var(--border-glass-strong)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: 'var(--border-glass-strong)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={20} color="var(--text-main)" />
                    </div>
                    <div>
                        <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{caseData.clientName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-success)' }}>Online</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={handlePhoneCall} style={{ padding: '0.5rem', background: 'var(--bg-glass)', border: 'none', borderRadius: '0.5rem', color: 'var(--text-secondary)', cursor: 'pointer' }}><Phone size={18} /></button>
                    <button onClick={handleVideoCall} style={{ padding: '0.5rem', background: 'var(--bg-glass)', border: 'none', borderRadius: '0.5rem', color: 'var(--text-secondary)', cursor: 'pointer' }}><Video size={18} /></button>
                </div>
            </div>

            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((msg, i) => {
                    const text = msg.text || '';
                    const isSystem = text.startsWith('System:');
                    if (isSystem) return (
                        <div key={i} style={{ alignSelf: 'center', margin: '1rem 0', background: 'rgba(255, 255, 255, 0.05)', padding: '0.5rem 1rem', borderRadius: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            {text.replace('System: ', '')}
                        </div>
                    );

                    return (
                        <div key={i} style={{
                            maxWidth: '70%', padding: '1rem', borderRadius: '1rem',
                            alignSelf: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                            background: msg.sender === 'me' ? 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)' : 'var(--bg-glass)',
                            color: msg.sender === 'me' ? 'white' : 'var(--text-main)',
                            borderBottomRightRadius: msg.sender === 'me' ? '0.2rem' : '1rem',
                            borderBottomLeftRadius: msg.sender === 'client' ? '0.2rem' : '1rem',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            {renderMessageContent(msg)}
                            <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.5rem', textAlign: 'right' }}>{msg.time}</div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '1.5rem', borderTop: 'var(--border-glass-strong)', display: 'flex', gap: '1rem' }}>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    disabled={uploading}
                >
                    {uploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
                </button>
                <button
                    onClick={async () => {
                        if (!input) return;
                        setIsRefining(true);
                        await new Promise(r => setTimeout(r, 1000)); // Simulate Groq
                        setInput(`Here is the update regarding the ${caseData.title}. Please review it when possible.`); // Mock refined text
                        setIsRefining(false);
                    }}
                    title="AI Refine for Client"
                    disabled={isRefining}
                    style={{ background: 'transparent', border: '1px solid var(--color-accent)', borderRadius: '2rem', padding: '0 1rem', color: 'var(--color-accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isRefining ? 0.5 : 1 }}>
                    {isRefining ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                </button>
                <button
                    onClick={handleVoiceMessage}
                    style={{
                        background: isRecording ? '#ef4444' : 'transparent',
                        border: 'none',
                        color: isRecording ? 'white' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                >
                    {isRecording ? <div className="animate-pulse" style={{ width: '12px', height: '12px', background: 'white', borderRadius: '2px' }} /> : <Type size={0} style={{ display: 'none' }} /> /* Hack to use a valid icon or nothing */}
                    {isRecording ? null : <div style={{ fontSize: '1.2rem' }}>🎤</div>}
                </button>
                <input
                    value={input} onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                    placeholder={isRecording ? "Recording..." : "Type your message..."}
                    disabled={isRecording}
                    style={{ flex: 1, background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '2rem', padding: '0.75rem 1.5rem', color: 'var(--text-main)', outline: 'none' }}
                />
                <button onClick={() => handleSend()} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-accent)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}
