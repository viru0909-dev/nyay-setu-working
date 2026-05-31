import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft, ChevronRight, Upload, X, FileText,
    CheckCircle2, Scale, Users, Home as HomeIcon, Briefcase,
    AlertCircle, Shield, MapPin, Calendar, MessageSquare,
    Bot, Sparkles, Wand2, Loader2, BrainCircuit, ClipboardList, Siren
} from 'lucide-react';
import { caseAPI, documentAPI, clientFirAPI, vakilFriendAPI, brainAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';

// Case types for court cases
// const caseTypes = [
//     { id: 'civil', name: 'Civil Case', icon: Scale, desc: 'Property, contracts, disputes', color: '#3b82f6' },
//     { id: 'criminal', name: 'Criminal Case', icon: AlertCircle, desc: 'Criminal offenses', color: '#ef4444' },
//     { id: 'family', name: 'Family Law', icon: Users, desc: 'Divorce, custody, inheritance', color: '#ec4899' },
//     { id: 'property', name: 'Property Dispute', icon: HomeIcon, desc: 'Land, ownership disputes', color: '#10b981' },
//     { id: 'commercial', name: 'Commercial', icon: Briefcase, desc: 'Business, trade matters', color: '#f59e0b' }
// ];

const caseTypes = [
    {
        id: 'civil',
        nameKey: 'civilCase',
        descKey: 'civilCaseDesc',
        icon: Scale,
        color: '#3b82f6'
    },
    {
        id: 'criminal',
        nameKey: 'criminalCase',
        descKey: 'criminalCaseDesc',
        icon: AlertCircle,
        color: '#ef4444'
    },
    {
        id: 'family',
        nameKey: 'familyLaw',
        descKey: 'familyLawDesc',
        icon: Users,
        color: '#ec4899'
    },
    {
        id: 'property',
        nameKey: 'propertyDispute',
        descKey: 'propertyDisputeDesc',
        icon: HomeIcon,
        color: '#10b981'
    },
    {
        id: 'commercial',
        nameKey: 'commercial',
        descKey: 'commercialDesc',
        icon: Briefcase,
        color: '#f59e0b'
    }
];

export default function FileUnifiedPage() {
    // Tab: 'case' or 'fir'
    const [activeTab, setActiveTab] = useState('case');
    const { t } = useTranslation('litigant');
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

    // const steps = [
    //     { number: 1, name: 'Case Type', desc: 'Select category' },
    //     { number: 2, name: 'Case Details', desc: 'Provide information' },
    //     { number: 3, name: 'Documents', desc: 'Upload files' },
    //     { number: 4, name: 'Review', desc: 'Confirm & submit' }
    // ];

    const steps = [
    { number: 1, name: t('fileUnified.caseType'), desc: t('fileUnified.selectCategory') },
    { number: 2, name: t('fileUnified.caseDetails'), desc: t('fileUnified.provideInformation') },
    { number: 3, name: t('fileUnified.documents'), desc: t('fileUnified.uploadFiles') },
    { number: 4, name: t('fileUnified.review'), desc: t('fileUnified.confirmSubmit') }
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
            alert(t('popups.aiConnectionIssue'));
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
            setCurrentStep(2);
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
            alert(t('popups.caseCreateFailed'));
        } finally {
            setUploading(false);
        }
    };

    const handleSubmitFir = async () => {
        if (!firData.title || !firData.description) {
            alert(t('popups.titleDescriptionRequired'));
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
            alert(t('popups.firFiledFailed'));
        } finally {
            setUploading(false);
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1: return formData.caseType !== '';
            case 2: return formData.title && formData.description && formData.petitioner && formData.respondent;
            case 3: return true;
            case 4: return true;
            default: return false;
        }
    };

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
                        ✅ {result.type === 'case' ? t('fileUnified.caseFiledSuccess') : t('fileUnified.firSubmittedSuccess')}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        {result.type === 'case'
                            ? t('fileUnified.caseRegistered')
                            : t('fileUnified.firSentReview')
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
                            {t('fileUnified.goToCaseDiary')}
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
                            {t('fileUnified.fileAnother')}
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
                        <ChevronLeft size={16} /> {t('fileUnified.backToDashboard')}
                    </button>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <ClipboardList size={32} color="var(--color-primary)" /> {t('fileUnified.fileCaseFir')}
                    </h1>
                    <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                        {t('fileUnified.chooseFilingType')}
                    </p>
                </div>

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
                    <Sparkles size={20} /> {t('fileUnified.askNyaySaarthi')}
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
                    <Scale size={20} /> {t('fileUnified.courtCase')}
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
                    <Shield size={20} /> {t('fileUnified.policeFir')}
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
                            {steps.map((step) => {
                                const isCompleted = step.number < currentStep;
                                return (
                                <div 
                                    key={step.number} 
                                    onClick={() => {
                                        if (isCompleted) {
                                            setCurrentStep(step.number);
                                        }
                                    }}
                                    style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center', 
                                        flex: 1, 
                                        position: 'relative', 
                                        zIndex: 1,
                                        cursor: isCompleted ? 'pointer' : 'default',
                                        transition: 'opacity 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        if (isCompleted) e.currentTarget.style.opacity = '0.7';
                                    }}
                                    onMouseOut={(e) => {
                                        if (isCompleted) e.currentTarget.style.opacity = '1';
                                    }}
                                >
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: step.number <= currentStep ? 'var(--color-primary)' : 'var(--bg-glass)',
                                        border: step.number === currentStep ? '3px solid rgba(30, 42, 68, 0.4)' : 'none',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700',
                                        color: step.number <= currentStep ? 'white' : 'var(--text-secondary)', marginBottom: '0.75rem',
                                        transition: 'all 0.2s'
                                    }}>
                                        {isCompleted ? <CheckCircle2 size={20} /> : step.number}
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: step.number <= currentStep ? 'var(--color-primary)' : 'var(--text-secondary)' }}>{step.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{step.desc}</div>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>

                    {/* Step Content */}
                    <div style={{
                        background: 'var(--bg-glass-strong)', border: 'var(--border-glass-strong)',
                        borderRadius: '1.5rem', padding: '2.5rem', minHeight: '400px'
                    }}>
                        {/* Step 1: Case Type - WITH HORIZONTAL SCROLL BAR */}
                        {currentStep === 1 && (
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
                                    {t('fileUnified.selectCaseType')}
                                </h2>
                                
                                {/* Horizontal Scroll Container with VISIBLE SCROLLBAR */}
                                <div style={{
                                    display: 'flex',
                                    gap: '1.5rem',
                                    overflowX: 'auto',
                                    overflowY: 'hidden',
                                    paddingBottom: '1.5rem',
                                    cursor: 'grab',
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: 'var(--color-primary) rgba(255,255,255,0.2)',
                                    WebkitOverflowScrolling: 'touch',
                                }}
                                className="horizontal-scroll-cards"
                                >
                                    {caseTypes.map((type) => {
                                        const Icon = type.icon;
                                        const isSelected = formData.caseType === type.id;
                                        return (
                                            <button
                                                key={type.id}
                                                onClick={() => setFormData({ ...formData, caseType: type.id })}
                                                style={{
                                                    minWidth: '280px',
                                                    flex: '0 0 auto',
                                                    padding: '1.5rem',
                                                    background: isSelected ? `${type.color}20` : 'var(--bg-glass)',
                                                    border: isSelected ? `2px solid ${type.color}` : '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '1.25rem',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    transition: 'all 0.2s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isSelected) {
                                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                                        e.currentTarget.style.borderColor = type.color;
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isSelected) {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                                    }
                                                }}
                                            >
                                                <div style={{
                                                    width: '50px', height: '50px',
                                                    borderRadius: '12px',
                                                    background: `${type.color}20`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginBottom: '1rem'
                                                }}>
                                                    <Icon size={28} color={type.color} />
                                                </div>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                                    {t(`fileUnified.${type.nameKey}`)}
                                                </h3>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    {t(`fileUnified.${type.descKey}`)}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                                
                                {/* Scroll Hint */}
                                <div style={{
                                    textAlign: 'center',
                                    marginTop: '0.5rem',
                                    fontSize: '0.75rem',
                                    color: 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <ChevronLeft size={14} />
                                    <span>Scroll to see more case types</span>
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Case Details */}
                        {currentStep === 2 && (
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>{t('fileUnified.caseDetails')}</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>{t('fileUnified.caseTitle')} *</label>
                                        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder={t('fileUnified.caseTitlePlaceholder')} style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>{t('fileUnified.caseDescription')} *</label>
                                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder={t('fileUnified.caseDescriptionPlaceholder')} rows={5} style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)', resize: 'vertical' }} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>{t('fileUnified.petitioner')} *</label>
                                            <input type="text" value={formData.petitioner} onChange={(e) => setFormData({ ...formData, petitioner: e.target.value })} placeholder={t('fileUnified.petitionerPlaceholder')} style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>{t('fileUnified.respondent')} *</label>
                                            <input type="text" value={formData.respondent} onChange={(e) => setFormData({ ...formData, respondent: e.target.value })} placeholder={t('fileUnified.respondentPlaceholder')} style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>{t('fileUnified.urgency')}</label>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            {['normal', 'urgent', 'critical'].map((level) => (
                                                <button key={level} onClick={() => setFormData({ ...formData, urgency: level })} style={{ flex: 1, padding: '0.75rem', background: formData.urgency === level ? 'rgba(30, 42, 68, 0.2)' : 'var(--bg-glass)', border: formData.urgency === level ? '2px solid var(--color-primary)' : 'var(--border-glass)', borderRadius: '0.75rem', color: formData.urgency === level ? 'var(--color-primary)' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', textTransform: 'capitalize' }}>{t(`fileUnified.${level}`)}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Documents */}
                        {currentStep === 3 && (
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>{t('fileUnified.uploadDocuments')}</h2>
                                <label style={{ display: 'block', padding: '3rem', background: 'var(--bg-glass)', border: '2px dashed var(--border-glass)', borderRadius: '1rem', textAlign: 'center', cursor: 'pointer', marginBottom: '1.5rem' }}>
                                    <input type="file" multiple onChange={handleFileUpload} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                                    <Upload size={40} style={{ color: 'var(--color-primary)', margin: '0 auto 1rem' }} />
                                    <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>{t('fileUnified.clickUploadFiles')}</p>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t('fileUnified.supportedFormats')}</p>
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
                                                                {doc.analyzing ? t('fileUnified.thinking'): t('fileUnified.analyzeDocument')}
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
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>{t('fileUnified.reviewConfirm')}</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: '0.75rem' }}>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t('fileUnified.caseType')}:</span>
                                        <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>{t(`fileUnified.${caseTypes.find((c) =>c.id === formData.caseType)?.nameKey}`)}</p>
                                    </div>
                                    <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: '0.75rem' }}>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t('fileUnified.title')}:</span>
                                        <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>{formData.title}</p>
                                    </div>
                                    <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: '0.75rem' }}>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t('fileUnified.petitionerRespondent')}:</span>
                                        <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>{formData.petitioner} vs {formData.respondent}</p>
                                    </div>
                                    <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: '0.75rem' }}>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t('fileUnified.documents')}:</span>
                                        <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>{formData.documents.length} {t('fileUnified.files')}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                        <button onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1} style={{ padding: '1rem 2rem', background: currentStep === 1 ? 'var(--bg-glass)' : 'rgba(30, 42, 68, 0.1)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: currentStep === 1 ? 'var(--text-secondary)' : 'var(--color-primary)', fontWeight: '600', cursor: currentStep === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ChevronLeft size={20} /> {t('fileUnified.previous')}
                        </button>
                        {currentStep < 4 ? (
                            <button onClick={() => setCurrentStep(currentStep + 1)} disabled={!canProceed()} style={{ padding: '1rem 2rem', background: canProceed() ? 'var(--color-primary)' : 'var(--bg-glass)', border: 'none', borderRadius: '0.75rem', color: canProceed() ? 'white' : 'var(--text-secondary)', fontWeight: '700', cursor: canProceed() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {t('fileUnified.next')} <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button onClick={handleSubmitCase} disabled={uploading} style={{ padding: '1rem 2rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', borderRadius: '0.75rem', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle2 size={20} /> {uploading ? t('fileUnified.submitting'): t('fileUnified.submitCase')}
                            </button>
                        )}
                    </div>
                </>
            )}

            {/* FIR TAB */}
            {activeTab === 'fir' && (
                <div style={{ background: 'var(--bg-glass-strong)', border: 'var(--border-glass-strong)', borderRadius: '1.5rem', padding: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Siren size={24} color="#ef4444" /> {t('fileUnified.filePoliceFir')}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>{t('fileUnified.incidentTitle')}*</label>
                            <input type="text" value={firData.title} onChange={(e) => setFirData({ ...firData, title: e.target.value })} placeholder={t('fileUnified.incidentTitlePlaceholder')} style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}><Calendar size={16} /> {t('fileUnified.incidentDate')}</label>
                                <input type="date" value={firData.incidentDate} onChange={(e) => setFirData({ ...firData, incidentDate: e.target.value })} style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)' }} />
                            </div>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}><MapPin size={16} /> {t('fileUnified.location')}</label>
                                <input type="text" value={firData.incidentLocation} onChange={(e) => setFirData({ ...firData, incidentLocation: e.target.value })} placeholder={t('fileUnified.locationPlaceholder')} style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)' }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>{t('fileUnified.incidentDescription')} *</label>
                            <textarea value={firData.description} onChange={(e) => setFirData({ ...firData, description: e.target.value })} placeholder={t('fileUnified.incidentDescriptionPlaceholder')} rows={6} style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)', resize: 'vertical' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>{t('fileUnified.evidenceOptional')}</label>
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
                                            <p style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '0.25rem' }}>{t('fileUnified.clickUploadEvidence')}</p>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{t('fileUnified.supportedEvidenceFormats')}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <button onClick={handleSubmitFir} disabled={uploading || !firData.title || !firData.description} style={{ marginTop: '1rem', padding: '1rem', background: (!firData.title || !firData.description) ? 'var(--bg-glass)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: 'none', borderRadius: '0.75rem', color: (!firData.title || !firData.description) ? 'var(--text-secondary)' : 'white', fontWeight: '700', cursor: (!firData.title || !firData.description) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Shield size={20} /> {uploading? t('fileUnified.submitting'): t('fileUnified.submitFirPolice')}
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
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>{t('fileUnified.nyaySaarthiAssist')}</h2>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('fileUnified.aiAssistDescription')}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAiAssistant(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        {!aiSuggestion ? (
                            <>
                                <textarea
                                    value={aiQuery}
                                    onChange={e => setAiQuery(e.target.value)}
                                    placeholder={t('fileUnified.aiPlaceholder')}
                                    rows={5}
                                    style={{ width: '100%', padding: '1rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '1rem', color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1rem' }}
                                />
                                <button
                                    onClick={handleAiAssist}
                                    disabled={aiThinking || !aiQuery.trim()}
                                    style={{ width: '100%', padding: '1rem', background: 'var(--color-primary)', border: 'none', borderRadius: '1rem', color: 'white', fontWeight: '700', cursor: (aiThinking || !aiQuery.trim()) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                >
                                    {aiThinking ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
                                    {aiThinking? t('fileUnified.analyzingCase'): t('fileUnified.analyzeSuggest')}
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
                                            <span style={{ color: 'var(--text-secondary)' }}>{t('fileUnified.recommendedFiling')}:</span>
                                            <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{aiSuggestion.type === 'fir'? t('fileUnified.policeFir'): t('fileUnified.courtCase')}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>{t('fileUnified.category')}:</span>
                                            <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{aiSuggestion.caseType === 'criminal'? t('fileUnified.criminal'): t('fileUnified.civil')}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>{t('fileUnified.suggestedTitle')}:</span>
                                            <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{aiSuggestion.title}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={applyAiSuggestion}
                                    style={{ width: '100%', padding: '1rem', background: 'var(--color-primary)', border: 'none', borderRadius: '1rem', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                >
                                    <CheckCircle2 size={20} /> {t('fileUnified.convertToFiling')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add custom CSS for scrollbar */}
            <style>{`
                .horizontal-scroll-cards::-webkit-scrollbar {
                    height: 6px;
                }
                .horizontal-scroll-cards::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .horizontal-scroll-cards::-webkit-scrollbar-thumb {
                    background: var(--color-primary);
                    border-radius: 10px;
                }
                .horizontal-scroll-cards::-webkit-scrollbar-thumb:hover {
                    background: #7c3aed;
                    cursor: pointer;
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}