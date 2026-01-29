import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Search, Filter, Calendar, Clock, FileText,
    Eye, Download, Plus, Grid, List as ListIcon, Loader2,
    Users, Scale, X, Check, Award, Shield, AlertTriangle, Gavel
} from 'lucide-react';
import { caseAPI, clientFirAPI, caseAssignmentAPI } from '../../services/api';

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

export default function CaseDiaryPage() {
    const [activeTab, setActiveTab] = useState('cases'); // 'cases' or 'firs'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [viewMode, setViewMode] = useState('grid');

    const [cases, setCases] = useState([]);
    const [firs, setFirs] = useState([]);

    const [availableLawyers, setAvailableLawyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lawyerLoading, setLawyerLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showHireModal, setShowHireModal] = useState(false);
    const [selectedCaseForLawyer, setSelectedCaseForLawyer] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch both cases and FIRs in parallel
            const [casesRes, firsRes] = await Promise.allSettled([
                caseAPI.list(),
                clientFirAPI.listFirs()
            ]);

            if (casesRes.status === 'fulfilled') {
                setCases(casesRes.value.data || []);
            } else {
                console.error('Error fetching cases:', casesRes.reason);
            }

            if (firsRes.status === 'fulfilled') {
                setFirs(firsRes.value.data || []);
            } else {
                console.error('Error fetching FIRs:', firsRes.reason);
            }

            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load diary entries.');
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
            fetchData();
        } catch (error) {
            console.error('Error sending proposal:', error);
            alert('Failed to send proposal. This case might already have a pending proposal.');
        }
    };

    const filteredItems = (activeTab === 'cases' ? cases : firs).filter(item => {
        const title = item.title || item.caseTitle || '';
        const id = item.id?.toString() || '';
        const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            id.toLowerCase().includes(searchQuery.toLowerCase());

        if (selectedStatus === 'all') return matchesSearch;
        return matchesSearch && item.status === selectedStatus;
    });

    const currentStatuses = ['all', ...new Set((activeTab === 'cases' ? cases : firs).map(c => c.status).filter(Boolean))];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                        Case Diary
                    </h1>
                    <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                        Manage your court cases and police FIRs
                    </p>
                </div>
                <Link
                    to="/litigant/file"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.875rem 1.5rem',
                        background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                        border: 'none', borderRadius: '0.75rem',
                        color: 'white', fontSize: '1rem', fontWeight: '700',
                        boxShadow: 'var(--shadow-glass-strong)'
                    }}
                >
                    <Plus size={20} />
                    File New Case
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-md" style={{ marginBottom: '2rem' }}>
                <div className="card flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                        <p className="text-secondary font-semibold text-sm">Total Cases</p>
                        <Scale size={20} className="text-primary" style={{ opacity: 0.5 }} />
                    </div>
                    <p className="font-bold text-primary" style={{ fontSize: '2rem' }}>{cases.length}</p>
                </div>
                <div className="card flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                        <p className="text-secondary font-semibold text-sm">Total FIRs</p>
                        <Shield size={20} style={{ color: '#ef4444', opacity: 0.5 }} />
                    </div>
                    <p className="font-bold" style={{ fontSize: '2rem', color: '#ef4444' }}>{firs.length}</p>
                </div>
                <div className="card flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                        <p className="text-secondary font-semibold text-sm">Active</p>
                        <Clock size={20} style={{ color: '#3b82f6', opacity: 0.5 }} />
                    </div>
                    <p className="font-bold" style={{ fontSize: '2rem', color: '#3b82f6' }}>
                        {cases.filter(c => c.status !== 'CLOSED').length + firs.filter(f => f.status !== 'CLOSED').length}
                    </p>
                </div>
                <div className="card flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                        <p className="text-secondary font-semibold text-sm">Pending Action</p>
                        <AlertTriangle size={20} style={{ color: '#f59e0b', opacity: 0.5 }} />
                    </div>
                    <p className="font-bold" style={{ fontSize: '2rem', color: '#f59e0b' }}>
                        {cases.filter(c => c.status === 'AWAITING_DOCUMENTS').length}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-md" style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-glass)' }}>
                <button
                    onClick={() => setActiveTab('cases')}
                    className={`btn ${activeTab === 'cases' ? 'btn-ghost' : 'btn-ghost'}`}
                    style={{
                        padding: '1rem 2rem',
                        borderBottom: activeTab === 'cases' ? '3px solid #3b82f6' : '3px solid transparent',
                        color: activeTab === 'cases' ? '#3b82f6' : 'var(--text-secondary)',
                        borderRadius: '0',
                        background: activeTab === 'cases' ? 'linear-gradient(to top, rgba(59, 130, 246, 0.1), transparent)' : 'transparent',
                    }}
                >
                    <Scale size={20} /> Court Cases
                </button>
                <button
                    onClick={() => setActiveTab('firs')}
                    className={`btn ${activeTab === 'firs' ? 'btn-ghost' : 'btn-ghost'}`}
                    style={{
                        padding: '1rem 2rem',
                        borderBottom: activeTab === 'firs' ? '3px solid #ef4444' : '3px solid transparent',
                        color: activeTab === 'firs' ? '#ef4444' : 'var(--text-secondary)',
                        borderRadius: '0',
                        background: activeTab === 'firs' ? 'linear-gradient(to top, rgba(239, 68, 68, 0.1), transparent)' : 'transparent',
                    }}
                >
                    <Shield size={20} /> Police FIRs
                </button>
            </div>

            {/* Filters */}
            <div style={{
                background: 'var(--bg-glass-strong)',
                border: 'var(--border-glass-strong)',
                borderRadius: '1rem', padding: '1rem', marginBottom: '2rem',
                display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center'
            }}>
                <div style={{ flex: 1, position: 'relative', minWidth: '250px' }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder={activeTab === 'cases' ? "Search by title or Case ID..." : "Search by title or FIR ID..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.5rem', color: 'var(--text-main)' }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Filter size={18} style={{ color: '#94a3b8' }} />
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        style={{ padding: '0.75rem', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.5rem', color: 'var(--text-main)', cursor: 'pointer' }}
                    >
                        {Object.keys(statusColors).map(status => (
                            <option key={status} value={status}>{formatStatus(status)}</option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                    <button onClick={() => setViewMode('grid')} style={{ padding: '0.5rem', background: viewMode === 'grid' ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-glass)', borderRadius: '0.5rem', cursor: 'pointer', color: viewMode === 'grid' ? '#8b5cf6' : '#94a3b8' }}><Grid size={20} /></button>
                    <button onClick={() => setViewMode('list')} style={{ padding: '0.5rem', background: viewMode === 'list' ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-glass)', borderRadius: '0.5rem', cursor: 'pointer', color: viewMode === 'list' ? '#8b5cf6' : '#94a3b8' }}><ListIcon size={20} /></button>
                </div>
            </div>

            {/* List Content */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <Loader2 size={40} className="animate-spin" style={{ color: '#8b5cf6', margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Loading your diary...</p>
                </div>
            ) : filteredItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-glass)', borderRadius: '1rem' }}>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>No entries found</p>
                    <Link to="/litigant/file" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'var(--color-accent)', borderRadius: '0.5rem', color: 'white', fontWeight: '600' }}>
                        <Plus size={18} /> File New
                    </Link>
                </div>
            ) : (
                <div style={{ display: viewMode === 'grid' ? 'grid' : 'flex', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', flexDirection: 'column', gap: '1.5rem' }}>
                    {filteredItems.map(item => (
                        <div key={item.id} style={{ background: 'var(--bg-glass-strong)', border: 'var(--border-glass-strong)', borderRadius: '1rem', padding: '1.5rem', transition: 'transform 0.2s', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <span style={{
                                    padding: '0.25rem 0.75rem', borderRadius: '9999px',
                                    background: (statusColors[item.status] || statusColors['PENDING']).bg,
                                    color: (statusColors[item.status] || statusColors['PENDING']).text,
                                    fontSize: '0.75rem', fontWeight: '700', border: `1px solid ${(statusColors[item.status] || statusColors['PENDING']).border}`
                                }}>
                                    {formatStatus(item.status)}
                                </span>
                                {item.urgency === 'CRITICAL' && <AlertTriangle size={18} color="#ef4444" />}
                            </div>

                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                                {item.title}
                            </h3>

                            {activeTab === 'cases' && (
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    {item.caseType || 'No Type'} • ID: {item.id}
                                </p>
                            )}

                            {activeTab === 'firs' && (
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    <Shield size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                    Police FIR • ID: {item.id} • {item.incidentLocation || 'No Loc'}
                                </p>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                                <Calendar size={14} /> {formatDate(item.createdAt || item.filedDate)}
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                                {activeTab === 'cases' ? (
                                    <>
                                        <Link to={`/litigant/case-diary/${item.id}`} style={{ flex: 1, textAlign: 'center', padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderRadius: '0.5rem', fontWeight: '600' }}>
                                            View Details
                                        </Link>
                                        {!item.assignedLawyer && item.status !== 'CLOSED' && (
                                            item.lawyerProposalStatus === 'PENDING' ? (
                                                <button
                                                    disabled
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.75rem',
                                                        background: 'rgba(245, 158, 11, 0.1)',
                                                        border: '1px solid rgba(245, 158, 11, 0.3)',
                                                        borderRadius: '0.5rem',
                                                        color: '#d97706',
                                                        fontWeight: '600',
                                                        cursor: 'not-allowed',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                >
                                                    <Clock size={16} /> Request Sent
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleHireLawyer(item);
                                                    }}
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.75rem',
                                                        background: 'var(--color-accent)',
                                                        borderRadius: '0.5rem',
                                                        color: 'white',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                >
                                                    <Gavel size={16} /> Hire Lawyer
                                                </button>
                                            )
                                        )}
                                    </>
                                ) : (
                                    (item.caseId) ? (
                                        <Link
                                            to={`/litigant/case-diary/${item.caseId}`}
                                            style={{
                                                flex: 1,
                                                textAlign: 'center',
                                                padding: '0.75rem',
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                                color: '#10b981',
                                                borderRadius: '0.5rem',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <Scale size={16} /> View Linked Court Case
                                        </Link>
                                    ) : (
                                        <button disabled style={{ flex: 1, textAlign: 'center', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '0.5rem', fontWeight: '600', opacity: 0.7 }}>
                                            {item.status === 'REJECTED' ? 'Application Rejected' : 'Processing'}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )
            }

            {/* Hire Lawyer Modal */}
            {
                showHireModal && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }} onClick={() => setShowHireModal(false)}>
                        <div style={{
                            background: 'var(--bg-glass-strong)',
                            backdropFilter: 'var(--glass-blur)',
                            border: 'var(--border-glass-strong)',
                            borderRadius: '2rem',
                            width: '90%', maxWidth: '800px', maxHeight: '80vh',
                            padding: '2.5rem', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                            boxShadow: 'var(--shadow-glass-strong)'
                        }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                                        Match with Legal Experts
                                    </h2>
                                    <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                                        Select the best lawyer for: <span style={{ color: 'var(--color-accent)', fontWeight: '600' }}>{selectedCaseForLawyer?.title}</span>
                                    </p>
                                </div>
                                <button onClick={() => setShowHireModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
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
                                    <Users size={64} style={{ color: 'var(--text-secondary)', margin: '0 auto 1.5rem' }} />
                                    <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem' }}>No lawyers available currently</h3>
                                    <p style={{ color: 'var(--text-secondary)' }}>Our partner lawyers are currently handling other cases. Please try again shortly.</p>
                                </div>
                            ) : (
                                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem', padding: '0.5rem' }}>
                                    {availableLawyers.map(lawyer => (
                                        <div key={lawyer.id} style={{
                                            background: 'var(--bg-glass)',
                                            border: 'var(--border-glass)',
                                            borderRadius: '1.25rem',
                                            padding: '1.5rem',
                                            transition: 'all 0.2s',
                                            boxShadow: 'var(--shadow-glass)'
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
                                                    <h4 style={{ color: 'var(--text-main)', fontWeight: '700', fontSize: '1.1rem', margin: 0 }}>{lawyer.name}</h4>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                                        <Award size={14} color="#f59e0b" />
                                                        <span style={{ color: '#f59e0b', fontWeight: '700', fontSize: '0.875rem' }}>{lawyer.rating || '4.8'}</span>
                                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>• {lawyer.specialization}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                                <div style={{ background: 'var(--bg-glass-strong)', padding: '0.75rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: '700' }}>Experience</p>
                                                    <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: '600' }}>8+ Years</p>
                                                </div>
                                                <div style={{ background: 'var(--bg-glass-strong)', padding: '0.75rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: '700' }}>Cases</p>
                                                    <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: '600' }}>{lawyer.casesHandled || '120'}+</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => submitProposal(lawyer.id)}
                                                style={{
                                                    width: '100%', padding: '0.875rem', borderRadius: '0.75rem',
                                                    background: 'var(--bg-glass-strong)', border: '1px solid var(--color-accent)',
                                                    color: 'var(--color-accent)', fontWeight: '700', cursor: 'pointer',
                                                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.background = 'var(--color-accent)';
                                                    e.currentTarget.style.color = 'white';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.background = 'var(--bg-glass-strong)';
                                                    e.currentTarget.style.color = 'var(--color-accent)';
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
                )
            }
        </div >
    );
}

