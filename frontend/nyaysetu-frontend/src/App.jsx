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

const LawyerDashboard = lazy(() => import('./pages/dashboards/LawyerDashboard'));

// Litigant Pages
const LitigantDashboard = lazy(() => import('./pages/litigant/LitigantDashboard'));
const FileUnifiedPage = lazy(() => import('./pages/litigant/FileUnifiedPage'));
const VakilFriendPage = lazy(() => import('./pages/litigant/VakilFriendPage'));
const CaseDiaryPage = lazy(() => import('./pages/litigant/CaseDiaryPage'));
const CaseDetailPage = lazy(() => import('./pages/litigant/CaseDetailPage'));
const HearingsPage = lazy(() => import('./pages/litigant/HearingsPage'));
const LawyerChatPage = lazy(() => import('./pages/litigant/LawyerChatPage'));
const ProfilePage = lazy(() => import('./pages/litigant/ProfilePage'));


// Judge Pages (keep only those still used)
const ConductHearingPage = lazy(() => import('./pages/judge/ConductHearingPage'));
const CourtAnalyticsPage = lazy(() => import('./pages/judge/CourtAnalyticsPage'));
// New Unified Workspace Pages
const MyDocket = lazy(() => import('./pages/judge/MyDocket'));
const JudgeCaseWorkspace = lazy(() => import('./pages/judge/JudgeCaseWorkspace'));
const JudicialOverview = lazy(() => import('./pages/judge/JudicialOverview'));
const UnassignedPool = lazy(() => import('./pages/judge/UnassignedPool'));
const LiveHearing = lazy(() => import('./pages/judge/LiveHearing'));

// Lawyer Pages
const LawyerCasesPage = lazy(() => import('./pages/lawyer/LawyerCasesPage'));
const MyClientsPage = lazy(() => import('./pages/lawyer/MyClientsPage'));
const CasePreparationPage = lazy(() => import('./pages/lawyer/CasePreparationPage'));
const EvidenceVaultPage = lazy(() => import('./pages/lawyer/EvidenceVaultPage'));
const AILegalAssistantPage = lazy(() => import('./pages/lawyer/AILegalAssistantPage'));
const LawyerHearingsPage = lazy(() => import('./pages/lawyer/LawyerHearingsPage'));
const LawyerAnalyticsPage = lazy(() => import('./pages/lawyer/AnalyticsPage'));
const LawyerCaseDetailsPage = lazy(() => import('./pages/lawyer/LawyerCaseDetailsPage'));
const ClientChatPage = lazy(() => import('./pages/lawyer/ClientChatPage'));
const LawyerProfilePage = lazy(() => import('./pages/lawyer/LawyerProfilePage'));
const CaseWorkspace = lazy(() => import('./pages/lawyer/CaseWorkspace'));

// Police Pages
const PoliceDashboard = lazy(() => import('./pages/police/PoliceDashboard'));
const UploadFirPage = lazy(() => import('./pages/police/UploadFirPage'));
const MyFirsPage = lazy(() => import('./pages/police/MyFirsPage'));
const PoliceInvestigationsPage = lazy(() => import('./pages/police/PoliceInvestigationsPage'));
const InvestigationDetailsPage = lazy(() => import('./pages/police/InvestigationDetailsPage'));

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
                                path="/litigant/*"
                                element={
                                    <ProtectedRoute allowedRoles={['LITIGANT']}>
                                        <DashboardLayout />
                                    </ProtectedRoute>
                                }
                            >
                                <Route index element={<LitigantDashboard />} />
                                <Route path="vakil-friend" element={<VakilFriendPage />} />
                                <Route path="file" element={<FileUnifiedPage />} />
                                <Route path="case-diary" element={<CaseDiaryPage />} />
                                <Route path="case-diary/:caseId" element={<CaseDetailPage />} />
                                <Route path="hearings" element={<HearingsPage />} />
                                <Route path="chat" element={<LawyerChatPage />} />
                                <Route path="profile" element={<ProfilePage />} />
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
                                <Route path="case/:caseId" element={<LawyerCaseDetailsPage />} />
                                <Route path="case/:caseId/workspace" element={<CaseWorkspace />} />
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
                                <Route index element={<JudicialOverview />} />
                                {/* New Unified Workspace Routes */}
                                <Route path="docket" element={<MyDocket />} />
                                <Route path="unassigned" element={<UnassignedPool />} />
                                <Route path="live-hearing" element={<LiveHearing />} />
                                <Route path="case/:caseId" element={<JudgeCaseWorkspace />} />
                                {/* Keep only essential old routes */}
                                <Route path="conduct" element={<ConductHearingPage />} />
                                <Route path="analytics" element={<CourtAnalyticsPage />} />
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

                            <Route
                                path="/police/*"
                                element={
                                    <ProtectedRoute allowedRoles={['POLICE']}>
                                        <DashboardLayout />
                                    </ProtectedRoute>
                                }
                            >
                                <Route index element={<PoliceDashboard />} />
                                <Route path="upload" element={<UploadFirPage />} />
                                <Route path="firs" element={<MyFirsPage />} />
                                <Route path="investigations" element={<PoliceInvestigationsPage />} />
                                <Route path="investigation/:id" element={<InvestigationDetailsPage />} />
                                <Route path="profile" element={<ProfilePage />} />
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
