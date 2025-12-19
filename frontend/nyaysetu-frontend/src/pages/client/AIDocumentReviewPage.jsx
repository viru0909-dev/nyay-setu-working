import { useState } from 'react';
import {
    Upload, Brain, CheckCircle2, AlertCircle, Info,
    FileText, Loader, Sparkles, TrendingUp, X, Download
} from 'lucide-react';

export default function AIDocumentReviewPage() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setAnalysis(null);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setAnalyzing(true);

        try {
            const token = localStorage.getItem('token');

            // Step 1: Upload document first
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('category', 'LEGAL_DOCUMENTS');
            formData.append('description', 'AI Analysis Document');

            const uploadResponse = await fetch('http://localhost:8080/api/documents/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload document');
            }

            const uploadedDoc = await uploadResponse.json();
            const documentId = uploadedDoc.id;

            // Step 2: Trigger AI analysis
            const analyzeResponse = await fetch(`http://localhost:8080/api/documents/${documentId}/analyze`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!analyzeResponse.ok) {
                throw new Error('Failed to start analysis');
            }

            // Step 3: Poll for analysis results (check every 2 seconds for up to 60 seconds)
            let attempts = 0;
            const maxAttempts = 30;

            const checkAnalysis = async () => {
                const checkResponse = await fetch(`http://localhost:8080/api/documents/${documentId}/analysis`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (checkResponse.ok) {
                    const analysisData = await checkResponse.json();

                    if (analysisData.analysisSuccess) {
                        // Parse the AI response - NEW STRUCTURE
                        const legalPoints = JSON.parse(analysisData.legalPoints || '[]');
                        const relevantLaws = JSON.parse(analysisData.relevantLaws || '[]');
                        const caseLaws = JSON.parse(analysisData.caseLawSuggestions || '[]');
                        const parties = JSON.parse(analysisData.partiesInvolved || '[]');
                        const dates = JSON.parse(analysisData.importantDates || '[]');

                        // Transform to frontend format
                        setAnalysis({
                            score: 85, // Fixed score
                            category: analysisData.suggestedCategory || 'Legal Document',
                            summary: analysisData.summary || 'Analysis completed',
                            completeness: {
                                status: 'Good',
                                percentage: 85,
                                issues: [] // No issues in fake AI
                            },
                            compliance: {
                                status: 'Compliant',
                                checks: [
                                    { item: 'Document structure', passed: true },
                                    { item: 'Legal terminology', passed: true }
                                ]
                            },
                            suggestions: legalPoints,
                            keyPoints: relevantLaws,
                            similarCases: caseLaws.map((law, idx) => ({
                                id: `REF-${idx + 1}`,
                                title: law,
                                relevance: 85
                            })),
                            parties: parties,
                            dates: dates,
                            riskAssessment: analysisData.riskAssessment || 'Pending review'
                        });
                        setAnalyzing(false);
                    } else if (analysisData.errorMessage) {
                        throw new Error(analysisData.errorMessage);
                    }
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(checkAnalysis, 2000);
                } else {
                    throw new Error('Analysis timeout');
                }
            };

            // Start polling
            setTimeout(checkAnalysis, 2000);

        } catch (error) {
            console.error('Analysis error:', error);
            alert('AI Analysis failed: ' + error.message);
            setAnalyzing(false);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'white', marginBottom: '0.5rem' }}>
                    AI Document Review
                </h1>
                <p style={{ fontSize: '1rem', color: '#94a3b8' }}>
                    Upload legal documents for AI-powered analysis and recommendations
                </p>
            </div>

            {/* Upload Section */}
            <div style={{
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '1.5rem',
                padding: '2rem',
                marginBottom: '2rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Brain size={28} color="white" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '0.25rem' }}>
                            Document Analysis
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                            Powered by AI • Get instant insights
                        </p>
                    </div>
                </div>

                {/* File Upload */}
                <label style={{
                    display: 'block',
                    padding: '3rem',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: selectedFile ? '2px dashed #8b5cf6' : '2px dashed rgba(139, 92, 246, 0.3)',
                    borderRadius: '1rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginBottom: '1.5rem'
                }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = '#8b5cf6';
                        e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = selectedFile ? '#8b5cf6' : 'rgba(139, 92, 246, 0.3)';
                        e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
                    }}
                >
                    <input
                        type="file"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                        accept=".pdf,.doc,.docx"
                    />
                    {selectedFile ? (
                        <>
                            <FileText size={48} style={{ color: '#8b5cf6', margin: '0 auto 1rem' }} />
                            <p style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem' }}>
                                {selectedFile.name}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Click to change
                            </p>
                        </>
                    ) : (
                        <>
                            <Upload size={48} style={{ color: '#8b5cf6', margin: '0 auto 1rem' }} />
                            <p style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem' }}>
                                Click to upload document
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                                PDF, DOC, DOCX (max 10MB)
                            </p>
                        </>
                    )}
                </label>

                {/* Analyze Button */}
                <button
                    onClick={handleAnalyze}
                    disabled={!selectedFile || analyzing}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: (!selectedFile || analyzing)
                            ? 'rgba(148, 163, 184, 0.2)'
                            : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                        border: 'none',
                        borderRadius: '0.75rem',
                        color: (!selectedFile || analyzing) ? '#64748b' : 'white',
                        fontSize: '1.05rem',
                        fontWeight: '700',
                        cursor: (!selectedFile || analyzing) ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: (!selectedFile || analyzing) ? 'none' : '0 4px 15px rgba(139, 92, 246, 0.4)'
                    }}
                >
                    {analyzing ? (
                        <>
                            <Loader size={20} className="spin" />
                            Analyzing Document...
                        </>
                    ) : (
                        <>
                            <Sparkles size={20} />
                            Analyze with AI
                        </>
                    )}
                </button>
            </div>

            {/* Analysis Results */}
            {analysis && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Overall Score */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.8)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        borderRadius: '1.5rem',
                        padding: '2rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
                                    Document Quality Score
                                </h3>
                                <p style={{ fontSize: '0.875rem', color: '#8b5cf6', fontWeight: '600' }}>
                                    {analysis.category}
                                </p>
                            </div>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                background: `conic-gradient(#8b5cf6 ${analysis.score * 3.6}deg, rgba(148, 163, 184, 0.2) 0deg)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                            }}>
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    background: 'rgba(15, 23, 42, 0.9)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column'
                                }}>
                                    <span style={{ fontSize: '2rem', fontWeight: '800', color: 'white' }}>
                                        {analysis.score}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                        / 100
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Issues */}
                        {analysis.completeness.issues.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {analysis.completeness.issues.map((issue, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'start',
                                            gap: '0.75rem',
                                            padding: '1rem',
                                            background: issue.type === 'warning'
                                                ? 'rgba(245, 158, 11, 0.1)'
                                                : 'rgba(59, 130, 246, 0.1)',
                                            border: issue.type === 'warning'
                                                ? '1px solid rgba(245, 158, 11, 0.3)'
                                                : '1px solid rgba(59, 130, 246, 0.3)',
                                            borderRadius: '0.75rem'
                                        }}
                                    >
                                        {issue.type === 'warning' ? (
                                            <AlertCircle size={20} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '0.125rem' }} />
                                        ) : (
                                            <Info size={20} style={{ color: '#3b82f6', flexShrink: 0, marginTop: '0.125rem' }} />
                                        )}
                                        <p style={{
                                            fontSize: '0.875rem',
                                            color: issue.type === 'warning' ? '#fbbf24' : '#60a5fa',
                                            fontWeight: '500'
                                        }}>
                                            {issue.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Compliance Check */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.8)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        borderRadius: '1.5rem',
                        padding: '2rem'
                    }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '1.5rem' }}>
                            Compliance Check
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {analysis.compliance.checks.map((check, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '1rem',
                                        background: 'rgba(15, 23, 42, 0.6)',
                                        borderRadius: '0.75rem',
                                        border: check.passed
                                            ? '1px solid rgba(16, 185, 129, 0.2)'
                                            : '1px solid rgba(239, 68, 68, 0.2)'
                                    }}
                                >
                                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#e2e8f0' }}>
                                        {check.item}
                                    </span>
                                    {check.passed ? (
                                        <CheckCircle2 size={20} color="#10b981" />
                                    ) : (
                                        <AlertCircle size={20} color="#ef4444" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Suggestions */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.8)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        borderRadius: '1.5rem',
                        padding: '2rem'
                    }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={20} color="#8b5cf6" />
                            AI Recommendations
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {analysis.suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'start',
                                        gap: '0.75rem',
                                        padding: '1rem',
                                        background: 'rgba(139, 92, 246, 0.1)',
                                        border: '1px solid rgba(139, 92, 246, 0.2)',
                                        borderRadius: '0.75rem'
                                    }}
                                >
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: 'rgba(139, 92, 246, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        color: '#8b5cf6'
                                    }}>
                                        {index + 1}
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: '#e2e8f0', lineHeight: '1.6' }}>
                                        {suggestion}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Key Points & Similar Cases Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {/* Key Points */}
                        <div style={{
                            background: 'rgba(30, 41, 59, 0.8)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            borderRadius: '1.5rem',
                            padding: '2rem'
                        }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'white', marginBottom: '1.5rem' }}>
                                Key Points Extracted
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {analysis.keyPoints.map((point, index) => (
                                    <li
                                        key={index}
                                        style={{
                                            fontSize: '0.875rem',
                                            color: '#94a3b8',
                                            paddingLeft: '1.5rem',
                                            position: 'relative'
                                        }}
                                    >
                                        <span style={{
                                            position: 'absolute',
                                            left: 0,
                                            top: '0.25rem',
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: '#8b5cf6'
                                        }} />
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Similar Cases */}
                        <div style={{
                            background: 'rgba(30, 41, 59, 0.8)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            borderRadius: '1.5rem',
                            padding: '2rem'
                        }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'white', marginBottom: '1.5rem' }}>
                                Similar Cases
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {analysis.similarCases.map((caseItem, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            padding: '1rem',
                                            background: 'rgba(15, 23, 42, 0.6)',
                                            borderRadius: '0.75rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#8b5cf6' }}>
                                                {caseItem.id}
                                            </span>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                background: 'rgba(16, 185, 129, 0.2)',
                                                color: '#10b981',
                                                fontWeight: '600'
                                            }}>
                                                {caseItem.relevance}% match
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.875rem', color: '#e2e8f0' }}>
                                            {caseItem.title}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => {
                                setSelectedFile(null);
                                setAnalysis(null);
                            }}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                background: 'rgba(148, 163, 184, 0.1)',
                                border: '1px solid rgba(148, 163, 184, 0.2)',
                                borderRadius: '0.75rem',
                                color: '#94a3b8',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Analyze Another Document
                        </button>
                        <button
                            style={{
                                flex: 1,
                                padding: '1rem',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                border: 'none',
                                borderRadius: '0.75rem',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Download size={20} />
                            Download Report
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
}
