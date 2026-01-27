import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { caseAPI, lawyerAPI, caseAssignmentAPI } from '../../services/api';
import {
    Search,
    Filter,
    Briefcase,
    Clock,
    Scale,
    MoreVertical, ArrowRight, ChevronDown,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Calendar,
    FileText,
    Activity,
    Loader2,
    Plus,
    User,
    Check,
    X
} from 'lucide-react';

export default function LawyerCasesPage() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'proposals'
    const navigate = useNavigate();

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            const response = await lawyerAPI.getCases();
            setCases(response.data || []);
        } catch (error) {
            console.error('Error fetching cases:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRespondProposal = async (caseId, status) => {
        try {
            await caseAssignmentAPI.respondToProposal(caseId, status);
            alert(`✅ Proposal ${status.toLowerCase()} successfully!`);
            fetchCases();
        } catch (error) {
            console.error('Error responding to proposal:', error);
            alert('Failed to record response');
        }
    };

    const activeCases = cases.filter(c => c.lawyerProposalStatus !== 'PENDING');
    const proposals = cases.filter(c => c.lawyerProposalStatus === 'PENDING');

    const displayCases = activeTab === 'active' ? activeCases : proposals;

    const filteredCases = displayCases.filter(c => {
        const matchesSearch = (c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filterStatus === 'ALL' || c.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const glassStyle = {
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'var(--glass-blur)',
        border: 'var(--border-glass-strong)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-glass-strong)'
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Loader2 size={48} className="spin" style={{ color: 'var(--color-primary)' }} />
                <style>{`
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .spin { animation: spin 1s linear infinite; }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '14px',
                            background: 'var(--color-accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: 'var(--shadow-glass)'
                        }}>
                            <Briefcase size={28} color="white" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                                Professional Console
                            </h1>
                            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>
                                Manage your litigation portfolio and evaluate new client proposals
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => setActiveTab('active')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.75rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            transition: 'all 0.2s',
                            background: activeTab === 'active' ? 'var(--color-accent)' : 'var(--bg-glass)',
                            color: activeTab === 'active' ? 'var(--text-main)' : 'var(--text-secondary)',
                            border: activeTab === 'active' ? 'none' : 'var(--border-glass)',
                            boxShadow: activeTab === 'active' ? 'var(--shadow-glass)' : 'none'
                        }}
                    >
                        <Activity size={18} />
                        Active Portfolio ({activeCases.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('proposals')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.75rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            transition: 'all 0.2s',
                            background: activeTab === 'proposals' ? 'var(--color-warning)' : 'var(--bg-glass)',
                            color: activeTab === 'proposals' ? 'var(--text-main)' : 'var(--text-secondary)',
                            border: activeTab === 'proposals' ? 'none' : 'var(--border-glass)',
                            boxShadow: activeTab === 'proposals' ? 'var(--shadow-glass)' : 'none'
                        }}
                    >
                        <AlertCircle size={18} />
                        Incoming Proposals ({proposals.length})
                        {proposals.length > 0 && (
                            <span style={{
                                width: '20px', height: '20px', borderRadius: '50%',
                                background: 'white', color: '#d97706', fontSize: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {proposals.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div style={{
                ...glassStyle,
                padding: '1rem 1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '2rem'
            }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab === 'active' ? 'active portfolio' : 'proposals'}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'var(--bg-glass)',
                            border: 'var(--border-glass)',
                            borderRadius: '0.75rem',
                            padding: '0.8rem 1rem 0.8rem 3rem',
                            color: 'var(--text-main)',
                            outline: 'none',
                            fontSize: '0.95rem'
                        }}
                    />
                </div>
                {activeTab === 'active' && (
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <Filter size={18} color="#64748b" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{
                                background: 'var(--bg-glass)',
                                border: 'var(--border-glass)',
                                borderRadius: '0.75rem',
                                padding: '0.8rem 1rem',
                                color: 'var(--text-main)',
                                outline: 'none',
                                fontSize: '0.9rem',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PENDING">Pending Approval</option>
                            <option value="OPEN">Active Litigation</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="CLOSED">Closed/Resolved</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Cases List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {filteredCases.length === 0 ? (
                    <div style={{ ...glassStyle, textAlign: 'center', padding: '5rem' }}>
                        <Briefcase size={64} color="var(--text-secondary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                        <h3 style={{ color: 'var(--text-main)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                            {activeTab === 'active' ? 'No Case Entries Found' : 'No New Proposals'}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {activeTab === 'active' ? 'Your active portfolio is currently clear.' : 'Client proposals will appear here for your review.'}
                        </p>
                    </div>
                ) : (
                    filteredCases.map((caseItem) => (
                        <div
                            key={caseItem.id}
                            style={{
                                background: 'var(--bg-glass-strong)',
                                backdropFilter: 'var(--glass-blur)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '1.5rem',
                                padding: '1.75rem',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'default',
                                display: 'flex',
                                gap: '2rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            }}
                            onMouseOver={e => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            }}
                        >
                            {/* Left Side: Icon and Core Info */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1rem' }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '12px',
                                        background: activeTab === 'proposals' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: activeTab === 'proposals' ? 'var(--color-warning)' : '#3b82f6',
                                        flexShrink: 0
                                    }}>
                                        {activeTab === 'proposals' ? <AlertCircle size={24} /> : <Scale size={24} />}
                                    </div>
                                    <div>
                                        <h3 style={{ color: 'var(--text-main)', fontSize: '1.35rem', fontWeight: '700', margin: 0, lineHeight: 1.2 }}>
                                            {caseItem.title}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem' }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--text-secondary)',
                                                fontFamily: 'monospace',
                                                background: 'rgba(255,255,255,0.05)',
                                                padding: '0.1rem 0.4rem', borderRadius: '4px'
                                            }}>
                                                ID: {caseItem.id.substring(0, 8)}
                                            </span>
                                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-secondary)' }} />
                                            <span style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: '600', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                                                {caseItem.caseType || 'General Litigation'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 1.5rem 0', maxWidth: '90%' }}>
                                    {caseItem.description ? (caseItem.description.substring(0, 200) + (caseItem.description.length > 200 ? '...' : '')) : 'No case brief provided - please review full details.'}
                                </p>
                                <div style={{ display: 'flex', gap: '2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>
                                        <Calendar size={16} color="#64748b" />
                                        <span>Filed: <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{new Date(caseItem.filedDate || caseItem.createdAt).toLocaleDateString()}</span></span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>
                                        <User size={16} color="#64748b" />
                                        <span>Petitioner: <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{caseItem.petitioner || 'Anonymous'}</span></span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Status and Actions */}
                            <div style={{ width: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', paddingLeft: '2rem', borderLeft: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                {activeTab === 'active' ? (
                                    <>
                                        <div style={{
                                            padding: '0.4rem 1rem',
                                            borderRadius: '2rem',
                                            fontSize: '0.75rem',
                                            fontWeight: '800',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            background: caseItem.status === 'OPEN' || caseItem.status === 'IN_PROGRESS' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            color: caseItem.status === 'OPEN' || caseItem.status === 'IN_PROGRESS' ? 'var(--color-success)' : 'var(--color-warning)',
                                            border: `1px solid ${caseItem.status === 'OPEN' || caseItem.status === 'IN_PROGRESS' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                                        }}>
                                            {caseItem.status === 'OPEN' || caseItem.status === 'IN_PROGRESS' ? <Activity size={12} /> : <Clock size={12} />}
                                            {caseItem.status}
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%' }}>
                                            <button
                                                onClick={() => navigate(`/lawyer/case/${caseItem.id}/workspace`)}
                                                style={{
                                                    width: '100%',
                                                    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                                                    color: 'white', border: 'none', borderRadius: '0.75rem',
                                                    padding: '0.7rem', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer',
                                                    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                                                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                            >
                                                Open Workspace <ChevronRight size={16} />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/lawyer/case/${caseItem.id}/workspace?tab=evidence`)}
                                                style={{
                                                    width: '100%',
                                                    background: 'transparent',
                                                    color: 'var(--text-secondary)', border: '1px solid var(--border-glass)',
                                                    borderRadius: '0.75rem', padding: '0.65rem', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={e => {
                                                    e.currentTarget.style.borderColor = 'var(--text-secondary)';
                                                    e.currentTarget.style.color = 'var(--text-main)';
                                                }}
                                                onMouseOut={e => {
                                                    e.currentTarget.style.borderColor = 'var(--border-glass)';
                                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                                }}
                                            >
                                                Quick Verification
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{
                                            padding: '0.4rem 1rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: '800',
                                            background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)', border: '1px solid rgba(245, 158, 11, 0.2)'
                                        }}>
                                            NEW PROPOSAL
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                                            <button
                                                onClick={() => handleRespondProposal(caseItem.id, 'ACCEPTED')}
                                                style={{
                                                    width: '100%',
                                                    background: 'var(--color-success)',
                                                    color: 'white', border: 'none', borderRadius: '0.75rem',
                                                    padding: '0.65rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer'
                                                }}
                                            >
                                                Accept Case
                                            </button>
                                            <button
                                                onClick={() => handleRespondProposal(caseItem.id, 'REJECTED')}
                                                style={{
                                                    width: '100%',
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    color: 'var(--color-error)', border: '1px solid rgba(239, 68, 68, 0.2)',
                                                    borderRadius: '0.75rem', padding: '0.65rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer'
                                                }}
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
