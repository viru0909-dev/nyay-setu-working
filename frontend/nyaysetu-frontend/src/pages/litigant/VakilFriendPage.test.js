import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock('../../services/api', () => ({
  vakilFriendAPI: {
    getSessions: vi.fn(() => Promise.resolve({ data: [] })),
    startSession: vi.fn(() => Promise.reject(new Error('offline'))),
    analyzeDocumentForSession: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

vi.mock('../../config/apiConfig', () => ({
  API_BASE_URL: 'https://api.test',
}));

vi.mock('../../components/avatar/AvatarPanel', () => ({
  default: () => null,
}));

vi.mock('../../store/chatStore', () => ({
  default: () => ({
    documentContext: '',
    setDocumentContext: vi.fn(),
    clearDocumentContext: vi.fn(),
  }),
}));

import VakilFriendPage from './VakilFriendPage';

describe('VakilFriendPage fallback document upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn();
    const storage = {
      getItem: vi.fn((key) => (key === 'token' ? 'test-token' : null)),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: storage,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'localStorage', {
      value: storage,
      configurable: true,
    });
    HTMLElement.prototype.scrollTo = vi.fn();
    localStorage.setItem('token', 'test-token');
    axios.post.mockResolvedValue({ data: { id: 'doc-1' } });
  });

  it('posts fallback document uploads to the versioned documents endpoint', async () => {
    const { container } = render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(VakilFriendPage)
      )
    );

    await waitFor(() => {
      expect(container.querySelector('input[type="file"][multiple]')).not.toBeDisabled();
    });

    const fileInput = container.querySelector('input[type="file"][multiple]');
    const file = new File(['legal evidence'], 'evidence.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'https://api.test/api/v1/documents/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });
});
