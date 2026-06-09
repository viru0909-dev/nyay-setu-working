
import { useState } from 'react';
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
    const [aiSummary, setAiSummary] =
        useState('');
    const [baseVersion, setBaseVersion] =
        useState('v1');

    const [compareVersion, setCompareVersion] =
        useState('v3');
    const handleOriginalUpload =
        async (file) => {
            const text =
                await extractTextFromFile(file);

            setOriginalText(text);

            const summary =
                await summarizeText(text);

            setAiSummary(summary);
        };

    const handleRevisedUpload =
        async (file) => {
            const text =
                await extractTextFromFile(file);

            setRevisedText(text);
        };

    const versions = [
        {
            id: 'v1',
            label: 'Version 1'
        },
        {
            id: 'v2',
            label: 'Version 2'
        },
        {
            id: 'v3',
            label: 'Version 3'
        }
    ];
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
            </div>
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
            {originalText && revisedText && (
                <DocumentDiffViewer
                    originalText={originalText}
                    revisedText={revisedText}
                />
            )}
        </div>
    );
} 