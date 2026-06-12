import { useState, useEffect, useMemo, useCallback } from 'react';
import DocumentDiffViewer from '../../components/diff/DocumentDiffViewer';
import FileUploadPanel from '../../components/diff/FileUploadPanel';
import { extractTextFromFile } from '../../services/documentDiffService';
import { uploadDocument } from '../../services/documentUploadService';
import VersionSelector from '../../components/diff/VersionSelector';
import { summarizeText } from '../../services/aiSummaryService';
import AIComparisonPanel from '../../components/diff/AIComparisonPanel';
import {
    getVersions,
    compareVersions
} from '../../services/documentVersionService';

/**
 * Merges backend version metadata with local text content.
 * Backend is primary for metadata; local state retains extracted text.
 */
function mergeVersionsWithBackend(localVersions, backendVersions) {
    if (!backendVersions?.length) {
        return localVersions;
    }

    const merged = backendVersions.map((backendVersion) => {
        const id = `v${backendVersion.versionNumber}`;
        const localMatch = localVersions.find(
            (local) => local.id === id
        );

        return {
            id,
            label:
                localMatch?.label ||
                `Version ${backendVersion.versionNumber}`,
            text: localMatch?.text || '',
            uploadedBy: backendVersion.uploadedBy,
            uploaderName:
                backendVersion.uploadedBy ||
                localMatch?.uploaderName,
            uploadedAt:
                backendVersion.uploadedAt ||
                localMatch?.uploadedAt,
            fileHash:
                backendVersion.fileHash ||
                localMatch?.fileHash,
            isVerified:
                backendVersion.isVerified ??
                localMatch?.isVerified,
            backendVersionId: backendVersion.id,
            versionNumber: backendVersion.versionNumber
        };
    });

    localVersions.forEach((localVersion) => {
        if (!merged.some((item) => item.id === localVersion.id)) {
            merged.push(localVersion);
        }
    });

    return merged.sort((a, b) => {
        const aNum = parseInt(String(a.id).replace('v', ''), 10);
        const bNum = parseInt(String(b.id).replace('v', ''), 10);
        return aNum - bNum;
    });
}

