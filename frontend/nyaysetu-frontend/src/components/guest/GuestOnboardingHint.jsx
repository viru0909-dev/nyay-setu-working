import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Bot, FileText, Sparkles } from 'lucide-react';
import useGuest from '../../hooks/useGuest';
import { GUEST_ONBOARDING_STEPS } from '../../lib/guest';

const STEP_ICONS = [BookOpen, Bot, FileText];

export default function GuestOnboardingHint() {
    const { isGuest, hasDismissedOnboarding, dismissOnboarding } = useGuest();
    const [step, setStep] = useState(0);
    const [dismissed, setDismissed] = useState(false);

    if (!isGuest || hasDismissedOnboarding() || dismissed) {
        return null;
    }

    const StepIcon = STEP_ICONS[step] || Sparkles;

    const handleDismiss = () => {
        dismissOnboarding();
        setDismissed(true);
    };

    const handleNext = () => {
        if (step >= GUEST_ONBOARDING_STEPS.length - 1) {
            handleDismiss();
            return;
        }
        setStep((s) => s + 1);
    };

    // Refactor Fix: Standardized glassmorphism design system alignment layout properties
    const containerStyle = {
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
        padding: '20px',
        maxWidth: '380px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
    };

    // Refactor Fix: Explicit structural layout containment bounding parameters for buttons
    const nextButtonStyle = {
        maxWidth: '160px',
        width: '100%',
        alignSelf: 'flex-end',
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer'
    };

    return (
        <motion.div
            style={containerStyle}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25 }}
        >
            <div className="guest-onboarding__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span className="guest-onboarding__label" style={{ fontWeight: 500, fontSize: '0.875rem', opacity: 0.9 }}>
                    Quick tour · {step + 1}/{GUEST_ONBOARDING_STEPS.length}
                </span>
                {/* Refactor Fix: Pure zero-dependency high-utility inline SVG close button vector path */}
                <button 
                    type="button" 
                    className="guest-btn-ghost" 
                    onClick={handleDismiss} 
                    aria-label="Dismiss tips"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '16px', height: '16px', opacity: 0.85 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="guest-onboarding__icon-row" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div className="guest-onboarding__step-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)' }}>
                            <StepIcon size={18} />
                        </div>
                        <p className="guest-onboarding__text" style={{ fontSize: '0.92rem', lineHeight: '1.4', margin: 0, opacity: 0.95 }}>
                            {GUEST_ONBOARDING_STEPS[step]}
                        </p>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="guest-onboarding__progress" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={GUEST_ONBOARDING_STEPS.length} style={{ display: 'flex', gap: '6px', width: '100%' }}>
                {GUEST_ONBOARDING_STEPS.map((_, i) => (
                    <span
                        key={i}
                        className={`guest-onboarding__progress-seg${i <= step ? ' guest-onboarding__progress-seg--active' : ''}`}
                        style={{ height: '4px', flex: 1, borderRadius: '2px', background: i <= step ? 'var(--text-primary, #ffffff)' : 'rgba(255, 255, 255, 0.15)', transition: 'background 0.2s ease' }}
                    />
                ))}
            </div>

            <button 
                type="button" 
                className="guest-btn-primary" 
                style={nextButtonStyle} 
                onClick={handleNext}
            >
                {step >= GUEST_ONBOARDING_STEPS.length - 1 ? 'Start exploring' : 'Next tip'}
            </button>
        </motion.div>
    );
}

