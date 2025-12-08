import { useState } from 'react';
import {
    Upload, Search, Grid, List as ListIcon, Filter,
    FileText, Image, File, Download, Eye, Trash2,
    FolderOpen, Calendar, CheckCircle2, X, Plus
} from 'lucide-react';

const mockDocuments = [
    { id: 1, name: 'Property_Deed.pdf', type: 'PDF', size: 2.4, category: 'Legal Documents', uploadDate: 'Dec 1, 2024', caseId: 'CS-2024-001', status: 'Verified' },
    { id: 2, name: 'Contract_Agreement.pdf', type: 'PDF', size: 1.8, category: 'Contracts', uploadDate: 'Nov 28, 2024', caseId: 'CS-2024-002', status: 'Pending' },
    { id: 3, name: 'Evidence_Photo_1.jpg', type: 'Image', size: 3.2, category: 'Evidence', uploadDate: 'Nov 25, 2024', caseId: 'CS-2024-001', status: 'Verified' },
    { id: 4, name: 'Witness_Statement.docx', type: 'DOC', size: 0.8, category: 'Statements', uploadDate: 'Nov 20, 2024', caseId: 'CS-2024-003', status: 'Under Review' },
    { id: 5, name: 'Financial_Records.pdf', type: 'PDF', size: 4.1, category: 'Financial', uploadDate: 'Nov 15, 2024', caseId: 'CS-2024-004', status: 'Verified' },
    { id: 6, name: 'Court_Notice.pdf', type: 'PDF', size: 1.2, category: 'Official', uploadDate: 'Dec 5, 2024', caseId: 'CS-2024-002', status: 'Verified' }
];

const categories = ['All', 'Legal Documents', 'Contracts', 'Evidence', 'Statements', 'Financial', 'Official'];

const fileTypeIcons = {
    PDF: FileText,
    DOC: FileText,
    Image: Image,
    Other: File
};

const statusColors = {
    'Verified': { bg: '#10b98120', border: '#10b981', text: '#10b981' },
    'Pending': { bg: '#f5930020', border: '#f59e0b', text: '#f59e0b' },
    'Under Review': { bg: '#8b5cf620', border: '#8b5cf6', text: '#8b5cf6' }
};

export default function DocumentsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [viewMode, setViewMode] = useState('grid');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const filteredDocs = mockDocuments.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
        return matchesSearch && matchesCategory;
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
        // Handle file upload
        console.log('Files dropped:', e.dataTransfer.files);
    };

    return (
        <div>
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
                    { label: 'Total Documents', value: mockDocuments.length, color: '#8b5cf6' },
                    { label: 'Verified', value: mockDocuments.filter(d => d.status === 'Verified').length, color: '#10b981' },
                    { label: 'Pending', value: mockDocuments.filter(d => d.status === 'Pending').length, color: '#f59e0b' },
                    { label: 'Storage Used', value: `${mockDocuments.reduce((sum, d) => sum + d.size, 0).toFixed(1)} MB`, color: '#3b82f6' }
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

                    {/* Category Filter */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                style={{
                                    padding: '0.75rem 1.25rem',
                                    background: selectedCategory === cat
                                        ? 'rgba(139, 92, 246, 0.2)'
                                        : 'rgba(15, 23, 42, 0.6)',
                                    border: selectedCategory === cat
                                        ? '2px solid #8b5cf6'
                                        : '2px solid rgba(139, 92, 246, 0.2)',
                                    borderRadius: '0.75rem',
                                    color: selectedCategory === cat ? '#c4b5fd' : '#94a3b8',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
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
                            <ListIcon size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Documents Display */}
            <div style={{
                display: viewMode === 'grid' ? 'grid' : 'flex',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : undefined,
                flexDirection: viewMode === 'list' ? 'column' : undefined,
                gap: '1.5rem'
            }}>
                {filteredDocs.map((doc) => {
                    const Icon = fileTypeIcons[doc.type] || fileTypeIcons.Other;
                    const statusStyle = statusColors[doc.status];

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
                                {doc.name}
                            </h3>

                            {/* Details */}
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <FolderOpen size={14} style={{ color: '#94a3b8' }} />
                                    <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                                        {doc.category}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <Calendar size={14} style={{ color: '#94a3b8' }} />
                                    <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                                        {doc.uploadDate}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                        {doc.size} MB
                                    </span>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '9999px',
                                        background: statusStyle.bg,
                                        border: `1px solid ${statusStyle.border}`,
                                        color: statusStyle.text,
                                        fontWeight: '600'
                                    }}>
                                        {doc.status}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
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
                                    <Eye size={16} />
                                    View
                                </button>
                                <button
                                    style={{
                                        padding: '0.75rem',
                                        background: 'rgba(15, 23, 42, 0.6)',
                                        border: '1px solid rgba(139, 92, 246, 0.2)',
                                        borderRadius: '0.5rem',
                                        color: '#94a3b8',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Download size={16} />
                                </button>
                                <button
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
                                onClick={() => setShowUploadModal(false)}
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
                            <input type="file" multiple style={{ display: 'none' }} />
                            <Upload size={48} style={{ color: '#8b5cf6', margin: '0 auto 1rem' }} />
                            <p style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem' }}>
                                Drag & drop files here
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                                or click to browse (PDF, DOC, DOCX, JPG, PNG)
                            </p>
                        </label>

                        {/* Category Selection */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#e2e8f0', fontSize: '0.875rem' }}>
                                Category
                            </label>
                            <select style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                background: 'rgba(15, 23, 42, 0.6)',
                                border: '2px solid rgba(139, 92, 246, 0.2)',
                                borderRadius: '0.75rem',
                                color: 'white',
                                fontSize: '1rem'
                            }}>
                                {categories.filter(c => c !== 'All').map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Upload Button */}
                        <button
                            onClick={() => setShowUploadModal(false)}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
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
                            <CheckCircle2 size={20} />
                            Upload Files
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
