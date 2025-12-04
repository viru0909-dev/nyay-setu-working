import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import JudgeDashboard from './pages/dashboards/JudgeDashboard';
import LawyerDashboard from './pages/dashboards/LawyerDashboard';
import ClientDashboard from './pages/dashboards/ClientDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

function App() {
    const { initAuth } = useAuthStore();

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Dashboards */}
                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/judge/*"
                    element={
                        <ProtectedRoute allowedRoles={['JUDGE']}>
                            <JudgeDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/lawyer/*"
                    element={
                        <ProtectedRoute allowedRoles={['LAWYER']}>
                            <LawyerDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/client/*"
                    element={
                        <ProtectedRoute allowedRoles={['CLIENT']}>
                            <ClientDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route path="/unauthorized" element={
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <h1>Unauthorized</h1>
                        <p>You don't have permission to access this page.</p>
                    </div>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
