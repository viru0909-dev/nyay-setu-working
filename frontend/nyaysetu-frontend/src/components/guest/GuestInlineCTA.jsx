import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function GuestInlineCTA({
    message = 'Create an account to continue this action.',
    onSignUp,
    compact = false,
}) {
    return (
        <motion.div
            role="status"
            className={`guest-inline-cta${compact ? ' guest-inline-cta--compact' : ''}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.22 }}
        >
            <p className="guest-inline-cta__message">
                <Sparkles size={16} />
                <span>{message}</span>
            </p>
            {onSignUp ? (
                <button type="button" className="guest-btn-primary" onClick={onSignUp}>
                    Sign up free
                    <ArrowRight size={14} />
                </button>
            ) : (
                <Link to="/signup" className="guest-btn-primary">
                    Sign up free
                    <ArrowRight size={14} />
                </Link>
            )}
        </motion.div>
    );
}
