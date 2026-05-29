import { motion } from 'framer-motion';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';

export default function GuestLockedCard({
    title,
    description,
    unlockItems = [],
    onUnlock,
}) {
    return (
        <motion.div
            className="guest-locked-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
        >
            <div className="guest-locked-card__glow" aria-hidden />
            <span className="guest-locked-card__badge">
                <Lock size={12} />
                Guest Access
            </span>
            <div className="guest-locked-card__header">
                <div className="guest-locked-card__icon-wrap">
                    <Lock size={20} strokeWidth={2.2} />
                </div>
                <div>
                    <h4 className="guest-locked-card__title">{title}</h4>
                    <p className="guest-locked-card__desc">{description}</p>
                </div>
            </div>
            {unlockItems.length > 0 && (
                <ul className="guest-locked-card__features">
                    {unlockItems.map((item) => (
                        <li key={item} className="guest-locked-card__feature">
                            <CheckCircle2 size={16} />
                            {item}
                        </li>
                    ))}
                </ul>
            )}
            <button type="button" className="guest-btn-primary" onClick={onUnlock}>
                Continue with an account
                <ArrowRight size={16} />
            </button>
        </motion.div>
    );
}
