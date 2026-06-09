export async function getDocumentVersions(documentId) {
    return [
        {
            id: 'v1',
            label: 'Version 1',
            createdAt: '2026-06-01'
        },
        {
            id: 'v2',
            label: 'Version 2',
            createdAt: '2026-06-03'
        },
        {
            id: 'v3',
            label: 'Version 3',
            createdAt: '2026-06-07'
        }
    ];
}