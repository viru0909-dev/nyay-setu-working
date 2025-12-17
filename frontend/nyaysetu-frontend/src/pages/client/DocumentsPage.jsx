import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Upload, Download, Trash2, Search, Filter, Grid, List,
    File, FileText, Image as ImageIcon, Film, Archive, X, Calendar,
    Loader, Eye, FolderOpen, CheckCircle2, Plus
} from 'lucide-react';
import { documentAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

const categories = ['All', 'LEGAL_DOCUMENTS', 'CONTRACTS', 'EVIDENCE', 'STATEMENTS', 'FINANCIAL', 'OFFICIAL', 'OTHER'];

const fileTypeIcons = {
    'application/pdf': FileText,
    'application/msword': FileText,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileText,
    'image/jpeg': Image,
    'image/png': Image,
    'image/jpg': Image,
    Other: File
};

const statusColors = {
    'Verified': { bg: '#10b98120', border: '#10b981', text: '#10b981' },
    'Pending': { bg: '#f59e0020', border: '#f59e0b', text: '#f59e0b' },
    'Under Review': { bg: '#8b5cf620', border: '#8b5cf6', text: '#8b5cf6' }
};

export default function DocumentsPage() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedCaseFilter, setSelectedCaseFilter] = useState('All');
    const [viewMode, setViewMode] = useState('grid');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadCategory, setUploadCategory] = useState('OTHER');
    const [uploadDescription, setUploadDescription] = useState('');
    const [uploadCaseId, setUploadCaseId] = useState(null);
    const [userCases, setUserCases] = useState([]);

    useEffect(() => {
        fetchDocuments();
        fetchUserCases();
    }, []);

    const formatCategoryName = (category) => {
        if (category === 'All') return 'All';
        return category.split('_').map(word =>
            word.charAt(0) + word.slice(1).toLowerCase()
        ).join(' ');
    };

    const fetchDocuments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/documents', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setDocuments(response.data);
        } catch (error) {
            console.error('Failed to fetch documents:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchUserCases = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/documents/user/cases', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setUserCases(response.data);
        } catch (error) {
            console.error('Failed to fetch user cases:', error);
        }
    };

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
        const matchesCase = selectedCaseFilter === 'All' ||
            (selectedCaseFilter === 'No Case' ? !doc.caseId : doc.caseId === selectedCaseFilter);
        return matchesSearch && matchesCategory && matchesCase;
    });

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
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert('Please select a file');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('category', uploadCategory);
            if (uploadDescription) {
                formData.append('description', uploadDescription);
            }
            if (uploadCaseId) {
                formData.append('caseId', uploadCaseId);
            }

            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8080/api/documents/upload', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setDocuments([response.data, ...documents]);
            setShowUploadModal(false);
            setSelectedFile(null);
            setUploadCategory('OTHER');
            setUploadDescription('');
            setUploadCaseId(null);
            alert('Document uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed: ' + (error.response?.data?.error || error.message));
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDownload = async (doc) => {
        try {
            const response = await documentAPI.download(doc.id);

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (docId) => {
        if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
            return;
        }

        try {
            await documentAPI.delete(docId);
            setDocuments(documents.filter(doc => doc.id !== docId));
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Delete failed: ' + (error.response?.data?.message || error.message));
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Loader size={48} style={{ color: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <div>
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'white', marginBottom: '0.5rem' }}>
                        Documents
                    </h1>
                    <p style={{ fontSize: '1rem', color: '#94a3b8' }}>
                        Upload and manage your case documents
                    </p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.875rem 1.5rem',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                        border: 'none',
                        borderRadius: '0.75rem',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
                    }}
                >
                    <Upload size={20} />
                    Upload Document
                </button>
            </div>

            {/* Stats Overview */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                {[
                    { label: 'Total Documents', value: documents.length, color: '#8b5cf6' },
                    { label: 'This Month', value: documents.filter(d => new Date(d.uploadedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, color: '#10b981' },
                    { label: 'Categories', value: new Set(documents.map(d => d.category)).size, color: '#f59e0b' },
                    { label: 'Storage Used', value: formatFileSize(documents.reduce((sum, d) => sum + (d.size || 0), 0)), color: '#3b82f6' }
                ].map((stat, index) => (
                    <div
                        key={index}
                        style={{
                            padding: '1.25rem',
                            background: 'rgba(30, 41, 59, 0.6)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            borderRadius: '1rem'
                        }}
                    >
                        <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                            {stat.label}
                        </p>
                        <p style={{ fontSize: '2rem', fontWeight: '800', color: stat.color }}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Search and Filters */}
            <div style={{
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '1.5rem',
                padding: '1.5rem',
                marginBottom: '2rem'
            }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Search */}
                    <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                        <Search size={20} style={{
                            position: 'absolute',
                            left: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#94a3b8'
                        }} />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem 0.875rem 3rem',
                                background: 'rgba(15, 23, 42, 0.6)',
                                border: '2px solid rgba(139, 92, 246, 0.2)',
                                borderRadius: '0.75rem',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {/* View Toggle */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                background: viewMode === 'grid' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                                border: viewMode === 'grid' ? '2px solid #8b5cf6' : '2px solid rgba(139, 92, 246, 0.2)',
                                color: viewMode === 'grid' ? '#8b5cf6' : '#94a3b8',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Grid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                background: viewMode === 'list' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                                border: viewMode === 'list' ? '2px solid #8b5cf6' : '2px solid rgba(139, 92, 246, 0.2)',
                                color: viewMode === 'list' ? '#8b5cf6' : '#94a3b8',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <List size={20} />
                        </button>
                    </div>
                </div>

                {/* Category Filter */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#94a3b8', alignSelf: 'center', marginRight: '0.5rem' }}>Category:</span>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: selectedCategory === cat
                                    ? 'rgba(139, 92, 246, 0.2)'
                                    : 'rgba(15, 23, 42, 0.6)',
                                border: selectedCategory === cat
                                    ? '2px solid #8b5cf6'
                                    : '2px solid rgba(139, 92, 246, 0.2)',
                                borderRadius: '0.5rem',
                                color: selectedCategory === cat ? '#c4b5fd' : '#94a3b8',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            {formatCategoryName(cat)}
                        </button>
                    ))}
                </div>

                {/* Case Filter */}
                {userCases.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                        <span style={{ fontSize: '0.875rem', color: '#94a3b8', alignSelf: 'center', marginRight: '0.5rem' }}>Case:</span>
                        <button
                            onClick={() => setSelectedCaseFilter('All')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: selectedCaseFilter === 'All' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                                border: selectedCaseFilter === 'All' ? '2px solid #8b5cf6' : '2px solid rgba(139, 92, 246, 0.2)',
                                borderRadius: '0.5rem',
                                color: selectedCaseFilter === 'All' ? '#c4b5fd' : '#94a3b8',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            All Cases
                        </button>
                        <button
                            onClick={() => setSelectedCaseFilter('No Case')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: selectedCaseFilter === 'No Case' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                                border: selectedCaseFilter === 'No Case' ? '2px solid #8b5cf6' : '2px solid rgba(139, 92, 246, 0.2)',
                                borderRadius: '0.5rem',
                                color: selectedCaseFilter === 'No Case' ? '#c4b5fd' : '#94a3b8',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            No Case
                        </button>
                        {userCases.map((caseItem) => (
                            <button
                                key={caseItem.id}
                                onClick={() => setSelectedCaseFilter(caseItem.id)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: selectedCaseFilter === caseItem.id ? 'rgba(139, 92, 246, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                                    border: selectedCaseFilter === caseItem.id ? '2px solid #8b5cf6' : '2px solid rgba(139, 92, 246, 0.2)',
                                    borderRadius: '0.5rem',
                                    color: selectedCaseFilter === caseItem.id ? '#c4b5fd' : '#94a3b8',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                {caseItem.title}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Documents Display */}
            {filteredDocs.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'rgba(30, 41, 59, 0.6)',
                    borderRadius: '1.5rem',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                    <FileText size={64} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '0.5rem' }}>No documents found</h3>
                    <p style={{ color: '#94a3b8' }}>
                        {searchQuery || selectedCategory !== 'All'
                            ? 'Try adjusting your filters'
                            : 'Upload your first document to get started'}
                    </p>
                </div>
            ) : (
                <div style={{
                    display: viewMode === 'grid' ? 'grid' : 'flex',
                    gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : undefined,
                    flexDirection: viewMode === 'list' ? 'column' : undefined,
                    gap: '1.5rem'
                }}>
                    {filteredDocs.map((doc) => {
                        const Icon = fileTypeIcons[doc.contentType] || fileTypeIcons.Other;

                        return (
                            <div
                                key={doc.id}
                                style={{
                                    background: 'rgba(30, 41, 59, 0.8)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(139, 92, 246, 0.2)',
                                    borderRadius: '1.5rem',
                                    padding: '1.5rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.3)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {/* File Icon */}
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '14px',
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    border: '2px solid rgba(139, 92, 246, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '1rem'
                                }}>
                                    <Icon size={32} color="#8b5cf6" />
                                </div>

                                {/* File Name */}
                                <h3 style={{
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    color: 'white',
                                    marginBottom: '0.5rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {doc.fileName}
                                </h3>

                                {/* Details */}
                                <div style={{ marginBottom: '1rem' }}>
                                    {doc.caseTitle && (
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.375rem 0.75rem',
                                            background: 'rgba(139, 92, 246, 0.15)',
                                            border: '1px solid rgba(139, 92, 246, 0.3)',
                                            borderRadius: '0.5rem',
                                            marginBottom: '0.75rem'
                                        }}>
                                            <FolderOpen size={14} style={{ color: '#a78bfa' }} />
                                            <span style={{ fontSize: '0.75rem', color: '#c4b5fd', fontWeight: '600' }}>
                                                {doc.caseTitle}
                                            </span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <FolderOpen size={14} style={{ color: '#94a3b8' }} />
                                        <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                                            {doc.category || 'OTHER'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <Calendar size={14} style={{ color: '#94a3b8' }} />
                                        <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                                            {formatDate(doc.uploadedAt)}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                            {formatFileSize(doc.size)}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleDownload(doc)}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            background: 'rgba(139, 92, 246, 0.1)',
                                            border: '1px solid rgba(139, 92, 246, 0.3)',
                                            borderRadius: '0.5rem',
                                            color: '#c4b5fd',
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <Download size={16} />
                                        Download
                                    </button>
                                    <button
                                        onClick={() => handleDelete(doc.id)}
                                        style={{
                                            padding: '0.75rem',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                            borderRadius: '0.5rem',
                                            color: '#ef4444',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem'
                }}>
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '1.5rem',
                        padding: '2rem',
                        maxWidth: '600px',
                        width: '100%'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
                                Upload Document
                            </h2>
                            <button
                                onClick={() => {
                                    setShowUploadModal(false);
                                    setSelectedFile(null);
                                    setUploadProgress(0);
                                }}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: 'rgba(148, 163, 184, 0.1)',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Case Selection (NEW!) */}
                        {userCases.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#e2e8f0', fontSize: '0.875rem' }}>
                                    Link to Case (Optional)
                                </label>
                                <select
                                    value={uploadCaseId || ''}
                                    onChange={(e) => setUploadCaseId(e.target.value || null)}
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem',
                                        background: 'rgba(15, 23, 42, 0.6)',
                                        border: '2px solid rgba(139, 92, 246, 0.2)',
                                        borderRadius: '0.75rem',
                                        color: 'white',
                                        fontSize: '1rem'
                                    }}
                                >
                                    <option value="">No Case (General Document)</option>
                                    {userCases.map((caseItem) => (
                                        <option key={caseItem.id} value={caseItem.id}>
                                            {caseItem.title} - {caseItem.caseType}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Drag Drop Zone */}
                        <label
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            style={{
                                display: 'block',
                                padding: '3rem',
                                background: dragActive ? 'rgba(139, 92, 246, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                                border: `2px dashed ${dragActive ? '#8b5cf6' : 'rgba(139, 92, 246, 0.3)'}`,
                                borderRadius: '1rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                marginBottom: '1.5rem'
                            }}
                        >
                            <input type="file" onChange={handleFileSelect} style={{ display: 'none' }} />
                            <Upload size={48} style={{ color: '#8b5cf6', margin: '0 auto 1rem' }} />
                            <p style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem' }}>
                                {selectedFile ? selectedFile.name : 'Drag & drop files here'}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                                {selectedFile
                                    ? `${formatFileSize(selectedFile.size)} (max 50MB) - Click to change`
                                    : 'or click to browse (PDF, DOC, DOCX, JPG, PNG - max 50MB)'}
                            </p>
                        </label>

                        {/* Category Selection */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#e2e8f0', fontSize: '0.875rem' }}>
                                Category
                            </label>
                            <select
                                value={uploadCategory}
                                onChange={(e) => setUploadCategory(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem',
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    border: '2px solid rgba(139, 92, 246, 0.2)',
                                    borderRadius: '0.75rem',
                                    color: 'white',
                                    fontSize: '1rem'
                                }}
                            >
                                {categories.filter(c => c !== 'All').map((cat) => (
                                    <option key={cat} value={cat}>{formatCategoryName(cat)}</option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#e2e8f0', fontSize: '0.875rem' }}>
                                Description (Optional)
                            </label>
                            <textarea
                                value={uploadDescription}
                                onChange={(e) => setUploadDescription(e.target.value)}
                                placeholder="Brief description of the document..."
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem',
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    border: '2px solid rgba(139, 92, 246, 0.2)',
                                    borderRadius: '0.75rem',
                                    color: 'white',
                                    fontSize: '1rem',
                                    resize: 'vertical',
                                    minHeight: '80px'
                                }}
                            />
                        </div>

                        {/* Upload Progress */}
                        {uploading && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Uploading...</span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#8b5cf6' }}>{uploadProgress}%</span>
                                </div>
                                <div style={{
                                    height: '8px',
                                    background: 'rgba(148, 163, 184, 0.2)',
                                    borderRadius: '9999px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${uploadProgress}%`,
                                        background: 'linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%)',
                                        transition: 'width 0.3s'
                                    }} />
                                </div>
                            </div>
                        )}

                        {/* Upload Button */}
                        <button
                            onClick={handleUpload}
                            disabled={!selectedFile || uploading}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: (!selectedFile || uploading)
                                    ? 'rgba(148, 163, 184, 0.2)'
                                    : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                border: 'none',
                                borderRadius: '0.75rem',
                                color: (!selectedFile || uploading) ? '#64748b' : 'white',
                                fontSize: '1rem',
                                fontWeight: '700',
                                cursor: (!selectedFile || uploading) ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {uploading ? (
                                <>
                                    <Loader size={20} className="spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={20} />
                                    Upload Files
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
