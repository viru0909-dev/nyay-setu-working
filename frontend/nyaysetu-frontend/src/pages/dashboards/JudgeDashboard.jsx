import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Gavel,
    Clock,
    Video,
    Scale,
    Calendar,
    FileText,
    ChevronRight,
    Loader2,
    AlertCircle,
    X
} from 'lucide-react';
import { hearingAPI, judgeAPI } from '../../services/api';

const JudgeDashboard = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedCase, setSelectedCase] = useState(null);
    const [hearingData, setHearingData] = useState({
        scheduledDate: '',
        scheduledTime: '',
        durationMinutes: 60
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        setLoading(true);
        try {
            const response = await judgeAPI.getCases();
            setCases(response.data || []);
        } catch (error) {
            console.error('Error fetching cases:', error);
        } finally {
            setLoading(false);
        }
    };

    const openScheduleModal = (caseItem) => {
        setSelectedCase(caseItem);
        setShowModal(true);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setHearingData({
            scheduledDate: tomorrow.toISOString().split('T')[0],
            scheduledTime: '10:00',
            durationMinutes: 60
        });
    };

    const scheduleHearing = async () => {
        try {
            const dateTime = new Date(`${hearingData.scheduledDate}T${hearingData.scheduledTime}`);

            await hearingAPI.schedule({
                caseId: selectedCase.id,
                scheduledDate: dateTime.toISOString(),
                durationMinutes: hearingData.durationMinutes
            });

            alert('✅ Hearing scheduled successfully!');
            setShowModal(false);
            fetchCases();
        } catch (error) {
            console.error('Error scheduling hearing:', error);
            alert('Failed to schedule hearing');
        }
    };

    const glassStyle = {
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
    };

    const statCardStyle = {
        ...glassStyle,
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        padding: '1.25rem',
        transition: 'transform 0.2s',
        cursor: 'default'
    };

    const primaryButtonStyle = {
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '0.75rem',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
        transition: 'all 0.2s'
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Loader2 size={48} className="spin" style={{ color: '#6366f1' }} />
                <style>{`
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .spin { animation: spin 1s linear infinite; }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)'
                    }}>
                        <Gavel size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'white', margin: 0 }}>
                            Judge Dashboard
                        </h1>
                        <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0 }}>
                            Manage your judicial caseload and schedule
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                <div style={statCardStyle}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Scale size={24} color="#818cf8" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Total Assigned Cases</p>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white', margin: 0 }}>{cases.length}</h2>
                    </div>
                </div>

                <div style={statCardStyle}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Clock size={24} color="#fbbf24" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Pending Actions</p>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white', margin: 0 }}>{cases.filter(c => c.status === 'PENDING').length}</h2>
                    </div>
                </div>

                <div style={statCardStyle}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Video size={24} color="#34d399" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Hearings Today</p>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white', margin: 0 }}>0</h2>
                    </div>
                </div>
            </div>

            {/* Cases Section */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', margin: 0 }}>
                        📋 Assigned Cases
                    </h2>
                    <button
                        onClick={() => navigate('/judge/pending')}
                        style={{ background: 'transparent', border: 'none', color: '#818cf8', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                        View All Pending <ChevronRight size={18} />
                    </button>
                </div>

                {cases.length === 0 ? (
                    <div style={{ ...glassStyle, textAlign: 'center', padding: '4rem' }}>
                        <FileText size={64} color="#475569" style={{ margin: '0 auto 1.5rem' }} />
                        <h3 style={{ color: 'white', margin: '0 0 0.5rem 0' }}>No cases assigned</h3>
                        <p style={{ color: '#94a3b8', margin: 0 }}>You don't have any cases assigned to your bench yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
                        {cases.map(caseItem => (
                            <div key={caseItem.id} style={{ ...glassStyle, padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.25rem' }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'white', margin: 0 }}>{caseItem.title}</h3>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        background: caseItem.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                                        border: `1px solid ${caseItem.status === 'PENDING' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(37, 99, 235, 0.3)'}`,
                                        borderRadius: '9999px',
                                        fontSize: '0.7rem',
                                        fontWeight: '700',
                                        color: caseItem.status === 'PENDING' ? '#fbbf24' : '#60a5fa',
                                        textTransform: 'uppercase'
                                    }}>
                                        {caseItem.status}
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                        <span style={{ color: '#64748b' }}>Type:</span>
                                        <span style={{ color: '#e2e8f0', fontWeight: '600' }}>{caseItem.caseType}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                        <span style={{ color: '#64748b' }}>Filed:</span>
                                        <span style={{ color: '#e2e8f0', fontWeight: '600' }}>{new Date(caseItem.filedDate).toLocaleDateString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                        <span style={{ color: '#64748b' }}>Petitioner:</span>
                                        <span style={{ color: '#e2e8f0', fontWeight: '600' }}>{caseItem.petitioner}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                        <span style={{ color: '#64748b' }}>Respondent:</span>
                                        <span style={{ color: '#e2e8f0', fontWeight: '600' }}>{caseItem.respondent}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => openScheduleModal(caseItem)}
                                    style={primaryButtonStyle}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)';
                                    }}
                                >
                                    <Calendar size={18} /> Schedule Hearing
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Overlay */}
            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setShowModal(false)}>
                    <div style={{
                        ...glassStyle, width: '100%', maxWidth: '480px', padding: '2rem',
                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.3)'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', margin: 0 }}>
                                📅 Schedule Hearing
                            </h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Case Title</label>
                                <input
                                    type="text"
                                    value={selectedCase?.title || ''}
                                    disabled
                                    style={{
                                        width: '100%', padding: '0.875rem', borderRadius: '0.75rem',
                                        background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(99, 102, 241, 0.1)',
                                        color: '#64748b', cursor: 'not-allowed'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Date</label>
                                    <input
                                        type="date"
                                        value={hearingData.scheduledDate}
                                        onChange={(e) => setHearingData({ ...hearingData, scheduledDate: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        style={{
                                            width: '100%', padding: '0.875rem', borderRadius: '0.75rem',
                                            paddingRight: '0.5rem',
                                            background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(99, 102, 241, 0.2)',
                                            color: 'white'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Time</label>
                                    <input
                                        type="time"
                                        value={hearingData.scheduledTime}
                                        onChange={(e) => setHearingData({ ...hearingData, scheduledTime: e.target.value })}
                                        style={{
                                            width: '100%', padding: '0.875rem', borderRadius: '0.75rem',
                                            background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(99, 102, 241, 0.2)',
                                            color: 'white'
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Duration</label>
                                <select
                                    value={hearingData.durationMinutes}
                                    onChange={(e) => setHearingData({ ...hearingData, durationMinutes: parseInt(e.target.value) })}
                                    style={{
                                        width: '100%', padding: '0.875rem', borderRadius: '0.75rem',
                                        background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(99, 102, 241, 0.2)',
                                        color: 'white'
                                    }}
                                >
                                    <option value={30}>30 minutes</option>
                                    <option value={60}>1 hour</option>
                                    <option value={90}>1.5 hours</option>
                                    <option value={120}>2 hours</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        flex: 1, padding: '0.875rem', borderRadius: '0.75rem',
                                        background: 'rgba(71, 85, 105, 0.2)', border: '1px solid rgba(71, 85, 105, 0.3)',
                                        color: '#94a3b8', fontWeight: '600', cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={scheduleHearing}
                                    style={{
                                        flex: 2, padding: '0.875rem', borderRadius: '0.75rem',
                                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                        border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                                    }}
                                >
                                    Schedule
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JudgeDashboard;
