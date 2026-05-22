import { useState } from 'react';
import {
    FileEdit, Send, Bell, Users, ShieldCheck, Gavel, Scale
} from 'lucide-react';

// STAGE DEFINITIONS

const STAGES = [
    {
        label: 'Drafting',
        icon: FileEdit,
        tooltip: 'Your case petition is being prepared. If filed via Vakil-Friend, the AI drafts it for your review.',
        color: '#8b5cf6'
    },
    {
        label: 'Filing',
        icon: Send,
        tooltip: 'The petition has been submitted to the court registry for formal acceptance.',
        color: '#6366f1'
    },
    {
        label: 'Notice Issued',
        icon: Bell,
        tooltip: 'The court has taken cognizance and issued summons/notice to the respondent.',
        color: '#3b82f6'
    },
    {
        label: 'Hearings',
        icon: Users,
        tooltip: 'Court hearings are underway. Attend scheduled dates via Virtual Court or in-person.',
        color: '#0ea5e9'
    },
    {
        label: 'Evidence',
        icon: ShieldCheck,
        tooltip: 'Both parties present evidence. Upload and verify documents via BSA §63(4) certification.',
        color: '#14b8a6'
    },
    {
        label: 'Judgment',
        icon: Gavel,
        tooltip: 'Arguments are complete. The judge is deliberating and will deliver the verdict.',
        color: '#10b981'
    },
    {
        label: 'Verdict / Closed',
        icon: Scale,
        tooltip: 'The verdict has been delivered. You may file an appeal within the statutory period if needed.',
        color: '#f59e0b'
    }
];

// STATUS → STAGE MAPPING
// Maps backend CaseStatus enum values to a 0-based stage index.

const STATUS_TO_STAGE = {
    // Drafting (stage 0)
    'PENDING':               0,
    'DRAFT_REVIEW':          0,
    'DRAFT_PENDING_CLIENT':  0,
    'AWAITING_DOCUMENTS':    0,

    // Filing (stage 1)
    'OPEN':                  1,
    'FIR_FILED':             1,
    'PENDING_COGNIZANCE':    1,
    'READY_FOR_COURT':       1,
    'APPROVED':              1,

    // Notice Issued (stage 2)
    'COGNIZANCE_PERIOD':     2,
    'IN_ADMISSION':          2,
    'SUMMONS_SERVED':        2,

    // Hearings (stage 3)
    'IN_PROGRESS':           3,
    'TRIAL_READY':           3,
    'UNDER_REVIEW':          3,

    // Evidence (stage 4)  — driven by judicialStage override

    // Judgment (stage 5)
    'JUDGMENT_PENDING':      5,

    // Appeal / Closed (stage 6)
    'COMPLETED':             6,
    'CLOSED':                6,
    'ON_HOLD':               3  // fallback
};

/**
 * Resolve the active stage index.
 * If the backend provides a `judicialStage` number (1-7 from the Judge workflow),
 * we map it to a 0-based stepper index:
 *   judicialStage 1 = Cognizance      → stepper 2 (Notice Issued)
 *   judicialStage 2 = Summons          → stepper 2 (Notice Issued)
 *   judicialStage 3 = Hearings         → stepper 3 (Hearings)
 *   judicialStage 4 = Evidence         → stepper 4 (Evidence)
 *   judicialStage 5 = Arguments        → stepper 4 (Evidence — still in trial phase)
 *   judicialStage 6 = Judgment Pending → stepper 5 (Judgment)
 *   judicialStage 7 = Verdict          → stepper 6 (Appeal/Closed)
 */
function resolveStage(status, judicialStage) {
    // If judge has explicitly set the judicial stage, prefer it
    if (judicialStage != null && judicialStage >= 1) {
        const jsMap = { 1: 2, 2: 2, 3: 3, 4: 4, 5: 4, 6: 5, 7: 6 };
        return jsMap[judicialStage] ?? STATUS_TO_STAGE[status] ?? 0;
    }
    return STATUS_TO_STAGE[status] ?? 0;
}

// COMPONENT

