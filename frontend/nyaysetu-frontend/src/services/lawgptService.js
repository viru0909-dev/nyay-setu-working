import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const DEFAULT = isLocalhost ? 'http://localhost:8001' : window.__LAWGPT_BASE__ || '';

const BASE = import.meta.env.VITE_LAWGPT_BASE || DEFAULT;

const client = axios.create({
    baseURL: BASE,
    timeout: 20000,
    headers: { 'Content-Type': 'application/json' },
});

export default {
    generate: (payload) => client.post('/generate', payload),
    generatePdf: (payload) => client.post('/generate/pdf', payload, { responseType: 'blob' }),
    generateDocx: (payload) => client.post('/generate/docx', payload, { responseType: 'blob' }),
};
