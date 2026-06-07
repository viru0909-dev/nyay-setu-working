import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, Suspense, lazy, useState } from 'react';
import useAuthStore from './store/authStore';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import ScrollToTop from './ScrollToTop';
import './styles/accessibility.css';
import ScrollProgressBar from './components/ScrollProgressBar';

// PWA Components
import OfflineIndicator from './components/OfflineIndicator';
import UpdateNotification from './components/UpdateNotification';
import GuestWelcomeToast from './components/guest/GuestWelcomeToast';
import GuestOnboardingHint from './components/guest/GuestOnboardingHint';

import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import KeyboardShortcutsModal from './components/common/KeyboardShortcutsModal';

// Imported Feature Component

// ==========================================
// VITE CHUNK BREAKAGE MITIGATION WRAPPER
// ==========================================
const retryLazy = (componentImport) => lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
        window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );
    try {
        const component = await componentImport();
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
        return component;
    } catch (error) {
        if (!pageHasAlreadyBeenForceRefreshed) {
            window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
            window.location.reload();
            return { default: () => <LoadingSpinner fullScreen message="Syncing workspace patches..." /> };
        }
        throw error;
    }
});

// ==========================================
// OPTIMIZED LAZY-LOAD ENTRIES
// ==========================================
const Landing = retryLazy(() => import('./pages/Landing'));
const Constitution = retryLazy(() => import('./pages/Constitution'));
const Login = retryLazy(() => import('./pages/Login'));
const Signup = retryLazy(() => import('./pages/Signup'));
const ResetPassword = retryLazy(() => import('./pages/ResetPassword'));
const About = retryLazy(() => import('./pages/About'));
const PrivacyPolicy = retryLazy(() => import('./pages/PrivacyPolicy'));
const Terms = retryLazy(() => import('./pages/Terms'));
const Disclaimer = retryLazy(() => import('./pages/Disclaimer'));
const UpcomingFeatures = retryLazy(() => import('./pages/UpcomingFeatures'));

// Dashboard Layout
const DashboardLayout = retryLazy(() => import('./layouts/DashboardLayout'));

// Dashboard Pages
const AdminDashboard = retryLazy(() => import('./pages/dashboards/AdminDashboard'));
const LawyerDashboard = retryLazy(() => import('./pages/dashboards/LawyerDashboard'));

// Litigant Pages
const LitigantDashboard = retryLazy(() => import('./pages/litigant/LitigantDashboard'));
const FileUnifiedPage = retryLazy(() => import('./pages/litigant/FileUnifiedPage'));
const VakilFriendPage = retryLazy(() => import('./pages/litigant/VakilFriendPage'));
const CaseDiaryPage = retryLazy(() => import('./pages/litigant/CaseDiaryPage'));
const CaseDetailPage = retryLazy(() => import('./pages/litigant/CaseDetailPage'));
const HearingsPage = retryLazy(() => import('./pages/litigant/HearingsPage'));
const LawyerChatPage = retryLazy(() => import('./pages/litigant/LawyerChatPage'));
const ProfilePage = retryLazy(() => import('./pages/litigant/ProfilePage'));
const DocumentGeneratePage = retryLazy(() => import('./pages/litigant/DocumentGeneratePage'));
const FindLawyerPage = retryLazy(() => import('./pages/litigant/FindLawyerPage'));
const LawyerFeedbackPage = retryLazy(() => import('./pages/litigant/LawyerFeedbackPage'));

// Judge Pages
const ConductHearingPage = retryLazy(() => import('./pages/judge/ConductHearingPage'));
const CourtAnalyticsPage = retryLazy(() => import('./pages/judge/CourtAnalyticsPage'));
const MyDocket = retryLazy(() => import('./pages/judge/MyDocket'));
const JudgeCaseWorkspace = retryLazy(() => import('./pages/judge/JudgeCaseWorkspace'));
const JudicialOverview = retryLazy(() => import('./pages/judge/JudicialOverview'));
const UnassignedPool = retryLazy(() => import('./pages/judge/UnassignedPool'));
const LiveHearing = retryLazy(() => import('./pages/judge/LiveHearing'));
const JudgeHearingsPage = retryLazy(() => import('./pages/judge/JudgeHearingsPage'));

