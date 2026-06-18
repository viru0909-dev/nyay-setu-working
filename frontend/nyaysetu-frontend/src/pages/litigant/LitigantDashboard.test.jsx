import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

vi.mock('../../services/api', () => ({
  caseAPI: {
    list: vi.fn(),
    reviewDraft: vi.fn(),
  },
  hearingAPI: {
    getMyHearings: vi.fn(),
  },
  documentAPI: {},
}));

import { caseAPI, hearingAPI } from '../../services/api';
import LitigantDashboard from './LitigantDashboard';

describe('LitigantDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    caseAPI.list.mockResolvedValue({
      data: [
        {
          id: 'draft-case-123',
          title: 'Draft Petition',
          status: 'DRAFT_PENDING_CLIENT',
          lawyerName: 'Adv. Sharma',
          createdAt: '2026-06-01T00:00:00.000Z',
        },
      ],
    });
    hearingAPI.getMyHearings.mockResolvedValue({ data: [] });
  });

  it('opens pending draft review through the existing case diary detail route', async () => {
    render(<LitigantDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/litigant.pendingApprovals/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /litigant.viewDetails/ }));

    expect(navigateMock).toHaveBeenCalledWith('/litigant/case-diary/draft-case-123');
  });
});
