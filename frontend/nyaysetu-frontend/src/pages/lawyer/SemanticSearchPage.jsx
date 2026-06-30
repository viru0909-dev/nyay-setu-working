import React, { useState } from 'react';
import { Search, Scale, ShieldAlert, BookOpen, Loader2, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

export default function SemanticSearchPage() {
    const [query, setQuery] = useState('');
    const [limit, setLimit] = useState(5);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setSearched(true);
        try {
            const response = await api.get('/api/ai/precedents/search', {
                params: { query, limit }
            });
            setResults(response.data || []);
        } catch (err) {
            console.error('Error fetching semantic search results:', err);
            setError(err.response?.data?.error || 'Failed to complete semantic search. Make sure AI microservice is running.');
        } finally {
            setLoading(false);
        }
    };

    const glassStyle = {
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'var(--glass-blur)',
        border: 'var(--border-glass-strong)',
        borderRadius: '1.5rem',
        padding: '2rem',
        boxShadow: 'var(--shadow-glass-strong)',
        marginBottom: '2rem'
    };

    const inputStyle = {
        flex: 1,
        padding: '1rem 1.5rem',
        borderRadius: '1rem',
        border: '1px solid var(--border-glass)',
        background: 'rgba(255, 255, 255, 0.05)',
        color: 'var(--text-main)',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.2s'
    };

    const selectStyle = {
        padding: '1rem',
        borderRadius: '1rem',
        border: '1px solid var(--border-glass)',
        background: 'var(--bg-glass-strong)',
        color: 'var(--text-main)',
        cursor: 'pointer',
        outline: 'none'
    };

    const buttonStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '1rem 2rem',
        borderRadius: '1rem',
        border: 'none',
        background: 'var(--color-accent)',
        color: 'var(--text-main)',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.2s'
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Scale size={32} style={{ color: 'var(--color-accent-light)' }} />
                    Semantic Precedents Search
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    Query Indian legal database (IPC, Constitution, and court documents) using natural language semantic retrieval.
                </p>
            </div>

            {/* Search Bar Container */}
            <div style={glassStyle}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Search for legal precedents (e.g., 'punishment for theft under IPC')"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-light)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-glass)'}
                    />
                    <select
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        style={selectStyle}
                    >
                        <option value={3}>Top 3</option>
                        <option value={5}>Top 5</option>
                        <option value={10}>Top 10</option>
                    </select>
                    <button type="submit" disabled={loading} style={buttonStyle}>
                        {loading ? <Loader2 className="spin" size={20} /> : <Search size={20} />}
                        Search
                    </button>
                </form>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{
                    ...glassStyle,
                    background: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: 'var(--color-error)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <ShieldAlert size={20} />
                    {error}
                </div>
            )}

            {/* Loader */}
            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
                    <Loader2 size={48} className="spin" style={{ color: 'var(--color-accent-light)' }} />
                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
                </div>
            )}

            {/* Search Results */}
            {searched && !loading && !error && (
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={20} style={{ color: 'var(--color-accent-light)' }} />
                        Relevance Matches ({results.length})
                    </h2>
                    {results.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {results.map((result, index) => (
                                <div key={index} style={{
                                    ...glassStyle,
                                    background: 'var(--bg-glass-subtle)',
                                    border: 'var(--border-glass-subtle)'
                                }}>
                                    {/* Card Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent-light)' }}>
                                            <BookOpen size={18} />
                                            <span style={{ fontWeight: '700', fontSize: '1rem' }}>
                                                {result.source.replace('.txt', '').replace('.pdf', '')}
                                            </span>
                                            {result.page > 0 && (
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                    — Page {result.page}
                                                </span>
                                            )}
                                        </div>
                                        {/* Score Indicator */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-success)' }}>
                                                {result.relevance}% Match
                                            </span>
                                            <div style={{ width: '100px', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${result.relevance}%`, height: '100%', background: 'var(--color-success)' }} />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Matching Content */}
                                    <p style={{
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.7',
                                        whiteSpace: 'pre-wrap',
                                        margin: 0
                                    }}>
                                        {result.page_content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ ...glassStyle, textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No relevant precedents found matching your query.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
