// Centralized API configuration for frontend
// This ensures consistent API base URL across all components

const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const PROD_BACKEND = 'https://nyaysetubackend.onrender.com';

const DEFAULT_NLP_PORT = '8001';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    (isLocalhost ? 'http://localhost:8080' : PROD_BACKEND);

// FastAPI NLP Orchestrator base URL (TrOCR, ML models)
export const NLP_BASE_URL = import.meta.env.VITE_NLP_BASE_URL ||
    (isLocalhost ? `http://localhost:${DEFAULT_NLP_PORT}` : PROD_BACKEND);

export default API_BASE_URL;
