import React from "react";

const ShortcutRow = ({
  action,
  shortcut,
}) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "12px 0",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
    }}
  >
    <span>{action}</span>

    <kbd
      style={{
        padding: "6px 12px",
        borderRadius: "8px",
        background: "#1f2937",
        color: "white",
        fontWeight: "600",
      }}
    >
      {shortcut}
    </kbd>
  </div>
);

export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "#111827",
          color: "white",
          borderRadius: "18px",
          padding: "24px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "1.8rem",
              }}
            >
              Keyboard Shortcuts
            </h2>

            <p
              style={{
                opacity: 0.7,
                marginTop: "8px",
              }}
            >
              Navigate Nyay Setu faster
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <ShortcutRow
          action="Open shortcuts help"
          shortcut="Shift + /"
        />

        <ShortcutRow
          action="Close modal"
          shortcut="Esc"
        />

        <ShortcutRow
          action="Go to Home"
          shortcut="g + h"
        />

        <ShortcutRow
          action="Open AI Assistant"
          shortcut="/"
        />

        <ShortcutRow
          action="Open AI Assistant"
          shortcut="g + c"
        />
      </div>
    </div>
  );
}