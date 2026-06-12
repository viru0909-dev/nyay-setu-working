import { analyzeDiff } from './DiffHighlighter';

/**
 * Lists detected diff blocks and scrolls the viewer to the selected change.
 */
export default function DiffNavigator({
    originalText,
    revisedText,
    blockPrefix = 'diff-block',
    scrollContainerId = 'diff-scroll-container'
}) {
    const { blocks } = analyzeDiff(originalText, revisedText);

    if (blocks.length === 0) {
        return null;
    }

    const scrollToChange = (blockId) => {
        const target = document.getElementById(
            `${blockPrefix}-${blockId.replace('change-', '')}`
        );

        const container = document.getElementById(scrollContainerId);

        if (target && container) {
            const top =
                target.offsetTop -
                container.offsetTop -
                40;

            container.scrollTo({
                top: Math.max(0, top),
                behavior: 'smooth'
            });
        } else if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    };

    return (
        <div
            style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                border: '1px solid #374151',
                borderRadius: '12px',
                background: '#0f172a'
            }}
        >
            <h3
                style={{
                    color: '#ffffff',
                    marginBottom: '0.75rem',
                    fontSize: '1rem'
                }}
            >
                Diff Navigator ({blocks.length} changes)
            </h3>

            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    maxHeight: '120px',
                    overflowY: 'auto'
                }}
            >
                {blocks.map((block, index) => (
                    <button
                        key={block.id}
                        type="button"
                        onClick={() => scrollToChange(block.id)}
                        style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #374151',
                            background:
                                block.type === 'modified'
                                    ? '#78350f'
                                    : block.type === 'added'
                                        ? '#14532d'
                                        : '#7f1d1d',
                            color: '#ffffff',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            textAlign: 'left',
                            maxWidth: '100%'
                        }}
                        title={block.label}
                    >
                        Change {index + 1}
                        {block.type === 'modified' ? ' (modified)' : ''}
                    </button>
                ))}
            </div>
        </div>
    );
}
