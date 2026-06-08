import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import ResetPassword from './ResetPassword';

vi.mock('../components/landing/Header', () => ({
  default: () => <header data-testid="header" />,
}));

vi.mock('../config/apiConfig', () => ({
  API_BASE_URL: 'https://api.test',
}));

vi.mock('framer-motion', async () => {
  const React = await import('react');

  return {
    AnimatePresence: ({ children }) => <>{children}</>,
    motion: new Proxy(
      {},
      {
        get:
          (_, element) =>
          ({ children, ...props }) =>
            React.createElement(element, props, children),
      }
    ),
  };
});

const renderResetPassword = () =>
  render(
    <MemoryRouter initialEntries={['/reset-password/reset-token-123']}>
      <Routes>
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </MemoryRouter>
  );

describe('ResetPassword', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: true })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses versioned auth endpoints to verify and reset the password', async () => {
    renderResetPassword();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test/api/v1/auth/verify-reset-token?token=reset-token-123'
      );
    });

    await screen.findByText('Credential Reset');

    const passwordInputs = document.querySelectorAll('input[type="password"]');
    fireEvent.change(passwordInputs[0], {
      target: { value: 'newSecurePassword' },
    });
    fireEvent.change(passwordInputs[1], {
      target: { value: 'newSecurePassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /replace credentials/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenLastCalledWith(
        'https://api.test/api/v1/auth/reset-password',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            token: 'reset-token-123',
            newPassword: 'newSecurePassword',
          }),
        })
      );
    });
  });
});
