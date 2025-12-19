import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hearingAPI, caseAPI } from '../../services/api';
import '../../styles/JudgeDashboard.css';

const JudgeDashboard = () => {
    const [cases, setCases] = useState([]);
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
        try {
            const response = await caseAPI.list();
            setCases(response.data || []);
        } catch (error) {
            console.error('Error fetching cases:', error);
        }
    };

    const openScheduleModal = (caseItem) => {
        setSelectedCase(caseItem);
        setShowModal(true);
        // Set default date to tomorrow
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

            alert('Hearing scheduled successfully!');
            setShowModal(false);
            fetchCases();
        } catch (error) {
            console.error('Error scheduling hearing:', error);
            alert('Failed to schedule hearing: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="judge-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>👨‍⚖️ Judge Dashboard</h1>
                    <p>Manage cases and schedule hearings</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">⚖️</div>
                    <div>
                        <div className="stat-value">{cases.length}</div>
                        <div className="stat-label">Total Cases</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⏳</div>
                    <div>
                        <div className="stat-value">{cases.filter(c => c.status === 'PENDING').length}</div>
                        <div className="stat-label">Pending Cases</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📹</div>
                    <div>
                        <div className="stat-value">0</div>
                        <div className="stat-label">Today's Hearings</div>
                    </div>
                </div>
            </div>

            <div className="cases-section">
                <h2>📋 All Cases</h2>
                <div className="cases-list">
                    {cases.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📂</div>
                            <p>No cases found</p>
                        </div>
                    ) : (
                        cases.map(caseItem => (
                            <div key={caseItem.id} className="case-card">
                                <div className="case-header">
                                    <h3>{caseItem.title}</h3>
                                    <span className={`status-badge ${caseItem.status?.toLowerCase()}`}>
                                        {caseItem.status}
                                    </span>
                                </div>
                                <div className="case-details">
                                    <div className="detail-row">
                                        <span className="label">Type:</span>
                                        <span>{caseItem.caseType}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Filed:</span>
                                        <span>{new Date(caseItem.filedDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Petitioner:</span>
                                        <span>{caseItem.petitioner}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Respondent:</span>
                                        <span>{caseItem.respondent}</span>
                                    </div>
                                </div>
                                <button
                                    className="schedule-btn"
                                    onClick={() => openScheduleModal(caseItem)}
                                >
                                    📅 Schedule Hearing
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Schedule Virtual Hearing</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Case:</label>
                                <input
                                    type="text"
                                    value={selectedCase?.title || ''}
                                    disabled
                                    className="disabled-input"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date:</label>
                                    <input
                                        type="date"
                                        value={hearingData.scheduledDate}
                                        onChange={(e) => setHearingData({ ...hearingData, scheduledDate: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Time:</label>
                                    <input
                                        type="time"
                                        value={hearingData.scheduledTime}
                                        onChange={(e) => setHearingData({ ...hearingData, scheduledTime: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Duration (minutes):</label>
                                <select
                                    value={hearingData.durationMinutes}
                                    onChange={(e) => setHearingData({ ...hearingData, durationMinutes: parseInt(e.target.value) })}
                                >
                                    <option value={30}>30 minutes</option>
                                    <option value={60}>1 hour</option>
                                    <option value={90}>1.5 hours</option>
                                    <option value={120}>2 hours</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="confirm-btn" onClick={scheduleHearing}>📅 Schedule Hearing</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JudgeDashboard;
