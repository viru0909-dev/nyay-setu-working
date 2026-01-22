import axios from 'axios';

// Use explicit backend URL - Vite proxy can be unreliable
// In development: http://localhost:8080
// In production: Replace with actual backend URL via environment variable
// Use explicit backend URL - Vite proxy can be unreliable
// In development: http://localhost:8080
// In production: Replace with actual backend URL via environment variable
// Check multiple variable names to be safe
// Smart Base URL detection
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const PROD_BACKEND = 'https://nyaysetubackend.onrender.com';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    (isLocalhost ? 'http://localhost:8080' : PROD_BACKEND);

const api = axios.create({
    baseURL: API_BASE_URL,
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

    console.log('API Request:', {
        method: config.method,
        url: config.url,
        hasAuth: !!config.headers.Authorization,
        contentType: config.headers['Content-Type']
    });

    return config;
});

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/api/auth/login', credentials),
    register: (userData) => api.post('/api/auth/register', userData),
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
};

// Case API
export const caseAPI = {
    create: (caseData) => api.post('/api/cases', caseData),
    list: () => api.get('/api/cases'),
    getById: (id) => api.get(`/api/cases/${id}`),
    update: (id, data) => api.put(`/api/cases/${id}`, data),
    delete: (id) => api.delete(`/api/cases/${id}`),
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

        console.log('Uploading with FormData:', {
            file: file.name,
            category: metadata.category,
            description: metadata.description
        });

        // CRITICAL: Don't set Content-Type header - let browser set it with boundary
        return api.post('/api/documents/upload', formData);
    },
    list: () => api.get('/api/documents'),
    getByCase: (caseId) => api.get(`/api/documents/case/${caseId}`),
    download: (id) => api.get(`/api/documents/${id}/download`, { responseType: 'blob' }),
    delete: (id) => api.delete(`/api/documents/${id}`)
};

// Hearing API
export const hearingAPI = {
    schedule: (hearingData) => api.post('/api/hearings/schedule', hearingData),
    getByCaseId: (caseId) => api.get(`/api/hearings/case/${caseId}`),
    getMyHearings: () => api.get('/api/hearings/my'),
    getById: (id) => api.get(`/api/hearings/${id}`),
    join: (id) => api.post(`/api/hearings/${id}/join`),
    leave: (id) => api.post(`/api/hearings/${id}/leave`),
    complete: (id, notes) => api.put(`/api/hearings/${id}/complete`, { judgeNotes: notes }),
    getParticipants: (id) => api.get(`/api/hearings/${id}/participants`)
};

// Meeting API
export const meetingAPI = {
    schedule: (meetingData) => api.post('/api/meetings', meetingData),
    list: () => api.get('/api/meetings'),
    getById: (id) => api.get(`/api/meetings/${id}`),
    update: (id, data) => api.put(`/api/meetings/${id}`, data),
};

// Vakil-Friend Chat API (Chat-First Case Filing)
export const vakilFriendAPI = {
    startSession: () => api.post('/api/vakil-friend/start'),
    startCaseSession: (caseId) => api.post(`/api/vakil-friend/case/${caseId}/start`),
    sendMessage: (sessionId, message) => api.post(`/api/vakil-friend/chat/${sessionId}`, { message }),
    completeSession: (sessionId) => api.post(`/api/vakil-friend/complete/${sessionId}`),
    getSession: (sessionId) => api.get(`/api/vakil-friend/session/${sessionId}`),
    getSessions: () => api.get('/api/vakil-friend/sessions'),
};

// Case Assignment API (Auto-assign judges, lawyer selection)
export const assignmentAPI = {
    autoAssign: (caseId) => api.post(`/api/assignments/case/${caseId}/auto-assign`),
    assignLawyer: (caseId, lawyerId) => api.post(`/api/assignments/case/${caseId}/assign-lawyer`, { lawyerId }),
    getLawyers: () => api.get('/api/users/lawyers'),
};

