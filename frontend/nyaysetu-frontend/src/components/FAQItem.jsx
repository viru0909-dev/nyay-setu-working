import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FAQItem({ question, answer, isOpen, onToggle, itemId }) {
  const panelId = `faq-panel-${itemId}`;
  const btnId = `faq-btn-${itemId}`;

  return (
    <div
      className="faq-item"
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${isOpen ? "var(--color-primary)" : "var(--border-light)"}`,
        borderRadius: "var(--radius-md)",
        marginBottom: "10px",
        overflow: "hidden",
        transition: "border-color 0.2s ease",
      }}
    >
      <button
        id={btnId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="faq-item-trigger"
        style={{
          width: "100%",
          padding: "18px 20px",
          background: isOpen ? "var(--bg-hover)" : "transparent",
          border: "none",
          color: "var(--text-main)",
          fontWeight: "600",
          cursor: "pointer",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          fontSize: "0.975rem",
          fontFamily: "var(--font-body)",
          lineHeight: "1.5",
          transition: "background 0.2s ease",
        }}
      >
        <span>{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          style={{
            flexShrink: 0,
            color: isOpen ? "var(--color-primary)" : "var(--text-muted)",
            display: "flex",
            alignItems: "center",
          }}
          aria-hidden="true"
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={btnId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                padding: "4px 20px 20px",
                borderTop: "1px solid var(--border-light)",
                color: "var(--text-secondary)",
                lineHeight: "1.75",
                fontSize: "0.925rem",
              }}
            >
              <p style={{ margin: "12px 0 0" }}>{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
