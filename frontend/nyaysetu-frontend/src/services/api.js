import axios from 'axios';

// Connect directly to auth-service to bypass gateway issues
const API_BASE_URL = 'http://localhost:8081';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
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
    create: (caseData) => api.post('/cases', caseData),
    list: () => api.get('/cases'),
    getById: (id) => api.get(`/cases/${id}`),
    update: (id, data) => api.put(`/cases/${id}`, data),
    delete: (id) => api.delete(`/cases/${id}`),
};

// Document API
export const documentAPI = {
    upload: (formData) => api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    list: (caseId) => api.get(`/documents?caseId=${caseId}`),
    download: (id) => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
};

// Meeting API
export const meetingAPI = {
    schedule: (meetingData) => api.post('/meetings', meetingData),
    list: () => api.get('/meetings'),
    getById: (id) => api.get(`/meetings/${id}`),
    update: (id, data) => api.put(`/meetings/${id}`, data),
};

export default api;
