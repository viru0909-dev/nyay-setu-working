import { useState, useEffect } from 'react';
import {
    Archive,
    Search,
    Upload,
    File,
    ShieldCheck,
    Lock,
    MoreHorizontal,
    Filter,
    ArrowUpRight,
    Download,
    Eye,
    CheckCircle2,
    AlertCircle,
    Database,
    Loader2
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { documentAPI } from '../../services/api';

export default function EvidenceVaultPage() {
    const location = useLocation();
    const filterCaseId = location.state?.caseId || null;
    const [searchTerm, setSearchTerm] = useState('');
    const [evidenceItems, setEvidenceItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvidence();
    }, [filterCaseId]);

    const fetchEvidence = async () => {
        setLoading(true);
        try {
            const response = filterCaseId
                ? await documentAPI.getByCase(filterCaseId)
                : await documentAPI.list();
            setEvidenceItems(response.data || []);
        } catch (error) {
            console.error('Error fetching evidence:', error);
        } finally {
            setLoading(false);
        }
    };

    const glassStyle = {
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'var(--glass-blur)',
        border: 'var(--border-glass-strong)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-glass-strong)'
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        background: 'var(--color-accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'var(--shadow-glass)'
                    }}>
                        <Archive size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                            Evidence Vault
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Secure, blockchain-verified repository for sensitive case material
                        </p>
                    </div>
                </div>
                <button style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'var(--color-accent)',
                    color: 'var(--text-main)', border: 'none', borderRadius: '0.75rem',
                    padding: '0.8rem 1.5rem', fontWeight: '700', cursor: 'pointer',
                    boxShadow: 'var(--shadow-glass)'
                }}>
                    <Upload size={18} /> Upload New Evidence
                </button>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Total Files', value: '128', icon: File, color: 'var(--color-accent-light)' },
                    { label: 'Blockchain Verified', value: '112', icon: ShieldCheck, color: 'var(--color-success)' },
                    { label: 'Encrypted Storage', value: '100%', icon: Lock, color: 'var(--color-warning)' },
                    { label: 'Linked Cases', value: '24', icon: Database, color: 'var(--color-error)' },
                ].map((stat, i) => (
                    <div key={i} style={{ ...glassStyle, padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '10px',
                                background: `${stat.color}15`, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', color: stat.color
                            }}>
                                <stat.icon size={20} />
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)' }}>STATISTICS</span>
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{stat.value}</h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div style={glassStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ position: 'relative', width: '400px' }}>
                        <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search by file name or case..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'var(--bg-glass)',
                                border: 'var(--border-glass)',
                                borderRadius: '0.75rem',
                                padding: '0.7rem 1rem 0.7rem 3rem',
                                color: 'var(--text-main)',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button style={{
                            background: 'var(--bg-glass)',
                            border: 'var(--border-glass)',
                            borderRadius: '0.75rem',
                            padding: '0.7rem 1.25rem',
                            color: 'var(--text-main)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}>
                            <Filter size={18} /> Filters
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
                        <thead>
                            <tr style={{ borderBottom: 'var(--border-glass-subtle)' }}>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '800' }}>ITEM NAME</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '800' }}>CATEGORY</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '800' }}>DATE ADDED</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '800' }}>VERIFICATION</th>
                                <th style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '800' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {evidenceItems.map(item => (
                                <tr key={item.id} style={{ borderBottom: 'var(--border-glass-subtle)', transition: 'background 0.2s' }}
                                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg-glass-subtle)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '8px',
                                                background: 'var(--bg-glass-subtle)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'var(--color-accent)'
                                            }}>
                                                <File size={18} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.fileName}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{item.contentType}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.category || 'General'}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(item.uploadDate).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '0.35rem',
                                                color: item.status === 'Verified' ? 'var(--color-success)' : 'var(--color-warning)',
                                                fontSize: '0.75rem', fontWeight: '700'
                                            }}>
                                                {item.status === 'Verified' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                                {item.status}
                                            </div>
                                            {item.blockchain && (
                                                <div style={{
                                                    fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px',
                                                    background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-accent)', fontWeight: '800'
                                                }}>BC-SECURED</div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                                            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} title="View">
                                                <Eye size={18} />
                                            </button>
                                            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} title="Download">
                                                <Download size={18} />
                                            </button>
                                            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} title="Menu">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
