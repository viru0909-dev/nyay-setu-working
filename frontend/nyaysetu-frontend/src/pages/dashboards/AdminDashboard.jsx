import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useApi from '../../hooks/useApi';
import ApiStateWrapper from '../../components/common/ApiStateWrapper';

// Simulated API call — replace with real service call when backend is ready
const fetchAdminStats = async () => {
    await new Promise(r => setTimeout(r, 800));
    return {
        totalUsers: 125,
        totalCases: 342,
        activeHearings: 18,
        pendingApprovals: 7
    };
};

const fetchRecentActivity = async () => {
    await new Promise(r => setTimeout(r, 1000));
    return [
        { action: 'New user registered', user: 'John Doe (Lawyer)', time: '5 min ago' },
        { action: 'Case filed', user: 'Jane Smith (Client)', time: '15 min ago' },
        { action: 'Hearing concluded', user: 'Judge Kumar', time: '1 hour ago' },
        { action: 'Document uploaded', user: 'Adv. Patel', time: '2 hours ago' }
    ];
};

export default function AdminDashboard() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useApi(fetchAdminStats);
    const { data: activity, loading: activityLoading, error: activityError, isEmpty: activityEmpty, refetch: refetchActivity } = useApi(fetchRecentActivity);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const statCards = stats ? [
        { label: 'Total Users', value: stats.totalUsers, color: '#667eea' },
        { label: 'Total Cases', value: stats.totalCases, color: '#48bb78' },
        { label: 'Active Hearings', value: stats.activeHearings, color: '#ed8936' },
        { label: 'Pending Approvals', value: stats.pendingApprovals, color: '#f56565' }
    ] : [];

    return (
        <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
            {/* Header */}
            <div style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1rem 0' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Admin Dashboard</h1>
                        <p style={{ color: '#718096', fontSize: '0.875rem' }}>Welcome, {user?.name || 'Admin'}</p>
                    </div>
                    <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 0' }}>
                {/* Stats Cards */}
                <ApiStateWrapper
                    loading={statsLoading}
                    error={statsError}
                    isEmpty={!stats}
                    onRetry={refetchStats}
                    skeleton="card"
                    skeletonCount={4}
                    emptyMsg="No stats available."
                >
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2rem'
                    }}>
                        {statCards.map((stat, idx) => (
                            <div key={idx} className="card" style={{ textAlign: 'center' }}>
                                <p style={{ color: '#718096', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{stat.label}</p>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: stat.color }}>{stat.value}</h2>
                            </div>
                        ))}
                    </div>
                </ApiStateWrapper>

                {/* Recent Activity */}
                <div className="card">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>System Activity</h3>
                    <ApiStateWrapper
                        loading={activityLoading}
                        error={activityError}
                        isEmpty={activityEmpty}
                        onRetry={refetchActivity}
                        emptyMsg="No recent activity found."
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {activity?.map((item, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '1rem',
                                    background: '#f7fafc',
                                    borderRadius: '0.5rem'
                                }}>
                                    <div>
                                        <p style={{ fontWeight: '600' }}>{item.action}</p>
                                        <p style={{ color: '#718096', fontSize: '0.875rem' }}>{item.user}</p>
                                    </div>
                                    <p style={{ color: '#a0aec0', fontSize: '0.875rem' }}>{item.time}</p>
                                </div>
                            ))}
                        </div>
                    </ApiStateWrapper>
                </div>
            </div>
        </div>
    );
}
