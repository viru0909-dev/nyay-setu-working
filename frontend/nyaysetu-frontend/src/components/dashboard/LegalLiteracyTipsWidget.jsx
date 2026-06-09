import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const tips = [
    {
        title: 'Right to Counsel',
        message: 'Every arrested person has the right to consult a lawyer of their choice.'
    },
    {
        title: 'FIR Copy',
        message: 'You have the right to obtain a copy of an FIR filed against you.'
    },
    {
        title: 'Legal Aid',
        message: 'Legal aid is available for eligible citizens who cannot afford legal representation.'
    },
    {
        title: 'Presumption of Innocence',
        message: 'Every accused person is presumed innocent until proven guilty in court.'
    },
    {
        title: 'Consumer Protection',
        message: 'Consumers can seek compensation for defective goods and deficient services.'
    },
    {
        title: 'Women and Arrest',
        message: 'Women are generally not to be arrested after sunset except in special circumstances.'
    }
];

export default function LegalLiteracyTipsWidget() {
    const [activeTipIndex, setActiveTipIndex] = useState(0);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setActiveTipIndex((current) => (current + 1) % tips.length);
        }, 6000);

        return () => window.clearInterval(timer);
    }, []);

    const goToPreviousTip = () => {
        setActiveTipIndex((current) => (current - 1 + tips.length) % tips.length);
    };

    const goToNextTip = () => {
        setActiveTipIndex((current) => (current + 1) % tips.length);
    };

    const activeTip = tips[activeTipIndex];

    return (
        <section
            aria-label="Legal literacy tip"
            style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(243, 244, 246, 0.92) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.14)',
                borderRadius: '1.5rem',
                padding: '1.25rem',
                marginBottom: '2rem',
                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
                backdropFilter: 'blur(12px)'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem', minWidth: 0 }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 8px 20px rgba(99, 102, 241, 0.28)'
                    }}>
                        <Sparkles size={22} color="white" />
                    </div>

                    <div style={{ minWidth: 0 }}>
                        <p style={{
                            margin: 0,
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: '#6366f1'
                        }}>
                            Did You Know?
                        </p>
                        <h3 style={{
                            margin: '0.25rem 0 0.5rem',
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            color: '#111827'
                        }}>
                            {activeTip.title}
                        </h3>
                        <p style={{
                            margin: 0,
                            color: '#374151',
                            lineHeight: 1.6,
                            fontSize: '0.98rem',
                            maxWidth: '60ch'
                        }}>
                            {activeTip.message}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'center' }}>
                    <button
                        type="button"
                        onClick={goToPreviousTip}
                        aria-label="Show previous legal literacy tip"
                        style={iconButtonStyle}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span style={{
                        minWidth: '4.5rem',
                        textAlign: 'center',
                        fontSize: '0.85rem',
                        color: '#6b7280',
                        fontWeight: 600
                    }}>
                        {activeTipIndex + 1} / {tips.length}
                    </span>
                    <button
                        type="button"
                        onClick={goToNextTip}
                        aria-label="Show next legal literacy tip"
                        style={iconButtonStyle}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div style={{
                display: 'flex',
                gap: '0.4rem',
                marginTop: '1rem',
                flexWrap: 'wrap'
            }}>
                {tips.map((tip, index) => (
                    <button
                        key={tip.title}
                        type="button"
                        onClick={() => setActiveTipIndex(index)}
                        aria-label={`Show tip ${index + 1}: ${tip.title}`}
                        aria-pressed={index === activeTipIndex}
                        style={{
                            width: index === activeTipIndex ? '1.75rem' : '0.65rem',
                            height: '0.65rem',
                            borderRadius: '999px',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            background: index === activeTipIndex ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : '#d1d5db',
                            transition: 'all 0.2s ease'
                        }}
                    />
                ))}
            </div>
        </section>
    );
}

const iconButtonStyle = {
    width: '2.25rem',
    height: '2.25rem',
    borderRadius: '999px',
    border: '1px solid rgba(99, 102, 241, 0.16)',
    background: 'white',
    color: '#4f46e5',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(15, 23, 42, 0.05)'
};
