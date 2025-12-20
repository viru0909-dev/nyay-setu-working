import { useState } from 'react';
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
    Database
} from 'lucide-react';

export default function EvidenceVaultPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const evidenceItems = [
        { id: 1, name: 'Property_Sale_Deed_2023.pdf', type: 'PDF', case: 'Kumar vs State', status: 'Verified', date: '2023-11-15', blockchain: true },
        { id: 2, name: 'CCTV_Footage_Front_Gate.mp4', type: 'VIDEO', case: 'Sharma Case', status: 'Pending', date: '2023-11-20', blockchain: true },
        { id: 3, name: 'Bank_Statement_Q3.xlsx', type: 'XLSX', case: 'Corporate Dispute', status: 'Verified', date: '2023-12-01', blockchain: false },
        { id: 4, name: 'Witness_Statement_Signed.pdf', type: 'PDF', case: 'Family Dispute', status: 'Verified', date: '2023-12-05', blockchain: true },
    ];

    const glassStyle = {
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
                    }}>
                        <Archive size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'white', margin: 0 }}>
                            Evidence Vault
                        </h1>
                        <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0 }}>
                            Secure, blockchain-verified repository for sensitive case material
                        </p>
                    </div>
                </div>
                <button style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    color: 'white', border: 'none', borderRadius: '0.75rem',
                    padding: '0.8rem 1.5rem', fontWeight: '700', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
                }}>
                    <Upload size={18} /> Upload New Evidence
                </button>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Total Files', value: '128', icon: File, color: '#818cf8' },
                    { label: 'Blockchain Verified', value: '112', icon: ShieldCheck, color: '#10b981' },
                    { label: 'Encrypted Storage', value: '100%', icon: Lock, color: '#f59e0b' },
                    { label: 'Linked Cases', value: '24', icon: Database, color: '#ec4899' },
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
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b' }}>STATISTICS</span>
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white', margin: 0 }}>{stat.value}</h2>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div style={glassStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ position: 'relative', width: '400px' }}>
                        <Search size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search by file name or case..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'rgba(15, 23, 42, 0.4)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '0.75rem',
                                padding: '0.7rem 1rem 0.7rem 3rem',
                                color: 'white',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '0.75rem',
                            padding: '0.7rem 1.25rem',
                            color: 'white',
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
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '800' }}>ITEM NAME</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '800' }}>CASE ASSOCIATION</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '800' }}>DATE ADDED</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '800' }}>VERIFICATION</th>
                                <th style={{ textAlign: 'center', padding: '1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '800' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {evidenceItems.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.02)', transition: 'background 0.2s' }}
                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '8px',
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#818cf8'
                                            }}>
                                                <File size={18} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.type} File</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>{item.case}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>{new Date(item.date).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '0.35rem',
                                                color: item.status === 'Verified' ? '#10b981' : '#f59e0b',
                                                fontSize: '0.75rem', fontWeight: '700'
                                            }}>
                                                {item.status === 'Verified' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                                {item.status}
                                            </div>
                                            {item.blockchain && (
                                                <div style={{
                                                    fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px',
                                                    background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', fontWeight: '800'
                                                }}>BC-SECURED</div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                                            <button style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }} title="View">
                                                <Eye size={18} />
                                            </button>
                                            <button style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }} title="Download">
                                                <Download size={18} />
                                            </button>
                                            <button style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }} title="Menu">
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
