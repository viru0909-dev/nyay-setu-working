import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { caseAPI } from '../../services/api';

export default function ClientDashboard() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCases();
    }, []);

    const loadCases = async () => {
        try {
            const response = await caseAPI.list();
            setCases(response.data || []);
        } catch (error) {
            console.error('Failed to load cases:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
            {/* Header */}
            <div style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1rem 0' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Client Dashboard</h1>
                        <p style={{ color: '#718096', fontSize: '0.875rem' }}>Welcome, {user?.name || 'Client'}</p>
                    </div>
                    <button onClick={handleLogout} className="btn btn-secondary">
                        Logout
                    </button>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 0' }}>
                {/* Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    {[
                        { label: 'My Cases', value: cases.length || 0 },
                        { label: 'Upcoming Hearings', value: 2 },
                        { label: 'Documents', value: 5 }
                    ].map((stat, idx) => (
                        <div key={idx} className="card" style={{ textAlign: 'center' }}>
                            <p style={{ color: '#718096', fontSize: '0.875rem' }}>{stat.label}</p>
                            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>
                                {stat.value}
                            </h2>
                        </div>
                    ))}
                </div>

                {/* My Cases */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                        My Cases
                    </h3>
                    {loading ? (
                        <div className="loading"><div className="spinner"></div></div>
                    ) : cases.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {cases.map((caseItem, idx) => (
                                <div key={idx} style={{
                                    padding: '1.5rem',
                                    background: '#f7fafc',
                                    borderRadius: '0.5rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <h4 style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                                            {caseItem.title || `Case #${caseItem.id}`}
                                        </h4>
                                        <span className={`badge ${caseItem.status === 'CLOSED' ? 'badge-success' :
                                                caseItem.status === 'PENDING' ? 'badge-warning' : 'badge-info'
                                            }`}>
                                            {caseItem.status || 'PENDING'}
                                        </span>
                                    </div>
                                    <p style={{ color: '#718096', marginBottom: '1rem' }}>
                                        {caseItem.description || 'No description'}
                                    </p>
                                    <button className="btn btn-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', color: '#718096', padding: '2rem' }}>
                            No cases yet. Contact a lawyer to file your case.
                        </p>
                    )}
                </div>

                {/* Upcoming Hearings */}
                <div className="card">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                        Upcoming Hearings
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { date: 'Dec 5, 2024', time: '10:00 AM', case: 'Civil Case #123', status: 'Virtual' },
                            { date: 'Dec 8, 2024', time: '2:30 PM', case: 'Property Dispute #456', status: 'Virtual' }
                        ].map((hearing, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem',
                                background: '#f7fafc',
                                borderRadius: '0.5rem'
                            }}>
                                <div>
                                    <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{hearing.case}</p>
                                    <p style={{ fontSize: '0.875rem', color: '#718096' }}>
                                        {hearing.date} at {hearing.time}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <span className="badge badge-info">{hearing.status}</span>
                                    <button className="btn btn-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                                        Join
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
