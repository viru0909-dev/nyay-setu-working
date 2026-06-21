import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Scale, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import FAQAccordion from "../components/FAQAccordion";
import SearchBar from "../components/SearchBar";
import { faqData } from "../utils/faqData";
import "../styles/faq.css";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: "easeOut" },
  }),
};

export default function FAQ() {
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return faqData;

    return faqData
      .map((section) => {
        const categoryMatches = section.category.toLowerCase().includes(query);
        const matchedFaqs = section.faqs.filter(
          (faq) =>
            faq.question.toLowerCase().includes(query) ||
            faq.answer.toLowerCase().includes(query)
        );

        if (categoryMatches) return section;
        if (matchedFaqs.length > 0) return { ...section, faqs: matchedFaqs };
        return null;
      })
      .filter(Boolean);
  }, [search]);

  const hasResults = filteredData.length > 0;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-main)" }}>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        aria-label="FAQ page header"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary, #7c3aed) 100%)",
          padding: "7rem 1.5rem 5rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* decorative circles */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            pointerEvents: "none",
          }}
        />
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-40px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.18)",
            marginBottom: "1.5rem",
          }}
          aria-hidden="true"
        >
          <Scale size={28} color="#fff" />
        </motion.div>

        <motion.h1
          className="faq-hero-title"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.1}
          style={{
            fontSize: "2.75rem",
            fontWeight: "800",
            color: "#fff",
            margin: "0 auto 1rem",
            maxWidth: "640px",
            fontFamily: "var(--font-heading)",
            lineHeight: "1.2",
          }}
        >
          Frequently Asked Questions
        </motion.h1>

        <motion.p
          className="faq-hero-description"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.2}
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: "1.1rem",
            maxWidth: "520px",
            margin: "0 auto 2.5rem",
            lineHeight: "1.7",
          }}
        >
          Quick answers to common legal questions across Family, Property,
          Criminal, Consumer, and Employment law.
        </motion.p>

        {/* search bar inside hero */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.3}
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-lg)",
            padding: "6px",
            boxShadow: "var(--shadow-lg, 0 8px 32px rgba(0,0,0,0.18))",
          }}
        >
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions, answers, or categories…"
          />
        </motion.div>
      </section>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          padding: "3rem 1.5rem 5rem",
        }}
      >
        {/* result count hint when searching */}
        {search.trim() && hasResults && (
          <p
            aria-live="polite"
            style={{
              fontSize: "0.9rem",
              color: "var(--text-muted)",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            Showing results for{" "}
            <strong style={{ color: "var(--text-main)" }}>
              &ldquo;{search.trim()}&rdquo;
            </strong>
          </p>
        )}

        {/* FAQ categories */}
        {hasResults ? (
          filteredData.map((section) => (
            <FAQAccordion
              key={section.category}
              category={section.category}
              faqs={section.faqs}
            />
          ))
        ) : (
          /* ── Empty state ─────────────────────────────────────── */
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            aria-live="polite"
            role="status"
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-light)",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                fontSize: "3rem",
                display: "block",
                marginBottom: "1rem",
              }}
            >
              🔍
            </span>
            <h2
              style={{
                fontSize: "1.4rem",
                fontWeight: "700",
                color: "var(--text-main)",
                marginBottom: "0.5rem",
              }}
            >
              No FAQs found
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              No results for{" "}
              <strong>&ldquo;{search.trim()}&rdquo;</strong>. Try a different
              keyword.
            </p>
            <button
              onClick={() => setSearch("")}
              style={{
                padding: "10px 22px",
                background: "var(--color-primary)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius-md)",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "0.95rem",
                fontFamily: "var(--font-body)",
              }}
            >
              Clear Search
            </button>
          </motion.div>
        )}

        {/* ── CTA ──────────────────────────────────────────────── */}
        {hasResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              marginTop: "3rem",
              padding: "2.5rem",
              borderRadius: "var(--radius-lg)",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-light)",
              textAlign: "center",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <MessageCircle
              size={36}
              aria-hidden="true"
              style={{ color: "var(--color-primary)", marginBottom: "1rem" }}
            />
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                marginBottom: "0.75rem",
                color: "var(--text-main)",
                fontFamily: "var(--font-heading)",
              }}
            >
              Didn&apos;t find your answer?
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                marginBottom: "1.5rem",
                maxWidth: "420px",
                margin: "0 auto 1.5rem",
                lineHeight: "1.6",
              }}
            >
              Chat with Vakil Friend for personalized AI-powered legal guidance
              tailored to your situation.
            </p>
            <Link
              to="/litigant/vakil-friend"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 28px",
                background: "var(--color-primary)",
                color: "#fff",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "0.975rem",
                transition: "opacity 0.2s ease",
              }}
            >
              <MessageCircle size={16} aria-hidden="true" />
              Chat with Vakil Friend
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  );
}
