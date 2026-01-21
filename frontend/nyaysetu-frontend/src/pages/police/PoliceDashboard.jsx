import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Upload, Shield, CheckCircle2,
    Clock, TrendingUp, AlertTriangle, Loader2
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { policeAPI } from '../../services/api';

export default function PoliceDashboard() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await policeAPI.getStats();
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
                // Set default stats on error
                setStats({ totalFirs: 0, sealedFirs: 0, linkedFirs: 0, firsToday: 0 });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
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
            {/* Hero Banner */}
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
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                            🔒 {t('Upload FIR - Digital Evidence Sealing')}
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

            {/* Stats Grid */}
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

            {/* Quick Actions */}
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

            {/* Info Banner */}
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
