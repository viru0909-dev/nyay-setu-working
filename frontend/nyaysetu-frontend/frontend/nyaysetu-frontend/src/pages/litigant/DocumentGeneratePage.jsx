import React, { useState } from 'react';
import {
    FileText, ScrollText, Send, Download,
    AlertTriangle, CheckCircle, ArrowLeft,
    ArrowRight, Loader2, BookOpen, Scale,
    ClipboardList, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import lawgpt from '../../services/lawgptService';
import styles from './DocumentGeneratePage.module.css';
import { documentGenerateAPI } from '../../services/api';

const DOC_TYPES = [
    {
        id: 'affidavit',
        icon: ScrollText,
        title: 'Affidavit',
        description: 'Sworn statement of facts for court submission',
        color: '#3B82F6',
        bgColor: 'rgba(59, 130, 246, 0.08)',
    },
    {
        id: 'rti',
        icon: ClipboardList,
        title: 'RTI Application',
        description: 'Request information from government departments',
        color: '#10B981',
        bgColor: 'rgba(16, 185, 129, 0.08)',
    },
    {
        id: 'complaint',
        icon: Scale,
        title: 'Legal Complaint',
        description: 'File a formal complaint with the court',
        color: '#F59E0B',
        bgColor: 'rgba(245, 158, 11, 0.08)',
    },
    {
        id: 'notice',
        icon: Mail,
        title: 'Legal Notice',
        description: 'Send a formal legal notice to a party',
        color: '#EF4444',
        bgColor: 'rgba(239, 68, 68, 0.08)',
    },
];

const DocumentGeneratePage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isCopying, setIsCopying] = useState(false);
    const [generatedDoc, setGeneratedDoc] = useState(null);
    const [error, setError] = useState(null);
    const [clipboardStatus, setClipboardStatus] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [injectionWarnings, setInjectionWarnings] = useState([]);

    // Form fields
    const [form, setForm] = useState({
        petitionerName: '',
        petitionerAddress: '',
        respondentName: '',
        respondentAddress: '',
        caseDescription: '',
        incidentDate: '',
        reliefSought: '',
        courtName: '',
        departmentName: '',
        pioName: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const selectDocType = (typeId) => {
        setSelectedType(typeId);
        setStep(2);
        setGeneratedDoc(null);
        setError(null);
    };

    const isFormValid = () => {
        if (!form.petitionerName || !form.petitionerAddress || !form.caseDescription || !form.incidentDate) {
            return false;
        }
        if (selectedType === 'rti') {
            return !!form.departmentName;
        }
        if (selectedType !== 'rti') {
            return !!form.respondentName && !!form.respondentAddress && !!form.reliefSought;
        }
        return true;
    };

    const handleGeneratePreview = async () => {
        setIsGenerating(true);
        setError(null);
        setValidationErrors({});
        setInjectionWarnings([]);
        try {
            const payload = {
                doc_type: selectedType,
                fields: {
                    petitioner_name: form.petitionerName,
                    petitioner_address: form.petitionerAddress,
                    respondent_name: form.respondentName,
                    respondent_address: form.respondentAddress,
                    case_description: form.caseDescription,
                    incident_date: form.incidentDate,
                    relief_sought: form.reliefSought,
                    court_name: form.courtName,
                    department_name: form.departmentName,
                    pio_name: form.pioName,
                },
                language: 'en',
            };

            const response = await lawgpt.generate(payload);
            setGeneratedDoc(response.data);
            setStep(3);
        } catch (err) {
            handleApiError(err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadPdf = async () => {
        setIsDownloading(true);
        setError(null);
        setClipboardStatus('');
        setValidationErrors({});
        setInjectionWarnings([]);
        try {
            const payload = {
                doc_type: selectedType,
                fields: {
                    petitioner_name: form.petitionerName,
                    petitioner_address: form.petitionerAddress,
                    respondent_name: form.respondentName,
                    respondent_address: form.respondentAddress,
                    case_description: form.caseDescription,
                    incident_date: form.incidentDate,
                    relief_sought: form.reliefSought,
                    court_name: form.courtName,
                    department_name: form.departmentName,
                    pio_name: form.pioName,
                },
                language: 'en',
            };

            const response = await lawgpt.generatePdf(payload);

            // Create download link
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${selectedType}_${form.petitionerName.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            handleApiError(err);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadDocx = async () => {
        setIsDownloading(true);
        setError(null);
        setClipboardStatus('');
        setValidationErrors({});
        setInjectionWarnings([]);
        try {
            const payload = {
                doc_type: selectedType,
                fields: {
                    petitioner_name: form.petitionerName,
                    petitioner_address: form.petitionerAddress,
                    respondent_name: form.respondentName,
                    respondent_address: form.respondentAddress,
                    case_description: form.caseDescription,
                    incident_date: form.incidentDate,
                    relief_sought: form.reliefSought,
                    court_name: form.courtName,
                    department_name: form.departmentName,
                    pio_name: form.pioName,
                },
                language: 'en',
            };

            const response = await lawgpt.generateDocx(payload);
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${selectedType}_${form.petitionerName.replace(/\s+/g, '_')}.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            handleApiError(err);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleCopyToClipboard = async () => {
        setIsCopying(true);
        setClipboardStatus('');
        try {
            await navigator.clipboard.writeText(generatedDoc.content || '');
            setClipboardStatus('Copied to clipboard');
        } catch (copyError) {
            setClipboardStatus('Failed to copy to clipboard');
        } finally {
            setIsCopying(false);
            window.setTimeout(() => setClipboardStatus(''), 3000);
        }
    };

    const mapBackendToFrontend = (name) => name.replace(/_([a-z])/g, (m, p) => p.toUpperCase());

    const handleApiError = (err) => {
        const resp = err.response;
        setGeneratedDoc(null);
        setValidationErrors({});
        setInjectionWarnings([]);

        // Pydantic validation errors (list)
        if (resp && Array.isArray(resp.data?.detail)) {
            const fieldErrors = {};
            resp.data.detail.forEach((d) => {
                const loc = d.loc || [];
                const idx = loc.indexOf('fields');
                if (idx !== -1 && loc.length > idx + 1) {
                    const backendField = loc[idx + 1];
                    const front = mapBackendToFrontend(backendField);
                    fieldErrors[front] = d.msg;
                }
            });
            setValidationErrors(fieldErrors);
            setError('Please fix the highlighted fields.');
            setStep(2);
            return;
        }

        const detail = resp?.data?.detail || resp?.data || null;
        if (detail && typeof detail === 'object') {
            if (detail.missing_fields) {
                const errs = {};
                detail.missing_fields.forEach((bf) => {
                    errs[mapBackendToFrontend(bf)] = 'This field is required.';
                });
                setValidationErrors(errs);
                setError('Required fields are missing — please complete them.');
                setStep(2);
                return;
            }
            if (detail.prompt_injection_detected) {
                setInjectionWarnings(detail.prompt_injection_detected || []);
                setError('Potential prompt-injection detected in your inputs — please remove suspicious content.');
                setStep(2);
                return;
            }
            setError(JSON.stringify(detail));
            return;
        }

        setError(err.message || 'An unexpected error occurred');
    };

    const selectedDocInfo = DOC_TYPES.find(d => d.id === selectedType);

    // ── Shared styles ────────────────────────────────────────────────────────

    const cardStyle = {
        background: 'var(--bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '1rem',
        padding: '1.5rem',
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem 1rem',
        border: 'var(--color-border)',
        borderRadius: '0.5rem',
        fontSize: '0.9rem',
        outline: 'none',
        transition: 'border-color 0.2s',
        background: 'var(--bg-surface)',
        fontFamily: 'inherit',
        color:'var(--text-main)'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: 'var(--text-main)',
        marginBottom: '0.35rem',
    };

    const btnPrimary = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        background: 'var(--color-primary)',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        fontSize: '0.9rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
    };

    const btnOutline = {
        ...btnPrimary,
        background: 'transparent',
        color: 'var(--color-primary)',
        border: '1px solid var(--color-primary)',
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div style={{
            height: 'calc(100vh - 64px)',
            background: 'var(--color-bg-alt)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
        }}>
            {/* Header */}
            <header style={{
                padding: '1rem 1.5rem',
                background: 'var(--bg-surface)',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
            }}>
                <button
                    onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Generate Legal Document</h1>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                        AI-powered document generation using Indian legal corpus
                    </p>
                </div>
                {/* Step indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {[1, 2, 3].map((s) => (
                        <div key={s} style={{
                            width: s === step ? '2rem' : '0.5rem',
                            height: '0.5rem',
                            borderRadius: '0.25rem',
                            background: s <= step ? 'var(--color-primary)' : 'var(--color-border)',
                            transition: 'all 0.3s',
                        }} />
                    ))}
                </div>
            </header>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                <AnimatePresence mode="wait">

                    {/* ─── Step 1: Document Type Selection ────────────────── */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.25 }}
                        >
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-main)' }}>
                                Select Document Type
                            </h2>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '1rem',
                                maxWidth: '700px',
                            }}>
                                {DOC_TYPES.map((docType) => {
                                    const Icon = docType.icon;
                                    return (
                                        <motion.div
                                            key={docType.id}
                                            whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => selectDocType(docType.id)}
                                            style={{
                                                ...cardStyle,
                                                cursor: 'pointer',
                                                borderColor: selectedType === docType.id ? docType.color : '#E5E7EB',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '12px',
                                                background: docType.bgColor,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: '0.75rem',
                                            }}>
                                                <Icon size={24} color={docType.color} />
                                            </div>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.25rem', color: 'var(--text-main)' }}>
                                                {docType.title}
                                            </h3>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                                                {docType.description}
                                            </p>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* ─── Step 2: Dynamic Form ──────────────────────────── */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.25 }}
                            style={{ maxWidth: '700px' }}
                        >
                            {selectedDocInfo && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    marginBottom: '1.25rem',
                                    padding: '0.75rem 1rem',
                                    background: selectedDocInfo.bgColor,
                                    borderRadius: '0.75rem',
                                    border: `1px solid ${selectedDocInfo.color}20`,
                                }}>
                                    <selectedDocInfo.icon size={20} color={selectedDocInfo.color} />
                                    <span style={{ fontWeight: 600, color: selectedDocInfo.color }}>
                                        {selectedDocInfo.title}
                                    </span>
                                </div>
                            )}

                            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {/* Common fields */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={labelStyle}>Petitioner Name *</label>
                                        <input name="petitionerName" value={form.petitionerName} onChange={handleInputChange}
                                            style={inputStyle} placeholder="Full legal name" />
                                        {validationErrors.petitionerName && (
                                            <div style={{ color: '#DC2626', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                                                {validationErrors.petitionerName}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Incident Date *</label>
                                        <input name="incidentDate" type="date" value={form.incidentDate} onChange={handleInputChange}
                                            style={inputStyle} />
                                        {validationErrors.incidentDate && (
                                            <div style={{ color: '#DC2626', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                                                {validationErrors.incidentDate}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
    <label className={styles.label}>Petitioner Address *</label>
    <input
        name="petitionerAddress"
        value={form.petitionerAddress}
        onChange={handleInputChange}
        className={styles.input}
        placeholder="Complete residential address"
    />
    {validationErrors.petitionerAddress && (
        <div style={{ color: '#DC2626', fontSize: '0.85rem', marginTop: '0.35rem' }}>
            {validationErrors.petitionerAddress}
        </div>
    )}
</div>
                                {/* Respondent fields (not for RTI) */}
                                {selectedType !== 'rti' && (
                                    <>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={labelStyle}>Respondent Name *</label>
                                                <input name="respondentName" value={form.respondentName} onChange={handleInputChange}
                                                    style={inputStyle} placeholder="Respondent's full name" />
                                                    {validationErrors.respondentName && (
                                                        <div style={{ color: '#DC2626', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                                                            {validationErrors.respondentName}
                                                        </div>
                                                    )}
                                            </div>
                                           <div>
    <label className={styles.label}>Respondent Address *</label>
    <input
        name="respondentAddress"
        value={form.respondentAddress}
        onChange={handleInputChange}
        className={styles.input}
        placeholder="Respondent's address"
    />
    {validationErrors.respondentAddress && (
        <div style={{ color: '#DC2626', fontSize: '0.85rem', marginTop: '0.35rem' }}>
            {validationErrors.respondentAddress}
        </div>
    )}
</div>
                                        </div>
                                    </>
                                )}

                                {/* RTI-specific fields */}
                                {selectedType === 'rti' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={labelStyle}>Department Name *</label>
                                            <input name="departmentName" value={form.departmentName} onChange={handleInputChange}
                                                style={inputStyle} placeholder="e.g. Ministry of Finance" />
                                                {validationErrors.departmentName && (
                                                    <div style={{ color: '#DC2626', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                                                        {validationErrors.departmentName}
                                                    </div>
                                                )}
                                        </div>
                                        <div>
                                            <label style={labelStyle}>PIO Name (optional)</label>
                                            <input name="pioName" value={form.pioName} onChange={handleInputChange}
                                                style={inputStyle} placeholder="Public Information Officer" />
                                                {validationErrors.pioName && (
                                                    <div style={{ color: '#DC2626', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                                                        {validationErrors.pioName}
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                )}

                                {/* Complaint-specific */}
                                {selectedType === 'complaint' && (
                                    <div>
                                        <label style={labelStyle}>Court Name (optional)</label>
                                        <input name="courtName" value={form.courtName} onChange={handleInputChange}
                                            style={inputStyle} placeholder="e.g. District Court, Patiala House" />
                                            {validationErrors.courtName && (
                                                <div style={{ color: '#DC2626', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                                                    {validationErrors.courtName}
                                                </div>
                                            )}
                                    </div>
                                )}

                                <div>
                                    <label style={labelStyle}>
                                        {selectedType === 'rti' ? 'Information Sought *' : 'Case Description *'}
                                    </label>
                                    <textarea name="caseDescription" value={form.caseDescription} onChange={handleInputChange}
                                        style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                                        placeholder={selectedType === 'rti'
                                            ? 'Describe the information you want to obtain...'
                                            : 'Describe the facts of the case in detail...'
                                        }
                                    />
                                    {validationErrors.caseDescription && (
                                        <div style={{ color: '#DC2626', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                                            {validationErrors.caseDescription}
                                        </div>
                                    )}
                                </div>

                                {/* Relief sought (not for RTI) */}
                                {selectedType !== 'rti' && (
                                    <div>
                                        <label style={labelStyle}>Relief Sought *</label>
                                        <textarea name="reliefSought" value={form.reliefSought} onChange={handleInputChange}
                                            style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }}
                                            placeholder="What outcome or remedy are you seeking?"
                                        />
                                        {validationErrors.reliefSought && (
                                            <div style={{ color: '#DC2626', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                                                {validationErrors.reliefSought}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Error */}
                                {error && (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.75rem', background: '#FEF2F2', border: '1px solid #FECACA',
                                        borderRadius: '0.5rem', color: '#DC2626', fontSize: '0.85rem',
                                    }}>
                                        <AlertTriangle size={16} />
                                        {error}
                                    </div>
                                )}
                                {injectionWarnings && injectionWarnings.length > 0 && (
                                    <div style={{
                                        display: 'flex', flexDirection: 'column', gap: '0.5rem',
                                        padding: '0.75rem', background: '#FFF7ED', border: '1px solid #FDE68A',
                                        borderRadius: '0.5rem', color: '#92400E', fontSize: '0.85rem',
                                    }}>
                                        <strong>Suspicious input detected:</strong>
                                        <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                                            {injectionWarnings.map((w, i) => (
                                                <li key={i}>{w}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Actions */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
                                    <button onClick={() => setStep(1)} style={btnOutline}>
                                        <ArrowLeft size={16} /> Back
                                    </button>
                                    <button
                                        onClick={handleGeneratePreview}
                                        disabled={!isFormValid() || isGenerating}
                                        style={{
                                            ...btnPrimary,
                                            opacity: (!isFormValid() || isGenerating) ? 0.5 : 1,
                                            cursor: (!isFormValid() || isGenerating) ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={16} /> Generate Preview
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── Step 3: Preview & Download ─────────────────────── */}
                    {step === 3 && generatedDoc && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.25 }}
                            style={{ maxWidth: '800px' }}
                        >
                            {/* Success banner */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.08)',
                                border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '0.75rem',
                                marginBottom: '1rem',
                            }}>
                                <CheckCircle size={20} color="#10B981" />
                                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#059669' }}>
                                    Document generated successfully
                                </span>
                            </div>

                            {/* Warning */}
                            <div style={{
                                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                                padding: '0.75rem 1rem', background: '#FFFBEB',
                                border: '1px solid #FDE68A', borderRadius: '0.75rem',
                                marginBottom: '1rem',
                            }}>
                                <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <p style={{ fontSize: '0.82rem', color: '#92400E', margin: 0, lineHeight: 1.5 }}>
                                    This document is AI-generated. Please review with a qualified lawyer before submission.
                                </p>
                            </div>

                            {/* Document preview */}
                            <div style={{ ...cardStyle, marginBottom: '1rem' }}>
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    marginBottom: '1rem', paddingBottom: '0.75rem',
                                    borderBottom: '1px solid var(--color-border)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FileText size={18} color="var(--color-primary)" />
                                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                                            {generatedDoc.title}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                                        {new Date(generatedDoc.generatedAt).toLocaleString()}
                                    </span>
                                </div>

                                <textarea
                                    readOnly
                                    value={generatedDoc.content}
                                    style={{
                                        width: '100%',
                                        minHeight: '400px',
                                        padding: '1rem',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '0.5rem',
                                        fontFamily: '"Courier New", Courier, monospace',
                                        fontSize: '0.88rem',
                                        lineHeight: 1.6,
                                        background: 'var(--bg-surface)',
                                        resize: 'vertical',
                                        color: 'var(--text-main)',
                                    }}
                                />
                            </div>

                            {/* Sources */}
                            {generatedDoc.sources && generatedDoc.sources.length > 0 && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.75rem 1rem', background: 'rgba(59, 130, 246, 0.06)',
                                    border: '1px solid rgba(59, 130, 246, 0.15)', borderRadius: '0.5rem',
                                    marginBottom: '1rem',
                                }}>
                                    <BookOpen size={16} color="#3B82F6" />
                                    <span style={{ fontSize: '0.82rem', color: '#1E40AF' }}>
                                        Based on: {generatedDoc.sources.join(', ')}
                                    </span>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.75rem', background: '#FEF2F2', border: '1px solid #FECACA',
                                    borderRadius: '0.5rem', color: '#DC2626', fontSize: '0.85rem',
                                    marginBottom: '1rem',
                                }}>
                                    <AlertTriangle size={16} />
                                    {error}
                                </div>
                            )}
                            {clipboardStatus && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.75rem', background: '#ECFDF5', border: '1px solid #D1FAE5',
                                    borderRadius: '0.5rem', color: '#065F46', fontSize: '0.85rem',
                                    marginBottom: '1rem',
                                }}>
                                    <CheckCircle size={16} />
                                    {clipboardStatus}
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.75rem' }}>
                                <button onClick={() => { setStep(2); setGeneratedDoc(null); }} style={btnOutline}>
                                    <ArrowLeft size={16} /> Edit Fields
                                </button>
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={handleCopyToClipboard}
                                        disabled={isCopying}
                                        style={{
                                            ...btnOutline,
                                            minWidth: '180px',
                                            opacity: isCopying ? 0.6 : 1,
                                            cursor: isCopying ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        {isCopying ? (
                                            <>
                                                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                                Copying...
                                            </>
                                        ) : (
                                            <>
                                                <ClipboardList size={16} /> Copy to clipboard
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleDownloadDocx}
                                        disabled={isDownloading}
                                        style={{
                                            ...btnPrimary,
                                            background: '#2563EB',
                                            opacity: isDownloading ? 0.6 : 1,
                                            cursor: isDownloading ? 'not-allowed' : 'pointer',
                                            minWidth: '180px',
                                        }}
                                    >
                                        {isDownloading ? (
                                            <>
                                                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                                Preparing DOCX...
                                            </>
                                        ) : (
                                            <>
                                                <FileText size={16} /> Download DOCX
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleDownloadPdf}
                                        disabled={isDownloading}
                                        style={{
                                            ...btnPrimary,
                                            background: '#059669',
                                            opacity: isDownloading ? 0.6 : 1,
                                            cursor: isDownloading ? 'not-allowed' : 'pointer',
                                            minWidth: '180px',
                                        }}
                                    >
                                        {isDownloading ? (
                                            <>
                                                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                                Preparing PDF...
                                            </>
                                        ) : (
                                            <>
                                                <Download size={16} /> Download PDF
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* CSS for spinner animation */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default DocumentGeneratePage;
