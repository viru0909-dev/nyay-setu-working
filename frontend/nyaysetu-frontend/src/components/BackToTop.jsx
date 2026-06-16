import { useState, useEffect } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
      // Throttle scroll updates using requestAnimationFrame for performance
    const onScroll = () => {
        requestAnimationFrame(() => setVisible(window.scrollY > 300));
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  return (
    <button
      className="back-to-top-btn"
      // Smooth scroll back to top of pagegit
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        zIndex: "var(--z-back-to-top, 500)",
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        background: "var(--primary-blue, #2563EB)",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        fontSize: "1.2rem",
        boxShadow: "0 4px 12px rgba(37,99,235,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: "opacity 0.3s, transform 0.2s",
      }}
      aria-label="Back to top"
      title="Back to top"
    >
      ↑
    </button>
  );
}
