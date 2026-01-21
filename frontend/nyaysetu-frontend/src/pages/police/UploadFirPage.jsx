import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Upload, Shield, CheckCircle2, FileText,
    AlertCircle, Loader2, Copy, ExternalLink
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { policeAPI } from '../../services/api';

export default function UploadFirPage() {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        caseId: ''
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !formData.title) {
            setError('Please provide a title and select a file');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            data.append('file', file);
            data.append('title', formData.title);
            if (formData.description) {
                data.append('description', formData.description);
            }
            if (formData.caseId) {
                data.append('caseId', formData.caseId);
            }

            const response = await policeAPI.uploadFir(data);
            setResult(response.data);
            console.log('FIR Uploaded Successfully:', response.data);
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.message || 'Failed to upload FIR. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyHash = () => {
        if (result?.fileHash) {
            navigator.clipboard.writeText(result.fileHash);
        }
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', caseId: '' });
        setFile(null);
        setResult(null);
        setError(null);
    };

    // Success State
    if (result) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
                    border: '2px solid #10b981',
                    borderRadius: '1.5rem',
                    padding: '3rem',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)'
                    }}>
                        <CheckCircle2 size={40} color="white" />
                    </div>

                    <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981', marginBottom: '0.5rem' }}>
                        ✅ Evidence Sealed Successfully!
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Your FIR has been digitally stamped with a unique SHA-256 fingerprint
                    </p>

                    {/* FIR Number */}
                    <div style={{
                        background: 'var(--bg-glass)',
                        border: 'var(--border-glass)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        marginBottom: '1.5rem'
                    }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            FIR Number
                        </p>
                        <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                            {result.firNumber}
                        </p>
                    </div>

                    {/* SHA-256 Hash */}
                    <div style={{
                        background: 'var(--bg-glass)',
                        border: 'var(--border-glass)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        marginBottom: '1.5rem'
                    }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            🔐 Digital Fingerprint (SHA-256)
                        </p>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <code style={{
                                fontSize: '0.75rem',
                                fontFamily: 'monospace',
                                background: 'var(--bg-glass-strong)',
                                padding: '0.75rem 1rem',
                                borderRadius: '0.5rem',
                                color: '#10b981',
                                wordBreak: 'break-all',
                                maxWidth: '100%'
                            }}>
                                {result.fileHash}
                            </code>
                            <button
                                onClick={copyHash}
                                style={{
                                    padding: '0.5rem',
                                    background: 'var(--bg-glass)',
                                    border: 'var(--border-glass)',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)'
                                }}
                                title="Copy Hash"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Details */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Title</p>
                            <p style={{ color: 'var(--text-main)', fontWeight: '600' }}>{result.title}</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>File</p>
                            <p style={{ color: 'var(--text-main)', fontWeight: '600' }}>{result.fileName}</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Status</p>
                            <span style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                color: '#10b981',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.875rem',
                                fontWeight: '600'
                            }}>
                                {result.status}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={resetForm}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                border: 'none',
                                borderRadius: '0.75rem',
                                color: 'white',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Upload size={18} />
                            Upload Another FIR
                        </button>
                        <button
                            onClick={() => navigate('/police/firs')}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'var(--bg-glass)',
                                border: 'var(--border-glass)',
                                borderRadius: '0.75rem',
                                color: 'var(--text-main)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <ExternalLink size={18} />
                            View All FIRs
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Upload Form
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    🔒 {t('Upload FIR Document')}
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    {t('Upload your FIR document to generate a tamper-proof SHA-256 digital fingerprint')}
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* File Upload Area */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    style={{
                        background: dragActive
                            ? 'rgba(16, 185, 129, 0.1)'
                            : 'var(--bg-glass-strong)',
                        border: dragActive
                            ? '2px dashed #10b981'
                            : '2px dashed var(--border-glass)',
                        borderRadius: '1.5rem',
                        padding: '3rem',
                        textAlign: 'center',
                        marginBottom: '1.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                    onClick={() => document.getElementById('file-input').click()}
                >
                    <input
                        id="file-input"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />

                    {file ? (
                        <div>
                            <FileText size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
                            <p style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                {file.name}
                            </p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    ) : (
                        <div>
                            <Upload size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
                            <p style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                {t('Drag & drop your FIR document here')}
                            </p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                {t('or click to browse (PDF, JPG, PNG)')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Form Fields */}
                <div style={{
                    background: 'var(--bg-glass-strong)',
                    border: 'var(--border-glass)',
                    borderRadius: '1.5rem',
                    padding: '1.5rem',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', color: 'var(--text-main)', fontWeight: '600', marginBottom: '0.5rem' }}>
                            Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., FIR - Theft Case at XYZ Location"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: 'var(--bg-glass)',
                                border: 'var(--border-glass)',
                                borderRadius: '0.5rem',
                                color: 'var(--text-main)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', color: 'var(--text-main)', fontWeight: '600', marginBottom: '0.5rem' }}>
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of the FIR content..."
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: 'var(--bg-glass)',
                                border: 'var(--border-glass)',
                                borderRadius: '0.5rem',
                                color: 'var(--text-main)',
                                fontSize: '1rem',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: 'var(--text-main)', fontWeight: '600', marginBottom: '0.5rem' }}>
                            Link to Case ID (Optional)
                        </label>
                        <input
                            type="text"
                            value={formData.caseId}
                            onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                            placeholder="Enter Case UUID if linking to existing case"
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: 'var(--bg-glass)',
                                border: 'var(--border-glass)',
                                borderRadius: '0.5rem',
                                color: 'var(--text-main)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <AlertCircle size={20} color="#ef4444" />
                        <p style={{ color: '#ef4444' }}>{error}</p>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || !file || !formData.title}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: loading || !file || !formData.title
                            ? 'var(--bg-glass)'
                            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        borderRadius: '0.75rem',
                        color: loading || !file || !formData.title ? 'var(--text-secondary)' : 'white',
                        fontSize: '1.125rem',
                        fontWeight: '700',
                        cursor: loading || !file || !formData.title ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        boxShadow: loading || !file || !formData.title ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                            Generating SHA-256 Hash...
                        </>
                    ) : (
                        <>
                            <Shield size={20} />
                            Seal Evidence & Generate Digital Fingerprint
                        </>
                    )}
                </button>
            </form>

            {/* Info */}
            <div style={{
                marginTop: '2rem',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                border: 'var(--border-glass)',
                borderRadius: '1rem',
                padding: '1.5rem'
            }}>
                <h4 style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '0.75rem' }}>
                    🔒 How SHA-256 Digital Sealing Works
                </h4>
                <ul style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.8', paddingLeft: '1.25rem' }}>
                    <li>Your document is processed to generate a unique 64-character hash</li>
                    <li>This hash is like a "fingerprint" - any change to the file changes the hash</li>
                    <li>The original file and hash are stored securely for verification</li>
                    <li>Judges can verify document authenticity by comparing hashes</li>
                </ul>
            </div>

            {/* CSS for animations */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
