import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

/**
 * Reusable Accordion component with smooth animations,
 * ARIA attributes, and keyboard navigation.
 *
 * @param {string} id — unique identifier for ARIA relationships
 * @param {string} question — the visible title/trigger
 * @param {string} answer — the collapsible content
 * @param {boolean} isOpen — controlled open state
 * @param {function} onToggle — callback when toggled
 * @param {number} index — position index for stagger animation
 */
export default function AccordionItem({ id, question, answer, isOpen, onToggle, index = 0 }) {
    const panelId = `faq-panel-${id}`;
    const headerId = `faq-header-${id}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.35 }}
            style={{
                background: 'var(--bg-surface)',
                border: `1px solid ${isOpen ? 'var(--color-secondary)' : 'var(--border-light)'}`,
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                boxShadow: isOpen ? 'var(--shadow-md)' : 'var(--shadow-sm)',
            }}
        >
            {/* Accordion Trigger */}
            <button
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={onToggle}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onToggle();
                    }
                }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-body)',
                    fontWeight: '600',
                    color: isOpen ? 'var(--color-secondary)' : 'var(--text-main)',
                    lineHeight: '1.5',
                    transition: 'color 0.25s ease, background-color 0.25s ease',
                }}
                onMouseEnter={(e) => {
                    if (!isOpen) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                }}
            >
                <span>{question}</span>
                <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: isOpen
                            ? 'rgba(63, 93, 204, 0.1)'
                            : 'var(--bg-hover)',
                        color: isOpen ? 'var(--color-secondary)' : 'var(--text-muted)',
                        transition: 'background 0.25s ease, color 0.25s ease',
                    }}
                >
                    <ChevronDown size={16} />
                </motion.span>
            </button>

            {/* Accordion Panel */}
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={headerId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div
                            style={{
                                padding: '0 1.5rem 1.5rem',
                                color: 'var(--text-secondary)',
                                fontSize: 'var(--text-body-sm)',
                                lineHeight: '1.8',
                                borderTop: '1px solid var(--border-light)',
                                paddingTop: '1rem',
                                marginTop: '-0.25rem',
                            }}
                        >
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
