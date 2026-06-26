import { useState } from "react";
import FAQItem from "./FAQItem";

export default function FAQAccordion({ category, faqs }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const categorySlug = category.toLowerCase().replace(/\s+/g, "-");

  return (
    <section
      aria-label={category}
      style={{ marginBottom: "2.5rem" }}
    >
      <h2
        style={{
          fontSize: "1.4rem",
          fontWeight: "700",
          marginBottom: "1rem",
          color: "var(--text-main)",
          fontFamily: "var(--font-heading)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: "4px",
            height: "1.4rem",
            background: "var(--color-primary)",
            borderRadius: "2px",
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
        {category}
      </h2>

      <div role="list">
        {faqs.map((faq, index) => (
          <div key={index} role="listitem">
            <FAQItem
              itemId={`${categorySlug}-${index}`}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => toggle(index)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