// Lawyer Pages
const LawyerCasesPage = retryLazy(() => import('./pages/lawyer/LawyerCasesPage'));
const MyClientsPage = retryLazy(() => import('./pages/lawyer/MyClientsPage'));
const CasePreparationPage = retryLazy(() => import('./pages/lawyer/CasePreparationPage'));
const EvidenceVaultPage = retryLazy(() => import('./pages/lawyer/EvidenceVaultPage'));
const AILegalAssistantPage = retryLazy(() => import('./pages/lawyer/AILegalAssistantPage'));
const LawyerHearingsPage = retryLazy(() => import('./pages/lawyer/LawyerHearingsPage'));
const LawyerAnalyticsPage = retryLazy(() => import('./pages/lawyer/AnalyticsPage'));
const LawyerCaseDetailsPage = retryLazy(() => import('./pages/lawyer/LawyerCaseDetailsPage'));
const ClientChatPage = retryLazy(() => import('./pages/lawyer/ClientChatPage'));
const LawyerProfilePage = retryLazy(() => import('./pages/lawyer/LawyerProfilePage'));
const CaseWorkspace = retryLazy(() => import('./pages/lawyer/CaseWorkspace'));
const OfflineDraftsPage = retryLazy(() => import('./pages/lawyer/OfflineDraftsPage'));

// Police Pages
const PoliceDashboard = retryLazy(() => import('./pages/police/PoliceDashboard'));
const UploadFirPage = retryLazy(() => import('./pages/police/UploadFirPage'));
const MyFirsPage = retryLazy(() => import('./pages/police/MyFirsPage'));
const PoliceInvestigationsPage = retryLazy(() => import('./pages/police/PoliceInvestigationsPage'));
const InvestigationDetailsPage = retryLazy(() => import('./pages/police/InvestigationDetailsPage'));

// ==========================================
// CORE AUTH ROUTE LOGIC
// ==========================================
const GuestAuthRedirect = ({ location }) => {
    const setGuestIntent = useAuthStore((s) => s.setGuestIntent);

    useEffect(() => {
        if (!location.pathname.includes('/signup') && !location.pathname.includes('/login')) {
            setGuestIntent({
                path: `${location.pathname}${location.search}`,
                feature: 'access your dashboard',
            });
        }
    }, [location.pathname, location.search, setGuestIntent]);

    return <Navigate to="/signup" replace state={{ from: location }} />;
};

