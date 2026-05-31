import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
import { GUEST_SEARCH_VISIBLE_LIMIT } from '../../lib/guest';

/**
 * Shows first N items clearly, blurs the rest with a signup CTA.
 */
export default function GuestBlurredResults({
    items = [],
    renderItem,
    visibleLimit = GUEST_SEARCH_VISIBLE_LIMIT,
    onSignUp,
    signUpLabel = 'Sign up to view all matches',
}) {
    if (!items.length) {
        return null;
    }

    const visible = items.slice(0, visibleLimit);
    const locked = items.slice(visibleLimit);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {visible.map((item, index) => (
                <motion.div
                    key={item.id ?? item.key ?? index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    {renderItem(item, index, false)}
                </motion.div>
            ))}

            {locked.length > 0 && (
                <div className="guest-blur-wrap">
                    <div className="guest-blur-preview" aria-hidden>
                        {locked.slice(0, 2).map((item, index) => (
                            <div key={item.id ?? item.key ?? `locked-${index}`}>
                                {renderItem(item, visibleLimit + index, true)}
                            </div>
                        ))}
                    </div>
                    <div className="guest-blur-overlay">
                        <div className="guest-blur-overlay__icon">
                            <Lock size={20} />
                        </div>
                        <p className="guest-blur-overlay__count">
                            +{locked.length} more match{locked.length > 1 ? 'es' : ''}
                        </p>
                        <p className="guest-blur-overlay__hint">{signUpLabel}</p>
                        <button type="button" className="guest-btn-primary" onClick={onSignUp}>
                            Sign up free
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
