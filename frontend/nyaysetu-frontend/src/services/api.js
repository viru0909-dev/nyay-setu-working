import axios from 'axios';
import toast from "react-hot-toast";
import { getErrorMessage } from "../utils/errorHandler";
import useAuthStore from '../store/authStore';
// Use explicit backend URL - Vite proxy can be unreliable
// In development: http://localhost:8080
// In production: Replace with actual backend URL via environment variable
// Use explicit backend URL - Vite proxy can be unreliable
// In development: http://localhost:8080
// In production: Replace with actual backend URL via environment variable
// Check multiple variable names to be safe
// Smart Base URL detection with safe fallbacks
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const PROD_BACKEND = 'https://nyaysetubackend.onrender.com';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    (isLocalhost ? 'http://localhost:8080' : PROD_BACKEND);

if (import.meta.env.DEV) {
    console.log('[api.js] Using API_BASE_URL:', API_BASE_URL);
}

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10s timeout — prevents infinite loading when backend is unreachable
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    // Only add Authorization header if token exists and is not null/undefined
    if (token && token !== 'null' && token !== 'undefined') {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // If request body is FormData, remove Content-Type to let browser set it with boundary
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    if (import.meta.env.DEV) {
        console.log('API Request:', {
            method: config.method,
            url: config.url,
            hasAuth: !!config.headers.Authorization,
            contentType: config.headers['Content-Type']
        });
    }

    return config;
});
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = getErrorMessage(error);

        // Show user-friendly toast notification
        toast.error(message);

        // Log detailed errors in development only
        if (import.meta.env.DEV) {
            console.error("API Error:", error);
        }

        const status = error.response?.status;
        if (status === 401 || status === 403) {
            const token = localStorage.getItem('token');
            const hasValidToken = token && token !== 'null' && token !== 'undefined';

            if (!hasValidToken) {
                try {
                    window.dispatchEvent(
                        new CustomEvent('guest:api-blocked', {
                            detail: {
                                message: 'Create an account to use this feature.',
                                url: error.config?.url,
                            },
                        })
                    );
                } catch {
                    // ignore
                }
            } else {
                useAuthStore.getState().logout();
                if (!window.location.pathname.startsWith('/login')) {
                    window.location.assign('/login');
                }
            }
        }
        return Promise.reject(error);
    }
);
// Auth API
export const authAPI = {
    login: (credentials) => api.post('/api/v1/auth/login', credentials),
    register: (userData) => api.post('/api/v1/auth/register', userData),
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
};

// Case API
export const caseAPI = {
    create: (caseData) => api.post('/api/v1/cases', caseData),
    list: () => api.get('/api/v1/cases'),
    getById: (id) => api.get(`/api/v1/cases/${id}`),
    update: (id, data) => api.put(`/api/v1/cases/${id}`, data),
    delete: (id) => api.delete(`/api/v1/cases/${id}`),
    submitDraft: (id, draftContent) => api.post(`/api/v1/cases/${id}/submit-draft`, { draftContent }),
    reviewDraft: (id, approved, comments) => api.post(`/api/v1/cases/${id}/review-draft`, { approved, comments }),
    fileInCourt: (id) => api.post(`/api/v1/cases/${id}/file-in-court`),
    startHearings: (id) => api.post(`/api/v1/cases/${id}/start-hearings`),
    startEvidence: (id) => api.post(`/api/v1/cases/${id}/start-evidence`),
    startArguments: (id) => api.post(`/api/v1/cases/${id}/start-arguments`),
    startJudgment: (id) => api.post(`/api/v1/cases/${id}/start-judgment`),
    deliverVerdict: (id, verdictDetails) => api.post(`/api/v1/cases/${id}/deliver-verdict`, { verdictDetails }),
    orderNotice: (id) => api.post(`/api/v1/cases/${id}/order-notice`),
};