const ProtectedRoute = ({ children, allowedRoles }) => {
    const location = useLocation();
    
    // Atomic Zustand Selectors prevent localized updates from re-rendering the outer core app
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const isGuest = useAuthStore((s) => s.isGuest);
    const user = useAuthStore((s) => s.user);

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

// Structural Workspace wrapper isolating Suspense performance bounds
const ProtectedWorkspace = ({ allowedRoles, message, children }) => (
    <ProtectedRoute allowedRoles={allowedRoles}>
        <Suspense fallback={<LoadingSpinner fullScreen message={message} />}>
            {children}
        </Suspense>
    </ProtectedRoute>
);

function KeyboardAccessibilityProvider({ user }) {
    const [showShortcuts, setShowShortcuts] = useState(false);

    useKeyboardShortcuts({
        user,
        onOpenHelp: () => setShowShortcuts(true),
        onCloseHelp: () => setShowShortcuts(false),
    });

    return (
        <KeyboardShortcutsModal
            isOpen={showShortcuts}
            onClose={() => setShowShortcuts(false)}
        />
    );
}

// Fixed-Reference Fallback Views
const UnauthorizedView = () => (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h1>Unauthorized</h1>
        <p>You don't have permission to access this page.</p>
    </div>
);

const NotFoundView = () => (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
    </div>
);

// ==========================================
// ENHANCED SYSTEM CORE ROOT ENTRY
// ==========================================
function App({ swRegistration }) {
    const initAuth = useAuthStore((s) => s.initAuth);
    const user = useAuthStore((s) => s.user);

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
                        {/* ============================================================= */}
                        {/* 🌟 SCROLL PROGRESS INDICATOR GLOBAL INTEGRATION LOCATION 🌟 */}
                        {/* ============================================================= */}
                        <ScrollProgressBar />

                        <KeyboardAccessibilityProvider user={user} />
                        <GuestWelcomeToast />
                        <GuestOnboardingHint />
                        <ScrollToTop />
                        
                        <Suspense fallback={<LoadingSpinner fullScreen message="Loading NyaySetu..." />}>
                            <Routes>
                                {/* Base Application Portals */}
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

                                {/* Litigant Functional Core */}
                                <Route path="/litigant/*" element={
                                    <ProtectedWorkspace allowedRoles={['LITIGANT']} message="Loading Litigant Workspace...">
                                        <DashboardLayout />
                                    </ProtectedWorkspace>
                                }>
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
                                    <Route path="generate-document" element={<DocumentGeneratePage />} />
                                    <Route path="*" element={<Navigate to="/litigant" replace />} />
                                </Route>

                                {/* Lawyer Functional Core */}
                                <Route path="/lawyer/*" element={
                                    <ProtectedWorkspace allowedRoles={['LAWYER']} message="Loading Lawyer Workspace...">
                                        <DashboardLayout />
                                    </ProtectedWorkspace>
                                }>
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
                                    <Route path="*" element={<Navigate to="/lawyer" replace />} />
                                </Route>

                                {/* Judicial Functional Core */}
                                <Route path="/judge/*" element={
                                    <ProtectedWorkspace allowedRoles={['JUDGE']} message="Loading Judicial Workspace...">
                                        <DashboardLayout />
                                    </ProtectedWorkspace>
                                }>
                                    <Route index element={<JudicialOverview />} />
                                    <Route path="docket" element={<MyDocket />} />
                                    <Route path="unassigned" element={<UnassignedPool />} />
                                    <Route path="hearings" element={<JudgeHearingsPage />} />
                                    <Route path="live-hearing" element={<LiveHearing />} />
                                    <Route path="case/:caseId" element={<JudgeCaseWorkspace />} />
                                    <Route path="conduct" element={<ConductHearingPage />} />
                                    <Route path="analytics" element={<CourtAnalyticsPage />} />
                                    <Route path="profile" element={<ProfilePage />} />
                                    <Route path="*" element={<Navigate to="/judge" replace />} />
                                </Route>

                                {/* Administrative Core */}
                                <Route path="/admin/*" element={
                                    <ProtectedWorkspace allowedRoles={['ADMIN']} message="Loading Admin Panel...">
                                        <DashboardLayout />
                                    </ProtectedWorkspace>
                                }>
                                    <Route index element={<AdminDashboard />} />
                                    <Route path="*" element={<Navigate to="/admin" replace />} />
                                </Route>

                                {/* Law Enforcement Core */}
                                <Route path="/police/*" element={
                                    <ProtectedWorkspace allowedRoles={['POLICE']} message="Loading Police Dashboard...">
                                        <DashboardLayout />
                                    </ProtectedWorkspace>
                                }>
                                    <Route index element={<PoliceDashboard />} />
                                    <Route path="upload" element={<UploadFirPage />} />
                                    <Route path="firs" element={<MyFirsPage />} />
                                    <Route path="investigations" element={<PoliceInvestigationsPage />} />
                                    <Route path="investigation/:id" element={<InvestigationDetailsPage />} />
                                    <Route path="profile" element={<ProfilePage />} />
                                    <Route path="*" element={<Navigate to="/police" replace />} />
                                </Route>
                                
                                {/* Core Catch-All Directives */}
                                <Route path="/unauthorized" element={<UnauthorizedView />} />
                                <Route path="*" element={<NotFoundView />} />
                            </Routes>
                        </Suspense>
                    </BrowserRouter>
                </LanguageProvider>
            </ErrorBoundary>
        </ThemeProvider>
    );
}

export default App;