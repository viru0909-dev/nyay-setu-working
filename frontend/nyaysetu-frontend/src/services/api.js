import axios from 'axios';

// Use explicit backend URL - Vite proxy can be unreliable
// In development: http://localhost:8080
// In production: Replace with actual backend URL via environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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
    sendMessage: (sessionId, message) => api.post(`/api/vakil-friend/chat/${sessionId}`, { message }),
    completeSession: (sessionId) => api.post(`/api/vakil-friend/complete/${sessionId}`),
    getSession: (sessionId) => api.get(`/api/vakil-friend/session/${sessionId}`),
    getSessions: () => api.get('/api/vakil-friend/sessions'),
};

// Case Assignment API (Auto-assign judges, lawyer selection)
export const caseAssignmentAPI = {
    autoAssignJudge: (caseId) => api.post(`/api/cases/${caseId}/assign-judge`),
    getAvailableLawyers: () => api.get('/api/cases/lawyers/available'),
    assignLawyer: (caseId, lawyerId) => api.post(`/api/cases/${caseId}/assign-lawyer`, { lawyerId }),
    getPendingCases: () => api.get('/api/cases/pending-assignment'),
    getJudgeWorkload: () => api.get('/api/cases/judge-workload'),
};

export default api;
