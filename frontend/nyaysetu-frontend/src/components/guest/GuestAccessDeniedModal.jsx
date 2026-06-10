import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, ArrowRight } from 'lucide-react';

export default function GuestAccessDeniedModal({
    isOpen,
    feature = 'this feature',
    onClose,
    onUpgrade,
    onContinue,
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="guest-upgrade-title"
                    className="guest-modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="guest-modal"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.94, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 8 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                        <div className="guest-modal__icon">
                            <UserPlus size={24} />
                        </div>
                        <h3 id="guest-upgrade-title" className="guest-modal__title">
                            Create an account to continue
                        </h3>
                        <p className="guest-modal__desc">
                            You are exploring as a guest. To <strong>{feature}</strong>, sign up in under a minute — we will bring you right back to where you left off.
                        </p>
                        <div className="guest-modal__actions">
                            {onContinue && (
                                <button type="button" className="guest-btn-secondary" onClick={onContinue}>
                                    Keep exploring
                                </button>
                            )}
                            <button type="button" className="guest-btn-primary" onClick={onUpgrade}>
                                Create free account
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
