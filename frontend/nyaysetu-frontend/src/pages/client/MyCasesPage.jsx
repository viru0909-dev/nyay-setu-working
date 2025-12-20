import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Search, Filter, Calendar, Clock, FileText,
    Eye, Download, Plus, Grid, List as ListIcon, Loader2,
    Users, Scale, X, Check, Award
} from 'lucide-react';
import { caseAPI, caseAssignmentAPI } from '../../services/api';

const statusColors = {
    'PENDING': { bg: '#f5930020', border: '#f59e0b', text: '#f59e0b' },
    'OPEN': { bg: '#3b82f620', border: '#3b82f6', text: '#3b82f6' },
    'IN_PROGRESS': { bg: '#10b98120', border: '#10b981', text: '#10b981' },
    'UNDER_REVIEW': { bg: '#8b5cf620', border: '#8b5cf6', text: '#8b5cf6' },
    'AWAITING_DOCUMENTS': { bg: '#ef444420', border: '#ef4444', text: '#ef4444' },
    'COMPLETED': { bg: '#10b98120', border: '#10b981', text: '#10b981' },
    'CLOSED': { bg: '#64748b20', border: '#64748b', text: '#64748b' }
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatStatus = (status) => {
    if (!status) return 'Pending';
    return status.replace(/_/g, ' ').split(' ').map(word =>
        word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
};

export default function MyCasesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [cases, setCases] = useState([]);
    const [availableLawyers, setAvailableLawyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lawyerLoading, setLawyerLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showHireModal, setShowHireModal] = useState(false);
    const [selectedCaseForLawyer, setSelectedCaseForLawyer] = useState(null);

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        setLoading(true);
        try {
            const response = await caseAPI.list();
            setCases(response.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching cases:', err);
            setError('Failed to load cases. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleHireLawyer = async (caseItem) => {
        setSelectedCaseForLawyer(caseItem);
        setLawyerLoading(true);
        setShowHireModal(true);
        try {
            const response = await caseAssignmentAPI.getAvailableLawyers();
            setAvailableLawyers(response.data || []);
        } catch (error) {
            console.error('Error fetching lawyers:', error);
            alert('Failed to load available lawyers');
        } finally {
            setLawyerLoading(false);
        }
    };

    const submitProposal = async (lawyerId) => {
        if (!selectedCaseForLawyer) return;
        try {
            await caseAssignmentAPI.proposeLawyer(selectedCaseForLawyer.id, lawyerId);
            alert('✅ Proposal sent successfully! The lawyer will review and accept/decline your case.');
            setShowHireModal(false);
            fetchCases();
        } catch (error) {
            console.error('Error sending proposal:', error);
            alert('Failed to send proposal. This case might already have a pending proposal.');
        }
    };

    const filteredCases = cases.filter(c => {
        const matchesSearch = c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.id?.toString().toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const statuses = ['all', ...new Set(cases.map(c => c.status).filter(Boolean))];

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'white', marginBottom: '0.5rem' }}>
                        My Cases
                    </h1>
                    <p style={{ fontSize: '1rem', color: '#94a3b8' }}>
                        Manage and track all your legal cases
                    </p>
                </div>
                <Link
                    to="/client/file-case"
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
                        textDecoration: 'none',
                        boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.5)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.4)';
                    }}
                >
                    <Plus size={20} />
                    File New Case
                </Link>
            </div>

            {/* Stats Overview */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minwidth(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                {[
                    { label: 'Total Cases', value: cases.length, color: '#8b5cf6' },
                    { label: 'Pending', value: cases.filter(c => c.status === 'PENDING').length, color: '#f59e0b' },
                    { label: 'In Progress', value: cases.filter(c => c.status === 'IN_PROGRESS').length, color: '#3b82f6' },
                    { label: 'Completed', value: cases.filter(c => c.status === 'COMPLETED').length, color: '#10b981' }
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
                            {loading ? '-' : stat.value}
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
                    {/* Search Bar */}
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
                            placeholder="Search cases by title or ID..."
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

                    {/* Status Filter */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {statuses.map((status) => (
                            <button
                                key={status}
                                onClick={() => setSelectedStatus(status)}
                                style={{
                                    padding: '0.75rem 1.25rem',
                                    background: selectedStatus === status
                                        ? 'rgba(139, 92, 246, 0.2)'
                                        : 'rgba(15, 23, 42, 0.6)',
                                    border: selectedStatus === status
                                        ? '2px solid #8b5cf6'
                                        : '2px solid rgba(139, 92, 246, 0.2)',
                                    borderRadius: '0.75rem',
                                    color: selectedStatus === status ? '#c4b5fd' : '#94a3b8',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    textTransform: 'capitalize',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {status.replace('-', ' ')}
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

            {/* Cases Display */}
            {loading ? (
                <div style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '1.5rem',
                    padding: '4rem',
                    textAlign: 'center'
                }}>
                    <Loader2 size={64} style={{ color: '#8b5cf6', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem' }}>
                        Loading cases...
                    </h3>
                    <p style={{ fontSize: '1rem', color: '#94a3b8' }}>
                        Please wait while we fetch your cases
                    </p>
                    <style>{`
                        @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            ) : error ? (
                <div style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '1.5rem',
                    padding: '4rem',
                    textAlign: 'center'
                }}>
                    <FileText size={64} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem' }}>
                        {error}
                    </h3>
                    <button
                        onClick={fetchCases}
                        style={{
                            marginTop: '1rem',
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            border: 'none',
                            borderRadius: '0.5rem',
                            color: 'white',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Retry
                    </button>
                </div>
            ) : filteredCases.length === 0 ? (
                <div style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '1.5rem',
                    padding: '4rem',
                    textAlign: 'center'
                }}>
                    <FileText size={64} style={{ color: '#64748b', margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem' }}>
                        No cases found
                    </h3>
                    <p style={{ fontSize: '1rem', color: '#94a3b8' }}>
                        {searchQuery || selectedStatus !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'File your first case to get started'}
                    </p>
                    {!searchQuery && selectedStatus === 'all' && (
                        <Link
                            to="/client/file-case"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginTop: '1.5rem',
                                padding: '0.875rem 1.5rem',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                border: 'none',
                                borderRadius: '0.75rem',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: '700',
                                textDecoration: 'none'
                            }}
                        >
                            <Plus size={20} />
                            File New Case
                        </Link>
                    )}
                </div>
            ) : (
                <div style={{
                    display: viewMode === 'grid' ? 'grid' : 'flex',
                    gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(400px, 1fr))' : undefined,
                    flexDirection: viewMode === 'list' ? 'column' : undefined,
                    gap: '1.5rem'
                }}>
                    {filteredCases.map((caseItem) => {
                        const statusStyle = statusColors[caseItem.status] || statusColors['PENDING'];
                        return (
                            <div
                                key={caseItem.id}
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
                                {/* Case Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <div>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            color: '#8b5cf6',
                                            padding: '0.25rem 0.75rem',
                                            background: 'rgba(139, 92, 246, 0.1)',
                                            borderRadius: '9999px',
                                            border: '1px solid rgba(139, 92, 246, 0.3)'
                                        }}>
                                            {caseItem.id ? caseItem.id.toString().substring(0, 13) : 'N/A'}
                                        </span>
                                    </div>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '0.35rem 0.75rem',
                                        borderRadius: '9999px',
                                        background: statusStyle.bg,
                                        border: `1px solid ${statusStyle.border}`,
                                        color: statusStyle.text,
                                        fontWeight: '600'
                                    }}>
                                        {formatStatus(caseItem.status)}
                                    </span>
                                </div>

                                {/* Case Title */}
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '0.75rem' }}>
                                    {caseItem.title || 'Untitled Case'}
                                </h3>

                                {/* Description */}
                                <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: '1.6' }}>
                                    {caseItem.description || 'No description provided'}
                                </p>

                                {/* Case Details Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                            Filed Date
                                        </p>
                                        <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#e2e8f0' }}>
                                            {formatDate(caseItem.filedDate)}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                            Next Hearing
                                        </p>
                                        <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#8b5cf6' }}>
                                            {formatDate(caseItem.nextHearing)}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                            Assigned Judge
                                        </p>
                                        <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#e2e8f0' }}>
                                            {caseItem.assignedJudge || 'Not assigned'}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                            Documents
                                        </p>
                                        <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#e2e8f0' }}>
                                            {caseItem.documentsCount || 0} files
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
                                    <Link
                                        to={`/client/case/${caseItem.id}`}
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
                                            gap: '0.5rem',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        <Eye size={16} />
                                        View Details
                                    </Link>

                                    {!caseItem.lawyer && (caseItem.status === 'PENDING' || caseItem.status === 'OPEN') && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleHireLawyer(caseItem);
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                border: 'none',
                                                borderRadius: '0.5rem',
                                                color: 'white',
                                                fontSize: '0.875rem',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                boxShadow: '0 4px 10px rgba(245, 158, 11, 0.2)'
                                            }}
                                        >
                                            <Scale size={16} />
                                            {caseItem.lawyerProposalStatus === 'PENDING' ? 'Proposal Sent' : 'Hire Lawyer'}
                                        </button>
                                    )}

                                    <Link
                                        to={`/client/case/${caseItem.id}`}
                                        style={{
                                            padding: '0.75rem',
                                            background: 'rgba(15, 23, 42, 0.6)',
                                            border: '1px solid rgba(139, 92, 246, 0.2)',
                                            borderRadius: '0.5rem',
                                            color: '#94a3b8',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            textDecoration: 'none'
                                        }}
                                        title="Download Case"
                                    >
                                        <Download size={16} />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Hire Lawyer Modal */}
            {showHireModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setShowHireModal(false)}>
                    <div style={{
                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '2rem',
                        width: '90%', maxWidth: '800px', maxHeight: '80vh',
                        padding: '2.5rem', overflow: 'hidden', display: 'flex', flexDirection: 'column'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white', margin: 0 }}>
                                    Match with Legal Experts
                                </h2>
                                <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
                                    Select the best lawyer for: <span style={{ color: '#818cf8', fontWeight: '600' }}>{selectedCaseForLawyer?.title}</span>
                                </p>
                            </div>
                            <button onClick={() => setShowHireModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                <X size={28} />
                            </button>
                        </div>

                        {lawyerLoading ? (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
                                <Loader2 size={48} style={{ color: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
                                <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Sourcing available legal experts...</p>
                            </div>
                        ) : availableLawyers.length === 0 ? (
                            <div style={{ flex: 1, textAlign: 'center', padding: '4rem' }}>
                                <Users size={64} color="#475569" style={{ margin: '0 auto 1.5rem' }} />
                                <h3 style={{ color: 'white', fontSize: '1.25rem' }}>No lawyers available currently</h3>
                                <p style={{ color: '#94a3b8' }}>Our partner lawyers are currently handling other cases. Please try again shortly.</p>
                            </div>
                        ) : (
                            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem', padding: '0.5rem' }}>
                                {availableLawyers.map(lawyer => (
                                    <div key={lawyer.id} style={{
                                        background: 'rgba(30, 41, 59, 0.5)',
                                        border: '1px solid rgba(139, 92, 246, 0.2)',
                                        borderRadius: '1.25rem',
                                        padding: '1.5rem',
                                        transition: 'all 0.2s'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                                            <div style={{
                                                width: '56px', height: '56px', borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: '800', fontSize: '1.25rem', color: 'white'
                                            }}>
                                                {lawyer.name?.substring(0, 1)}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem', margin: 0 }}>{lawyer.name}</h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                                    <Award size={14} color="#f59e0b" />
                                                    <span style={{ color: '#f59e0b', fontWeight: '700', fontSize: '0.875rem' }}>{lawyer.rating || '4.8'}</span>
                                                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>• {lawyer.specialization}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '0.75rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                                                <p style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: '700' }}>Experience</p>
                                                <p style={{ color: 'white', fontSize: '0.9rem', fontWeight: '600' }}>8+ Years</p>
                                            </div>
                                            <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '0.75rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                                                <p style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: '700' }}>Cases</p>
                                                <p style={{ color: 'white', fontSize: '0.9rem', fontWeight: '600' }}>{lawyer.casesHandled || '120'}+</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => submitProposal(lawyer.id)}
                                            style={{
                                                width: '100%', padding: '0.875rem', borderRadius: '0.75rem',
                                                background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)',
                                                color: '#818cf8', fontWeight: '700', cursor: 'pointer',
                                                transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.background = '#6366f1';
                                                e.currentTarget.style.color = 'white';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                                                e.currentTarget.style.color = '#818cf8';
                                            }}
                                        >
                                            <Check size={18} />
                                            Select & Send Proposal
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
