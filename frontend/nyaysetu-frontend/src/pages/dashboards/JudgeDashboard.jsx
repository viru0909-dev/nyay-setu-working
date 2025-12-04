import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { caseAPI } from '../../services/api';

export default function JudgeDashboard() {
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
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Judge Dashboard</h1>
                        <p style={{ color: '#718096', fontSize: '0.875rem' }}>Welcome, {user?.name || 'Judge'}</p>
                    </div>
                    <button onClick={handleLogout} className="btn btn-secondary">
                        Logout
                    </button>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 0' }}>
                {/* Quick Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    {[
                        { label: 'Assigned Cases', value: cases.length || 0 },
                        { label: 'Hearings Today', value: 3 },
                        { label: 'Pending Decisions', value: 5 }
                    ].map((stat, idx) => (
                        <div key={idx} className="card" style={{ textAlign: 'center' }}>
                            <p style={{ color: '#718096', fontSize: '0.875rem' }}>{stat.label}</p>
                            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>
                                {stat.value}
                            </h2>
                        </div>
                    ))}
                </div>

                {/* Assigned Cases */}
                <div className="card">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                        Assigned Cases
                    </h3>
                    {loading ? (
                        <div className="loading"><div className="spinner"></div></div>
                    ) : cases.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {cases.slice(0, 5).map((caseItem, idx) => (
                                <div key={idx} style={{
                                    padding: '1rem',
                                    background: '#f7fafc',
                                    borderRadius: '0.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <h4 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                            {caseItem.title || `Case #${caseItem.id}`}
                                        </h4>
                                        <p style={{ fontSize: '0.875rem', color: '#718096' }}>
                                            {caseItem.description || 'No description'}
                                        </p>
                                    </div>
                                    <span className="badge badge-info">
                                        {caseItem.status || 'PENDING'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', color: '#718096', padding: '2rem' }}>
                            No cases assigned yet
                        </p>
                    )}
                </div>

                {/* Today's Hearing Schedule */}
                <div className="card" style={{ marginTop: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                        Today's Hearing Schedule
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { time: '10:00 AM', case: 'Civil Case #123 - Property Dispute', status: 'Upcoming' },
                            { time: '2:00 PM', case: 'Criminal Case #456 - Theft', status: 'Upcoming' },
                            { time: '4:30 PM', case: 'Family Case #789 - Divorce Petition', status: 'Upcoming' }
                        ].map((hearing, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '1rem',
                                background: '#f7fafc',
                                borderRadius: '0.5rem'
                            }}>
                                <div>
                                    <p style={{ fontWeight: '600' }}>{hearing.time}</p>
                                    <p style={{ fontSize: '0.875rem', color: '#718096' }}>{hearing.case}</p>
                                </div>
                                <button className="btn btn-primary">Join Hearing</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
