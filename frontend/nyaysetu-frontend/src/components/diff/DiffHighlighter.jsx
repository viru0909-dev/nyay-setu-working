import { diffWords } from 'diff';

/**
 * Groups raw jsdiff word tokens into additions, removals, and modifications.
 * Adjacent removed+added pairs become a single modification block.
 */
export function analyzeDiff(originalText, revisedText) {
    const differences = diffWords(
        originalText || '',
        revisedText || ''
    );

    const blocks = [];
    let blockIndex = 0;

    for (let i = 0; i < differences.length; i++) {
        const part = differences[i];
        const nextPart = differences[i + 1];

        if (part.removed && nextPart?.added) {
            blocks.push({
                id: `change-${blockIndex}`,
                type: 'modified',
                oldValue: part.value.trim(),
                newValue: nextPart.value.trim(),
                label: `${part.value.trim()} → ${nextPart.value.trim()}`
            });
            blockIndex += 1;
            i += 1;
            continue;
        }

        if (part.added) {
            blocks.push({
                id: `change-${blockIndex}`,
                type: 'added',
                value: part.value.trim(),
                label: part.value.trim()
            });
            blockIndex += 1;
            continue;
        }

        if (part.removed) {
            blocks.push({
                id: `change-${blockIndex}`,
                type: 'removed',
                value: part.value.trim(),
                label: part.value.trim()
            });
            blockIndex += 1;
        }
    }

    return {
        differences,
        blocks: blocks.filter((block) => block.label)
    };
}

/**
 * AI artifact diff: classify summary changes vs original document.
 */
export function analyzeAiDiff(originalText, summaryText) {
    const { blocks } = analyzeDiff(
        originalText || '',
        summaryText || ''
    );

    const added = [];
    const removed = [];
    const condensed = [];

    blocks.forEach((block) => {
        if (block.type === 'added') {
            added.push(block.value);
        } else if (block.type === 'removed') {
            removed.push(block.value);
        } else if (block.type === 'modified') {
            if (block.newValue.length < block.oldValue.length) {
                condensed.push(block.oldValue);
            } else {
                added.push(block.newValue);
                removed.push(block.oldValue);
            }
        }
    });

    return { added, removed, condensed };
}

const highlightStyles = {
    added: {
        backgroundColor: '#14532d',
        color: '#ffffff',
        padding: '2px 4px',
        borderRadius: '4px'
    },
    removed: {
        backgroundColor: '#7f1d1d',
        color: '#ffffff',
        padding: '2px 4px',
        borderRadius: '4px',
        textDecoration: 'line-through'
    },
    modifiedOld: {
        backgroundColor: '#78350f',
        color: '#ffffff',
        padding: '2px 4px',
        borderRadius: '4px',
        textDecoration: 'line-through'
    },
    modifiedNew: {
        backgroundColor: '#14532d',
        color: '#ffffff',
        padding: '2px 4px',
        borderRadius: '4px'
    },
    unchanged: {
        backgroundColor: 'transparent',
        color: '#d1d5db',
        padding: 0
    }
};

export default function DiffHighlighter({
    originalText,
    revisedText,
    blockPrefix = 'diff-block',
    side = 'inline'
}) {
    const { differences } = analyzeDiff(originalText, revisedText);

    if (side === 'side') {
        const isOriginal = blockPrefix.includes('original');

        return differences.map((part, index) => {
            if (isOriginal && part.added) {
                return null;
            }

            if (!isOriginal && part.removed) {
                return null;
            }

            const style = part.added
                ? highlightStyles.added
                : part.removed
                    ? highlightStyles.removed
                    : highlightStyles.unchanged;

            return (
                <span key={index} style={style}>
                    {part.value}
                </span>
            );
        });
    }

    let renderedIndex = 0;
    const elements = [];

    for (let index = 0; index < differences.length; index++) {
        const part = differences[index];
        const nextPart = differences[index + 1];

        if (part.removed && nextPart?.added) {
            const blockId = `${blockPrefix}-${renderedIndex}`;
            renderedIndex += 1;

            elements.push(
                <span
                    key={index}
                    id={blockId}
                    data-diff-block={blockId}
                    style={{ whiteSpace: 'pre-wrap' }}
                >
                    <span style={highlightStyles.modifiedOld}>
                        {part.value}
                    </span>
                    <span style={{ color: '#9ca3af' }}> → </span>
                    <span style={highlightStyles.modifiedNew}>
                        {nextPart.value}
                    </span>
                </span>
            );
            index += 1;
            continue;
        }

        if (part.added || part.removed) {
            const blockId = `${blockPrefix}-${renderedIndex}`;
            renderedIndex += 1;
            const style = part.added
                ? highlightStyles.added
                : highlightStyles.removed;

            elements.push(
                <span
                    key={index}
                    id={blockId}
                    data-diff-block={blockId}
                    style={style}
                >
                    {part.value}
                </span>
            );
            continue;
        }

        elements.push(
            <span
                key={index}
                style={highlightStyles.unchanged}
            >
                {part.value}
            </span>
        );
    }

    return elements;
}
