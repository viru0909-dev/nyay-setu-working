import api from './api';

export async function uploadDocument(file) {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('category', 'LEGAL_DOCUMENT');
    formData.append('description', file.name);

    const response = await api.post(
        '/api/documents/upload',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    );

    return response.data;
}
