import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';

import { API_BASE_URL } from '../../config/apiConfig';
import JudgeHearingsPage from './JudgeHearingsPage';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('JudgeHearingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const storage = new Map();
    vi.stubGlobal('localStorage', {
      clear: vi.fn(() => storage.clear()),
      getItem: vi.fn((key) => storage.get(key) ?? null),
      removeItem: vi.fn((key) => storage.delete(key)),
      setItem: vi.fn((key, value) => storage.set(key, value)),
    });
  });

  it('loads judge hearings from the versioned hearings endpoint', async () => {
    localStorage.setItem('token', 'judge-token');
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <JudgeHearingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/hearings/my`,
        {
          headers: { Authorization: 'Bearer judge-token' },
        }
      );
    });
  });
});
