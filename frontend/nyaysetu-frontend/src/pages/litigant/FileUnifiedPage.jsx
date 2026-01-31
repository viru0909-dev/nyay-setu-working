import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft, ChevronRight, Upload, X, FileText,
    CheckCircle2, Scale, Users, Home as HomeIcon, Briefcase,
    AlertCircle, Shield, MapPin, Calendar, MessageSquare,
    Bot, Sparkles, Wand2, Loader2, BrainCircuit, ClipboardList, Siren
} from 'lucide-react';
import { caseAPI, documentAPI, clientFirAPI, vakilFriendAPI, brainAPI } from '../../services/api';

// Case types for court cases
const caseTypes = [
    { id: 'civil', name: 'Civil Case', icon: Scale, desc: 'Property, contracts, disputes', color: '#3b82f6' },
    { id: 'criminal', name: 'Criminal Case', icon: AlertCircle, desc: 'Criminal offenses', color: '#ef4444' },
    { id: 'family', name: 'Family Law', icon: Users, desc: 'Divorce, custody, inheritance', color: '#ec4899' },
    { id: 'property', name: 'Property Dispute', icon: HomeIcon, desc: 'Land, ownership disputes', color: '#10b981' },
    { id: 'commercial', name: 'Commercial', icon: Briefcase, desc: 'Business, trade matters', color: '#f59e0b' }
];

