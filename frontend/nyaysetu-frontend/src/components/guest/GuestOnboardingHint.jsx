import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Bot, FileText, X, Sparkles } from 'lucide-react';
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

    return (
        <motion.div
            className="guest-onboarding"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25 }}
        >
            <div className="guest-onboarding__header">
                <span className="guest-onboarding__label">
                    Quick tour · {step + 1}/{GUEST_ONBOARDING_STEPS.length}
                </span>
                <button type="button" className="guest-btn-ghost" onClick={handleDismiss} aria-label="Dismiss tips">
                    <X size={16} />
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
                    <div className="guest-onboarding__icon-row">
                        <div className="guest-onboarding__step-icon">
                            <StepIcon size={18} />
                        </div>
                        <p className="guest-onboarding__text">{GUEST_ONBOARDING_STEPS[step]}</p>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="guest-onboarding__progress" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={GUEST_ONBOARDING_STEPS.length}>
                {GUEST_ONBOARDING_STEPS.map((_, i) => (
                    <span
                        key={i}
                        className={`guest-onboarding__progress-seg${i <= step ? ' guest-onboarding__progress-seg--active' : ''}`}
                    />
                ))}
            </div>

            <button type="button" className="guest-btn-primary" style={{ width: '100%' }} onClick={handleNext}>
                {step >= GUEST_ONBOARDING_STEPS.length - 1 ? 'Start exploring' : 'Next tip'}
            </button>
        </motion.div>
    );
}
