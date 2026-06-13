import DiffHighlighter from './DiffHighlighter';

/**
 * Side-by-side panel with synchronized scrolling support for long documents.
 */
export default function SideBySidePanel({
    title,
    content,
    compareText,
    isOriginal = false,
    scrollRef,
    onScroll
    
}) {
    const border_color = '#374151';
    const background_color = '#111827';
    return (
        <div
            style={{
                flex: '1 1 300px',
                padding: '1rem',
                border: `1px solid ${border_color}`,
                borderRadius: '12px',
                background: `${background_color}`,
                minHeight: '250px',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <h3
                style={{
                    marginBottom: '1rem',
                    color: '#ffffff',
                    flexShrink: 0
                }}
            >
                {title}
            </h3>

            <div
                ref={scrollRef}
                onScroll={onScroll}
                style={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.9',
                    overflowY: 'auto',
                    maxHeight: '360px',
                    flex: 1
                }}
            >
                <DiffHighlighter
                    originalText={isOriginal ? content : compareText}
                    revisedText={isOriginal ? compareText : content}
                    blockPrefix={isOriginal ? 'side-original' : 'side-revised'}
                    side="side"
                />
            </div>
        </div>
    );
}