// Document API
export const documentAPI = {
    upload: (file, metadata = {}) => {
        const formData = new FormData();
        formData.append('file', file);

        // Only append non-empty values
        if (metadata.category) {
            formData.append('category', metadata.category);
        }
        if (metadata.description) {
            formData.append('description', metadata.description);
        }
        if (metadata.caseId) {
            formData.append('caseId', metadata.caseId);
        }

        if (import.meta.env.DEV) {
            console.log('Uploading with FormData:', {
                file: file.name,
                category: metadata.category,
                description: metadata.description
            });
        }
        // CRITICAL: Don't set Content-Type header - let browser set it with boundary
        return api.post('/api/v1/documents/upload', formData);
    },
    list: () => api.get('/api/v1/documents'),
    getByCase: (caseId) => api.get(`/api/v1/documents/case/${caseId}`),
    download: (id) => api.get(`/api/v1/documents/${id}/download`, { responseType: 'blob' }),
    delete: (id) => api.delete(`/api/v1/documents/${id}`),
    analyze: (id) => api.post(`/api/v1/documents/${id}/analyze`),
    getAnalysis: (id) => api.get(`/api/v1/documents/${id}/analysis`),
    hasAnalysis: (id) => api.get(`/api/v1/documents/${id}/has-analysis`),
    downloadCertificate: (id) => api.get(`/api/v1/documents/${id}/certificate`, { responseType: 'blob' })
};

// Document Generation API (AI-powered legal document drafting)
export const documentGenerateAPI = {
    preview: (data) => api.post('/api/v1/documents/generate/preview', data),
    download: (data) => api.post('/api/v1/documents/generate/download', data, { responseType: 'blob' }),
    downloadDocx: (data) => api.post('/api/v1/documents/generate/download/docx', data, { responseType: 'blob' }),
};

// Hearing API
export const hearingAPI = {
    schedule: (hearingData) => api.post('/api/v1/hearings/schedule', hearingData),
    getByCaseId: (caseId) => api.get(`/api/v1/hearings/case/${caseId}`),
    getMyHearings: () => api.get('/api/v1/hearings/my'),
    getById: (id) => api.get(`/api/v1/hearings/${id}`),
    join: (id) => api.post(`/api/v1/hearings/${id}/join`),
    leave: (id) => api.post(`/api/v1/hearings/${id}/leave`),
    complete: (id, notes) => api.put(`/api/v1/hearings/${id}/complete`, { judgeNotes: notes }),
    getParticipants: (id) => api.get(`/api/v1/hearings/${id}/participants`)
};

// Meeting API
export const meetingAPI = {
    schedule: (meetingData) => api.post('/api/v1/meetings', meetingData),
    list: () => api.get('/api/v1/meetings'),
    getById: (id) => api.get(`/api/v1/meetings/${id}`),
    update: (id, data) => api.put(`/api/v1/meetings/${id}`, data),
};

// Vakil-Friend Chat API (Chat-First Case Filing)
export const vakilFriendAPI = {
    startSession: () => api.post('/api/v1/vakil-friend/start'),
    startCaseSession: (caseId) => api.post(`/api/v1/vakil-friend/case/${caseId}/start`),
    sendMessage: (sessionId, payload) => api.post(`/api/v1/vakil-friend/chat/${sessionId}`, payload),
    completeSession: (sessionId) => api.post(`/api/v1/vakil-friend/complete/${sessionId}`),
    getSession: (sessionId) => api.get(`/api/v1/vakil-friend/session/${sessionId}`),
    getSessions: () => api.get('/api/v1/vakil-friend/sessions'),

    // Document Analysis with AI & SHA-256 protection
    analyzeDocument: (caseId, file, sessionId = null) => {
        const formData = new FormData();
        formData.append('file', file);
        if (sessionId) {
            formData.append('sessionId', sessionId);
        }
        return api.post(`/api/v1/vakil-friend/case/${caseId}/analyze-document`, formData);
    },

    // Analyze document for session (before case is created)
    analyzeDocumentForSession: (sessionId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post(`/api/v1/vakil-friend/session/${sessionId}/analyze-document`, formData);
    },

    // Case Diary entries with SHA-256 integrity
    getCaseDiary: (caseId) => api.get(`/api/v1/vakil-friend/case/${caseId}/diary`),

    // Verify diary entry integrity
    verifyDiaryEntry: (entryId) => api.get(`/api/v1/vakil-friend/diary/${entryId}/verify`),
};