export default function DocumentComparisonPage() {
    const [originalText, setOriginalText] = useState('');
    const [revisedText, setRevisedText] = useState('');
    const [uploadWarning, setUploadWarning] = useState('');
    const [aiSummary, setAiSummary] = useState('');
    const [versions, setVersions] = useState([]);
    const [documentId, setDocumentId] = useState(null);
    const [backendVersions, setBackendVersions] = useState([]);
    const [baseVersion, setBaseVersion] = useState('');
    const [compareVersion, setCompareVersion] = useState('');
    const [pendingVersionType, setPendingVersionType] =
        useState('new');

    const displayVersions = useMemo(
        () =>
            mergeVersionsWithBackend(
                versions,
                backendVersions
            ),
        [versions, backendVersions]
    );

    const baseMetadata = useMemo(
        () =>
            displayVersions.find(
                (version) => version.id === baseVersion
            ) || null,
        [displayVersions, baseVersion]
    );

    const compareMetadata = useMemo(
        () =>
            displayVersions.find(
                (version) => version.id === compareVersion
            ) || null,
        [displayVersions, compareVersion]
    );

    useEffect(() => {
        const baseDoc = displayVersions.find(
            (version) => version.id === baseVersion
        );
        const compareDoc = displayVersions.find(
            (version) => version.id === compareVersion
        );

        if (baseDoc?.text) {
            setOriginalText(baseDoc.text);
        }

        if (compareDoc?.text) {
            setRevisedText(compareDoc.text);
        }
    }, [baseVersion, compareVersion, displayVersions]);

    useEffect(() => {
        if (!documentId) return;
        loadVersions();
    }, [documentId]);

    useEffect(() => {
        const base = displayVersions.find(
            (version) => version.id === baseVersion
        );
        const compare = displayVersions.find(
            (version) => version.id === compareVersion
        );

        if (
            base?.backendVersionId &&
            compare?.backendVersionId
        ) {
            compareVersions(
                base.backendVersionId,
                compare.backendVersionId
            ).catch((error) => {
                console.warn(
                    'Backend compare unavailable, using client diff',
                    error
                );
            });
        }
    }, [baseVersion, compareVersion, displayVersions]);

    async function loadVersions(id = documentId) {
        if (!id) return;

        try {
            const data = await getVersions(id);
            setBackendVersions(data);
        } catch (error) {
            console.error('Failed to load versions', error);
        }
    }

    const buildVersionEntry = (file, text, uploadedDoc, currentCount) => ({
        id: `v${currentCount + 1}`,
        label: file.name,
        text,
        uploadedAt: uploadedDoc.uploadedAt || new Date().toISOString(),
        uploadedBy: uploadedDoc.uploaderName,
        uploaderName: uploadedDoc.uploaderName,
        fileHash: uploadedDoc.fileHash,
        isVerified: uploadedDoc.isVerified,
        documentId: uploadedDoc.id
    });

    const handleOriginalUpload = async (file) => {
        if (
            displayVersions.length > 0 &&
            pendingVersionType === 'new'
        ) {
            setUploadWarning(
                'You already uploaded a document. Is this a completely different document or a revision of the same one?'
            );
        }

        try {
            const uploadedDoc = await uploadDocument(file);
            const text = await extractTextFromFile(file);

            setDocumentId(uploadedDoc.id);

            const newVersion = buildVersionEntry(
                file,
                text,
                uploadedDoc,
                versions.length
            );

            let updatedVersions = [];

            if (pendingVersionType === 'new') {
                updatedVersions = [newVersion];
                setBaseVersion('');
                setCompareVersion('');
            } else {
                updatedVersions = [...versions, newVersion];
            }

            setVersions(updatedVersions);
            setOriginalText(text);

            if (!baseVersion && updatedVersions.length >= 1) {
                setBaseVersion(updatedVersions[0].id);
            }

            if (pendingVersionType === 'revision') {
                if (updatedVersions.length === 1) {
                    setBaseVersion(updatedVersions[0].id);
                }
                if (updatedVersions.length > 1) {
                    setBaseVersion(updatedVersions[0].id);
                    setCompareVersion(
                        updatedVersions[updatedVersions.length - 1].id
                    );
                }
            }

            try {
                const summary = await summarizeText(text);
                setAiSummary(summary);
            } catch {
                setAiSummary('');
            }

            await loadVersions(uploadedDoc.id);
        } catch (error) {
            console.error('Upload failed', error);
            setUploadWarning(
                `Upload failed: ${error.message || 'Unknown error'}`
            );
        }
    };

    const handleRevisedUpload = async (file) => {
        try {
            const uploadedDoc = await uploadDocument(file);
            const text = await extractTextFromFile(file);

            setDocumentId(uploadedDoc.id);

            const newVersion = buildVersionEntry(
                file,
                text,
                uploadedDoc,
                versions.length
            );

            let updatedVersions = [];

            if (pendingVersionType === 'new') {
                updatedVersions =
                    versions.length > 0
                        ? [...versions, newVersion]
                        : [newVersion];
                setCompareVersion(newVersion.id);
            } else {
                updatedVersions = [...versions, newVersion];
            }

            setVersions(updatedVersions);
            setRevisedText(text);

            if (pendingVersionType === 'revision') {
                if (updatedVersions.length === 1) {
                    setBaseVersion(updatedVersions[0].id);
                }
                if (updatedVersions.length > 1) {
                    if (!baseVersion) {
                        setBaseVersion(updatedVersions[0].id);
                    }
                    setCompareVersion(
                        updatedVersions[updatedVersions.length - 1].id
                    );
                }
            } else if (!baseVersion && updatedVersions.length >= 1) {
                setCompareVersion(newVersion.id);
            }

            await loadVersions(uploadedDoc.id);
        } catch (error) {
            console.error('Upload failed', error);
            setUploadWarning(
                `Upload failed: ${error.message || 'Unknown error'}`
            );
        }
    };

    const handleTimelineClick = useCallback(
        (versionId) => {
            if (!baseVersion) {
                setBaseVersion(versionId);
                return;
            }

            if (baseVersion === versionId) {
                return;
            }

            setCompareVersion(versionId);
        },
        [baseVersion]
    );

    const canCompare = originalText && revisedText;

    return (
        <div
            style={{
                padding: 'clamp(1rem, 3vw, 2rem)',
                color: 'white',
                maxWidth: '1400px',
                margin: '0 auto'
            }}
        >
            <h1>Legal Document Comparison Viewer</h1>

            <div style={{ marginBottom: '1.5rem' }}>
                <label
                    style={{
                        display: 'block',
                        marginBottom: '0.5rem'
                    }}
                >
                    Upload Type
                </label>

                <select
                    value={pendingVersionType}
                    onChange={(e) => {
                        setPendingVersionType(e.target.value);
                        setUploadWarning('');
                    }}
                    style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: '#111827',
                        color: 'white',
                        border: '1px solid #374151',
                        width: '100%',
                        maxWidth: '400px'
                    }}
                >
                    <option value="new">Different Document</option>
                    <option value="revision">
                        Revision of Same Document
                    </option>
                </select>
            </div>

            {uploadWarning && (
                <div
                    style={{
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        background: '#78350f',
                        border: '1px solid #f59e0b',
                        borderRadius: '8px',
                        color: '#fde68a'
                    }}
                >
                    {uploadWarning}
                </div>
            )}

            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2rem',
                    flexWrap: 'wrap'
                }}
            >
                <FileUploadPanel
                    label="Upload Original Document"
                    onFileSelect={handleOriginalUpload}
                />

                <FileUploadPanel
                    label="Upload Revised Document"
                    onFileSelect={handleRevisedUpload}
                />
            </div>

            {displayVersions.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3>Uploaded Versions</h3>

                    {displayVersions.map((version) => (
                        <div
                            key={version.id}
                            style={{
                                padding: '0.75rem',
                                marginBottom: '0.5rem',
                                background: '#111827',
                                border: '1px solid #374151',
                                borderRadius: '8px'
                            }}
                        >
                            <strong>{version.id}</strong> - {version.label}
                        </div>
                    ))}
                </div>
            )}

            {pendingVersionType === 'revision' &&
                displayVersions.length > 0 && (
                    <div
                        style={{
                            display: 'flex',
                            gap: '2rem',
                            marginBottom: '2rem',
                            flexWrap: 'wrap'
                        }}
                    >
                        <VersionSelector
                            label="Base Version"
                            versions={displayVersions}
                            selected={baseVersion}
                            onChange={setBaseVersion}
                        />

                        <VersionSelector
                            label="Compare Version"
                            versions={displayVersions}
                            selected={compareVersion}
                            onChange={setCompareVersion}
                        />
                    </div>
                )}

            {originalText && aiSummary && (
                <AIComparisonPanel
                    originalText={originalText}
                    summaryText={aiSummary}
                />
            )}

            {canCompare && (
                <DocumentDiffViewer
                    originalText={originalText}
                    revisedText={revisedText}
                    versions={displayVersions}
                    baseVersion={baseVersion}
                    compareVersion={compareVersion}
                    baseMetadata={baseMetadata}
                    compareMetadata={compareMetadata}
                    onVersionClick={handleTimelineClick}
                />
            )}
        </div>
    );
}