export default function FileUnifiedPage() {
    // Tab: 'case' or 'fir'
    const [activeTab, setActiveTab] = useState('case');

    // AI Assistant State
    const [showAiAssistant, setShowAiAssistant] = useState(false);
    const [aiQuery, setAiQuery] = useState('');
    const [aiThinking, setAiThinking] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState(null);

    // Case filing state
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        caseType: '',
        title: '',
        description: '',
        petitioner: '',
        respondent: '',
        urgency: 'normal',
        documents: []
    });

    // FIR filing state
    const [firData, setFirData] = useState({
        title: '',
        description: '',
        incidentDate: '',
        incidentLocation: ''
    });
    const [firFile, setFirFile] = useState(null);

    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const navigate = useNavigate();

    const steps = [
        { number: 1, name: 'Case Type', desc: 'Select category' },
        { number: 2, name: 'Case Details', desc: 'Provide information' },
        { number: 3, name: 'Documents', desc: 'Upload files' },
        { number: 4, name: 'Review', desc: 'Confirm & submit' }
    ];

    const handleAiAssist = async () => {
        if (!aiQuery.trim()) return;
        setAiThinking(true);
        try {
            const response = await brainAPI.analyzeCase(aiQuery);
            const data = response.data;

            setAiSuggestion({
                type: (data.type || '').toUpperCase() === 'FIR' ? 'fir' : 'case',
                caseType: (data.caseType || '').toLowerCase() || 'civil',
                title: data.title || 'Draft Case',
                description: data.description || aiQuery,
                reason: data.reason || "Based on the AI analysis of your description."
            });

        } catch (e) {
            console.error(e);
            alert("Vakil Friend is having trouble connecting right now. Please try again.");
        } finally {
            setAiThinking(false);
        }
    };

    const applyAiSuggestion = () => {
        if (!aiSuggestion) return;

        if (aiSuggestion.type === 'fir') {
            setActiveTab('fir');
            setFirData({
                ...firData,
                title: aiSuggestion.title,
                description: aiSuggestion.description
            });
        } else {
            setActiveTab('case');
            setFormData({
                ...formData,
                caseType: aiSuggestion.caseType,
                title: aiSuggestion.title,
                description: aiSuggestion.description
            });
            setCurrentStep(2); // Skip to details
        }
        setShowAiAssistant(false);
        setAiQuery('');
        setAiSuggestion(null);
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setFormData({
            ...formData,
            documents: [...formData.documents, ...files.map(f => ({ file: f, name: f.name, size: f.size, aiAnalyzed: false }))]
        });
    };

    const analyzeDocument = (index) => {
        // Mock AI analysis for document
        const newDocs = [...formData.documents];
        newDocs[index].analyzing = true;
        setFormData({ ...formData, documents: newDocs });

        setTimeout(() => {
            newDocs[index].analyzing = false;
            newDocs[index].aiAnalyzed = true;
            newDocs[index].risk = Math.random() > 0.7 ? 'Moderate Risk: Missing signature page' : 'Low Risk: Document appears valid';
            setFormData({ ...formData, documents: newDocs });
        }, 2000);
    };

    const removeDocument = (index) => {
        setFormData({
            ...formData,
            documents: formData.documents.filter((_, i) => i !== index)
        });
    };

    // Submit Court Case
    const handleSubmitCase = async () => {
        setUploading(true);
        try {
            const caseData = {
                title: formData.title,
                description: formData.description,
                caseType: formData.caseType.toUpperCase(),
                petitioner: formData.petitioner,
                respondent: formData.respondent,
                urgency: formData.urgency.toUpperCase()
            };

            const response = await caseAPI.create(caseData);

            if (formData.documents.length > 0) {
                const caseId = response.data.id;
                for (const doc of formData.documents) {
                    try {
                        await documentAPI.upload(doc.file, {
                            caseId: caseId,
                            category: 'CASE_DOCUMENT',
                            description: `Document uploaded during case filing: ${doc.name}`
                        });
                    } catch (uploadError) {
                        console.error('Error uploading document:', doc.name, uploadError);
                    }
                }
            }

            setResult({ type: 'case', data: response.data });
        } catch (error) {
            console.error('Error creating case:', error);
            alert('Failed to create case. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    // Submit FIR
    const handleSubmitFir = async () => {
        if (!firData.title || !firData.description) {
            alert('Please provide a title and description');
            return;
        }

        setUploading(true);
        try {
            const data = new FormData();
            data.append('title', firData.title);
            data.append('description', firData.description);
            if (firData.incidentDate) data.append('incidentDate', firData.incidentDate);
            if (firData.incidentLocation) data.append('incidentLocation', firData.incidentLocation);
            data.append('aiGenerated', false);
            if (firFile) data.append('file', firFile);

            const response = await clientFirAPI.fileFir(data);
            setResult({ type: 'fir', data: response.data });
        } catch (error) {
            console.error('Error filing FIR:', error);
            alert('Failed to file FIR. Please check your connection and try again.');
        } finally {
            setUploading(false);
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1: return formData.caseType !== '';
            case 2: return formData.title && formData.description && formData.petitioner && formData.respondent;
            case 3: return true; // Documents optional
            case 4: return true;
            default: return false;
        }
    };

    // Success Result
    if (result) {
        return (
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
                    border: '2px solid #10b981',
                    borderRadius: '1.5rem',
                    padding: '3rem',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem'
                    }}>
                        <CheckCircle2 size={40} color="white" />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#10b981', marginBottom: '0.5rem' }}>
                        ✅ {result.type === 'case' ? 'Case Filed Successfully!' : 'FIR Submitted Successfully!'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        {result.type === 'case'
                            ? 'Your case has been registered with the court'
                            : 'Your FIR has been sent for police review'
                        }
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            onClick={() => navigate('/litigant/case-diary')}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                border: 'none', borderRadius: '0.75rem', color: 'white', fontWeight: '700', cursor: 'pointer'
                            }}
                        >
                            Go to Case Diary
                        </button>
                        <button
                            onClick={() => {
                                setResult(null);
                                setCurrentStep(1);
                                setFormData({ caseType: '', title: '', description: '', petitioner: '', respondent: '', urgency: 'normal', documents: [] });
                                setFirData({ title: '', description: '', incidentDate: '', incidentLocation: '' });
                            }}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem',
                                color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer'
                            }}
                        >
                            File Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div>
                    <button
                        onClick={() => navigate('/litigant')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: 'none', border: 'none', color: 'var(--text-secondary)',
                            fontSize: '0.875rem', cursor: 'pointer', marginBottom: '1rem'
                        }}
                    >
                        <ChevronLeft size={16} /> Back to Dashboard
                    </button>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <ClipboardList size={32} color="var(--color-primary)" /> File Case / FIR
                    </h1>
                    <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                        Choose between filing a court case or a police FIR
                    </p>
                </div>

                {/* AI Assistant Button */}
                <button
                    onClick={() => setShowAiAssistant(true)}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'var(--color-primary)',
                        color: 'white', border: 'none', borderRadius: '2rem',
                        fontWeight: '700', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        boxShadow: '0 4px 15px rgba(30, 42, 68, 0.4)',
                        animation: 'pulse 2s infinite'
                    }}
                >
                    <Sparkles size={20} /> Ask Vakil Friend
                </button>
                <style>{`@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); } }`}</style>
            </div>

            {/* Tab Selector */}
            <div style={{
                background: 'var(--bg-glass-strong)', border: 'var(--border-glass-strong)',
                borderRadius: '1rem', padding: '0.5rem', marginBottom: '2rem', display: 'flex', gap: '0.5rem'
            }}>
                <button
                    onClick={() => { setActiveTab('case'); setCurrentStep(1); }}
                    style={{
                        flex: 1, padding: '1rem',
                        background: activeTab === 'case' ? 'var(--color-primary)' : 'transparent',
                        border: 'none', borderRadius: '0.75rem',
                        color: activeTab === 'case' ? 'white' : 'var(--text-secondary)',
                        fontWeight: '700', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                    }}
                >
                    <Scale size={20} /> Court Case
                </button>
                <button
                    onClick={() => setActiveTab('fir')}
                    style={{
                        flex: 1, padding: '1rem',
                        background: activeTab === 'fir' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'transparent',
                        border: 'none', borderRadius: '0.75rem',
                        color: activeTab === 'fir' ? 'white' : 'var(--text-secondary)',
                        fontWeight: '700', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                    }}
                >
                    <Shield size={20} /> Police FIR
                </button>
            </div>

            {/* COURT CASE TAB */}
            {activeTab === 'case' && (
                <>
                    {/* Progress Steps */}
                    <div style={{
                        background: 'var(--bg-glass-strong)', border: 'var(--border-glass-strong)',
                        borderRadius: '1.5rem', padding: '2rem', marginBottom: '2rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                            <div style={{
                                position: 'absolute', top: '20px', left: '10%', right: '10%', height: '2px',
                                background: 'var(--border-glass)', zIndex: 0
                            }}>
                                <div style={{
                                    height: '100%', width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                                    background: 'var(--color-primary)', transition: 'width 0.3s'
                                }} />
                            </div>
                            {steps.map((step) => (
                                <div key={step.number} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: step.number <= currentStep ? 'var(--color-primary)' : 'var(--bg-glass)',
                                        border: step.number === currentStep ? '3px solid rgba(30, 42, 68, 0.4)' : 'none',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700',
                                        color: step.number <= currentStep ? 'white' : 'var(--text-secondary)', marginBottom: '0.75rem'
                                    }}>
                                        {step.number < currentStep ? <CheckCircle2 size={20} /> : step.number}
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: step.number <= currentStep ? 'var(--color-primary)' : 'var(--text-secondary)' }}>{step.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{step.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step Content */}
                    <div style={{
                        background: 'var(--bg-glass-strong)', border: 'var(--border-glass-strong)',
                        borderRadius: '1.5rem', padding: '2.5rem', minHeight: '400px'
                    }}>
                        {/* Step 1: Case Type */}
                        {currentStep === 1 && (
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Select Case Type</h2>
                                <div style={{
                                    display: 'flex',
                                    gap: '1.5rem',
                                    overflowX: 'auto',
                                    paddingBottom: '1rem',
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none'
                                }}>
                                    {caseTypes.map((type) => {
                                        const Icon = type.icon;
                                        const isSelected = formData.caseType === type.id;
                                        return (
                                            <button
                                                key={type.id}
                                                onClick={() => setFormData({ ...formData, caseType: type.id })}
                                                style={{
                                                    minWidth: '320px',
                                                    flex: '0 0 auto',
                                                    padding: '2rem',
                                                    background: isSelected ? `${type.color}20` : 'var(--bg-glass)',
                                                    border: isSelected ? `2px solid ${type.color}` : 'var(--border-glass)',
                                                    borderRadius: '1.25rem', cursor: 'pointer', textAlign: 'left',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: `${type.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                                                    <Icon size={32} color={type.color} />
                                                </div>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{type.name}</h3>
                                                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>{type.desc}</p>
                                            </button>
                                        );
                                    })}
                                    {/* Spacer for right padding in scroll view */}
                                    <div style={{ width: '1px', flex: '0 0 1px' }}></div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Case Details */}
                        {currentStep === 2 && (
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Case Details</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>Case Title *</label>
                                        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Brief title of your case" style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>Case Description *</label>
                                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Detailed description..." rows={5} style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)', resize: 'vertical' }} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>Petitioner *</label>
                                            <input type="text" value={formData.petitioner} onChange={(e) => setFormData({ ...formData, petitioner: e.target.value })} placeholder="Your name" style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>Respondent *</label>
                                            <input type="text" value={formData.respondent} onChange={(e) => setFormData({ ...formData, respondent: e.target.value })} placeholder="Other party" style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>Urgency</label>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            {['normal', 'urgent', 'critical'].map((level) => (
                                                <button key={level} onClick={() => setFormData({ ...formData, urgency: level })} style={{ flex: 1, padding: '0.75rem', background: formData.urgency === level ? 'rgba(30, 42, 68, 0.2)' : 'var(--bg-glass)', border: formData.urgency === level ? '2px solid var(--color-primary)' : 'var(--border-glass)', borderRadius: '0.75rem', color: formData.urgency === level ? 'var(--color-primary)' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', textTransform: 'capitalize' }}>{level}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Documents */}
                        {currentStep === 3 && (
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Upload Documents</h2>
                                <label style={{ display: 'block', padding: '3rem', background: 'var(--bg-glass)', border: '2px dashed var(--border-glass)', borderRadius: '1rem', textAlign: 'center', cursor: 'pointer', marginBottom: '1.5rem' }}>
                                    <input type="file" multiple onChange={handleFileUpload} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                                    <Upload size={40} style={{ color: 'var(--color-primary)', margin: '0 auto 1rem' }} />
                                    <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>Click to upload files</p>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>PDF, DOC, JPG, PNG (max 10MB)</p>
                                </label>
                                {formData.documents.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {formData.documents.map((doc, index) => (
                                            <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-glass)', borderRadius: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <FileText size={20} color="var(--color-primary)" />
                                                    <div>
                                                        <span style={{ color: 'var(--text-main)', display: 'block' }}>{doc.name}</span>
                                                        {doc.aiAnalyzed ? (
                                                            <span style={{ fontSize: '0.75rem', color: doc.risk.includes('Low') ? '#10b981' : '#f59e0b' }}>
                                                                <BrainCircuit size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                                                {doc.risk}
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => analyzeDocument(index)}
                                                                disabled={doc.analyzing}
                                                                style={{ fontSize: '0.75rem', color: '#8b5cf6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                                            >
                                                                {doc.analyzing ? 'Thinking...' : '✨ Analyze Document'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <button onClick={() => removeDocument(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={18} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 4: Review */}
                        {currentStep === 4 && (
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Review & Confirm</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: '0.75rem' }}>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Case Type:</span>
                                        <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>{caseTypes.find(t => t.id === formData.caseType)?.name}</p>
                                    </div>
                                    <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: '0.75rem' }}>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Title:</span>
                                        <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>{formData.title}</p>
                                    </div>
                                    <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: '0.75rem' }}>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Petitioner vs Respondent:</span>
                                        <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>{formData.petitioner} vs {formData.respondent}</p>
                                    </div>
                                    <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: '0.75rem' }}>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Documents:</span>
                                        <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>{formData.documents.length} files</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                        <button onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1} style={{ padding: '1rem 2rem', background: currentStep === 1 ? 'var(--bg-glass)' : 'rgba(30, 42, 68, 0.1)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: currentStep === 1 ? 'var(--text-secondary)' : 'var(--color-primary)', fontWeight: '600', cursor: currentStep === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ChevronLeft size={20} /> Previous
                        </button>
                        {currentStep < 4 ? (
                            <button onClick={() => setCurrentStep(currentStep + 1)} disabled={!canProceed()} style={{ padding: '1rem 2rem', background: canProceed() ? 'var(--color-primary)' : 'var(--bg-glass)', border: 'none', borderRadius: '0.75rem', color: canProceed() ? 'white' : 'var(--text-secondary)', fontWeight: '700', cursor: canProceed() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Next <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button onClick={handleSubmitCase} disabled={uploading} style={{ padding: '1rem 2rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', borderRadius: '0.75rem', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle2 size={20} /> {uploading ? 'Submitting...' : 'Submit Case'}
                            </button>
                        )}
                    </div>
                </>
            )}

            {/* FIR TAB */}
            {activeTab === 'fir' && (
                <div style={{ background: 'var(--bg-glass-strong)', border: 'var(--border-glass-strong)', borderRadius: '1.5rem', padding: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Siren size={24} color="#ef4444" /> File Police FIR
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>Incident Title *</label>
                            <input type="text" value={firData.title} onChange={(e) => setFirData({ ...firData, title: e.target.value })} placeholder="e.g., Theft at residence" style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}><Calendar size={16} /> Incident Date</label>
                                <input type="date" value={firData.incidentDate} onChange={(e) => setFirData({ ...firData, incidentDate: e.target.value })} style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)' }} />
                            </div>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}><MapPin size={16} /> Location</label>
                                <input type="text" value={firData.incidentLocation} onChange={(e) => setFirData({ ...firData, incidentLocation: e.target.value })} placeholder="e.g., Near City Mall, Pune" style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)' }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>Incident Description *</label>
                            <textarea value={firData.description} onChange={(e) => setFirData({ ...firData, description: e.target.value })} placeholder="Describe what happened in detail..." rows={6} style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)', resize: 'vertical' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>Evidence (Optional)</label>
                            <div onClick={() => document.getElementById('fir-file').click()} style={{ padding: '2rem', background: 'var(--bg-glass)', border: '2px dashed var(--border-glass)', borderRadius: '0.75rem', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', transition: 'all 0.2s' }}>
                                <input id="fir-file" type="file" accept=".pdf,.jpg,.jpeg,.png,.mp4" onChange={(e) => setFirFile(e.target.files[0])} style={{ display: 'none' }} />
                                {firFile ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontWeight: '600' }}>
                                        <CheckCircle2 size={24} />
                                        <span>{firFile.name}</span>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{
                                            width: '64px', height: '64px', borderRadius: '50%',
                                            background: 'rgba(30, 42, 68, 0.05)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <Upload size={32} style={{ color: 'var(--color-primary)' }} />
                                        </div>
                                        <div>
                                            <p style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '0.25rem' }}>Click to upload evidence</p>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Supported: PDF, JPG, PNG, MP4</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <button onClick={handleSubmitFir} disabled={uploading || !firData.title || !firData.description} style={{ marginTop: '1rem', padding: '1rem', background: (!firData.title || !firData.description) ? 'var(--bg-glass)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: 'none', borderRadius: '0.75rem', color: (!firData.title || !firData.description) ? 'var(--text-secondary)' : 'white', fontWeight: '700', cursor: (!firData.title || !firData.description) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Shield size={20} /> {uploading ? 'Submitting...' : 'Submit FIR to Police'}
                        </button>
                    </div>
                </div>
            )}

            {/* AI Assistant Modal */}
            {showAiAssistant && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
                    <div style={{ background: 'var(--bg-glass-strong)', border: 'var(--border-glass-strong)', borderRadius: '2rem', width: '90%', maxWidth: '600px', padding: '2rem', boxShadow: 'var(--shadow-glass-strong)', animation: 'slideUp 0.3s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Bot size={28} color="white" />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Vakil Friend Assist</h2>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Describe your situation, I'll help you file.</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAiAssistant(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        {!aiSuggestion ? (
                            <>
                                <textarea
                                    value={aiQuery}
                                    onChange={e => setAiQuery(e.target.value)}
                                    placeholder="e.g., My landlord is refusing to return my deposit even though I gave notice..."
                                    rows={5}
                                    style={{ width: '100%', padding: '1rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '1rem', color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1rem' }}
                                />
                                <button
                                    onClick={handleAiAssist}
                                    disabled={aiThinking || !aiQuery.trim()}
                                    style={{ width: '100%', padding: '1rem', background: 'var(--color-primary)', border: 'none', borderRadius: '1rem', color: 'white', fontWeight: '700', cursor: (aiThinking || !aiQuery.trim()) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                >
                                    {aiThinking ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
                                    {aiThinking ? 'Analyzing your case...' : 'Analyze & Suggest'}
                                </button>
                            </>
                        ) : (
                            <div style={{ animation: 'fadeIn 0.5s' }}>
                                <div style={{ padding: '1.5rem', background: 'var(--bg-glass)', borderRadius: '1rem', marginBottom: '1.5rem', borderLeft: `6px solid ${aiSuggestion.type === 'fir' ? '#ef4444' : '#3b82f6'}` }}>
                                    <p style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                                        {aiSuggestion.reason}
                                    </p>
                                    <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>Recommended Filing:</span>
                                            <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{aiSuggestion.type === 'fir' ? 'Police FIR' : 'Court Case'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>Category:</span>
                                            <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{aiSuggestion.caseType === 'criminal' ? 'Criminal' : 'Civil'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>Suggested Title:</span>
                                            <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{aiSuggestion.title}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={applyAiSuggestion}
                                    style={{ width: '100%', padding: '1rem', background: 'var(--color-primary)', border: 'none', borderRadius: '1rem', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                >
                                    <CheckCircle2 size={20} /> Convert to Filing
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