// Message API
// Message API
export const messageAPI = {
    send: (caseId, message) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const senderId = user?.id;
        return api.post(`/cases/${caseId}/messages`, { message, senderId });
    },
    getMessages: (caseId) => api.get(`/cases/${caseId}/messages`),
};
export const caseAssignmentAPI = {
    autoAssignJudge: (caseId) => api.post(`/api/cases/${caseId}/assign-judge`),
    getAvailableLawyers: () => api.get('/api/cases/lawyers/available'),
    proposeLawyer: (caseId, lawyerId) => api.post(`/api/cases/${caseId}/propose-lawyer`, { lawyerId }),
    respondToProposal: (caseId, status) => api.post(`/api/cases/${caseId}/respond-proposal`, { status }),
    getPendingCases: () => api.get('/api/cases/pending-assignment'),
    getJudgeWorkload: () => api.get('/api/cases/judge-workload'),
};

// Judge API - Case management for judges
export const judgeAPI = {
    getCases: () => api.get('/api/judge/cases'),
    getPendingCases: () => api.get('/api/judge/pending'),
    getUnassignedCases: () => api.get('/api/judge/unassigned'), // Central pool
    claimCase: (id) => api.post(`/api/judge/cases/${id}/claim`),
    getTodaysHearings: () => api.get('/api/judge/hearings/today'),
    getAnalytics: () => api.get('/api/judge/analytics'),
    aiChat: (message, caseId) => api.post('/api/judge/ai-chat', { message, caseId }),
    getAICaseSummary: (caseId) => api.get(`/api/judge/case/${caseId}/ai-summary`),
    scheduleHearingAI: (prompt) => api.post('/api/judge/hearings/schedule-ai', { prompt }),
};

// Lawyer API - Case and client management for lawyers
export const lawyerAPI = {
    getCases: () => api.get('/api/lawyer/cases'),
    getClients: () => api.get('/api/lawyer/clients'),
    getStats: () => api.get('/api/lawyer/stats'),
    generateDraft: (caseId, template) => api.post('/api/lawyer/draft', { caseId, template }),
    saveDraft: (caseId, draft) => api.post('/api/lawyer/draft/save', { caseId, draft }),
};

// Central Brain API
export const brainAPI = {
    chat: (message, sessionId = null) => api.post('/api/brain/chat', { message, sessionId }),
};

// Police API - FIR management for police officers
export const policeAPI = {
    uploadFir: (formData) => api.post('/api/police/fir/upload', formData),
    listFirs: () => api.get('/api/police/fir/list'),
    getFir: (id) => api.get(`/api/police/fir/${id}`),
    verifyFir: (id, formData) => api.post(`/api/police/fir/${id}/verify`, formData),
    getStats: () => api.get('/api/police/stats'),
    getPendingFirs: () => api.get('/api/police/fir/pending'),
    updateFirStatus: (id, status, reviewNotes) => api.put(`/api/police/fir/${id}/status`, null, {
        params: { status, reviewNotes }
    }),
    health: () => api.get('/api/police/health'),
    startInvestigation: (id) => api.post(`/api/police/investigation/${id}/start`),
    submitInvestigation: (id, findings) => api.post(`/api/police/investigation/${id}/submit`, { findings }),
    getInvestigations: () => api.get('/api/police/investigation/list'),

    // New methods for Enhanced Investigation
    uploadEvidence: (id, formData) => api.post(`/api/police/investigation/${id}/evidence`, formData),
    generateAiSummary: (id) => api.get(`/api/police/investigation/${id}/summary`),
    draftCourtSubmission: (id) => api.get(`/api/police/investigation/${id}/draft-submission`),
};

// Client FIR API - For citizens to file FIRs
export const clientFirAPI = {
    fileFir: (formData) => api.post('/api/client/fir', formData),
    listFirs: () => api.get('/api/client/fir/list'),
    getFir: (id) => api.get(`/api/client/fir/${id}`),
    getStats: () => api.get('/api/client/fir/stats'),
};

export default api;


