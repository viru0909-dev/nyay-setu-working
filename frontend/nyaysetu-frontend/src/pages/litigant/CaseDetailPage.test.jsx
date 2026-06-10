import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios', () => ({
  default: {
    get: vi.fn()
  }
}));

vi.mock('../../config/apiConfig', () => ({
  API_BASE_URL: 'http://api.test',
  default: 'http://api.test'
}));

vi.mock('../../services/api', () => ({
  caseAPI: {
    getById: vi.fn()
  },
  documentAPI: {},
  brainAPI: {},
  caseAssignmentAPI: {
    getAvailableLawyers: vi.fn(),
    proposeLawyer: vi.fn()
  }
}));

vi.mock('../../components/CaseChatWidget', () => ({
  default: () => null
}));

vi.mock('../../components/common/CaseStepper', () => ({
  default: () => null
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' }
  })
}));

vi.mock('i18next', () => ({
  t: (key) => key
}));

import { caseAPI } from '../../services/api';
import CaseDetailPage from './CaseDetailPage';

describe('CaseDetailPage timeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const localStorageMock = {
      getItem: vi.fn((key) => (key === 'token' ? 'test-token' : null)),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
    vi.stubGlobal('localStorage', localStorageMock);
    caseAPI.getById.mockResolvedValue({
      data: {
        id: 'case-1090',
        title: 'Timeline endpoint case',
        description: 'Case with timeline events',
        status: 'PENDING',
        urgency: 'NORMAL',
        caseType: 'CIVIL',
        currentJudicialStage: 'PLAINT_FILED'
      }
    });
    axios.get.mockResolvedValue({ data: [] });
  });

  it('loads timeline data from versioned timeline and case event endpoints', async () => {
    render(
      <MemoryRouter initialEntries={['/litigant/case-diary/case-1090']}>
        <Routes>
          <Route path="/litigant/case-diary/:caseId" element={<CaseDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole('button', { name: /caseDetail\.tabs\.timeline/i }));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'http://api.test/api/v1/timeline/case-1090',
        { headers: { Authorization: 'Bearer test-token' } }
      );
      expect(axios.get).toHaveBeenCalledWith(
        'http://api.test/api/v1/cases/case-1090/events',
        { headers: { Authorization: 'Bearer test-token' } }
      );
    });
  });
});
