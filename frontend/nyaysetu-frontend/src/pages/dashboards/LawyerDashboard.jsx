import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { caseAPI, lawyerAPI } from '../../services/api';
import {
    Briefcase,
    Users,
    Scale,
    Clock,
    Plus,
    Search,
    LogOut,
    FileText,
    MoreVertical,
    ChevronRight,
    Filter,
    Activity,
    CheckCircle2,
    AlertCircle,
    Loader2,
    X
} from 'lucide-react';

export default function LawyerDashboard() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [stats, setStats] = useState({ totalCases: 0, activeClients: 0, upcomingHearings: 0, resolvedCases: 0 });
    const [showNewCaseForm, setShowNewCaseForm] = useState(false);
    const [newCase, setNewCase] = useState({ title: '', description: '', caseType: 'CIVIL' });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [casesRes, statsRes] = await Promise.all([
                lawyerAPI.getCases(),
                lawyerAPI.getStats()
            ]);
            setCases(casesRes.data || []);
            setStats(statsRes.data || stats);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCase = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await caseAPI.create(newCase);
            setShowNewCaseForm(false);
            setNewCase({ title: '', description: '', caseType: 'CIVIL' });
            await loadData();
        } catch (error) {
            console.error('Failed to create case:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const filteredCases = cases.filter(c =>
        c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const glassStyle = {
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
    };

    const primaryButtonStyle = {
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '0.75rem',
        padding: '0.75rem 1.5rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
        transition: 'all 0.2s'
    };

    if (loading && cases.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'transparent' }}>
                <Loader2 size={48} className="spin" style={{ color: '#6366f1' }} />
                <style>{`
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .spin { animation: spin 1s linear infinite; }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '16px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
                        }}>
                            <Scale size={28} color="white" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'white', margin: 0 }}>
                                Legal Counsel Hub
                            </h1>
                            <p style={{ color: '#94a3b8', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Activity size={14} color="#6366f1" /> Welcome back, Adv. {user?.name || 'Counselor'}
                            </p>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => setShowNewCaseForm(true)}
                        style={primaryButtonStyle}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <Plus size={20} /> File New Case
                    </button>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '0.75rem',
                            padding: '0.75rem',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {/* Stats Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <QuickStat icon={<Briefcase size={22} />} label="Total Cases" value={stats.totalCases} color="#6366f1" />
                <QuickStat icon={<Clock size={22} />} label="Upcoming Hearings" value={stats.upcomingHearings} color="#f59e0b" />
                <QuickStat icon={<CheckCircle2 size={22} />} label="Resolved" value={stats.resolvedCases} color="#10b981" />
                <QuickStat icon={<Users size={22} />} label="Total Clients" value={stats.activeClients} color="#ec4899" />
            </div>

            {/* Cases List Area */}
            <div style={glassStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FileText size={24} color="#6366f1" /> Active Litigation Files
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Search cases..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    background: 'rgba(15, 23, 42, 0.4)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '0.75rem',
                                    padding: '0.6rem 1rem 0.6rem 3rem',
                                    color: 'white',
                                    width: '250px',
                                    outline: 'none',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>
                        <button style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '0.75rem',
                            padding: '0.6rem',
                            color: '#94a3b8',
                            cursor: 'pointer'
                        }}>
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                {filteredCases.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(15, 23, 42, 0.2)', borderRadius: '1rem' }}>
                        <AlertCircle size={48} color="#334155" style={{ marginBottom: '1rem' }} />
                        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>No case files matching your criteria</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filteredCases.map((caseItem, idx) => (
                            <div key={idx} style={{
                                padding: '1.25rem',
                                background: 'rgba(15, 23, 42, 0.4)',
                                borderRadius: '1rem',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)'}
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.4)'}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <h4 style={{ fontWeight: '700', fontSize: '1.1rem', color: 'white', margin: 0 }}>
                                            {caseItem.title || `Untitled Case #${caseItem.id}`}
                                        </h4>
                                        <span style={{
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '2rem',
                                            fontSize: '0.7rem',
                                            fontWeight: '800',
                                            background: caseItem.status === 'OPEN' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            color: caseItem.status === 'OPEN' ? '#10b981' : '#f59e0b',
                                            border: `1px solid ${caseItem.status === 'OPEN' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                                        }}>
                                            {caseItem.status || 'PENDING'}
                                        </span>
                                    </div>
                                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, maxWidth: '600px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Activity size={12} /> {caseItem.description ? (caseItem.description.substring(0, 100) + (caseItem.description.length > 100 ? '...' : '')) : 'No summary available'}
                                    </p>
                                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>
                                            <Scale size={14} /> {caseItem.caseType || 'GENERAL'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>
                                            <Clock size={14} /> Updated 2h ago
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button style={{
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        border: '1px solid rgba(99, 102, 241, 0.2)',
                                        borderRadius: '0.75rem',
                                        padding: '0.5rem 1rem',
                                        color: '#818cf8',
                                        fontWeight: '700',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer'
                                    }}>
                                        View Dossier
                                    </button>
                                    <button style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '0.75rem',
                                        padding: '0.5rem',
                                        color: '#94a3b8',
                                        cursor: 'pointer'
                                    }}>
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* New Case Form Modal */}
            {showNewCaseForm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div style={{
                        ...glassStyle,
                        width: '100%',
                        maxWidth: '550px',
                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        padding: '2.5rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '12px',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Plus size={24} color="#6366f1" />
                                </div>
                                <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white', margin: 0 }}>
                                    File New Case
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowNewCaseForm(false)}
                                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCase}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem', fontWeight: '700' }}>
                                    CASE TITLE
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter formal case title..."
                                    style={{
                                        width: '100%',
                                        background: 'rgba(15, 23, 42, 0.4)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '0.75rem',
                                        padding: '1rem',
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                    value={newCase.title}
                                    onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem', fontWeight: '700' }}>
                                    JURISDICTION / TYPE
                                </label>
                                <select
                                    style={{
                                        width: '100%',
                                        background: 'rgba(15, 23, 42, 0.4)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '0.75rem',
                                        padding: '1rem',
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                    value={newCase.caseType}
                                    onChange={(e) => setNewCase({ ...newCase, caseType: e.target.value })}
                                >
                                    <option value="CIVIL">CIVIL LITIGATION</option>
                                    <option value="CRIMINAL">CRIMINAL PROCEEDINGS</option>
                                    <option value="FAMILY">FAMILY LAW</option>
                                    <option value="PROPERTY">PROPERTY DISPUTE</option>
                                    <option value="CONSTITUTIONAL">CONSTITUTIONAL MATTERS</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem', fontWeight: '700' }}>
                                    CASE SYNOPSIS
                                </label>
                                <textarea
                                    placeholder="Provide detailed background and legal claims..."
                                    style={{
                                        width: '100%',
                                        background: 'rgba(15, 23, 42, 0.4)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '0.75rem',
                                        padding: '1rem',
                                        color: 'white',
                                        outline: 'none',
                                        minHeight: '120px',
                                        resize: 'vertical'
                                    }}
                                    value={newCase.description}
                                    onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="submit" style={{ ...primaryButtonStyle, flex: 1, justifyContent: 'center' }}>
                                    INITIATE FILING
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowNewCaseForm(false)}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '0.75rem',
                                        color: '#94a3b8',
                                        flex: 1,
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    DISCARD
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function QuickStat({ icon, label, value, color }) {
    return (
        <div style={{
            background: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '1.25rem',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
        }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: `${color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: color,
                border: `1px solid ${color}33`
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white', lineHeight: '1' }}>{value}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', marginTop: '0.35rem' }}>{label}</div>
            </div>
        </div>
    );
}
