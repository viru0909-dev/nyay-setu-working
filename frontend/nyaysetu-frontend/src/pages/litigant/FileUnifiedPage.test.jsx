import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";

import FileUnifiedPage from "./FileUnifiedPage";

describe("FileUnifiedPage stepper navigation", () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <FileUnifiedPage />
      </MemoryRouter>,
    );

  it("navigates back using Previous button and preserves form state", async () => {
    const { container } = renderPage();

    // Select first case type card so we can proceed to step 2
    const firstCaseButton = container.querySelector(
      ".horizontal-scroll-cards button",
    );
    expect(firstCaseButton).toBeTruthy();
    fireEvent.click(firstCaseButton);

    // Proceed to Step 2
    fireEvent.click(screen.getByRole("button", { name: /fileUnified.next/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /fileUnified.caseDetails/i }),
      ).toBeInTheDocument(),
    );

    // Fill some fields in Step 2 (use placeholders rendered as i18n keys)
    const titleInput = screen.getByPlaceholderText(
      /fileUnified.caseTitlePlaceholder/i,
    );
    const petitionerInput = screen.getByPlaceholderText(
      /fileUnified.petitionerPlaceholder/i,
    );
    const respondentInput = screen.getByPlaceholderText(
      /fileUnified.respondentPlaceholder/i,
    );
    const descriptionInput = screen.getByPlaceholderText(
      /fileUnified.caseDescriptionPlaceholder/i,
    );

    fireEvent.change(titleInput, { target: { value: "Test Case Title" } });
    fireEvent.change(petitionerInput, { target: { value: "Alice" } });
    fireEvent.change(respondentInput, { target: { value: "Bob" } });
    fireEvent.change(descriptionInput, { target: { value: "Some facts" } });

    // Go to Step 3
    fireEvent.click(screen.getByRole("button", { name: /fileUnified.next/i }));
    await waitFor(() =>
      expect(
        screen.getByText(/fileUnified.clickUploadFiles/i),
      ).toBeInTheDocument(),
    );

    // Click Previous to go back to Step 2
    fireEvent.click(
      screen.getByRole("button", { name: /fileUnified.previous/i }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /fileUnified.caseDetails/i }),
      ).toBeInTheDocument(),
    );

    // Ensure the previously entered values are preserved
    expect(titleInput.value).toBe("Test Case Title");
    expect(petitionerInput.value).toBe("Alice");
    expect(respondentInput.value).toBe("Bob");
  });

  it("allows clicking a completed step indicator to navigate back and preserves state", async () => {
    const { container } = renderPage();

    // Select a case type and move to step 2
    const firstCaseButton = container.querySelector(
      ".horizontal-scroll-cards button",
    );
    fireEvent.click(firstCaseButton);
    fireEvent.click(screen.getByRole("button", { name: /fileUnified.next/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /fileUnified.caseDetails/i }),
      ).toBeInTheDocument(),
    );

    // Fill required fields
    const titleInput2 = screen.getByPlaceholderText(
      /fileUnified.caseTitlePlaceholder/i,
    );
    const descriptionInput2 = screen.getByPlaceholderText(
      /fileUnified.caseDescriptionPlaceholder/i,
    );
    const petitionerInput2 = screen.getByPlaceholderText(
      /fileUnified.petitionerPlaceholder/i,
    );
    const respondentInput2 = screen.getByPlaceholderText(
      /fileUnified.respondentPlaceholder/i,
    );
    fireEvent.change(titleInput2, { target: { value: "Preserve Title" } });
    fireEvent.change(descriptionInput2, { target: { value: "Some facts" } });
    fireEvent.change(petitionerInput2, { target: { value: "Alice" } });
    fireEvent.change(respondentInput2, { target: { value: "Bob" } });

    // Move forward to Step 3
    fireEvent.click(screen.getByRole("button", { name: /fileUnified.next/i }));
    await waitFor(() =>
      expect(
        screen.getByText(/fileUnified.clickUploadFiles/i),
      ).toBeInTheDocument(),
    );

    // Click the stepper label for "Case Details" (completed) to go back
    const stepLabel = screen.getAllByText(/fileUnified.caseDetails/i)[0];
    fireEvent.click(stepLabel);

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /fileUnified.caseDetails/i }),
      ).toBeInTheDocument(),
    );
    expect(titleInput2.value).toBe("Preserve Title");
  });
});
