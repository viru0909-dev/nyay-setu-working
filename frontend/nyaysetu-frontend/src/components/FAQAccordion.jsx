import { useState } from "react";

export default function FAQAccordion({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-light)",
        borderRadius: "12px",
        marginBottom: "12px",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "16px",
          background: "transparent",
          border: "none",
          color: "var(--text-main)",
          fontWeight: "600",
          cursor: "pointer",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "1rem",
        }}
      >
        <span>{question}</span>
        <span>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div
          style={{
            padding: "16px",
            borderTop: "1px solid var(--border-light)",
            color: "var(--text-secondary)",
            lineHeight: "1.6",
          }}
        >
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}