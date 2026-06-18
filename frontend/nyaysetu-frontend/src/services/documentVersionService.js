import api from './api';

export async function getVersions(documentId) {
    const response = await api.get(
        `/api/documents/${documentId}/versions`
    );

    return response.data;
}

export async function compareVersions(
    baseVersionId,
    compareVersionId
) {
    const response = await api.post(
        '/api/documents/compare',
        {
            baseVersionId,
            compareVersionId
        }
    );

    return response.data;
}
