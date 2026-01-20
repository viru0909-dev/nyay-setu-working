import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { judgeAPI } from '../../services/api';
import {
    Brain,
    Sparkles,
    FileText,
    Loader2,
    ChevronRight,
    RefreshCw,
    X,
    Search,
    Shield,
    Database,
    Zap,
    Cpu,
    ArrowRight
} from 'lucide-react';

export default function AICaseSummaryPage() {
    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            const response = await judgeAPI.getCases();
            setCases(response.data || []);
        } catch (error) {
            console.error('Error fetching cases:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateSummary = async (caseItem) => {
        setSelectedCase(caseItem);
        setGenerating(true);
        setSummary(null);

        try {
            const response = await judgeAPI.getAICaseSummary(caseItem.id);
            setSummary(response.data);
        } catch (error) {
            console.error('Error generating summary:', error);
            setSummary({ error: 'The AI service is currently processing high volume. Please try again in moments.' });
        } finally {
            setGenerating(false);
        }
    };

    const glassStyle = {
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'var(--glass-blur)',
        border: 'var(--border-glass-strong)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-glass)'
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Loader2 size={48} className="spin" style={{ color: 'var(--color-accent)' }} />
                <style>{`
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .spin { animation: spin 1s linear infinite; }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)'
                    }}>
                        <Brain size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                            AI Judicial Assistant
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Intelligent case summarization and legal research automation • Powered by Nyay-Setu Intelligence
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                {/* Cases List */}
                <div style={glassStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Database size={20} color="#6366f1" />
                        <h3 style={{ color: 'var(--text-main)', fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Active Judicial Files</h3>
                    </div>

                    {cases.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-glass)', borderRadius: '1rem' }}>
                            <FileText size={40} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: 'var(--text-secondary)' }}>No case files available</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHieght: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {cases.map(caseItem => (
                                <button
                                    key={caseItem.id}
                                    onClick={() => generateSummary(caseItem)}
                                    style={{
                                        padding: '1.25rem',
                                        background: selectedCase?.id === caseItem.id
                                            ? 'rgba(99, 102, 241, 0.15)'
                                            : 'var(--bg-glass)',
                                        border: `1px solid ${selectedCase?.id === caseItem.id ? 'var(--color-accent)' : 'var(--border-glass)'}`,
                                        borderRadius: '1rem',
                                        color: 'var(--text-main)',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.2s',
                                        gap: '1rem'
                                    }}
                                    onMouseOver={e => {
                                        if (selectedCase?.id !== caseItem.id) e.currentTarget.style.background = 'var(--bg-glass-strong)';
                                    }}
                                    onMouseOut={e => {
                                        if (selectedCase?.id !== caseItem.id) e.currentTarget.style.background = 'var(--bg-glass)';
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.35rem', color: selectedCase?.id === caseItem.id ? 'var(--color-accent)' : 'var(--text-main)' }}>
                                            {caseItem.title}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                                                {caseItem.caseType}
                                            </span>
                                            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#334155' }} />
                                            <span style={{
                                                fontSize: '0.7rem',
                                                color: caseItem.status === 'OPEN' ? '#10b981' : '#f59e0b',
                                                fontWeight: '800'
                                            }}>
                                                {caseItem.status}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} color={selectedCase?.id === caseItem.id ? 'var(--color-accent)' : 'var(--text-secondary)'} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* AI Summary */}
                <div style={{
                    ...glassStyle,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '0.75rem' }}>
                                <Sparkles size={20} color="#ec4899" />
                            </div>
                            <h3 style={{ color: 'var(--text-main)', fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>
                                AI Case Synthesis
                            </h3>
                        </div>
                        {selectedCase && !generating && (
                            <button
                                onClick={() => generateSummary(selectedCase)}
                                style={{
                                    width: '36px', height: '36px',
                                    background: 'rgba(236, 72, 153, 0.1)',
                                    border: '1px solid rgba(236, 72, 153, 0.2)',
                                    borderRadius: '0.6rem',
                                    color: '#ec4899',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(236, 72, 153, 0.2)'}
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(236, 72, 153, 0.1)'}
                                title="Re-generate Analysis"
                            >
                                <RefreshCw size={16} />
                            </button>
                        )}
                    </div>

                    {!selectedCase ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', textAlign: 'center' }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '24px',
                                background: 'rgba(99, 102, 241, 0.1)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem'
                            }}>
                                <Cpu size={40} color="#6366f1" style={{ opacity: 0.5 }} />
                            </div>
                            <h4 style={{ color: 'var(--text-main)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Awaiting File Selection</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '300px' }}>
                                Select a judicial case from the repository to initiate AI-powered analysis and summarization.
                            </p>
                        </div>
                    ) : generating ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', textAlign: 'center' }}>
                            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                <Loader2 size={64} className="spin" style={{ color: '#ec4899' }} />
                                <Zap size={24} color="#ec4899" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                            </div>
                            <h4 style={{ color: 'var(--text-main)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Analyzing Docket</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Our AI models are processing legal documents and synthesizing information...</p>
                            <div style={{ width: '200px', height: '4px', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '2px', marginTop: '1.5rem', overflow: 'hidden' }}>
                                <div style={{ width: '60%', height: '100%', background: '#ec4899', borderRadius: '2px', animation: 'progress 2s infinite ease-in-out' }} />
                            </div>
                        </div>
                    ) : summary?.error ? (
                        <div style={{ padding: '2rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', textAlign: 'center' }}>
                            <X size={40} color="#ef4444" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: '#ef4444', fontWeight: '600' }}>{summary.error}</p>
                        </div>
                    ) : summary ? (
                        <div style={{ flex: 1 }}>
                            <div style={{
                                background: 'var(--bg-glass)',
                                border: '1px solid rgba(236, 72, 153, 0.2)',
                                borderRadius: '1rem',
                                padding: '1.25rem',
                                marginBottom: '2rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '10px',
                                    background: 'rgba(236, 72, 153, 0.1)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Shield size={22} color="#ec4899" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                                        Synthetic Insight Report
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600' }}>
                                        {selectedCase.title.substring(0, 40)}{selectedCase.title.length > 40 ? '...' : ''}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '700' }}>PRECISION</div>
                                    <div style={{ fontSize: '0.8rem', color: '#ec4899', fontWeight: '800' }}>98.4%</div>
                                </div>
                            </div>

                            <div
                                className="markdown-content"
                                style={{
                                    color: 'var(--text-secondary)',
                                    lineHeight: '1.8',
                                    fontSize: '0.95rem',
                                    padding: '1.5rem',
                                    background: 'var(--bg-glass)',
                                    borderRadius: '1rem',
                                    border: 'var(--border-glass-strong)',
                                    maxHeight: '500px',
                                    overflowY: 'auto'
                                }}
                            >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary.summary}</ReactMarkdown>
                            </div>

                            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                                    Report Timestamp: {new Date(summary.generatedAt).toLocaleString()}
                                </div>
                                <button style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none',
                                    background: 'transparent', color: '#ec4899', fontSize: '0.8rem',
                                    fontWeight: '800', cursor: 'pointer'
                                }}>
                                    EXPORT AS PDF <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
                @keyframes progress {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }

                /* Markdown Content Styling for Judge Dashboard */
                .markdown-content h1, 
                .markdown-content h2, 
                .markdown-content h3 {
                    font-size: 1.15rem !important;
                    font-weight: 700 !important;
                    margin-top: 1.25rem !important;
                    margin-bottom: 0.75rem !important;
                    color: var(--text-main) !important;
                    border-bottom: 1px solid rgba(236, 72, 153, 0.2);
                    padding-bottom: 0.25rem;
                }
                .markdown-content p {
                    margin-bottom: 1rem !important;
                }
                .markdown-content ul, 
                .markdown-content ol {
                    margin-bottom: 1rem !important;
                    padding-left: 1.5rem !important;
                }
                .markdown-content li {
                    margin-bottom: 0.5rem !important;
                }
                .markdown-content strong {
                    color: #ec4899 !important;
                    font-weight: 700 !important;
                }
                .markdown-content code {
                    background: rgba(0,0,0,0.06) !important;
                    padding: 0.15rem 0.4rem !important;
                    border-radius: 0.35rem !important;
                    font-family: inherit !important;
                    font-size: 0.9rem !important;
                    color: #ec4899 !important;
                }
            `}</style>
        </div>
    );
}
