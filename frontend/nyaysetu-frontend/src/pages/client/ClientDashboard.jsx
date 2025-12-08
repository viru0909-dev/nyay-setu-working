import { FolderOpen, Video, FileText, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

export default function ClientDashboard() {
    // Mock data - will be replaced with API calls
    const stats = [
        { label: 'My Cases', value: '3', icon: FolderOpen, color: '#3b82f6', change: '+1 this month' },
        { label: 'Upcoming Hearings', value: '2', icon: Video, color: '#8b5cf6', change: 'Next: Dec 15' },
        { label: 'Documents', value: '15', icon: FileText, color: '#10b981', change: '5 pending review' }
    ];

    const recentCases = [
        { id: 'CS-2024-001', title: 'Property Dispute Case', status: 'Pending', date: 'Dec 1, 2024' },
        { id: 'CS-2024-002', title: 'Contract Breach', status: 'In Progress', date: 'Nov 28, 2024' },
        { id: 'CS-2024-003', title: 'Family Matter', status: 'Under Review', date: 'Nov 20, 2024' }
    ];

    const upcomingHearings = [
        { caseId: 'CS-2024-001', title: 'Property Dispute Hearing', date: 'Dec 15, 2024', time: '10:00 AM', type: 'Virtual' },
        { caseId: 'CS-2024-002', title: 'Contract Case Review', date: 'Dec 20, 2024', time: '2:30 PM', type: 'Virtual' }
    ];

    return (
        <div>
            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            style={{
                                background: 'rgba(30, 41, 59, 0.8)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                borderRadius: '1.5rem',
                                padding: '1.5rem',
                                transition: 'all 0.3s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.3)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                                        {stat.label}
                                    </p>
                                    <h3 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white' }}>
                                        {stat.value}
                                    </h3>
                                </div>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '14px',
                                    background: `${stat.color}20`,
                                    border: `2px solid ${stat.color}40`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon size={28} color={stat.color} />
                                </div>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#8b5cf6', fontWeight: '500' }}>
                                {stat.change}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div style={{
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '1.5rem',
                padding: '1.5rem',
                marginBottom: '2rem'
            }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '1rem' }}>
                    Quick Actions
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {[
                        { label: 'File New Case', icon: FileText, path: '/client/file-case' },
                        { label: 'Upload Documents', icon: FileText, path: '/client/documents' },
                        { label: 'AI Document Review', icon: TrendingUp, path: '/client/ai-review' },
                        { label: 'Join Hearing', icon: Video, path: '/client/hearings' }
                    ].map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={index}
                                onClick={() => window.location.href = action.path}
                                style={{
                                    padding: '1rem',
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    border: '1px solid rgba(139, 92, 246, 0.2)',
                                    borderRadius: '0.75rem',
                                    color: '#c4b5fd',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                                }}
                            >
                                <Icon size={20} />
                                {action.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Recent Cases & Hearings Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Recent Cases */}
                <div style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '1.5rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '1.5rem' }}>
                        Recent Cases
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {recentCases.map((caseItem, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '1rem',
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    borderRadius: '0.75rem',
                                    border: '1px solid rgba(139, 92, 246, 0.1)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.1)';
                                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: '600' }}>
                                        {caseItem.id}
                                    </span>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '9999px',
                                        background: caseItem.status === 'Pending' ? '#f5930020' :
                                            caseItem.status === 'In Progress' ? '#3b82f620' : '#10b98120',
                                        color: caseItem.status === 'Pending' ? '#f59e0b' :
                                            caseItem.status === 'In Progress' ? '#3b82f6' : '#10b981',
                                        fontWeight: '600'
                                    }}>
                                        {caseItem.status}
                                    </span>
                                </div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem' }}>
                                    {caseItem.title}
                                </h4>
                                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                                    Filed: {caseItem.date}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Hearings */}
                <div style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '1.5rem',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '1.5rem' }}>
                        Upcoming Hearings
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {upcomingHearings.map((hearing, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '1rem',
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    borderRadius: '0.75rem',
                                    border: '1px solid rgba(139, 92, 246, 0.1)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Video size={20} color="white" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'white', marginBottom: '0.25rem' }}>
                                            {hearing.title}
                                        </h4>
                                        <p style={{ fontSize: '0.75rem', color: '#8b5cf6' }}>
                                            {hearing.caseId}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                                            <Clock size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                            {hearing.date} at {hearing.time}
                                        </p>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '9999px',
                                            background: '#8b5cf620',
                                            color: '#8b5cf6',
                                            fontWeight: '600'
                                        }}>
                                            {hearing.type}
                                        </span>
                                    </div>
                                    <button style={{
                                        padding: '0.5rem 1rem',
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}>
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
