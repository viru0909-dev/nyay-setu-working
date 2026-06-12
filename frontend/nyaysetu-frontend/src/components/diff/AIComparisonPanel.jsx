import { useEffect, useState } from 'react';
import { analyzeAiDiff } from './DiffHighlighter';
import { compareAiArtifacts } from '../../services/aiSummaryService';

/**
 * Shows AI interpretation differences: added, removed, and condensed sections.
 */
export default function AIComparisonPanel({
    originalText,
    summaryText
}) {
    const [aiDiff, setAiDiff] = useState({
        added: [],
        removed: [],
        condensed: []
    });

    useEffect(() => {
        if (!originalText || !summaryText) {
            return;
        }

        let cancelled = false;

        async function loadDiff() {
            try {
                const backendDiff =
                    await compareAiArtifacts(
                        originalText,
                        summaryText
                    );

                if (!cancelled) {
                    setAiDiff(backendDiff);
                }
            } catch {
                if (!cancelled) {
                    setAiDiff(
                        analyzeAiDiff(
                            originalText,
                            summaryText
                        )
                    );
                }
            }
        }

        loadDiff();

        return () => {
            cancelled = true;
        };
    }, [originalText, summaryText]);

    const sectionStyle = {
        flex: '1 1 250px',
        padding: '1rem',
        borderRadius: '10px',
        border: '1px solid #374151',
        background: '#0f172a'
    };

    const listStyle = {
        color: '#d1d5db',
        lineHeight: '1.8',
        paddingLeft: '1.25rem',
        margin: 0
    };

    const renderList = (items, emptyLabel) => {
        if (!items.length) {
            return (
                <p style={{ color: '#6b7280', margin: 0 }}>
                    {emptyLabel}
                </p>
            );
        }

        return (
            <ul style={listStyle}>
                {items.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        );
    };

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
                AI Interpretation Differences
            </h3>

            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap'
                }}
            >
                <div style={sectionStyle}>
                    <h4
                        style={{
                            color: '#34d399',
                            marginBottom: '0.75rem'
                        }}
                    >
                        AI Added
                    </h4>
                    {renderList(
                        aiDiff.added,
                        'No additions detected'
                    )}
                </div>

                <div style={sectionStyle}>
                    <h4
                        style={{
                            color: '#f87171',
                            marginBottom: '0.75rem'
                        }}
                    >
                        AI Removed
                    </h4>
                    {renderList(
                        aiDiff.removed,
                        'No removals detected'
                    )}
                </div>

                <div style={sectionStyle}>
                    <h4
                        style={{
                            color: '#fbbf24',
                            marginBottom: '0.75rem'
                        }}
                    >
                        AI Condensed
                    </h4>
                    {renderList(
                        aiDiff.condensed,
                        'No condensed sections detected'
                    )}
                </div>
            </div>
        </div>
    );
}
