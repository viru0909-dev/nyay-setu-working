
import { useState, useEffect } from 'react';
import DocumentDiffViewer from '../../components/diff/DocumentDiffViewer';
import FileUploadPanel
    from '../../components/diff/FileUploadPanel';

import {
    extractTextFromFile
} from '../../services/documentDiffService';
import VersionSelector
    from '../../components/diff/VersionSelector';
import {
    summarizeText
} from '../../services/aiSummaryService';

import AIComparisonPanel
    from '../../components/diff/AIComparisonPanel';

export default function DocumentComparisonPage() {
    const [originalText, setOriginalText] = useState('');
    const [revisedText, setRevisedText] = useState('');
    const [uploadWarning,
        setUploadWarning] =
        useState('');
    const [aiSummary, setAiSummary] =
        useState('');
    const [versions, setVersions] = useState([]);
    const [baseVersion, setBaseVersion] =
        useState('');

    const [compareVersion, setCompareVersion] =
        useState('');
    const [pendingVersionType,
        setPendingVersionType] =
        useState('new');
    const handleOriginalUpload =
        async (file) => {
            if (
                versions.length > 0 &&
                pendingVersionType === 'new'
            ) {
                setUploadWarning(
                    'You already uploaded a document. Is this a completely different document or a revision of the same one?'
                );
            }
            const text =
                await extractTextFromFile(file);
            const versionId =
                `v${versions.length + 1}`;

            const newVersion = {
                id: versionId,
                label: file.name,
                text,
                uploadedAt:
                    new Date().toISOString()
            };

            let updatedVersions = [];

            if (pendingVersionType === 'new') {
                updatedVersions = [newVersion];

                setBaseVersion('');
                setCompareVersion('');
            }
            else {
                updatedVersions = [
                    ...versions,
                    newVersion
                ];
            }

            setVersions(updatedVersions);

            if (pendingVersionType === 'revision') {

                if (updatedVersions.length === 1) {
                    setBaseVersion(updatedVersions[0].id);
                    setCompareVersion(updatedVersions[0].id);
                }

                if (updatedVersions.length >= 2) {
                    setBaseVersion(updatedVersions[0].id);

                    setCompareVersion(
                        updatedVersions[
                            updatedVersions.length - 1
                        ].id
                    );
                }
            }
            setOriginalText(text);

            const summary =
                await summarizeText(text);

            setAiSummary(summary);
        };

    const handleRevisedUpload =
        async (file) => {
            const text =
                await extractTextFromFile(file);
            const versionId =
                `v${versions.length + 1}`;

            const newVersion = {
                id: versionId,
                label: file.name,
                text,
                uploadedAt:
                    new Date().toISOString()
            };

            let updatedVersions = [];

            if (pendingVersionType === 'new') {
                updatedVersions = [newVersion];

                setBaseVersion('');
                setCompareVersion('');
            }
            else {
                updatedVersions = [
                    ...versions,
                    newVersion
                ];
            }

            setVersions(updatedVersions);

            if (pendingVersionType === 'revision') {

                if (updatedVersions.length === 1) {
                    setBaseVersion(updatedVersions[0].id);
                }

                if (updatedVersions.length > 1) {
                    setCompareVersion(
                        updatedVersions[
                            updatedVersions.length - 1
                        ].id
                    );
                }
            }
            setRevisedText(text);
        };
    useEffect(() => {
        const baseDoc =
            versions.find(
                v => v.id === baseVersion
            );

        const compareDoc =
            versions.find(
                v => v.id === compareVersion
            );

        if (baseDoc) {
            setOriginalText(baseDoc.text);
        }

        if (compareDoc) {
            setRevisedText(compareDoc.text);
        }
    }, [
        baseVersion,
        compareVersion,
        versions
    ]);
    return (
        <div style={{
            padding: '2rem',
            color: 'white'
        }}>
            <h1>
                Legal Document Comparison Viewer
            </h1>

            <div
                style={{
                    marginBottom: '1.5rem'
                }}
            >
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
                        setPendingVersionType(
                            e.target.value
                        );
                        setUploadWarning('');
                    }}
                    style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: '#111827',
                        color: 'white',
                        border: '1px solid #374151'
                    }}
                >
                    <option value="new">
                        Different Document
                    </option>

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
                    marginBottom: '2rem'
                }}
            >
                <FileUploadPanel
                    label="Upload Original Document"
                    onFileSelect={
                        handleOriginalUpload
                    }
                />

                <FileUploadPanel
                    label="Upload Revised Document"
                    onFileSelect={
                        handleRevisedUpload
                    }
                />
                {versions.length > 0 && (
                    <div
                        style={{
                            marginBottom: '2rem'
                        }}
                    >
                        <h3>Uploaded Versions</h3>

                        {versions.map((version) => (
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
                                <strong>{version.id}</strong>
                                {' - '}
                                {version.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {pendingVersionType === 'revision' &&
                versions.length > 0 && (
                    <div
                        style={{
                            display: 'flex',
                            gap: '2rem',
                            marginBottom: '2rem'
                        }}
                    >
                        <VersionSelector
                            label="Base Version"
                            versions={versions}
                            selected={baseVersion}
                            onChange={setBaseVersion}
                        />

                        <VersionSelector
                            label="Compare Version"
                            versions={versions}
                            selected={compareVersion}
                            onChange={setCompareVersion}
                        />
                    </div>
                )}
            {originalText && revisedText && (
                <DocumentDiffViewer
                    originalText={originalText}
                    revisedText={revisedText}
                    versions={versions}
                    baseVersion={baseVersion}
                    compareVersion={compareVersion}
                />
            )}
        </div>
    );
} 