// Case Assignment API (Auto-assign judges, lawyer selection)
export const assignmentAPI = {
    autoAssign: (caseId) => api.post(`/api/v1/assignments/case/${caseId}/auto-assign`),
    assignLawyer: (caseId, lawyerId) => api.post(`/api/v1/assignments/case/${caseId}/assign-lawyer`, { lawyerId }),
    getLawyers: () => api.get('/api/v1/users/lawyers'),
};

// Message API
// Message API
export const messageAPI = {
    send: (caseId, messageOrPayload) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const senderId = user?.id;

        // Handle both string messages and full payload objects
        const payload = typeof messageOrPayload === 'string'
            ? { message: messageOrPayload, senderId, type: 'TEXT', attachmentUrl: null }
            : {
                message: messageOrPayload.message,
                senderId: messageOrPayload.senderId || senderId,
                type: messageOrPayload.type || 'TEXT',
                attachmentUrl: messageOrPayload.attachmentUrl || null
            };

        return api.post(`/api/v1/cases/${caseId}/messages`, payload);
    },
    getMessages: (caseId) => api.get(`/api/v1/cases/${caseId}/messages`),
};
export const caseAssignmentAPI = {
    autoAssignJudge: (caseId) => api.post(`/api/v1/cases/${caseId}/assign-judge`),
    getAvailableLawyers: () => api.get('/api/v1/cases/lawyers/available'),
    proposeLawyer: (caseId, lawyerId) => api.post(`/api/v1/cases/${caseId}/propose-lawyer`, { lawyerId }),
    respondToProposal: (caseId, status) => api.post(`/api/v1/cases/${caseId}/respond-proposal`, { status }),
    getPendingCases: () => api.get('/api/v1/cases/pending-assignment'),
    getJudgeWorkload: () => api.get('/api/v1/cases/judge-workload'),
    takeCognizance: (caseId, judgeId) => api.post(`/api/v1/cases/${caseId}/take-cognizance`, { judgeId }),
    updateSummons: (caseId, served) => api.post(`/api/v1/cases/${caseId}/update-summons`, { served }),
    updateDocumentStatus: (caseId, status) => api.post(`/api/v1/cases/${caseId}/document-status`, { status }),
};

// Judge API - Case management for judges
export const judgeAPI = {
    getCases: () => api.get('/api/v1/judge/cases'),
    getPendingCases: () => api.get('/api/v1/judge/pending'),
    getUnassignedCases: () => api.get('/api/v1/judge/unassigned'), // Central pool
    claimCase: (id) => api.post(`/api/v1/judge/cases/${id}/claim`),
    getTodaysHearings: () => api.get('/api/v1/judge/hearings/today'),
    getAnalytics: () => api.get('/api/v1/judge/analytics'),
    aiChat: (message, caseId) => api.post('/api/v1/judge/ai-chat', { message, caseId }),
    getAICaseSummary: (caseId) => api.get(`/api/v1/judge/case/${caseId}/ai-summary`),
    scheduleHearingAI: (prompt) => api.post('/api/v1/judge/hearings/schedule-ai', { prompt }),
};

// Lawyer API - Case and client management for lawyers
export const lawyerAPI = {
    getCases: () => api.get('/api/v1/lawyer/cases'),
    getClients: () => api.get('/api/v1/lawyer/clients'),
    getStats: () => api.get('/api/v1/lawyer/stats'),
    generateDraft: (caseId, template) => api.post('/api/v1/lawyer/draft', { caseId, template }),
    saveDraft: (caseId, draft) => api.post('/api/v1/lawyer/draft/save', { caseId, draft }),
};

// Central Brain API
export const brainAPI = {
    chat: (message, sessionId = null) => api.post('/api/v1/brain/chat', { message, sessionId }),
    analyzeCase: (query) => api.post('/api/v1/brain/analyze-case', { query }),
    getSuggestedDocuments: (caseDetails) => api.post('/api/v1/brain/suggest-documents', { caseDetails }),
};

