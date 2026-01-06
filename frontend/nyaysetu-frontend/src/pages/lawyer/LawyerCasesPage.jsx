import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { caseAPI, lawyerAPI, caseAssignmentAPI } from '../../services/api';
import {
    Search,
    Filter,
    Briefcase,
    Clock,
    Scale,
    MoreVertical,
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
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Loader2 size={48} className="spin" style={{ color: '#6366f1' }} />
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
                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
                        }}>
                            <Briefcase size={28} color="white" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'white', margin: 0 }}>
                                Professional Console
                            </h1>
                            <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0 }}>
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
                            background: activeTab === 'active' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'rgba(255,255,255,0.05)',
                            color: activeTab === 'active' ? 'white' : '#94a3b8',
                            border: activeTab === 'active' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            boxShadow: activeTab === 'active' ? '0 4px 15px rgba(99, 102, 241, 0.4)' : 'none'
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
                            background: activeTab === 'proposals' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'rgba(255,255,255,0.05)',
                            color: activeTab === 'proposals' ? 'white' : '#94a3b8',
                            border: activeTab === 'proposals' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            boxShadow: activeTab === 'proposals' ? '0 4px 15px rgba(245, 158, 11, 0.4)' : 'none'
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
                            background: 'rgba(15, 23, 42, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '0.75rem',
                            padding: '0.8rem 1rem 0.8rem 3rem',
                            color: 'white',
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
                                background: 'rgba(15, 23, 42, 0.4)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '0.75rem',
                                padding: '0.8rem 1rem',
                                color: 'white',
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {filteredCases.length === 0 ? (
                    <div style={{ ...glassStyle, textAlign: 'center', padding: '5rem' }}>
                        <Briefcase size={64} color="#1e293b" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                        <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                            {activeTab === 'active' ? 'No Case Entries Found' : 'No New Proposals'}
                        </h3>
                        <p style={{ color: '#64748b' }}>
                            {activeTab === 'active' ? 'Your active portfolio is currently clear.' : 'Client proposals will appear here for your review.'}
                        </p>
                    </div>
                ) : (
                    filteredCases.map((caseItem) => (
                        <div
                            key={caseItem.id}
                            style={{
                                ...glassStyle,
                                padding: '1.5rem',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                display: 'flex',
                                gap: '2rem'
                            }}
                            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {/* Left Side: Icon and Core Info */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '10px',
                                        background: activeTab === 'proposals' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: activeTab === 'proposals' ? '#f59e0b' : '#818cf8'
                                    }}>
                                        {activeTab === 'proposals' ? <AlertCircle size={20} /> : <Scale size={20} />}
                                    </div>
                                    <div>
                                        <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
                                            {caseItem.title}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                color: '#64748b',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}>
                                                ID: {caseItem.id.substring(0, 8)}
                                            </span>
                                            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#334155' }} />
                                            <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: '700' }}>
                                                {caseItem.caseType || 'General Litigation'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', margin: '1rem 0' }}>
                                    {caseItem.description ? (caseItem.description.substring(0, 200) + (caseItem.description.length > 200 ? '...' : '')) : 'No case brief provided.'}
                                </p>
                                <div style={{ display: 'flex', gap: '2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>
                                        <Calendar size={14} /> Filed: {new Date(caseItem.filedDate || caseItem.createdAt).toLocaleDateString()}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>
                                        <User size={14} /> Petitioner: {caseItem.petitioner || 'Anonymous'}
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Status and Actions */}
                            <div style={{ width: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', borderLeft: '1px solid rgba(255, 255, 255, 0.05)', paddingLeft: '2rem' }}>
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
                                            color: caseItem.status === 'OPEN' || caseItem.status === 'IN_PROGRESS' ? '#10b981' : '#f59e0b',
                                            border: `1px solid ${caseItem.status === 'OPEN' || caseItem.status === 'IN_PROGRESS' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                                        }}>
                                            {caseItem.status === 'OPEN' || caseItem.status === 'IN_PROGRESS' ? <Activity size={12} /> : <Clock size={12} />}
                                            {caseItem.status}
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                                            <button
                                                onClick={() => navigate(`/lawyer/case/${caseItem.id}`)}
                                                style={{
                                                    width: '100%',
                                                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                                    color: 'white', border: 'none', borderRadius: '0.75rem',
                                                    padding: '0.6rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer'
                                                }}>
                                                Manage Case
                                            </button>
                                            <button
                                                onClick={() => navigate('/lawyer/evidence', { state: { caseId: caseItem.id } })}
                                                style={{
                                                    width: '100%',
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    color: '#94a3b8', border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '0.75rem', padding: '0.6rem', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer'
                                                }}>
                                                View Evidence
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{
                                            padding: '0.4rem 1rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: '800',
                                            background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)'
                                        }}>
                                            NEW PROPOSAL
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                                            <button
                                                onClick={() => handleRespondProposal(caseItem.id, 'ACCEPTED')}
                                                style={{
                                                    width: '100%',
                                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                    color: 'white', border: 'none', borderRadius: '0.75rem',
                                                    padding: '0.6rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer'
                                                }}
                                            >
                                                Accept Case
                                            </button>
                                            <button
                                                onClick={() => handleRespondProposal(caseItem.id, 'REJECTED')}
                                                style={{
                                                    width: '100%',
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)',
                                                    borderRadius: '0.75rem', padding: '0.6rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer'
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
