import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import CaseDiaryPage from "./CaseDiaryPage";
import { MemoryRouter } from "react-router-dom";

// Mock translation
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k) => k }),
}));

// Mock APIs used by the component
const generateMockItems = (n) =>
  Array.from({ length: n }).map((_, i) => ({
    id: `case-${i}`,
    title: `Case Title ${i}`,
    status: i % 5 === 0 ? "OPEN" : "PENDING",
    createdAt: new Date().toISOString(),
    caseType: "Civil",
  }));

const mockCases = generateMockItems(1000);

vi.mock(
  "../../services/api",
  () => ({
    caseAPI: { list: vi.fn(() => Promise.resolve({ data: mockCases })) },
    clientFirAPI: { listFirs: vi.fn(() => Promise.resolve({ data: [] })) },
    caseAssignmentAPI: { getAvailableLawyers: vi.fn(), proposeLawyer: vi.fn() },
  }),
  { virtual: true },
);

// The project uses Vite + Vitest with jsdom. This test ensures that rendering
// 1,000 timeline items does not place all items in the DOM (i.e., virtualization
// or pagination should limit rendered nodes). We set a generous threshold of 200.

test("renders large dataset without rendering all 1,000 items (virtualization/pagination)", async () => {
  const { container } = render(
    <MemoryRouter>
      <CaseDiaryPage />
    </MemoryRouter>,
  );

  // wait for async load to finish and at least one title to appear
  await waitFor(() => expect(container.querySelector("h3")).toBeTruthy(), {
    timeout: 5000,
  });

  const headings = container.getElementsByTagName("h3");
  const renderedCount = headings.length;

  // If the UI uses pagination or virtualization, renderedCount should be much smaller than 1000.
  // Choose a threshold that indicates virtualization/pagination (200).
  expect(renderedCount).toBeLessThan(200);
});
