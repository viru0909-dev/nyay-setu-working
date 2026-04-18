import { useState, useEffect, useRef } from 'react';
import { Search, Brain, GitBranch, Cpu, Scale, CheckCircle, Loader2, Sparkles, BookOpen } from 'lucide-react';

const STAGES = [
    { key: 'understanding', label: 'Understanding', icon: Brain, description: 'Analyzing your query...' },
    { key: 'searching', label: 'Searching Kanoon', icon: Search, description: 'Searching Indian Kanoon database...' },
    { key: 'routing', label: 'Routing', icon: GitBranch, description: 'Determining AI model...' },
    { key: 'reasoning', label: 'Reasoning', icon: Cpu, description: 'Legal reasoning in progress...' },
    { key: 'verdict', label: 'Verdict', icon: Scale, description: 'Preparing final conclusion...' },
];

export default function ReasoningPanel({ stages = {}, reasoningText = '', kanoonResults = [], isActive = false }) {
    const reasoningRef = useRef(null);

    // Auto-scroll reasoning text
    useEffect(() => {
        if (reasoningRef.current) {
            reasoningRef.current.scrollTop = reasoningRef.current.scrollHeight;
        }
    }, [reasoningText]);

    if (!isActive) return null;

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '320px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 25,
            animation: 'slideInLeft 0.4s ease-out',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <Sparkles size={18} color="#818cf8" />
                <span style={{
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: '#e2e8f0',
                    letterSpacing: '-0.01em'
                }}>
                    Deep Legal Research
                </span>
            </div>

            {/* Stages List */}
            <div style={{
                padding: '0.75rem 1rem',
                flex: stages['reasoning']?.status === 'active' || stages['reasoning']?.status === 'complete' ? '0 0 auto' : '1',
                overflowY: 'auto'
            }}>
                {STAGES.map((stage, index) => {
                    const stageData = stages[stage.key];
                    const status = stageData?.status || 'pending';
                    const message = stageData?.message || stage.description;

                    return (
                        <div key={stage.key} style={{
                            display: 'flex',
                            gap: '0.75rem',
                            padding: '0.6rem 0',
                            opacity: status === 'pending' ? 0.35 : 1,
                            transition: 'all 0.3s ease'
                        }}>
                            {/* Status Indicator */}
                            <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                background: status === 'complete'
                                    ? 'rgba(16, 185, 129, 0.2)'
                                    : status === 'active'
                                        ? 'rgba(99, 102, 241, 0.2)'
                                        : 'rgba(255,255,255,0.05)',
                                border: status === 'complete'
                                    ? '1px solid rgba(16, 185, 129, 0.4)'
                                    : status === 'active'
                                        ? '1px solid rgba(99, 102, 241, 0.4)'
                                        : '1px solid rgba(255,255,255,0.1)',
                                transition: 'all 0.3s ease'
                            }}>
                                {status === 'complete' ? (
                                    <CheckCircle size={14} color="#10b981" />
                                ) : status === 'active' ? (
                                    <Loader2 size={14} color="#818cf8" style={{ animation: 'spin 1s linear infinite' }} />
                                ) : (
                                    <stage.icon size={12} color="#64748b" />
                                )}
                            </div>

                            {/* Stage Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: '0.78rem',
                                    fontWeight: '700',
                                    color: status === 'active' ? '#818cf8' : status === 'complete' ? '#10b981' : '#94a3b8',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '0.15rem'
                                }}>
                                    {stage.label}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#94a3b8',
                                    lineHeight: '1.4',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: stage.key !== 'routing' ? 'nowrap' : 'normal'
                                }}>
                                    {message}
                                </div>

                                {/* Kanoon Results (Stage 2) */}
                                {stage.key === 'searching' && kanoonResults.length > 0 && status !== 'pending' && (
                                    <div style={{ marginTop: '0.4rem' }}>
                                        {kanoonResults.map((r, i) => (
                                            <div key={i} style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '0.4rem',
                                                padding: '0.3rem 0.5rem',
                                                marginTop: '0.25rem',
                                                background: 'rgba(99, 102, 241, 0.08)',
                                                borderRadius: '0.4rem',
                                                border: '1px solid rgba(99, 102, 241, 0.15)'
                                            }}>
                                                <BookOpen size={11} color="#818cf8" style={{ marginTop: '2px', flexShrink: 0 }} />
                                                <span style={{
                                                    fontSize: '0.68rem',
                                                    color: '#c7d2fe',
                                                    lineHeight: '1.3',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical'
                                                }}>
                                                    {r.title}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Reasoning Stream (Stage 4) */}
            {reasoningText && (
                <div style={{
                    flex: 1,
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0
                }}>
                    <div style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        color: '#818cf8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em'
                    }}>
                        Chain of Thought
                    </div>
                    <div
                        ref={reasoningRef}
                        style={{
                            flex: 1,
                            padding: '0 1rem 1rem',
                            overflowY: 'auto',
                            fontSize: '0.72rem',
                            color: '#cbd5e1',
                            lineHeight: '1.6',
                            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                        }}
                    >
                        {reasoningText}
                        <span style={{
                            display: 'inline-block',
                            width: '6px',
                            height: '14px',
                            background: '#818cf8',
                            marginLeft: '2px',
                            animation: 'blink 1s step-end infinite',
                            verticalAlign: 'middle'
                        }} />
                    </div>
                </div>
            )}

            {/* CSS Animations */}
            <style>{`
                @keyframes slideInLeft {
                    from { transform: translateX(-100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
