import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft, ChevronRight, Upload, X, FileText,
    CheckCircle2, Scale, Users, Home as HomeIcon, Briefcase,
    AlertCircle
} from 'lucide-react';
import { caseAPI, documentAPI } from '../../services/api';

const caseTypes = [
    { id: 'civil', name: 'Civil Case', icon: Scale, desc: 'Property, contracts, disputes', color: '#3b82f6' },
    { id: 'criminal', name: 'Criminal Case', icon: AlertCircle, desc: 'Criminal offenses', color: '#ef4444' },
    { id: 'family', name: 'Family Law', icon: Users, desc: 'Divorce, custody, inheritance', color: '#ec4899' },
    { id: 'property', name: 'Property Dispute', icon: HomeIcon, desc: 'Land, ownership disputes', color: '#10b981' },
    { id: 'commercial', name: 'Commercial', icon: Briefcase, desc: 'Business, trade matters', color: '#f59e0b' }
];

export default function FileCasePage() {
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
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    const steps = [
        { number: 1, name: 'Case Type', desc: 'Select category' },
        { number: 2, name: 'Case Details', desc: 'Provide information' },
        { number: 3, name: 'Documents', desc: 'Upload files' },
        { number: 4, name: 'Review', desc: 'Confirm & submit' }
    ];

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setFormData({
            ...formData,
            documents: [...formData.documents, ...files.map(f => ({ file: f, name: f.name, size: f.size }))]
        });
    };

    const removeDocument = (index) => {
        setFormData({
            ...formData,
            documents: formData.documents.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = async () => {
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
            console.log('Case created:', response.data);

            // Upload documents with the newly created case ID
            if (formData.documents.length > 0) {
                const caseId = response.data.id;
                let uploadErrors = [];

                for (const doc of formData.documents) {
                    try {
                        await documentAPI.upload(doc.file, {
                            caseId: caseId,
                            category: 'CASE_DOCUMENT',
                            description: `Document uploaded during case filing: ${doc.name}`
                        });
                        console.log('Document uploaded:', doc.name);
                    } catch (uploadError) {
                        console.error('Error uploading document:', doc.name, uploadError);
                        uploadErrors.push(doc.name);
                    }
                }

                if (uploadErrors.length > 0) {
                    alert(`Case created but some documents failed to upload: ${uploadErrors.join(', ')}. You can upload them later from the Documents section.`);
                }
            }

            navigate('/client/cases');
        } catch (error) {
            console.error('Error creating case:', error);
            alert('Failed to create case. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1: return formData.caseType !== '';
            case 2: return formData.title && formData.description && formData.petitioner && formData.respondent;
            case 3: return formData.documents.length > 0;
            case 4: return true;
            default: return false;
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/client')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        marginBottom: '1rem'
                    }}
                >
                    <ChevronLeft size={16} />
                    Back to Dashboard
                </button>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    File New Case
                </h1>
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                    Complete all steps to submit your case filing
                </p>
            </div>

            {/* Progress Steps */}
            <div style={{
                background: 'var(--bg-glass-strong)',
                backdropFilter: 'var(--glass-blur)',
                border: 'var(--border-glass-strong)',
                borderRadius: '1.5rem',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: 'var(--shadow-glass)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                    {/* Progress Line */}
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '10%',
                        right: '10%',
                        height: '2px',
                        background: 'var(--border-glass)',
                        zIndex: 0
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                            background: 'linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%)',
                            transition: 'width 0.3s'
                        }} />
                    </div>

                    {steps.map((step) => (
                        <div
                            key={step.number}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                flex: 1,
                                position: 'relative',
                                zIndex: 1
                            }}
                        >
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: step.number <= currentStep
                                    ? 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)'
                                    : 'var(--bg-glass)',
                                border: step.number === currentStep
                                    ? '3px solid rgba(139, 92, 246, 0.4)'
                                    : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '700',
                                fontSize: '1rem',
                                color: step.number <= currentStep ? 'white' : 'var(--text-secondary)',
                                marginBottom: '0.75rem',
                                transition: 'all 0.3s'
                            }}>
                                {step.number < currentStep ? <CheckCircle2 size={20} /> : step.number}
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: step.number === currentStep ? 'var(--color-accent)' : step.number < currentStep ? 'var(--color-accent)' : 'var(--text-secondary)',
                                    marginBottom: '0.25rem'
                                }}>
                                    {step.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {step.desc}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div style={{
                background: 'var(--bg-glass-strong)',
                backdropFilter: 'var(--glass-blur)',
                border: 'var(--border-glass-strong)',
                borderRadius: '1.5rem',
                padding: '2.5rem',
                minHeight: '500px',
                boxShadow: 'var(--shadow-glass)'
            }}>
                {/* Step 1: Case Type */}
                {currentStep === 1 && (
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
                            Select Case Type
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                            {caseTypes.map((type) => {
                                const Icon = type.icon;
                                const isSelected = formData.caseType === type.id;
                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => setFormData({ ...formData, caseType: type.id })}
                                        style={{
                                            padding: '1.5rem',
                                            background: isSelected
                                                ? `linear-gradient(135deg, ${type.color}40 0%, ${type.color}20 100%)`
                                                : 'var(--bg-glass)',
                                            border: isSelected
                                                ? `2px solid ${type.color}`
                                                : 'var(--border-glass)',
                                            borderRadius: '1rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            textAlign: 'left'
                                        }}
                                        onMouseOver={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.1)';
                                            }
                                        }}
                                    >
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '12px',
                                            background: `${type.color}20`,
                                            border: `2px solid ${type.color}40`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '1rem',
                                            boxShadow: isSelected ? '0 0 15px ' + type.color + '40' : 'none'
                                        }}>
                                            <Icon size={28} color={type.color} />
                                        </div>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                            {type.name}
                                        </h3>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            {type.desc}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Step 2: Case Details */}
                {currentStep === 2 && (
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
                            Case Details
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem' }}>
                                    Case Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Brief title of your case"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem',
                                        background: 'var(--bg-glass)',
                                        border: 'var(--border-glass)',
                                        borderRadius: '0.75rem',
                                        color: 'var(--text-main)',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem' }}>
                                    Case Description *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Detailed description of your case..."
                                    rows={6}
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem',
                                        background: 'var(--bg-glass)',
                                        border: 'var(--border-glass)',
                                        borderRadius: '0.75rem',
                                        color: 'var(--text-main)',
                                        fontSize: '1rem',
                                        resize: 'vertical',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem' }}>
                                        Petitioner Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.petitioner}
                                        onChange={(e) => setFormData({ ...formData, petitioner: e.target.value })}
                                        placeholder="Your name"
                                        style={{
                                            width: '100%',
                                            padding: '0.875rem 1rem',
                                            background: 'var(--bg-glass)',
                                            border: 'var(--border-glass)',
                                            borderRadius: '0.75rem',
                                            color: 'var(--text-main)',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem' }}>
                                        Respondent Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.respondent}
                                        onChange={(e) => setFormData({ ...formData, respondent: e.target.value })}
                                        placeholder="Other party name"
                                        style={{
                                            width: '100%',
                                            padding: '0.875rem 1rem',
                                            background: 'var(--bg-glass)',
                                            border: 'var(--border-glass)',
                                            borderRadius: '0.75rem',
                                            color: 'var(--text-main)',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.875rem' }}>
                                    Urgency Level
                                </label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {['normal', 'urgent', 'critical'].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setFormData({ ...formData, urgency: level })}
                                            style={{
                                                flex: 1,
                                                padding: '0.875rem',
                                                background: formData.urgency === level
                                                    ? 'rgba(139, 92, 246, 0.2)'
                                                    : 'var(--bg-glass)',
                                                border: formData.urgency === level
                                                    ? '2px solid var(--color-accent)'
                                                    : 'var(--border-glass)',
                                                borderRadius: '0.75rem',
                                                color: formData.urgency === level ? 'var(--color-accent)' : 'var(--text-secondary)',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                textTransform: 'capitalize'
                                            }}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Documents */}
                {currentStep === 3 && (
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
                            Upload Documents
                        </h2>

                        {/* Upload Zone */}
                        <label style={{
                            display: 'block',
                            padding: '3rem',
                            background: 'var(--bg-glass)',
                            border: '2px dashed var(--border-glass)',
                            borderRadius: '1rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            marginBottom: '2rem'
                        }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-accent)';
                                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-glass)';
                                e.currentTarget.style.background = 'var(--bg-glass)';
                            }}
                        >
                            <input
                                type="file"
                                multiple
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                            <Upload size={48} style={{ color: 'var(--color-accent)', margin: '0 auto 1rem' }} />
                            <p style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                Click to upload or drag and drop
                            </p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                PDF, DOC, DOCX, JPG, PNG (max 10MB each)
                            </p>
                        </label>

                        {/* Uploaded Documents List */}
                        {formData.documents.length > 0 && (
                            <div>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '1rem' }}>
                                    Uploaded Documents ({formData.documents.length})
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {formData.documents.map((doc, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '1rem',
                                                background: 'var(--bg-glass)',
                                                borderRadius: '0.75rem',
                                                border: 'var(--border-glass)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '8px',
                                                    background: 'rgba(139, 92, 246, 0.2)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <FileText size={20} color="#8b5cf6" />
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)' }}>
                                                        {doc.name}
                                                    </p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                        {(doc.size / 1024).toFixed(2)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeDocument(index)}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '8px',
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    color: '#ef4444'
                                                }}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
                            Review & Confirm
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ padding: '1.5rem', background: 'var(--bg-glass)', borderRadius: '1rem', border: 'var(--border-glass)' }}>
                                <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Case Type</h3>
                                <p style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-main)' }}>
                                    {caseTypes.find(t => t.id === formData.caseType)?.name}
                                </p>
                            </div>

                            <div style={{ padding: '1.5rem', background: 'var(--bg-glass)', borderRadius: '1rem', border: 'var(--border-glass)' }}>
                                <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Case Title</h3>
                                <p style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-main)' }}>{formData.title}</p>
                            </div>

                            <div style={{ padding: '1.5rem', background: 'var(--bg-glass)', borderRadius: '1rem', border: 'var(--border-glass)' }}>
                                <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Description</h3>
                                <p style={{ fontSize: '1rem', color: 'var(--text-main)', lineHeight: '1.6' }}>{formData.description}</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div style={{ padding: '1.5rem', background: 'var(--bg-glass)', borderRadius: '1rem', border: 'var(--border-glass)' }}>
                                    <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Petitioner</h3>
                                    <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>{formData.petitioner}</p>
                                </div>

                                <div style={{ padding: '1.5rem', background: 'var(--bg-glass)', borderRadius: '1rem', border: 'var(--border-glass)' }}>
                                    <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Respondent</h3>
                                    <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>{formData.respondent}</p>
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem', background: 'var(--bg-glass)', borderRadius: '1rem', border: 'var(--border-glass)' }}>
                                <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Documents Uploaded</h3>
                                <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>
                                    {formData.documents.length} files
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '2rem'
            }}>
                <button
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                    style={{
                        padding: '1rem 2rem',
                        background: currentStep === 1 ? 'var(--bg-glass-hover)' : 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: '0.75rem',
                        color: currentStep === 1 ? 'var(--text-secondary)' : 'var(--color-accent)',
                        fontWeight: '600',
                        cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <ChevronLeft size={20} />
                    Previous
                </button>

                {currentStep < 4 ? (
                    <button
                        onClick={() => setCurrentStep(currentStep + 1)}
                        disabled={!canProceed()}
                        style={{
                            padding: '1rem 2rem',
                            background: canProceed()
                                ? 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)'
                                : 'var(--bg-glass-hover)',
                            border: 'none',
                            borderRadius: '0.75rem',
                            color: canProceed() ? 'white' : 'var(--text-secondary)',
                            fontWeight: '700',
                            cursor: canProceed() ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: canProceed() ? 'var(--shadow-glass-strong)' : 'none'
                        }}
                    >
                        Next
                        <ChevronRight size={20} />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={uploading}
                        style={{
                            padding: '1rem 2rem ',
                            background: uploading
                                ? 'rgba(139, 92, 246, 0.5)'
                                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            borderRadius: '0.75rem',
                            color: 'white',
                            fontWeight: '700',
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: 'var(--shadow-glass-strong)'
                        }}
                    >
                        <CheckCircle2 size={20} />
                        {uploading ? 'Submitting...' : 'Submit Case'}
                    </button>
                )}
            </div>
        </div>
    );
}
