import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Upload, Shield, CheckCircle2,
    Clock, TrendingUp, AlertTriangle, Loader2, Lock
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { policeAPI } from '../../services/api';

export default function PoliceDashboard() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pendingFirs, setPendingFirs] = useState([]);
    const [activeInvestigations, setActiveInvestigations] = useState([]);
    const [summonsTasks, setSummonsTasks] = useState([]);
    const [selectedFir, setSelectedFir] = useState(null);
    const [findings, setFindings] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, pendingRes, activeRes, summonsRes] = await Promise.all([
                policeAPI.getStats(),
                policeAPI.getPendingFirs(),
                policeAPI.getInvestigations(),
                axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/police/summons/pending`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                })
            ]);
            setStats(statsRes.data);
            setPendingFirs(pendingRes.data);
            setActiveInvestigations(activeRes.data);
            setSummonsTasks(summonsRes.data || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setStats({ totalFirs: 0, sealedFirs: 0, linkedFirs: 0, firsToday: 0 });
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteSummons = async (caseId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/police/summons/${caseId}/complete`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Success: Summons marked as SERVED');
            fetchDashboardData();
        } catch (error) {
            console.error('Error completing summons:', error);
            alert('Failed to complete summons task');
        }
    };

    const handleStartInvestigation = async (firId) => {
        try {
            await policeAPI.startInvestigation(firId);
            fetchDashboardData(); // Refresh lists
        } catch (error) {
            console.error('Error starting investigation:', error);
        }
    };

    const handleRegisterFir = async (firId) => {
        try {
            await policeAPI.updateFirStatus(firId, 'REGISTERED');
            alert('Success: FIR Registered & Court Case Created Successfully!');
            fetchDashboardData();
        } catch (error) {
            console.error('Error registering FIR:', error);
            alert('Failed to register FIR');
        }
    };

    const handleSubmitToCourt = async () => {
        if (!selectedFir || !findings.trim()) return;

        try {
            setIsSubmitting(true);
            await policeAPI.submitInvestigation(selectedFir.id, findings);
            setSelectedFir(null);
            setFindings('');
            fetchDashboardData(); // Refresh lists
        } catch (error) {
            console.error('Error submitting to court:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const statCards = [
        // ... (existing stat cards code)
        {
            label: 'Total FIRs',
            value: stats?.totalFirs || 0,
            icon: FileText,
            color: 'var(--color-primary)',
            change: 'All uploaded FIRs'
        },
        {
            label: 'Sealed Today',
            value: stats?.firsToday || 0,
            icon: Shield,
            color: '#10b981',
            change: 'Digitally stamped'
        },
        {
            label: 'Pending Linkage',
            value: stats?.sealedFirs || 0,
            icon: Clock,
            color: '#f59e0b',
            change: 'Not linked to case'
        },
        {
            label: 'Linked to Cases',
            value: stats?.linkedFirs || 0,
            icon: CheckCircle2,
            color: '#8b5cf6',
            change: 'Successfully linked'
        },
    ];

    return (
        <div>
            {/* Hero Banner (existing) */}
            <div
                onClick={() => navigate('/police/upload')}
                style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
                    border: 'var(--border-glass)',
                    borderRadius: '1.5rem',
                    padding: '2rem',
                    marginBottom: '2rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-glass)'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-glass-strong)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-glass)';
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)'
                    }}>
                        <Shield size={32} color="white" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Lock size={28} /> {t('Upload FIR - Digital Evidence Sealing')}
                        </h2>
                        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                            {t('Upload FIR documents to generate SHA-256 tamper-proof digital fingerprints')}
                        </p>
                    </div>
                </div>
                <div style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}>
                    <Upload size={20} />
                    {t('Upload FIR')}
                </div>
            </div>

            {/* Stats Grid (existing) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {loading ? (
                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                        <Loader2 size={32} style={{ color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
                    </div>
                ) : (
                    statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={index}
                                style={{
                                    background: 'var(--bg-glass-strong)',
                                    backdropFilter: 'var(--glass-blur)',
                                    border: 'var(--border-glass-strong)',
                                    borderRadius: '1.5rem',
                                    padding: '1.5rem',
                                    transition: 'all 0.3s',
                                    boxShadow: 'var(--shadow-glass)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                            {t(stat.label)}
                                        </p>
                                        <h3 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)' }}>
                                            {stat.value}
                                        </h3>
                                    </div>
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '14px',
                                        background: 'var(--bg-glass)',
                                        border: 'var(--border-glass)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Icon size={28} color={stat.color} />
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.875rem', color: stat.color, fontWeight: '600' }}>
                                    {stat.change}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>

            {/* ACTION CENTER: Incoming FIRs */}
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} color="#f59e0b" /> Incoming FIRs ({pendingFirs.length})
            </h3>
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                {pendingFirs.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No pending FIRs for review.</p>
                ) : pendingFirs.map(fir => (
                    <div key={fir.id} style={{ background: 'var(--bg-glass)', padding: '1rem', borderRadius: '1rem', border: 'var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ margin: 0, color: 'var(--text-main)' }}>{fir.title}</h4>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Filed by: {fir.filedByName || 'Unknown'} | Date: {new Date(fir.uploadedAt).toLocaleDateString()}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => handleRegisterFir(fir.id)}
                                style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}
                            >
                                Register FIR
                            </button>
                            <button
                                onClick={() => handleStartInvestigation(fir.id)}
                                style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}
                            >
                                Investigate
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {/* SUMMONS DELIVERY TASKS */}
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} color="#8b5cf6" /> Summons Delivery Tasks ({summonsTasks.length})
            </h3>
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                {summonsTasks.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No pending summons for delivery.</p>
                ) : summonsTasks.map(task => (
                    <div key={task.id} style={{ background: 'var(--bg-glass)', padding: '1rem', borderRadius: '1rem', border: 'var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ margin: 0, color: 'var(--text-main)' }}>{task.caseTitle}</h4>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>To: {task.respondent} | <strong>Type: {task.type}</strong></p>
                        </div>
                        <button
                            onClick={() => handleCompleteSummons(task.id)}
                            style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}
                        >
                            Mark as Handed Over
                        </button>
                    </div>
                ))}
            </div>

            {/* ACTIVE INVESTIGATIONS */}
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={20} color="#3b82f6" /> Active Investigations ({activeInvestigations.length})
            </h3>
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                {activeInvestigations.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No active investigations.</p>
                ) : activeInvestigations.map(fir => (
                    <div key={fir.id} style={{ background: 'var(--bg-glass)', padding: '1rem', borderRadius: '1rem', border: 'var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ margin: 0, color: 'var(--text-main)' }}>{fir.title}</h4>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>FIR #: {fir.firNumber}</p>
                        </div>
                        <button
                            onClick={() => setSelectedFir(fir)}
                            style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}
                        >
                            Submit to Court
                        </button>
                    </div>
                ))}
            </div>

            {/* CASE DIARY MODAL */}
            {selectedFir && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '500px', maxWidth: '90%' }}>
                        <h3 style={{ marginTop: 0 }}>Final Case Diary</h3>
                        <p style={{ color: '#666' }}>Submit investigation findings for <strong>{selectedFir.firNumber}</strong> to the Court.</p>
                        <textarea
                            value={findings}
                            onChange={(e) => setFindings(e.target.value)}
                            placeholder="Enter detailed investigation findings..."
                            style={{ width: '100%', height: '150px', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd', marginBottom: '1rem' }}
                        />
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setSelectedFir(null)} style={{ background: 'none', border: '1px solid #ddd', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
                            <button
                                onClick={handleSubmitToCourt}
                                disabled={isSubmitting || !findings.trim()}
                                style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', opacity: (isSubmitting || !findings.trim()) ? 0.7 : 1 }}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit to Judge'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions (existing) */}
            <div style={{
                background: 'var(--bg-glass-strong)',
                backdropFilter: 'var(--glass-blur)',
                border: 'var(--border-glass-strong)',
                borderRadius: '1.5rem',
                padding: '1.5rem',
                marginBottom: '2rem',
                boxShadow: 'var(--shadow-glass)'
            }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1rem' }}>
                    {t('Quick Actions')}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {[
                        { label: 'Upload New FIR', icon: Upload, path: '/police/upload', color: '#10b981' },
                        { label: 'View My FIRs', icon: FileText, path: '/police/firs', color: '#8b5cf6' },
                        { label: 'Verify Document', icon: Shield, path: '/police/verify', color: '#f59e0b' },
                    ].map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={index}
                                onClick={() => navigate(action.path)}
                                style={{
                                    padding: '1rem',
                                    background: 'var(--bg-glass)',
                                    border: 'var(--border-glass)',
                                    borderRadius: '0.75rem',
                                    color: 'var(--text-secondary)',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'var(--bg-glass-hover)';
                                    e.currentTarget.style.borderColor = action.color;
                                    e.currentTarget.style.color = action.color;
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'var(--bg-glass)';
                                    e.currentTarget.style.borderColor = 'var(--border-glass)';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }}
                            >
                                <Icon size={20} />
                                {t(action.label)}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Info Banner (existing) */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                border: 'var(--border-glass)',
                borderRadius: '1rem',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
            }}>
                <AlertTriangle size={24} color="#f59e0b" />
                <div>
                    <p style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '0.25rem' }}>
                        {t('Digital Evidence Integrity')}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {t('All uploaded FIRs are cryptographically sealed with SHA-256 hashing. Any modification to the original document will be detectable.')}
                    </p>
                </div>
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
