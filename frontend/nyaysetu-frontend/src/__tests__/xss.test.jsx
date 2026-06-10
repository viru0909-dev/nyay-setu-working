import React from "react";
import { render, screen } from "@testing-library/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

describe("XSS sanitization in message rendering", () => {
  const scriptPayload = '<script>alert("xss")</script>';
  const imgPayload = '<img src=x onerror="alert(1)" />';

  test("ReactMarkdown does not produce executable <script> elements", () => {
    const { container } = render(
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {scriptPayload}
      </ReactMarkdown>,
    );

    // No script tag should be present in the rendered DOM
    const script = container.querySelector("script");
    expect(script).toBeNull();

    // The rendered HTML should show escaped script text (no execution)
    expect(container.textContent).toContain('<script>alert("xss")</script>');
  });

  test("Plain JSX text rendering escapes HTML and does not create image with onerror", () => {
    const { container } = render(<div>{imgPayload}</div>);

    // No img element should be created from the raw string
    const img = container.querySelector("img");
    expect(img).toBeNull();

    // Text content should contain the literal markup
    expect(container.textContent).toContain('<img src=x onerror="alert(1)" />');
  });
});
