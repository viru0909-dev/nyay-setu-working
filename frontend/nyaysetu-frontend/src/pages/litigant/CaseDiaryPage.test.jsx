import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const MOCK_CASE_COUNT = 1000;
const BENCHMARK_TIMEOUT = 10000;
const MAX_RENDER_MS = 5000;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const map = {
        'caseDiary.title': 'My Case Diary',
        'caseDiary.subtitle': 'Track your cases and FIRs',
        'caseDiary.fileNewCase': 'File New Case',
        'caseDiary.total': 'Total',
        'caseDiary.cases': 'Cases',
        'caseDiary.firs': 'FIRs',
        'caseDiary.court': 'Court',
        'caseDiary.police': 'Police',
        'caseDiary.searchCasePlaceholder': 'Search cases...',
        'caseDiary.searchFirPlaceholder': 'Search FIRs...',
        'caseDiary.loadingDiary': 'Loading...',
        'caseDiary.noEntries': 'No entries found',
        'caseDiary.fileNew': 'File New',
        'caseDiary.viewDetails': 'View Details',
        'caseDiary.hireLawyer': 'Hire Lawyer',
        'caseDiary.requestSent': 'Request Sent',
        'caseDiary.noType': 'N/A',
        'caseDiary.policeFir': 'Police FIR',
        'caseDiary.noLocation': 'N/A',
        'caseDiary.action': 'Action',
        'caseDiary.viewLinkedCourtCase': 'View Linked Case',
        'caseDiary.applicationRejected': 'Rejected',
        'caseDiary.processing': 'Processing',
        'statuses.pending': 'Pending',
        'statuses.open': 'Open',
        'statuses.in_progress': 'In Progress',
        'statuses.under_review': 'Under Review',
        'statuses.awaiting_documents': 'Awaiting Documents',
        'statuses.completed': 'Completed',
        'statuses.closed': 'Closed',
        'statuses.active': 'Active',
        'statuses.pending_police_review': 'Pending Police Review',
        'lawyers.matchExperts': 'Match with Experts',
        'lawyers.sourcingExperts': 'Finding lawyers...',
        'lawyers.noLawyersAvailable': 'No lawyers available',
        'lawyers.noLawyersDescription': 'Please check back later',
        'lawyers.experience': 'Experience',
        'lawyers.experienceValue': '5+ Years',
        'lawyers.cases': 'Cases',
        'lawyers.selectAndSendProposal': 'Select & Send Proposal',
      };
      return map[key] || key;
    },
    i18n: { language: 'en' },
  }),
}));

vi.mock('i18next', () => ({
  t: (key) => key,
}));

vi.mock('../../services/api', () => ({
  caseAPI: {
    list: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    submitDraft: vi.fn(),
    reviewDraft: vi.fn(),
    fileInCourt: vi.fn(),
    startHearings: vi.fn(),
    startEvidence: vi.fn(),
    startArguments: vi.fn(),
    startJudgment: vi.fn(),
    deliverVerdict: vi.fn(),
    orderNotice: vi.fn(),
    create: vi.fn(),
  },
  clientFirAPI: {
    listFirs: vi.fn(),
    fileFir: vi.fn(),
    getFir: vi.fn(),
    getStats: vi.fn(),
  },
  caseAssignmentAPI: {
    getAvailableLawyers: vi.fn(),
    proposeLawyer: vi.fn(),
    autoAssignJudge: vi.fn(),
    respondToProposal: vi.fn(),
    getPendingCases: vi.fn(),
    getJudgeWorkload: vi.fn(),
    takeCognizance: vi.fn(),
    updateSummons: vi.fn(),
    updateDocumentStatus: vi.fn(),
  },
  documentAPI: {},
  brainAPI: {},
}));

import CaseDiaryPage from './CaseDiaryPage';
import { caseAPI, clientFirAPI } from '../../services/api';

