import { Search, X } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Search FAQs..." }) {
  const handleClear = () => {
    onChange({ target: { value: "" } });
  };

  return (
    <div
      role="search"
      style={{ position: "relative", maxWidth: "640px", margin: "0 auto" }}
    >
      <Search
        size={18}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "16px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--text-muted)",
          pointerEvents: "none",
        }}
      />
      <input
        type="search"
        role="searchbox"
        aria-label="Search frequently asked questions"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete="off"
        style={{
          width: "100%",
          padding: "14px 44px",
          paddingRight: value ? "44px" : "16px",
          borderRadius: "var(--radius-lg)",
          border: "1.5px solid var(--border-light)",
          background: "var(--bg-surface)",
          color: "var(--text-main)",
          fontSize: "1rem",
          fontFamily: "var(--font-body)",
          outline: "none",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          boxSizing: "border-box",
        }}
        className="faq-search-input"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            padding: "4px",
            borderRadius: "var(--radius-sm)",
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
