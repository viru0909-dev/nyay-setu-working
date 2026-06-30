import React, { useState } from 'react';
import { Scale, FileText, User, Gavel, Shield } from 'lucide-react';

export default function CaseSummaryViewer({ caseSummary }) {
    const [activeTab, setActiveTab] = useState('overview');

    if (!caseSummary) {
        return (
            <div style={{
                padding: '2rem',
                textAlign: 'center',
                background: 'var(--bg-glass-subtle)',
                borderRadius: '1rem',
                color: 'var(--text-secondary)'
            }}>
                No structured case summary available. Upload a judgment to generate one.
            </div>
        );
    }

    const {
        case_context = 'N/A',
        petitioner_arguments = [],
        respondent_arguments = [],
        ratio_decidendi = [],
        verdict = 'N/A'
    } = caseSummary;

    const tabs = [
        { id: 'overview', label: 'Overview & Verdict', icon: <Gavel size={16} /> },
        { id: 'petitioner', label: 'Petitioner Arguments', icon: <User size={16} style={{ color: 'var(--color-success)' }} /> },
        { id: 'respondent', label: 'Respondent Arguments', icon: <Scale size={16} style={{ color: 'var(--color-error)' }} /> },
        { id: 'ratio', label: 'Ratio Decidendi', icon: <Shield size={16} style={{ color: 'var(--color-accent-light)' }} /> }
    ];

    const tabHeaderStyle = {
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-glass)',
        marginBottom: '1.5rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem'
    };

    const getTabButtonStyle = (tabId) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.25rem',
        background: activeTab === tabId ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
        border: activeTab === tabId ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
        borderRadius: '0.75rem',
        color: activeTab === tabId ? 'var(--color-accent-light)' : 'var(--text-secondary)',
        fontWeight: activeTab === tabId ? '700' : '500',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s ease-in-out'
    });

    const contentBoxStyle = {
        background: 'var(--bg-glass-subtle)',
        border: 'var(--border-glass-subtle)',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-glass-subtle)',
        color: 'var(--text-main)',
        minHeight: '200px'
    };

    return (
        <div style={{ marginTop: '1.5rem', width: '100%' }}>
            <h4 style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                color: 'var(--text-main)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <FileText size={18} style={{ color: 'var(--color-accent-light)' }} />
                Structured Case Summarization
            </h4>

            {/* Tab Headers */}
            <div style={tabHeaderStyle}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={getTabButtonStyle(tab.id)}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={contentBoxStyle}>
                {activeTab === 'overview' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <h5 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--color-accent-light)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                Case Facts & Context
                            </h5>
                            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                                {case_context}
                            </p>
                        </div>
                        <div style={{
                            borderTop: '1px solid var(--border-glass)',
                            paddingTop: '1rem'
                        }}>
                            <h5 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--color-success)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                Final Verdict / Order
                            </h5>
                            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>
                                {verdict}
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'petitioner' && (
                    <div>
                        <h5 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--color-success)', marginBottom: '1rem', textTransform: 'uppercase' }}>
                            Petitioner / Prosecution Submissions
                        </h5>
                        {petitioner_arguments.length > 0 ? (
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.25rem', margin: 0 }}>
                                {petitioner_arguments.map((arg, idx) => (
                                    <li key={idx} style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                                        {arg}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                                No specific arguments extracted for the petitioner.
                            </p>
                        )}
                    </div>
                )}

                {activeTab === 'respondent' && (
                    <div>
                        <h5 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--color-error)', marginBottom: '1rem', textTransform: 'uppercase' }}>
                            Respondent / Defense Submissions
                        </h5>
                        {respondent_arguments.length > 0 ? (
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.25rem', margin: 0 }}>
                                {respondent_arguments.map((arg, idx) => (
                                    <li key={idx} style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                                        {arg}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                                No specific arguments extracted for the respondent.
                            </p>
                        )}
                    </div>
                )}

                {activeTab === 'ratio' && (
                    <div>
                        <h5 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--color-accent-light)', marginBottom: '1rem', textTransform: 'uppercase' }}>
                            Ratio Decidendi (Legal Reasoning)
                        </h5>
                        {ratio_decidendi.length > 0 ? (
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.25rem', margin: 0 }}>
                                {ratio_decidendi.map((ratio, idx) => (
                                    <li key={idx} style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                                        {ratio}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                                No specific ratio decidendi extracted.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
