import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Shield, Clock, TrendingUp, AlertTriangle,
    Search, Filter, ChevronRight, Loader2
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { policeAPI } from '../../services/api';

export default function PoliceInvestigationsPage() {
    const navigate = useNavigate();
    const { t } = useLanguage();

    // State
    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'pending'
    const [loading, setLoading] = useState(true);
    const [activeInvestigations, setActiveInvestigations] = useState([]);
    const [pendingFirs, setPendingFirs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [pendingRes, activeRes] = await Promise.all([
                policeAPI.getPendingFirs(),
                policeAPI.getInvestigations()
            ]);
            setPendingFirs(pendingRes.data);
            setActiveInvestigations(activeRes.data);
        } catch (error) {
            console.error('Error fetching investigations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id, e) => {
        e.stopPropagation();
        try {
            await policeAPI.startInvestigation(id);
            fetchData(); // Refresh
        } catch (error) {
            console.error('Error starting investigation:', error);
        }
    };

    const filteredList = (activeTab === 'active' ? activeInvestigations : pendingFirs).filter(item =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.firNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    {t('Investigation Unit')}
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    {t('Manage active cases, review incoming FIRs, and prepare court submissions')}
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-glass)' }}>
                <button
                    onClick={() => setActiveTab('active')}
                    style={{
                        padding: '1rem 2rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'active' ? '3px solid #3b82f6' : '3px solid transparent',
                        color: activeTab === 'active' ? '#3b82f6' : 'var(--text-secondary)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <TrendingUp size={20} />
                    {t('Active Investigations')} ({activeInvestigations.length})
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    style={{
                        padding: '1rem 2rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'pending' ? '3px solid #f59e0b' : '3px solid transparent',
                        color: activeTab === 'pending' ? '#f59e0b' : 'var(--text-secondary)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <AlertTriangle size={20} />
                    {t('Pending Review')} ({pendingFirs.length})
                </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '2rem' }}>
                <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                    type="text"
                    placeholder="Search by FIR Number or Title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '1rem 1rem 1rem 3rem',
                        borderRadius: '0.75rem',
                        border: 'var(--border-glass)',
                        background: 'var(--bg-glass)',
                        color: 'var(--text-main)',
                        fontSize: '1rem'
                    }}
                />
            </div>

            {/* List */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
                </div>
            ) : filteredList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    <Shield size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>No cases found in this category.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {filteredList.map(fir => (
                        <div
                            key={fir.id}
                            onClick={() => activeTab === 'active' && navigate(`/police/investigation/${fir.id}`)}
                            style={{
                                background: 'var(--bg-glass)',
                                padding: '1.5rem',
                                borderRadius: '1rem',
                                border: 'var(--border-glass)',
                                display: 'grid',
                                gridTemplateColumns: '1fr auto',
                                gap: '1rem',
                                alignItems: 'center',
                                cursor: activeTab === 'active' ? 'pointer' : 'default',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                if (activeTab === 'active') {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-glass)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (activeTab === 'active') {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        background: activeTab === 'active' ? '#eff6ff' : '#fffbeb',
                                        color: activeTab === 'active' ? '#3b82f6' : '#f59e0b'
                                    }}>
                                        {fir.firNumber}
                                    </span>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                        {new Date(fir.uploadedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.25rem' }}>{fir.title}</h3>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {fir.description}
                                </p>
                            </div>

                            <div>
                                {activeTab === 'active' ? (
                                    <ChevronRight size={24} color="var(--text-secondary)" />
                                ) : (
                                    <button
                                        onClick={(e) => handleAccept(fir.id, e)}
                                        style={{
                                            background: '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '0.5rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <TrendingUp size={18} />
                                        Accept Case
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Add CSS keyframes for spinner
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
