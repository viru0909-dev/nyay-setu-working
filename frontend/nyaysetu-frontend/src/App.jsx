import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import useAuthStore from './store/authStore';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
// CHANGED: ThemeProvider added — wraps the entire app so all components can access theme
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import ScrollToTop from './ScrollToTop';

// PWA Components
import OfflineIndicator from './components/OfflineIndicator';
import UpdateNotification from './components/UpdateNotification';
import GuestWelcomeToast from './components/guest/GuestWelcomeToast';
import GuestOnboardingHint from './components/guest/GuestOnboardingHint';

// Lazy load pages for better performance
const Landing = lazy(() => import('./pages/Landing'));
const Constitution = lazy(() => import('./pages/Constitution'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const About = lazy(() => import('./pages/About'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));
const UpcomingFeatures = lazy(() => import('./pages/UpcomingFeatures'));

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
const ForensicsPage = lazy(() => import('./pages/litigant/ForensicsPage'));
const DocumentGeneratePage = lazy(() => import('./pages/litigant/DocumentGeneratePage'));
const FindLawyerPage = lazy(() => import('./pages/litigant/FindLawyerPage'));
const LawyerFeedbackPage = lazy(() => 
  import('./pages/litigant/LawyerFeedbackPage'));


// Judge Pages (keep only those still used)
const ConductHearingPage = lazy(() => import('./pages/judge/ConductHearingPage'));
const CourtAnalyticsPage = lazy(() => import('./pages/judge/CourtAnalyticsPage'));
// New Unified Workspace Pages
const MyDocket = lazy(() => import('./pages/judge/MyDocket'));
const JudgeCaseWorkspace = lazy(() => import('./pages/judge/JudgeCaseWorkspace'));
const JudicialOverview = lazy(() => import('./pages/judge/JudicialOverview'));
const UnassignedPool = lazy(() => import('./pages/judge/UnassignedPool'));
const LiveHearing = lazy(() => import('./pages/judge/LiveHearing'));
const JudgeHearingsPage = lazy(() => import('./pages/judge/JudgeHearingsPage'));


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
const OfflineDraftsPage = lazy(() => import('./pages/lawyer/OfflineDraftsPage'));

// Police Pages
const PoliceDashboard = lazy(() => import('./pages/police/PoliceDashboard'));
const UploadFirPage = lazy(() => import('./pages/police/UploadFirPage'));
const MyFirsPage = lazy(() => import('./pages/police/MyFirsPage'));
const PoliceInvestigationsPage = lazy(() => import('./pages/police/PoliceInvestigationsPage'));
const InvestigationDetailsPage = lazy(() => import('./pages/police/InvestigationDetailsPage'));

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
        // CHANGED: ThemeProvider is the outermost wrapper so the theme CSS attribute
        // is set on <html> before any child renders — prevents flash of wrong theme
        <ThemeProvider>
            <ErrorBoundary>
                <LanguageProvider>
                    {/* Global PWA Components */}
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
                        <Suspense fallback={<LoadingSpinner fullScreen message="Loading NyaySetu..." />}>
                            <Routes>
                                <Route path="/" element={<Landing />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/reset-password/:token" element={<ResetPassword />} />
                                <Route path="/constitution" element={<Constitution />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/privacy" element={<PrivacyPolicy />} />
                                <Route path="/terms" element={<Terms />} />
                                <Route path="/disclaimer" element={<Disclaimer />} />
                                <Route path="/upcoming-features" element={<UpcomingFeatures />} />

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
                                    <Route path="find-lawyer" element={<FindLawyerPage />} />
                                    <Route path="feedback" element={<LawyerFeedbackPage />} />
                                    <Route path="profile" element={<ProfilePage />} />
                                    <Route path="forensics" element={<ForensicsPage />} />
                                    <Route path="generate-document" element={<DocumentGeneratePage />} />
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
                                    <Route path="offline-drafts" element={<OfflineDraftsPage />} />
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
                                    <Route path="hearings" element={<JudgeHearingsPage />} />
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
        </ThemeProvider>
    );
}

export default App;
