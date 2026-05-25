import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import useAuthStore from './store/authStore';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';

import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import ScrollToTop from './ScrollToTop';

import OfflineIndicator from './components/OfflineIndicator';
import UpdateNotification from './components/UpdateNotification';
import GuestWelcomeToast from './components/guest/GuestWelcomeToast';
import GuestOnboardingHint from './components/guest/GuestOnboardingHint';

import HearingReminder from "./components/HearingReminder";

// Public Pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const About = lazy(() => import('./pages/About'));
const Constitution = lazy(() => import('./pages/Constitution'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));
const UpcomingFeatures = lazy(() => import('./pages/UpcomingFeatures'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

// Dashboard Layout
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));

// Dashboard Pages
const AdminDashboard = lazy(() => import('./pages/dashboards/AdminDashboard'));
const LawyerDashboard = lazy(() => import('./pages/dashboards/LawyerDashboard'));

// Litigant Pages
const LitigantDashboard = lazy(() => import('./pages/litigant/LitigantDashboard'));

const GuestAuthRedirect = ({ location }) => {
    const setGuestIntent = useAuthStore((s) => s.setGuestIntent);

    useEffect(() => {
        setGuestIntent({
            path: `${location.pathname}${location.search}`,
            feature: 'access your dashboard',
        });
    }, [location.pathname, location.search, setGuestIntent]);

    return <Navigate to="/signup" replace state={{ from: location }} />;
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const location = useLocation();
    const { isAuthenticated, isGuest, user } = useAuthStore();

    if (isGuest) {
        return <GuestAuthRedirect location={location} />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

function App({ swRegistration }) {
    const { initAuth } = useAuthStore();

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    return (
        <ThemeProvider>
            <ErrorBoundary>
                <LanguageProvider>

                    <OfflineIndicator />
                    <UpdateNotification registration={swRegistration} />

                    <BrowserRouter
                        future={{
                            v7_startTransition: true,
                            v7_relativeSplatPath: true
                        }}
                    >
                        <GuestWelcomeToast />
                        <GuestOnboardingHint />
                        <ScrollToTop />

                        <Suspense
                            fallback={
                                <LoadingSpinner
                                    fullScreen
                                    message="Loading NyaySetu..."
                                />
                            }
                        >
                            <Routes>

                                {/* Public Routes */}
                                <Route path="/" element={<Landing />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/constitution" element={<Constitution />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/privacy" element={<PrivacyPolicy />} />
                                <Route path="/terms" element={<Terms />} />
                                <Route path="/disclaimer" element={<Disclaimer />} />
                                <Route path="/upcoming-features" element={<UpcomingFeatures />} />
                                <Route path="/reset-password/:token" element={<ResetPassword />} />

                                {/* Hearing Reminder Route */}
                                <Route
                                    path="/hearing-reminder"
                                    element={<HearingReminder />}
                                />

                                {/* Protected Routes */}
                                <Route
                                    path="/litigant/*"
                                    element={
                                        <ProtectedRoute allowedRoles={['LITIGANT']}>
                                            <DashboardLayout />
                                        </ProtectedRoute>
                                    }
                                >
                                    <Route index element={<LitigantDashboard />} />
                                </Route>

                                <Route
                                    path="/lawyer/*"
                                    element={
                                        <ProtectedRoute allowedRoles={['LAWYER']}>
                                            <DashboardLayout />
                                        </ProtectedRoute>
                                    }
                                >
                                    <Route index element={<LawyerDashboard />} />
                                </Route>

                                <Route
                                    path="/admin/*"
                                    element={
                                        <ProtectedRoute allowedRoles={['ADMIN']}>
                                            <DashboardLayout />
                                        </ProtectedRoute>
                                    }
                                >
                                    <Route index element={<AdminDashboard />} />
                                </Route>

                                {/* Unauthorized */}
                                <Route
                                    path="/unauthorized"
                                    element={
                                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                                            <h1>Unauthorized</h1>
                                            <p>You don't have permission to access this page.</p>
                                        </div>
                                    }
                                />

                            </Routes>
                        </Suspense>

                    </BrowserRouter>

                </LanguageProvider>
            </ErrorBoundary>
        </ThemeProvider>
    );
}

export default App;