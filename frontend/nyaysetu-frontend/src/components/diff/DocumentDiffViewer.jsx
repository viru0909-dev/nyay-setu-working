import { diffWords } from 'diff';
import SideBySidePanel from './SideBySidePanel';
import VersionTimeline from './VersionTimeline';

export default function DocumentDiffViewer({
    originalText,
    revisedText,
    versions,
    baseVersion,
    compareVersion
}) {
    const differences = diffWords(
        originalText,
        revisedText
    );

    return (
        <div
            style={{
                background: '#111827',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #374151'
            }}
        >
            <h2
                style={{
                    marginBottom: '20px',
                    color: '#ffffff'
                }}
            >
                Legal Document Comparison
            </h2>
            <p
                style={{
                    marginBottom: '20px',
                    color: '#9ca3af'
                }}
            >
                Green = Added Text | Red = Removed Text
            </p>
            <VersionTimeline
                versions={versions}
                baseVersion={baseVersion}
                compareVersion={compareVersion}
            />
            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}
            >
                <SideBySidePanel
                    title="Original Version"
                    content={originalText}
                    compareText={revisedText}
                    isOriginal={true}
                />

                <SideBySidePanel
                    title="Revised Version"
                    content={revisedText}
                    compareText={originalText}
                    isOriginal={false}
                />
            </div>

            <div
                style={{
                    lineHeight: '2',
                    fontSize: '15px',
                    whiteSpace: 'pre-wrap'
                }}
            >
                {differences.map((part, index) => (
                    <span
                        key={index}
                        style={{
                            backgroundColor: part.added
                                ? '#14532d'
                                : part.removed
                                    ? '#7f1d1d'
                                    : 'transparent',

                            color: part.added || part.removed
                                ? '#ffffff'
                                : '#d1d5db',

                            padding:
                                part.added || part.removed
                                    ? '2px 4px'
                                    : '0',

                            borderRadius:
                                part.added || part.removed
                                    ? '4px'
                                    : '0',

                            textDecoration: part.removed
                                ? 'line-through'
                                : 'none'
                        }}
                    >
                        {part.value}
                    </span>
                ))}
            </div>
        </div>

    );
}