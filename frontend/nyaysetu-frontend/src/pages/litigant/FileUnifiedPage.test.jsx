import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

import FileUnifiedPage from './FileUnifiedPage';

describe('FileUnifiedPage', () => {
  it('preserves form state when navigating backwards', () => {
    render(
      <MemoryRouter>
        <FileUnifiedPage />
      </MemoryRouter>
    );

    // Step 1 - select case type
    fireEvent.click(
      screen.getByText('fileUnified.propertyDispute')
    );

    // Go to Step 2
    fireEvent.click(
      screen.getByText('fileUnified.next')
    );

    // Fill title field
    const titleInput = screen.getAllByRole('textbox')[0];

    fireEvent.change(titleInput, {
      target: { value: 'Property Dispute Case' },
    });

    // Go back to Step 1
    fireEvent.click(
      screen.getByText('fileUnified.previous')
    );

    // Go forward again
    fireEvent.click(
      screen.getByText('fileUnified.next')
    );

    // Verify title is still there
    expect(
      screen.getAllByRole('textbox')[0]
    ).toHaveValue('Property Dispute Case');
  });
});
