import SideBySidePanel from './SideBySidePanel';
import VersionTimeline from './VersionTimeline';
import DocumentMetadataPanel from './DocumentMetadataPanel';
import DiffHighlighter from './DiffHighlighter';
import DiffNavigator from './DiffNavigator';
import { useRef } from 'react';

export default function DocumentDiffViewer({
    originalText,
    revisedText,
    versions,
    baseVersion,
    compareVersion,
    baseMetadata,
    compareMetadata,
    onVersionClick
}) {
    const leftScrollRef = useRef(null);
    const rightScrollRef = useRef(null);
    const isSyncingRef = useRef(false);
    const border_color = '#374151';
    const background_color = '#111827';
    const syncScroll = (source, target) => {
        if (isSyncingRef.current || !source.current || !target.current) {
            return;
        }

        isSyncingRef.current = true;
        target.current.scrollTop = source.current.scrollTop;
        requestAnimationFrame(() => {
            isSyncingRef.current = false;
        });
    };

    return (
        <div
            style={{
                background: `${background_color}`,
                padding: '24px',
                borderRadius: '12px',
                border: `1px solid ${border_color}`
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
                Green = Added | Red = Removed | Amber = Modified
            </p>

            <VersionTimeline
                versions={versions}
                baseVersion={baseVersion}
                compareVersion={compareVersion}
                onVersionClick={onVersionClick}
            />

            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2rem',
                    marginTop: '1rem',
                    flexWrap: 'wrap'
                }}
            >
                <DocumentMetadataPanel
                    title={
                        baseMetadata?.id
                            ? `Version ${baseMetadata.id.replace('v', '')}`
                            : 'Base Version Metadata'
                    }
                    metadata={baseMetadata}
                />

                <DocumentMetadataPanel
                    title={
                        compareMetadata?.id
                            ? `Version ${compareMetadata.id.replace('v', '')}`
                            : 'Compare Version Metadata'
                    }
                    metadata={compareMetadata}
                />
            </div>

            <DiffNavigator
                originalText={originalText}
                revisedText={revisedText}
            />

            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2rem',
                    flexDirection: 'row',
                    flexWrap: 'wrap'
                }}
            >
                <SideBySidePanel
                    title="Original Version"
                    content={originalText}
                    compareText={revisedText}
                    isOriginal={true}
                    scrollRef={leftScrollRef}
                    partnerScrollRef={rightScrollRef}
                    isSyncingRef={isSyncingRef}
                    onScroll={() => syncScroll(leftScrollRef, rightScrollRef)}
                />

                <SideBySidePanel
                    title="Revised Version"
                    content={revisedText}
                    compareText={originalText}
                    isOriginal={false}
                    scrollRef={rightScrollRef}
                    partnerScrollRef={leftScrollRef}
                    isSyncingRef={isSyncingRef}
                    onScroll={() => syncScroll(rightScrollRef, leftScrollRef)}
                />
            </div>

            <div
                id="diff-scroll-container"
                style={{
                    lineHeight: '2',
                    fontSize: '15px',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '420px',
                    overflowY: 'auto',
                    padding: '0.5rem',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                }}
            >
                <DiffHighlighter
                    originalText={originalText}
                    revisedText={revisedText}
                />
            </div>
        </div>
    );
}
