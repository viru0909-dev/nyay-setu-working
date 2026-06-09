import { diffWords } from 'diff';

export default function SideBySidePanel({
    title,
    content,
    compareText,
    isOriginal = false
}) {
    const diff = diffWords(
        isOriginal ? content : compareText,
        isOriginal ? compareText : content
    );
    return (
        <div
            style={{
                flex: 1,
                padding: '1rem',
                border: '1px solid #374151',
                borderRadius: '12px',
                background: '#111827',
                minHeight: '250px'
            }}
        >
            <h3
                style={{
                    marginBottom: '1rem',
                    color: '#ffffff'
                }}
            >
                {title}
            </h3>

            <div
                style={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.9'
                }}
            >
                {diff.map((part, index) => {
                    if (
                        isOriginal &&
                        part.added
                    )
                        return null;

                    if (
                        !isOriginal &&
                        part.removed
                    )
                        return null;

                    return (
                        <span
                            key={index}
                            style={{
                                background:
                                    part.added
                                        ? '#14532d'
                                        : part.removed
                                        ? '#7f1d1d'
                                        : 'transparent',
                                color: 'white',
                                padding:
                                    part.added ||
                                    part.removed
                                        ? '2px 4px'
                                        : 0,
                                borderRadius:
                                    part.added ||
                                    part.removed
                                        ? '4px'
                                        : 0
                            }}
                        >
                            {part.value}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}