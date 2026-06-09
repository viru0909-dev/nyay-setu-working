export default function AIComparisonPanel({
    originalText,
    summaryText
}) {
    return (
        <div
            style={{
                marginBottom: '2rem',
                border: '1px solid #374151',
                borderRadius: '12px',
                padding: '1.5rem',
                background: '#111827'
            }}
        >
            <h3
                style={{
                    color: '#ffffff',
                    marginBottom: '1rem'
                }}
            >
                Document Revision Comparison
            </h3>

            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap'
                }}
            >
                {/* Original Document */}
                <div
                    style={{
                        flex: 1,
                        minWidth: '300px',
                        padding: '1rem',
                        borderRadius: '10px',
                        border: '1px solid #374151',
                        background: '#0f172a'
                    }}
                >
                    <h4
                        style={{
                            color: '#60a5fa',
                            marginBottom: '1rem'
                        }}
                    >
                        Original Document
                    </h4>

                    <p
                        style={{
                            color: '#d1d5db',
                            lineHeight: '1.8',
                            whiteSpace: 'pre-wrap'
                        }}
                    >
                        {originalText}
                    </p>
                </div>

                {/* AI Summary */}
                <div
                    style={{
                        flex: 1,
                        minWidth: '300px',
                        padding: '1rem',
                        borderRadius: '10px',
                        border: '1px solid #374151',
                        background: '#0f172a'
                    }}
                >
                    <h4
                        style={{
                            color: '#34d399',
                            marginBottom: '1rem'
                        }}
                    >
                        Revised Document
                    </h4>

                    <p
                        style={{
                            color: '#d1d5db',
                            lineHeight: '1.8',
                            whiteSpace: 'pre-wrap'
                        }}
                    >
                        {summaryText}
                    </p>
                </div>
            </div>
        </div>
    );
}