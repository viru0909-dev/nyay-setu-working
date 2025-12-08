import axios from 'axios';

// Unified Backend - all requests route through here
const API_BASE_URL = 'http://localhost:8080';

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
    return config;
});

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
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
    upload: (file, metadata) => {
        const formData = new FormData();
        formData.append('file', file);
        if (metadata.category) formData.append('category', metadata.category);
        if (metadata.description) formData.append('description', metadata.description);
        if (metadata.caseId) formData.append('caseId', metadata.caseId);
        return api.post('/api/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    list: () => api.get('/api/documents'),
    getByCase: (caseId) => api.get(`/api/documents/case/${caseId}`),
    download: (id) => api.get(`/api/documents/${id}/download`, { responseType: 'blob' }),
    delete: (id) => api.delete(`/api/documents/${id}`)
};

// Meeting API
export const meetingAPI = {
    schedule: (meetingData) => api.post('/meetings', meetingData),
    list: () => api.get('/meetings'),
    getById: (id) => api.get(`/meetings/${id}`),
    update: (id, data) => api.put(`/meetings/${id}`, data),
};

export default api;
