import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import useAuthStore from './store/authStore';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages for better performance
const Landing = lazy(() => import('./pages/Landing'));
const Constitution = lazy(() => import('./pages/Constitution'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const About = lazy(() => import('./pages/About'));
const AdminDashboard = lazy(() => import('./pages/dashboards/AdminDashboard'));
const JudgeDashboard = lazy(() => import('./pages/dashboards/JudgeDashboard'));
const LawyerDashboard = lazy(() => import('./pages/dashboards/LawyerDashboard'));
const ClientDashboard = lazy(() => import('./pages/dashboards/ClientDashboard'));

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
        <ErrorBoundary>
            <LanguageProvider>
                <BrowserRouter>
                    <Suspense fallback={<LoadingSpinner fullScreen message="Loading NyaySetu..." />}>
                        <Routes>
                            <Route path="/" element={<Landing />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/constitution" element={<Constitution />} />
                            <Route path="/about" element={<About />} />

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
                    </Suspense>
                </BrowserRouter>
            </LanguageProvider>
        </ErrorBoundary>
    );
}

export default App;
