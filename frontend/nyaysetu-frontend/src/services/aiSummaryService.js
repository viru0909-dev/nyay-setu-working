import api from './api';

export async function summarizeText(text) {
    const response = await api.post('/api/ai/summarize', {
        text
    });

    return response.data.summary;
}

export async function compareAiArtifacts(
    originalText,
    summaryText
) {
    const response = await api.post(
        '/api/ai/artifacts/compare',
        {
            originalText,
            summaryText
        }
    );

    return response.data;
}
