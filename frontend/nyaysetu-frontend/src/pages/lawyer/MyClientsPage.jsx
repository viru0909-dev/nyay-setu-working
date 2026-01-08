import { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Calendar,
    ChevronRight,
    Plus,
    Loader2,
    Activity
} from 'lucide-react';
import { lawyerAPI } from '../../services/api';

export default function MyClientsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState([]);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const response = await lawyerAPI.getClients();
            // Enhance with some UI defaults
            const enhancedClients = (response.data || []).map(c => ({
                ...c,
                status: 'Active',
                location: 'Not Specified',
                cases: 0 // Will handle case counts if needed later
            }));
            setClients(enhancedClients);
        } catch (error) {
            console.error('Failed to load clients:', error);
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

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Loader2 size={48} className="spin" style={{ color: 'var(--color-accent)' }} />
            </div>
        );
    }

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
                        <Users size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                            Client Directory
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Manage your professional relationships and client profiles
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
                    <Plus size={18} /> Add New Client
                </button>
            </div>

            {/* Controls */}
            <div style={{
                ...glassStyle,
                padding: '1rem 1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'center'
            }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search clients by name, email, or location..."
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
                <button style={{
                    background: 'var(--bg-glass)',
                    border: 'var(--border-glass)',
                    borderRadius: '0.75rem',
                    padding: '0.8rem 1.25rem',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                }}>
                    <Filter size={18} /> Filters
                </button>
            </div>

            {/* Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '1.5rem'
            }}>
                {clients.map(client => (
                    <div key={client.id} style={{
                        ...glassStyle,
                        transition: 'transform 0.2s',
                        cursor: 'default'
                    }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{
                                    width: '50px', height: '50px', borderRadius: '50%',
                                    background: 'var(--bg-glass-subtle)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-accent)',
                                    border: 'var(--border-glass-subtle)'
                                }}>
                                    {client.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{client.name}</h3>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: client.status === 'Active' ? 'var(--color-success)' : 'var(--text-secondary)',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}>
                                        <Activity size={10} /> {client.status}
                                    </span>
                                </div>
                            </div>
                            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                <Mail size={16} /> {client.email}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                <Phone size={16} /> {client.phone}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                <MapPin size={16} /> {client.location}
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            paddingTop: '1rem',
                            borderTop: 'var(--border-glass-subtle)',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Briefcase size={16} color="var(--color-accent)" />
                                <span style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '0.85rem' }}>{client.cases} Active Cases</span>
                            </div>
                            <button style={{
                                background: 'var(--bg-glass)',
                                color: 'var(--color-accent)',
                                border: 'var(--border-glass)',
                                borderRadius: '0.5rem',
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }}>
                                View Profile <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
