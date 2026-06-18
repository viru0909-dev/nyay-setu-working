import { useState } from "react";
import FAQAccordion from "../components/FAQAccordion";
import { faqData } from "../utils/faqData";
import { Link } from "react-router-dom";

export default function FAQ() {
  const [search, setSearch] = useState("");

  const filteredFaqs = faqData.filter(
    (faq) =>
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase()) ||
      faq.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(filteredFaqs.map((faq) => faq.category))];

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "8rem 1.5rem 4rem",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "3rem",
          fontWeight: "700",
          marginBottom: "1rem",
          color: "var(--text-main)",
        }}
      >
        Frequently Asked Questions
      </h1>

      <p
        style={{
          textAlign: "center",
          color: "var(--text-secondary)",
          marginBottom: "2rem",
        }}
      >
        Find quick answers to common legal and platform-related questions.
      </p>

      <input
        type="text"
        placeholder="Search FAQs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "14px 18px",
          borderRadius: "12px",
          border: "1px solid var(--border-light)",
          background: "var(--bg-surface)",
          color: "var(--text-main)",
          marginBottom: "2rem",
          fontSize: "1rem",
        }}
      />

      {categories.map((category) => (
        <div key={category} style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: "600",
              marginBottom: "1rem",
              color: "var(--text-main)",
            }}
          >
            {category}
          </h2>

          {filteredFaqs
            .filter((faq) => faq.category === category)
            .map((faq, index) => (
              <FAQAccordion
                key={index}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
        </div>
      ))}

      <div
        style={{
          marginTop: "4rem",
          padding: "2.5rem",
          borderRadius: "16px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-light)",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: "700",
            marginBottom: "1rem",
            color: "var(--text-main)",
          }}
        >
          Didn't find your answer?
        </h2>

        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "1.5rem",
          }}
        >
          Chat with Vakil Friend for personalized legal assistance.
        </p>

        <Link
          to="/litigant"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            background: "var(--color-primary)",
            color: "#fff",
            borderRadius: "10px",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          Chat with Vakil Friend
        </Link>
      </div>
    </div>
  );
}