/* @vitest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => key,
  }),
}));

vi.mock('../../services/api', () => ({
  policeAPI: {
    getStats: vi.fn(),
    getPendingFirs: vi.fn(),
    getInvestigations: vi.fn(),
    startInvestigation: vi.fn(),
    updateFirStatus: vi.fn(),
    submitInvestigation: vi.fn(),
  },
}));

import { policeAPI } from '../../services/api';
import PoliceDashboard from './PoliceDashboard';

describe('PoliceDashboard summons tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => (key === 'token' ? 'police-token' : null)),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    localStorage.setItem('token', 'police-token');
    policeAPI.getStats.mockResolvedValue({
      data: { totalFirs: 1, sealedFirs: 0, linkedFirs: 0, firsToday: 1 },
    });
    policeAPI.getPendingFirs.mockResolvedValue({ data: [] });
    policeAPI.getInvestigations.mockResolvedValue({ data: [] });
    axios.get.mockResolvedValue({
      data: [
        {
          id: 'case-1',
          caseTitle: 'State vs Doe',
          respondent: 'John Doe',
          type: 'SUMMONS',
        },
      ],
    });
  });

  it('loads pending summons from the versioned police API with auth', async () => {
    render(
      <MemoryRouter>
        <PoliceDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/police/summons/pending',
        { headers: { Authorization: 'Bearer police-token' } }
      );
    });
    expect(await screen.findByText('State vs Doe')).toBeInTheDocument();
  });
});
