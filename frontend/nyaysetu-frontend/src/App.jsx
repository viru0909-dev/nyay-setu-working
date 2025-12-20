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
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const About = lazy(() => import('./pages/About'));

// Dashboard Layout
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));

// Dashboard Pages
const AdminDashboard = lazy(() => import('./pages/dashboards/AdminDashboard'));
const JudgeDashboard = lazy(() => import('./pages/dashboards/JudgeDashboard'));
const LawyerDashboard = lazy(() => import('./pages/dashboards/LawyerDashboard'));
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard'));
const FileCasePage = lazy(() => import('./pages/client/FileCasePage'));
const MyCasesPage = lazy(() => import('./pages/client/MyCasesPage'));
const DocumentsPage = lazy(() => import('./pages/client/DocumentsPage'));
const AIDocumentReviewPage = lazy(() => import('./pages/client/AIDocumentReviewPage'));
const ProfilePage = lazy(() => import('./pages/client/ProfilePage'));
const VakilFriendChat = lazy(() => import('./pages/client/VakilFriendChat'));
const CaseDetailPage = lazy(() => import('./pages/client/CaseDetailPage'));
const EvidenceManagerPage = lazy(() => import('./pages/client/EvidenceManagerPage'));
const HearingsPage = lazy(() => import('./pages/client/HearingsPage'));

// Judge Pages
const PendingCasesPage = lazy(() => import('./pages/judge/PendingCasesPage'));
const ConductHearingPage = lazy(() => import('./pages/judge/ConductHearingPage'));
const EvidenceReviewPage = lazy(() => import('./pages/judge/EvidenceReviewPage'));
const DraftOrdersPage = lazy(() => import('./pages/judge/DraftOrdersPage'));
const CourtAnalyticsPage = lazy(() => import('./pages/judge/CourtAnalyticsPage'));
const AICaseSummaryPage = lazy(() => import('./pages/judge/AICaseSummaryPage'));

// Lawyer Pages
const LawyerCasesPage = lazy(() => import('./pages/lawyer/LawyerCasesPage'));
const MyClientsPage = lazy(() => import('./pages/lawyer/MyClientsPage'));
const CasePreparationPage = lazy(() => import('./pages/lawyer/CasePreparationPage'));
const EvidenceVaultPage = lazy(() => import('./pages/lawyer/EvidenceVaultPage'));
const AILegalAssistantPage = lazy(() => import('./pages/lawyer/AILegalAssistantPage'));
const LawyerHearingsPage = lazy(() => import('./pages/lawyer/LawyerHearingsPage'));
const LawyerAnalyticsPage = lazy(() => import('./pages/lawyer/AnalyticsPage'));
const ClientChatPage = lazy(() => import('./pages/lawyer/ClientChatPage'));
const LawyerProfilePage = lazy(() => import('./pages/lawyer/LawyerProfilePage'));

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
                <BrowserRouter
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true
                    }}
                >
                    <Suspense fallback={<LoadingSpinner fullScreen message="Loading NyaySetu..." />}>
                        <Routes>
                            <Route path="/" element={<Landing />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/reset-password/:token" element={<ResetPassword />} />
                            <Route path="/constitution" element={<Constitution />} />
                            <Route path="/about" element={<About />} />

                            {/* Protected Dashboards */}
                            <Route
                                path="/client/*"
                                element={
                                    <ProtectedRoute allowedRoles={['CLIENT']}>
                                        <DashboardLayout />
                                    </ProtectedRoute>
                                }
                            >
                                <Route index element={<ClientDashboard />} />
                                <Route path="file-case" element={<FileCasePage />} />
                                <Route path="cases" element={<MyCasesPage />} />
                                <Route path="documents" element={<DocumentsPage />} />
                                <Route path="ai-review" element={<AIDocumentReviewPage />} />
                                <Route path="profile" element={<ProfilePage />} />
                                <Route path="vakil-friend" element={<VakilFriendChat />} />
                                <Route path="case/:caseId" element={<CaseDetailPage />} />
                                <Route path="evidence" element={<EvidenceManagerPage />} />
                                <Route path="hearings" element={<HearingsPage />} />
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
                                <Route path="cases" element={<LawyerCasesPage />} />
                                <Route path="clients" element={<MyClientsPage />} />
                                <Route path="preparation" element={<CasePreparationPage />} />
                                <Route path="evidence" element={<EvidenceVaultPage />} />
                                <Route path="ai-assistant" element={<AILegalAssistantPage />} />
                                <Route path="hearings" element={<LawyerHearingsPage />} />
                                <Route path="analytics" element={<LawyerAnalyticsPage />} />
                                <Route path="chat" element={<ClientChatPage />} />
                                <Route path="profile" element={<LawyerProfilePage />} />
                            </Route>

                            <Route
                                path="/judge/*"
                                element={
                                    <ProtectedRoute allowedRoles={['JUDGE']}>
                                        <DashboardLayout />
                                    </ProtectedRoute>
                                }
                            >
                                <Route index element={<JudgeDashboard />} />
                                <Route path="pending" element={<PendingCasesPage />} />
                                <Route path="assign" element={<PendingCasesPage />} />
                                <Route path="conduct" element={<ConductHearingPage />} />
                                <Route path="evidence" element={<EvidenceReviewPage />} />
                                <Route path="orders" element={<DraftOrdersPage />} />
                                <Route path="analytics" element={<CourtAnalyticsPage />} />
                                <Route path="ai-summary" element={<AICaseSummaryPage />} />
                                <Route path="profile" element={<ProfilePage />} />
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