function generateMockCases(count) {
  const statuses = ['PENDING', 'OPEN', 'IN_PROGRESS', 'UNDER_REVIEW', 'AWAITING_DOCUMENTS', 'COMPLETED', 'CLOSED'];
  const caseTypes = ['CIVIL', 'CRIMINAL', 'FAMILY', 'PROPERTY', 'CONSUMER'];
  const urgencies = ['NORMAL', 'HIGH', 'CRITICAL'];
  const items = [];

  for (let i = 0; i < count; i++) {
    items.push({
      id: `bench-case-${i + 1}`,
      title: `Benchmark Case #${i + 1}: Sample Legal Matter for Performance Testing`,
      caseType: caseTypes[i % caseTypes.length],
      status: statuses[i % statuses.length],
      urgency: urgencies[i % urgencies.length],
      createdAt: new Date(2025, 0, (i % 365) + 1).toISOString(),
      assignedLawyer: null,
      lawyerProposalStatus: null,
      description: `Benchmark test case #${i + 1} for rendering performance validation.`,
    });
  }

  return items;
}

function generateMockFirs(count) {
  const statuses = ['PENDING', 'UNDER_REVIEW', 'CLOSED', 'REJECTED'];
  const items = [];

  for (let i = 0; i < count; i++) {
    items.push({
      id: `bench-fir-${i + 1}`,
      title: `Benchmark FIR #${i + 1}: Sample Incident Report`,
      status: statuses[i % statuses.length],
      filedDate: new Date(2025, 5, (i % 30) + 1).toISOString(),
      incidentLocation: `Benchmark Location #${i + 1}`,
      caseId: i % 3 === 0 ? `bench-case-${(i % 100) + 1}` : null,
    });
  }

  return items;
}

const mockCases = generateMockCases(MOCK_CASE_COUNT);
const mockFirs = generateMockFirs(20);

function renderPage() {
  return render(
    <MemoryRouter>
      <CaseDiaryPage />
    </MemoryRouter>
  );
}

describe('CaseDiaryPage benchmark: 1,000 timeline entries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    caseAPI.list.mockResolvedValue({ data: mockCases });
    clientFirAPI.listFirs.mockResolvedValue({ data: mockFirs });
  });

  it('renders 1,000 cases without freezing (benchmark)', async () => {
    const start = performance.now();

    renderPage();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: BENCHMARK_TIMEOUT });

    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(MAX_RENDER_MS);
    expect(screen.getByText('My Case Diary')).toBeInTheDocument();
  });

  it('displays correct stats cards with 1,000 cases and 20 FIRs', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: BENCHMARK_TIMEOUT });

    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('renders all 1,000 case cards in the grid', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: BENCHMARK_TIMEOUT });

    const cards = screen.getAllByText(/Benchmark Case #\d+/);
    expect(cards.length).toBe(MOCK_CASE_COUNT);
  });

  it('switches to FIRs tab and renders items without freezing', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: BENCHMARK_TIMEOUT });

    const firsTab = screen.getByText('Police FIRs');

    const start = performance.now();
    fireEvent.click(firsTab);

    await waitFor(() => {
      const firCards = screen.getAllByText(/Benchmark FIR #\d+/);
      expect(firCards.length).toBe(20);
    });

    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(MAX_RENDER_MS);
  });

  it('filters 1,000 cases by status without performance degradation', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: BENCHMARK_TIMEOUT });

    const statusSelect = document.querySelector('select');
    expect(statusSelect).not.toBeNull();

    const start = performance.now();

    fireEvent.change(statusSelect, { target: { value: 'CLOSED' } });

    await waitFor(() => {
      const closedBadges = screen.getAllByText('Closed');
      expect(closedBadges.length).toBeGreaterThan(0);
    });

    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(MAX_RENDER_MS);
  });

  it('searches among 1,000 cases by title and shows filtered results quickly', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: BENCHMARK_TIMEOUT });

    const searchInput = document.querySelector('input[type="text"]');
    expect(searchInput).not.toBeNull();

    const start = performance.now();

    fireEvent.change(searchInput, { target: { value: '#999' } });

    await waitFor(() => {
      expect(
        screen.getByText('Benchmark Case #999: Sample Legal Matter for Performance Testing')
      ).toBeInTheDocument();
    });

    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(MAX_RENDER_MS);
  });
});
