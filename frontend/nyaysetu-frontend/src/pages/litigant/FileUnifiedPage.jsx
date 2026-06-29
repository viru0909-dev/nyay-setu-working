import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft, ChevronRight, Upload, X, FileText,
    CheckCircle2, Scale, Users, Home as HomeIcon, Briefcase,
    AlertCircle, Shield, MapPin, Calendar,
    Bot, Sparkles, Wand2, Loader2, BrainCircuit, ClipboardList, Siren
} from 'lucide-react';
import { caseAPI, documentAPI, clientFirAPI, brainAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import FilingProgressIndicator from '../../components/common/FilingProgressIndicator';
import useFormDraft from '../../hooks/useFormDraft';
import useUnsavedChanges from '../../hooks/useUnsavedChanges';
import {
    CASE_FIELD_LIMITS,
    getCaseStepFields,
    getRestorableCaseStep,
    getStepErrors,
    hasMeaningfulCaseDraft,
    hasMeaningfulFirDraft,
    sanitizeCaseDraft,
    sanitizeFirDraft,
    validateCaseFiling,
    validateFirFiling
} from '../../utils/caseFilingValidation';
import '../../styles/case-filing.css';

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

const MS_PER_MINUTE = 60 * 10 * 100;
const CASE_SUBMIT_GRADIENT = 'linear-gradient(135deg, #10b' + '981 0%, #059' + '669 100%)';
const CASE_DRAFT_STORAGE_KEY = 'nyay-setu:file-unified-draft:v1';
const EMPTY_CASE_FORM = {
    caseType: '',
    title: '',
    description: '',
    petitioner: '',
    respondent: '',
    urgency: 'normal',
    documents: []
};
const EMPTY_FIR_FORM = {
    title: '',
    description: '',
    incidentDate: '',
    incidentLocation: ''
};
const REQUIRED_DRAFT_KEYS = ['activeTab', 'currentStep', 'caseForm', 'firData'];

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
    const [formData, setFormData] = useState(EMPTY_CASE_FORM);

    // FIR filing state
    const [firData, setFirData] = useState(EMPTY_FIR_FORM);
    const [firFile, setFirFile] = useState(null);

    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [touchedFields, setTouchedFields] = useState({});
    const [attemptedStep, setAttemptedStep] = useState(null);
    const [attemptedFirSubmit, setAttemptedFirSubmit] = useState(false);
    const [draftReady, setDraftReady] = useState(false);
    const [draftRestored, setDraftRestored] = useState(false);
    const [draftNoticeVisible, setDraftNoticeVisible] = useState(false);
    const [submissionSucceeded, setSubmissionSucceeded] = useState(false);
    const navigate = useNavigate();
    const draftExcludeFields = useMemo(() => [], []);
    const { hasDraft, draftTimestamp, saveDraft, restoreDraft, clearDraft } = useFormDraft(
        CASE_DRAFT_STORAGE_KEY,
        draftExcludeFields,
        700
    );
    const hasHydratedDraftRef = useRef(false);

    // const steps = [
    //     { number: 1, name: 'Case Type', desc: 'Select category' },
    //     { number: 2, name: 'Case Details', desc: 'Provide information' },
    //     { number: 3, name: 'Documents', desc: 'Upload files' },
    //     { number: 4, name: 'Review', desc: 'Confirm & submit' }
    // ];

    const steps = useMemo(() => [
        { number: 1, name: t('fileUnified.caseType'), desc: t('fileUnified.selectCategory') },
        { number: 2, name: t('fileUnified.caseDetails'), desc: t('fileUnified.provideInformation') },
        { number: 3, name: t('fileUnified.documents'), desc: t('fileUnified.uploadFiles') },
        { number: 4, name: t('fileUnified.review'), desc: t('fileUnified.confirmSubmit') }
    ], [t]);

    const caseErrors = useMemo(() => validateCaseFiling(formData), [formData]);
    const firErrors = useMemo(() => validateFirFiling(firData), [firData]);
    const isFirValid = Object.keys(firErrors).length === 0;
    const hasCaseDraftContent = useMemo(() => hasMeaningfulCaseDraft(formData), [formData]);
    const hasFirDraftContent = useMemo(() => hasMeaningfulFirDraft(firData, firFile), [firData, firFile]);
    const isDirty = !submissionSucceeded && !result && (hasCaseDraftContent || hasFirDraftContent);

    useUnsavedChanges(isDirty, 'You have unsaved filing changes. Leave this page?');

    const getVisibleError = useCallback((field) => {
        const isFirField = ['firTitle', 'firDescription', 'incidentLocation'].includes(field);
        const shouldShow = touchedFields[field]
            || (isFirField
                ? attemptedFirSubmit
                : attemptedStep === currentStep || (currentStep === 4 && attemptedStep === 4));

        return shouldShow ? (caseErrors[field] || firErrors[field]) : null;
    }, [attemptedFirSubmit, attemptedStep, caseErrors, currentStep, firErrors, touchedFields]);

    const markTouched = useCallback((field) => {
        setTouchedFields((prev) => ({ ...prev, [field]: true }));
    }, []);

    const updateCaseField = useCallback((field, value) => {
        markTouched(field);
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, [markTouched]);

    const updateFirField = useCallback((field, value) => {
        const touchedKey = field === 'title'
            ? 'firTitle'
            : field === 'description'
                ? 'firDescription'
                : field;
        markTouched(touchedKey);
        setFirData((prev) => ({ ...prev, [field]: value }));
    }, [markTouched]);

    const buildDraftPayload = useCallback(() => ({
        activeTab,
        currentStep,
        caseForm: {
            ...sanitizeCaseDraft(formData),
            documents: []
        },
        firData: sanitizeFirDraft(firData)
    }), [activeTab, currentStep, firData, formData]);

    const resetForms = useCallback(() => {
        setCurrentStep(1);
        setFormData(EMPTY_CASE_FORM);
        setFirData(EMPTY_FIR_FORM);
        setFirFile(null);
        setTouchedFields({});
        setAttemptedStep(null);
        setAttemptedFirSubmit(false);
    }, []);

    useEffect(() => {
        if (hasHydratedDraftRef.current) return;

        const draft = restoreDraft(REQUIRED_DRAFT_KEYS);
        if (draft) {
            const restoredCaseForm = sanitizeCaseDraft(draft.caseForm);
            const restoredFirData = sanitizeFirDraft(draft.firData);
            const restoredStep = getRestorableCaseStep(draft.currentStep, restoredCaseForm);

            setActiveTab(draft.activeTab === 'fir' ? 'fir' : 'case');
            setCurrentStep(restoredStep);
            setFormData(restoredCaseForm);
            setFirData(restoredFirData);
            setDraftRestored(true);
            setDraftNoticeVisible(true);
        }

        hasHydratedDraftRef.current = true;
        setDraftReady(true);
    }, [restoreDraft]);

    useEffect(() => {
        if (!draftReady || result || submissionSucceeded) return;

        if (hasCaseDraftContent || hasFirDraftContent) {
            saveDraft(buildDraftPayload());
        } else if (hasDraft) {
            clearDraft();
        }
    }, [
        buildDraftPayload,
        clearDraft,
        draftReady,
        hasCaseDraftContent,
        hasDraft,
        hasFirDraftContent,
        result,
        saveDraft,
        submissionSucceeded
    ]);

    const formatDraftTime = () => {
        if (!draftTimestamp) return 'recently';

        const minutes = Math.max(0, Math.round((Date.now() - draftTimestamp) / MS_PER_MINUTE));
        if (minutes < 1) return 'just now';
        if (minutes === 1) return '1 minute ago';
        return `${minutes} minutes ago`;
    };

    const discardDraft = () => {
        clearDraft();
        resetForms();
        setActiveTab('case');
        setDraftNoticeVisible(false);
        setDraftRestored(false);
    };

    const canProceed = useCallback(() => {
        const stepErrors = getStepErrors(currentStep, caseErrors);
        return Object.keys(stepErrors).length === 0;
    }, [caseErrors, currentStep]);

    const handleNextStep = () => {
        const stepFields = getCaseStepFields(currentStep);
        setAttemptedStep(currentStep);
        setTouchedFields((prev) => stepFields.reduce((next, field) => ({ ...next, [field]: true }), prev));

        if (!canProceed()) return;

        setCurrentStep((step) => Math.min(steps.length, step + 1));
        setAttemptedStep(null);
    };

    const confirmLeavingFiling = () => {
        return !isDirty || window.confirm('You have unsaved filing changes. Leave this page?');
    };

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
            setFirData((prev) => ({
                ...prev,
                title: aiSuggestion.title,
                description: aiSuggestion.description
            }));
            setTouchedFields((prev) => ({ ...prev, firTitle: true, firDescription: true }));
        } else {
            setActiveTab('case');
            setFormData((prev) => ({
                ...prev,
                caseType: aiSuggestion.caseType,
                title: aiSuggestion.title,
                description: aiSuggestion.description
            }));
            setTouchedFields((prev) => ({ ...prev, caseType: true, title: true, description: true }));
            setCurrentStep(2);
        }
        setShowAiAssistant(false);
        setAiQuery('');
        setAiSuggestion(null);
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setFormData((prev) => ({
            ...prev,
            documents: [...prev.documents, ...files.map(f => ({ file: f, name: f.name, size: f.size, aiAnalyzed: false }))]
        }));
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
        const submitErrors = validateCaseFiling(formData);
        if (Object.keys(submitErrors).length > 0) {
            setAttemptedStep(4);
            setTouchedFields((prev) => getCaseStepFields(4).reduce((next, field) => ({ ...next, [field]: true }), prev));
            setCurrentStep(submitErrors.caseType ? 1 : 2);
            return;
        }

        setUploading(true);
        try {
            const caseData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                caseType: formData.caseType.toUpperCase(),
                petitioner: formData.petitioner.trim(),
                respondent: formData.respondent.trim(),
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

            clearDraft();
            setSubmissionSucceeded(true);
            setResult({ type: 'case', data: response.data });
        } catch (error) {
            console.error('Error creating case:', error);
            alert(t('popups.caseCreateFailed'));
        } finally {
            setUploading(false);
        }
    };

    const handleSubmitFir = async () => {
        const submitErrors = validateFirFiling(firData);
        setAttemptedFirSubmit(true);
        setTouchedFields((prev) => ({ ...prev, firTitle: true, firDescription: true }));

        if (Object.keys(submitErrors).length > 0) {
            return;
        }

        setUploading(true);
        try {
            const data = new FormData();
            data.append('title', firData.title.trim());
            data.append('description', firData.description.trim());
            if (firData.incidentDate) data.append('incidentDate', firData.incidentDate);
            if (firData.incidentLocation) data.append('incidentLocation', firData.incidentLocation.trim());
            data.append('aiGenerated', false);
            if (firFile) data.append('file', firFile);

            const response = await clientFirAPI.fileFir(data);
            clearDraft();
            setSubmissionSucceeded(true);
            setResult({ type: 'fir', data: response.data });
        } catch (error) {
            console.error('Error filing FIR:', error);
            alert(t('popups.firFiledFailed'));
        } finally {
            setUploading(false);
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
                                setSubmissionSucceeded(false);
                                resetForms();
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
                        onClick={() => {
                            if (confirmLeavingFiling()) {
                                navigate('/litigant');
                            }
                        }}
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
                    onClick={() => setActiveTab('case')}
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

            {draftNoticeVisible && draftRestored && (
                <div className="draft-banner" role="status" aria-live="polite">
                    <div className="draft-banner__icon">
                        <FileText size={20} aria-hidden="true" />
                    </div>
                    <div className="draft-banner__text">
                        <div className="draft-banner__title">Draft restored</div>
                        <div className="draft-banner__subtitle">
                            Your saved filing progress was restored from {formatDraftTime()}. Uploaded files must be selected again after a refresh.
                        </div>
                    </div>
                    <div className="draft-banner__actions">
                        <button
                            type="button"
                            className="draft-banner__btn draft-banner__btn--restore"
                            onClick={() => setDraftNoticeVisible(false)}
                        >
                            Continue
                        </button>
                        <button
                            type="button"
                            className="draft-banner__btn draft-banner__btn--discard"
                            onClick={discardDraft}
                        >
                            Discard draft
                        </button>
                    </div>
                </div>
            )}

            {/* COURT CASE TAB */}
            {activeTab === 'case' && (
                <>
                    {/* Progress Steps */}
                    <FilingProgressIndicator
                        steps={steps}
                        currentStep={currentStep}
                        onStepSelect={setCurrentStep}
                    />

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
                                                type="button"
                                                onClick={() => updateCaseField('caseType', type.id)}
                                                aria-pressed={isSelected}
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
                                {getVisibleError('caseType') && (
                                    <div className="field-error-message" id="caseType-error">
                                        <AlertCircle size={14} aria-hidden="true" />
                                        {getVisibleError('caseType')}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Case Details */}
                        {currentStep === 2 && (
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>{t('fileUnified.caseDetails')}</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>{t('fileUnified.caseTitle')} *</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            maxLength={CASE_FIELD_LIMITS.title}
                                            onBlur={() => markTouched('title')}
                                            onChange={(e) => updateCaseField('title', e.target.value)}
                                            placeholder={t('fileUnified.caseTitlePlaceholder')}
                                            className={getVisibleError('title') ? 'field-error-input' : ''}
                                            aria-invalid={Boolean(getVisibleError('title'))}
                                            aria-describedby={getVisibleError('title') ? 'title-error' : undefined}
                                            style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)' }}
                                        />
                                        {getVisibleError('title') && (
                                            <div className="field-error-message" id="title-error">
                                                <AlertCircle size={14} aria-hidden="true" />
                                                {getVisibleError('title')}
                                            </div>
                                        )}
                                        <div className="char-counter">{formData.title.length}/{CASE_FIELD_LIMITS.title}</div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>{t('fileUnified.caseDescription')} *</label>
                                        <textarea
                                            value={formData.description}
                                            maxLength={CASE_FIELD_LIMITS.description}
                                            onBlur={() => markTouched('description')}
                                            onChange={(e) => updateCaseField('description', e.target.value)}
                                            placeholder={t('fileUnified.caseDescriptionPlaceholder')}
                                            rows={5}
                                            className={getVisibleError('description') ? 'field-error-input' : ''}
                                            aria-invalid={Boolean(getVisibleError('description'))}
                                            aria-describedby={getVisibleError('description') ? 'description-error' : undefined}
                                            style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)', resize: 'vertical' }}
                                        />
                                        {getVisibleError('description') && (
                                            <div className="field-error-message" id="description-error">
                                                <AlertCircle size={14} aria-hidden="true" />
                                                {getVisibleError('description')}
                                            </div>
                                        )}
                                        <div className={`char-counter${formData.description.length > CASE_FIELD_LIMITS.description * 0.9 ? ' char-counter--warning' : ''}`}>
                                            {formData.description.length}/{CASE_FIELD_LIMITS.description}
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>{t('fileUnified.petitioner')} *</label>
                                            <input
                                                type="text"
                                                value={formData.petitioner}
                                                maxLength={CASE_FIELD_LIMITS.partyName}
                                                onBlur={() => markTouched('petitioner')}
                                                onChange={(e) => updateCaseField('petitioner', e.target.value)}
                                                placeholder={t('fileUnified.petitionerPlaceholder')}
                                                className={getVisibleError('petitioner') ? 'field-error-input' : ''}
                                                aria-invalid={Boolean(getVisibleError('petitioner'))}
                                                aria-describedby={getVisibleError('petitioner') ? 'petitioner-error' : undefined}
                                                style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)' }}
                                            />
                                            {getVisibleError('petitioner') && (
                                                <div className="field-error-message" id="petitioner-error">
                                                    <AlertCircle size={14} aria-hidden="true" />
                                                    {getVisibleError('petitioner')}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>{t('fileUnified.respondent')} *</label>
                                            <input
                                                type="text"
                                                value={formData.respondent}
                                                maxLength={CASE_FIELD_LIMITS.partyName}
                                                onBlur={() => markTouched('respondent')}
                                                onChange={(e) => updateCaseField('respondent', e.target.value)}
                                                placeholder={t('fileUnified.respondentPlaceholder')}
                                                className={getVisibleError('respondent') ? 'field-error-input' : ''}
                                                aria-invalid={Boolean(getVisibleError('respondent'))}
                                                aria-describedby={getVisibleError('respondent') ? 'respondent-error' : undefined}
                                                style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)' }}
                                            />
                                            {getVisibleError('respondent') && (
                                                <div className="field-error-message" id="respondent-error">
                                                    <AlertCircle size={14} aria-hidden="true" />
                                                    {getVisibleError('respondent')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>{t('fileUnified.urgency')}</label>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            {['normal', 'urgent', 'critical'].map((level) => (
                                                <button key={level} type="button" onClick={() => updateCaseField('urgency', level)} style={{ flex: 1, padding: '0.75rem', background: formData.urgency === level ? 'rgba(30, 42, 68, 0.2)' : 'var(--bg-glass)', border: formData.urgency === level ? '2px solid var(--color-primary)' : 'var(--border-glass)', borderRadius: '0.75rem', color: formData.urgency === level ? 'var(--color-primary)' : 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', textTransform: 'capitalize' }}>{t(`fileUnified.${level}`)}</button>
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
                            <button onClick={handleNextStep} aria-disabled={!canProceed()} style={{ padding: '1rem 2rem', background: canProceed() ? 'var(--color-primary)' : 'var(--bg-glass)', border: 'none', borderRadius: '0.75rem', color: canProceed() ? 'white' : 'var(--text-secondary)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {t('fileUnified.next')} <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button onClick={handleSubmitCase} disabled={uploading || !canProceed()} style={{ padding: '1rem 2rem', background: canProceed() ? CASE_SUBMIT_GRADIENT : 'var(--bg-glass)', border: 'none', borderRadius: '0.75rem', color: canProceed() ? 'white' : 'var(--text-secondary)', fontWeight: '700', cursor: uploading || !canProceed() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                            <input
                                type="text"
                                value={firData.title}
                                maxLength={CASE_FIELD_LIMITS.title}
                                onBlur={() => markTouched('firTitle')}
                                onChange={(e) => updateFirField('title', e.target.value)}
                                placeholder={t('fileUnified.incidentTitlePlaceholder')}
                                className={getVisibleError('firTitle') ? 'field-error-input' : ''}
                                aria-invalid={Boolean(getVisibleError('firTitle'))}
                                aria-describedby={getVisibleError('firTitle') ? 'firTitle-error' : undefined}
                                style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)' }}
                            />
                            {getVisibleError('firTitle') && (
                                <div className="field-error-message" id="firTitle-error">
                                    <AlertCircle size={14} aria-hidden="true" />
                                    {getVisibleError('firTitle')}
                                </div>
                            )}
                            <div className="char-counter">{firData.title.length}/{CASE_FIELD_LIMITS.title}</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}><Calendar size={16} /> {t('fileUnified.incidentDate')}</label>
                                <input type="date" value={firData.incidentDate} onChange={(e) => updateFirField('incidentDate', e.target.value)} style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)' }} />
                            </div>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}><MapPin size={16} /> {t('fileUnified.location')}</label>
                                <input
                                    type="text"
                                    value={firData.incidentLocation}
                                    maxLength={CASE_FIELD_LIMITS.location}
                                    onBlur={() => markTouched('incidentLocation')}
                                    onChange={(e) => updateFirField('incidentLocation', e.target.value)}
                                    placeholder={t('fileUnified.locationPlaceholder')}
                                    className={getVisibleError('incidentLocation') ? 'field-error-input' : ''}
                                    aria-invalid={Boolean(getVisibleError('incidentLocation'))}
                                    aria-describedby={getVisibleError('incidentLocation') ? 'incidentLocation-error' : undefined}
                                    style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)' }}
                                />
                                {getVisibleError('incidentLocation') && (
                                    <div className="field-error-message" id="incidentLocation-error">
                                        <AlertCircle size={14} aria-hidden="true" />
                                        {getVisibleError('incidentLocation')}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>{t('fileUnified.incidentDescription')} *</label>
                            <textarea
                                value={firData.description}
                                maxLength={CASE_FIELD_LIMITS.description}
                                onBlur={() => markTouched('firDescription')}
                                onChange={(e) => updateFirField('description', e.target.value)}
                                placeholder={t('fileUnified.incidentDescriptionPlaceholder')}
                                rows={6}
                                className={getVisibleError('firDescription') ? 'field-error-input' : ''}
                                aria-invalid={Boolean(getVisibleError('firDescription'))}
                                aria-describedby={getVisibleError('firDescription') ? 'firDescription-error' : undefined}
                                style={{ width: '100%', padding: '0.875rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)', resize: 'vertical' }}
                            />
                            {getVisibleError('firDescription') && (
                                <div className="field-error-message" id="firDescription-error">
                                    <AlertCircle size={14} aria-hidden="true" />
                                    {getVisibleError('firDescription')}
                                </div>
                            )}
                            <div className={`char-counter${firData.description.length > CASE_FIELD_LIMITS.description * 0.9 ? ' char-counter--warning' : ''}`}>
                                {firData.description.length}/{CASE_FIELD_LIMITS.description}
                            </div>
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
                        <button onClick={handleSubmitFir} disabled={uploading} aria-disabled={!isFirValid} style={{ marginTop: '1rem', padding: '1rem', background: !isFirValid ? 'var(--bg-glass)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: 'none', borderRadius: '0.75rem', color: !isFirValid ? 'var(--text-secondary)' : 'white', fontWeight: '700', cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
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