/**
 * CaseStepper — visual 7-stage judicial workflow tracker.
 *
 * @param {string}  currentStatus   - CaseStatus enum value from backend
 * @param {number}  [judicialStage] - Optional 1-7 judicial stage from judge
 * @param {boolean} [compact=false] - Render a smaller version for cards
 */
export default function CaseStepper({ currentStatus, judicialStage, compact = false }) {
    const activeIndex = resolveStage(currentStatus, judicialStage);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // ── Compact mode (for dashboard cards) ──────────────────────────────
    if (compact) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                marginTop: '0.5rem',
                width: '100%'
            }}>
                {STAGES.map((stage, i) => {
                    const isCompleted = i < activeIndex;
                    const isActive = i === activeIndex;

                    return (
                        <div
                            key={stage.label}
                            title={`${stage.label}${isActive ? ' (Current)' : ''}`}
                            style={{
                                flex: 1,
                                height: '4px',
                                borderRadius: '2px',
                                background: isCompleted
                                    ? 'var(--color-primary)'
                                    : isActive
                                        ? `linear-gradient(90deg, var(--color-primary) 50%, rgba(30,42,68,0.15) 50%)`
                                        : 'rgba(30, 42, 68, 0.1)',
                                transition: 'all 0.4s ease',
                                position: 'relative'
                            }}
                        >
                            {isActive && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-2px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: 'var(--color-primary)',
                                    boxShadow: '0 0 6px color-mix(in srgb, var(--color-primary) 60%, transparent)',
                                    animation: 'stepperPulse 2s ease-in-out infinite'
                                }} />
                            )}
                        </div>
                    );
                })}
                <span style={{
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    color: 'var(--color-primary)',
                    marginLeft: '6px',
                    whiteSpace: 'nowrap'
                }}>
                    {STAGES[activeIndex]?.label}
                </span>
            </div>
        );
    }

    // ── Full mode (for Case Detail page) ────────────────────────────────
    return (
        <div style={{
            background: 'var(--bg-glass-strong)',
            border: 'var(--border-glass-strong)',
            borderRadius: '1.5rem',
            padding: '2rem',
            marginBottom: '2rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative top gradient bar */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: `linear-gradient(90deg, ${STAGES.map(s => s.color).join(', ')})`,
                opacity: 0.7
            }} />

            <h3 style={{
                fontSize: '1.15rem',
                fontWeight: '700',
                color: 'var(--text-main)',
                marginBottom: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <Scale size={20} color="var(--color-primary)" />
                Case Progress
            </h3>
            <p style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                marginBottom: '1.75rem'
            }}>
                Stage {activeIndex + 1} of {STAGES.length} — <strong style={{ color: 'var(--color-primary)' }}>{STAGES[activeIndex]?.label}</strong>
            </p>

            {/* Stepper Track */}
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                position: 'relative',
                padding: '0 1rem'
            }}>
                {/* Background connector line */}
                <div style={{
                    position: 'absolute',
                    top: '22px',
                    left: 'calc(1rem + 22px)',
                    right: 'calc(1rem + 22px)',
                    height: '3px',
                    background: 'rgba(30, 42, 68, 0.1)',
                    borderRadius: '2px',
                    zIndex: 0
                }} />
                {/* Active progress line */}
                <div style={{
                    position: 'absolute',
                    top: '22px',
                    left: 'calc(1rem + 22px)',
                    width: `calc(${(activeIndex / (STAGES.length - 1)) * 100}% - ${(activeIndex / (STAGES.length - 1)) * 44}px)`,
                    height: '3px',
                    background: 'var(--color-primary)',
                    borderRadius: '2px',
                    zIndex: 1,
                    transition: 'width 0.6s ease'
                }} />

                {STAGES.map((stage, i) => {
                    const Icon = stage.icon;
                    const isCompleted = i < activeIndex;
                    const isActive = i === activeIndex;
                    const isFuture = i > activeIndex;
                    const isHovered = hoveredIndex === i;

                    return (
                        <div
                            key={stage.label}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                position: 'relative',
                                zIndex: 2,
                                cursor: 'default'
                            }}
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {/* Node Circle */}
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: isCompleted
                                    ? 'var(--color-primary)'
                                    : isActive
                                        ? 'white'
                                        : 'rgba(30, 42, 68, 0.06)',
                                border: isActive
                                    ? '3px solid var(--color-primary)'
                                    : isCompleted
                                        ? '3px solid var(--color-primary)'
                                        : '2px solid rgba(30, 42, 68, 0.15)',
                                boxShadow: isActive
                                    ? '0 0 0 6px color-mix(in srgb, var(--color-primary) 15%, transparent), 0 4px 12px color-mix(in srgb, var(--color-primary) 25%, transparent)'
                                    : isCompleted
                                        ? '0 2px 8px color-mix(in srgb, var(--color-primary) 20%, transparent)'
                                        : 'none',
                                transition: 'all 0.3s ease',
                                transform: isHovered ? 'scale(1.12)' : 'scale(1)'
                            }}>
                                <Icon
                                    size={20}
                                    color={
                                        isCompleted ? 'white'
                                            : isActive ? 'var(--color-primary)'
                                                : 'rgba(30, 42, 68, 0.3)'
                                    }
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                            </div>

                            {/* Label */}
                            <span style={{
                                marginTop: '0.6rem',
                                fontSize: '0.75rem',
                                fontWeight: isActive ? '700' : '500',
                                color: isActive
                                    ? 'var(--color-primary)'
                                    : isCompleted
                                        ? 'var(--text-main)'
                                        : 'var(--text-secondary)',
                                textAlign: 'center',
                                transition: 'all 0.2s'
                            }}>
                                {stage.label}
                            </span>

                            {/* Active pulse ring */}
                            {isActive && (
                                <div style={{
                                    position: 'absolute',
                                    top: '0px',
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '50%',
                                    border: '2px solid var(--color-primary)',
                                    animation: 'stepperRing 2s ease-in-out infinite',
                                    pointerEvents: 'none'
                                }} />
                            )}

                            {/* Tooltip (on hover) */}
                            {isHovered && (
                                <div style={{
                                    position: 'absolute',
                                    top: '56px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: 'var(--text-main)',
                                    color: 'white',
                                    padding: '0.6rem 0.85rem',
                                    borderRadius: '0.6rem',
                                    fontSize: '0.75rem',
                                    lineHeight: '1.4',
                                    width: '180px',
                                    textAlign: 'center',
                                    zIndex: 100,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                                    animation: 'tooltipFadeIn 0.2s ease',
                                    pointerEvents: 'none'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '-5px',
                                        left: '50%',
                                        transform: 'translateX(-50%) rotate(45deg)',
                                        width: '10px',
                                        height: '10px',
                                        background: 'var(--text-main)'
                                    }} />
                                    {stage.tooltip}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Next Steps callout */}
            <div style={{
                marginTop: '1.5rem',
                padding: '0.85rem 1.25rem',
                background: 'color-mix(in srgb, var(--color-primary) 6%, transparent)',
                border: '1px solid color-mix(in srgb, var(--color-primary) 15%, transparent)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
            }}>
                <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '1px'
                }}>
                    💡
                </div>
                <div>
                    <p style={{
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: 'var(--color-primary)',
                        marginBottom: '0.2rem'
                    }}>
                        Next Step
                    </p>
                    <p style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.5',
                        margin: 0
                    }}>
                        {STAGES[activeIndex]?.tooltip}
                    </p>
                </div>
            </div>

            {/* Keyframe animations */}
            <style>{`
                @keyframes stepperPulse {
                    0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
                    50% { opacity: 0.6; transform: translateX(-50%) scale(1.4); }
                }
                @keyframes stepperRing {
                    0% { transform: scale(1); opacity: 0.6; }
                    50% { transform: scale(1.35); opacity: 0; }
                    100% { transform: scale(1); opacity: 0; }
                }
                @keyframes tooltipFadeIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(4px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>
        </div>
    );
}