// Police API - FIR management for police officers
export const policeAPI = {
    uploadFir: (formData) => api.post('/api/v1/police/fir/upload', formData),
    listFirs: () => api.get('/api/v1/police/fir/list'),
    getFir: (id) => api.get(`/api/v1/police/fir/${id}`),
    verifyFir: (id, formData) => api.post(`/api/v1/police/fir/${id}/verify`, formData),
    getStats: () => api.get('/api/v1/police/stats'),
    getPendingFirs: () => api.get('/api/v1/police/fir/pending'),
    updateFirStatus: (id, status, reviewNotes) => api.put(`/api/v1/police/fir/${id}/status`, null, {
        params: { status, reviewNotes }
    }),
    health: () => api.get('/api/v1/police/health'),
    startInvestigation: (id) => api.post(`/api/v1/police/investigation/${id}/start`),
    submitInvestigation: (id, findings) => api.post(`/api/v1/police/investigation/${id}/submit`, { findings }),
    getInvestigations: () => api.get('/api/v1/police/investigation/list'),
    getPendingSummons: () => api.get('/api/v1/police/summons/pending'),
    completeSummons: (id) => api.post(`/api/v1/police/summons/${id}/complete`),

    // New methods for Enhanced Investigation
    uploadEvidence: (id, formData) => api.post(`/api/v1/police/investigation/${id}/evidence`, formData),
    generateAiSummary: (id) => api.get(`/api/v1/police/investigation/${id}/summary`),
    draftCourtSubmission: (id) => api.get(`/api/v1/police/investigation/${id}/draft-submission`),
};

// Client FIR API - For citizens to file FIRs
export const clientFirAPI = {
    fileFir: (formData) => api.post('/api/v1/client/fir', formData),
    listFirs: () => api.get('/api/v1/client/fir/list'),
    getFir: (id) => api.get(`/api/v1/client/fir/${id}`),
    getStats: () => api.get('/api/v1/client/fir/stats'),
};

// ===== NEW: Case Events API (Audit Trail / Timeline) =====
export const caseEventAPI = {
    // Get timeline events for a case (chronological order)
    getTimeline: (caseId) => api.get(`/api/v1/cases/${caseId}/events`),
    // Get recent events (newest first)
    getRecent: (caseId) => api.get(`/api/v1/cases/${caseId}/events/recent`),
    // Get events for judge's dashboard
    getJudgeEvents: (judgeId) => api.get(`/api/v1/cases/judge/${judgeId}/events`),
};

// ===== NEW: Case State Transition API (Chain Reaction Handover) =====
export const caseTransitionAPI = {
    // POLICE → COURT: Submit case for cognizance
    policeSubmitToCourt: (caseId, officerId, officerName) =>
        api.post(`/api/v1/cases/transition/${caseId}/submit-to-court`, { officerId, officerName }),

    // LAWYER: Save draft (triggers client approval flow)
    lawyerSaveDraft: (caseId, lawyerId, lawyerName, draftContent) =>
        api.post(`/api/v1/cases/transition/${caseId}/save-draft`, { lawyerId, lawyerName, draftContent }),

    // LITIGANT: Approve/Reject draft
    litigantApproveDraft: (caseId, litigantId, litigantName) =>
        api.post(`/api/v1/cases/transition/${caseId}/approve-draft`, { litigantId, litigantName }),
    litigantRejectDraft: (caseId, litigantId, litigantName, reason) =>
        api.post(`/api/v1/cases/transition/${caseId}/reject-draft`, { litigantId, litigantName, reason }),

    // JUDGE: Cognizance and Stage advancement
    judgeTakeCognizance: (caseId, judgeId, judgeName) =>
        api.post(`/api/v1/cases/transition/${caseId}/take-cognizance`, { judgeId, judgeName }),
    judgeAdvanceStage: (caseId, judgeId, judgeName) =>
        api.post(`/api/v1/cases/transition/${caseId}/advance-stage`, { judgeId, judgeName }),

    // SYSTEM: Summons served
    markSummonsServed: (caseId) => api.post(`/api/v1/cases/transition/${caseId}/summons-served`),

    // Get case health
    getCaseHealth: (caseId) => api.get(`/api/v1/cases/transition/${caseId}/health`),
};

export default api;