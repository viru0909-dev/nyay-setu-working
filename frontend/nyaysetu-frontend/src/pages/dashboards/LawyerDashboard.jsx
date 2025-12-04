import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { caseAPI } from '../../services/api';

export default function LawyerDashboard() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [showNewCaseForm, setShowNewCaseForm] = useState(false);
    const [newCase, setNewCase] = useState({ title: '', description: '', caseType: 'CIVIL' });
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

    const handleCreateCase = async (e) => {
        e.preventDefault();
        try {
            await caseAPI.create(newCase);
            setShowNewCaseForm(false);
            setNewCase({ title: '', description: '', caseType: 'CIVIL' });
            loadCases();
        } catch (error) {
            console.error('Failed to create case:', error);
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
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Lawyer Dashboard</h1>
                        <p style={{ color: '#718096', fontSize: '0.875rem' }}>Welcome, {user?.name || 'Lawyer'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => setShowNewCaseForm(true)} className="btn btn-primary">
                            File New Case
                        </button>
                        <button onClick={handleLogout} className="btn btn-secondary">
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 0' }}>
                {/* New Case Form Modal */}
                {showNewCaseForm && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '1rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                                File New Case
                            </h3>
                            <form onSubmit={handleCreateCase}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                        Case Title
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={newCase.title}
                                        onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                        Case Type
                                    </label>
                                    <select
                                        className="input"
                                        value={newCase.caseType}
                                        onChange={(e) => setNewCase({ ...newCase, caseType: e.target.value })}
                                    >
                                        <option value="CIVIL">Civil</option>
                                        <option value="CRIMINAL">Criminal</option>
                                        <option value="FAMILY">Family</option>
                                        <option value="PROPERTY">Property</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                        Description
                                    </label>
                                    <textarea
                                        className="input"
                                        value={newCase.description}
                                        onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                                        rows="4"
                                        required
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                        Submit Case
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewCaseForm(false)}
                                        className="btn btn-secondary"
                                        style={{ flex: 1 }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* My Cases */}
                <div className="card">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                        My Client Cases
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
                                        <span className="badge badge-info">
                                            {caseItem.status || 'PENDING'}
                                        </span>
                                    </div>
                                    <p style={{ color: '#718096', marginBottom: '1rem' }}>
                                        {caseItem.description || 'No description'}
                                    </p  >
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                                            View Details
                                        </button>
                                        <button className="btn btn-secondary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                                            Upload Document
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', color: '#718096', padding: '2rem' }}>
                            No cases yet. Click "File New Case" to get started.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
