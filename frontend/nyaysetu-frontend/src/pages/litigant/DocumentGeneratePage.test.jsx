import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
vi.mock('../../services/lawgptService', () => ({
  default: {
    generate: vi.fn(),
    generatePdf: vi.fn(),
    generateDocx: vi.fn(),
  },
}));

import lawgpt from '../../services/lawgptService';
import DocumentGeneratePage from './DocumentGeneratePage';

describe('DocumentGeneratePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lawgpt.generate.mockResolvedValue({ data: { title: 'AFFIDAVIT', content: 'dummy text', generatedAt: new Date().toISOString(), sources: [] } });
    lawgpt.generateDocx.mockResolvedValue({ data: new Blob(['docx']) });
  });

  const renderPage = () => render(
    <MemoryRouter>
      <DocumentGeneratePage />
    </MemoryRouter>
  );

  it('renders backend validation errors for missing fields', async () => {
    lawgpt.generate.mockRejectedValueOnce({ response: { data: { detail: { missing_fields: ['petitioner_address'] } } } });

    renderPage();

    const affidavitCard = screen.getByText(/Affidavit/i).closest('div');
    fireEvent.click(affidavitCard);
    await waitFor(() => expect(screen.getByPlaceholderText(/Full legal name/i)).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText(/Full legal name/i), { target: { value: 'John Doe' } });
    const dateInput = document.querySelector('input[type="date"]');
    fireEvent.change(dateInput, { target: { value: '2026-05-20' } });
    fireEvent.change(screen.getByPlaceholderText(/Complete residential address/i), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByPlaceholderText(/Respondent's full name/i), { target: { value: 'State' } });
    fireEvent.change(screen.getByPlaceholderText(/Respondent's address/i), { target: { value: 'Govt Office' } });
    fireEvent.change(screen.getByPlaceholderText(/Describe the facts of the case/i), { target: { value: 'Test facts' } });
    fireEvent.change(screen.getByPlaceholderText(/What outcome or remedy/i), { target: { value: 'Relief' } });

    fireEvent.click(screen.getByRole('button', { name: /Generate Preview/i }));

    await waitFor(() => expect(screen.getByText(/Required fields are missing/i)).toBeInTheDocument());
    expect(screen.getByText(/This field is required/i)).toBeInTheDocument();
  });

  it('shows prompt-injection warnings from backend error responses', async () => {
    lawgpt.generate.mockRejectedValueOnce({ response: { data: { detail: { prompt_injection_detected: ['ignore all previous'] } } } });

    renderPage();

    const affidavitCard = screen.getByText(/Affidavit/i).closest('div');
    fireEvent.click(affidavitCard);
    await waitFor(() => expect(screen.getByPlaceholderText(/Full legal name/i)).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText(/Full legal name/i), { target: { value: 'John Doe' } });
    const dateInput = document.querySelector('input[type="date"]');
    fireEvent.change(dateInput, { target: { value: '2026-05-20' } });
    fireEvent.change(screen.getByPlaceholderText(/Complete residential address/i), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByPlaceholderText(/Respondent's full name/i), { target: { value: 'State' } });
    fireEvent.change(screen.getByPlaceholderText(/Respondent's address/i), { target: { value: 'Govt Office' } });
    fireEvent.change(screen.getByPlaceholderText(/Describe the facts of the case/i), { target: { value: 'Test facts' } });
    fireEvent.change(screen.getByPlaceholderText(/What outcome or remedy/i), { target: { value: 'Relief' } });

    fireEvent.click(screen.getByRole('button', { name: /Generate Preview/i }));

    await waitFor(() => expect(screen.getByText(/Suspicious input detected/i)).toBeInTheDocument());
    expect(screen.getByText(/ignore all previous/i)).toBeInTheDocument();
  });

  it('copies generated content and calls DOCX export actions', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.assign(navigator, { clipboard: { writeText } });
    lawgpt.generate.mockResolvedValueOnce({ data: { title: 'AFFIDAVIT', content: 'My generated document', generatedAt: new Date().toISOString(), sources: [] } });

    renderPage();

    const affidavitCard = screen.getByText(/Affidavit/i).closest('div');
    fireEvent.click(affidavitCard);
    await waitFor(() => expect(screen.getByPlaceholderText(/Full legal name/i)).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText(/Full legal name/i), { target: { value: 'John Doe' } });
    const dateInput = document.querySelector('input[type="date"]');
    fireEvent.change(dateInput, { target: { value: '2026-05-20' } });
    fireEvent.change(screen.getByPlaceholderText(/Complete residential address/i), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByPlaceholderText(/Respondent's full name/i), { target: { value: 'State' } });
    fireEvent.change(screen.getByPlaceholderText(/Respondent's address/i), { target: { value: 'Govt Office' } });
    fireEvent.change(screen.getByPlaceholderText(/Describe the facts of the case/i), { target: { value: 'Test facts' } });
    fireEvent.change(screen.getByPlaceholderText(/What outcome or remedy/i), { target: { value: 'Relief' } });

    fireEvent.click(screen.getByRole('button', { name: /Generate Preview/i }));
    await waitFor(() => expect(screen.getByText(/Document generated successfully/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Copy to clipboard/i }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('My generated document'));
    expect(screen.getByText(/Copied to clipboard/i)).toBeInTheDocument();

    lawgpt.generateDocx.mockResolvedValueOnce({ data: new Blob(['docx']) });
    const createObjectURL = vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:dummy');
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    fireEvent.click(screen.getByRole('button', { name: /Download DOCX/i }));
    await waitFor(() => expect(lawgpt.generateDocx).toHaveBeenCalled());

    createObjectURL.mockRestore();
    anchorClick.mockRestore();
  });

  it('downloads PDF and handles filename and blob flow', async () => {
    // Prepare mocks
    lawgpt.generate.mockResolvedValueOnce({ data: { title: 'AFFIDAVIT', content: 'PDF content', generatedAt: new Date().toISOString(), sources: [] } });
    lawgpt.generatePdf.mockResolvedValueOnce({ data: new Blob(['%PDF-1.4']) });

    const createObjectURL = vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:pdfdummy');
    let appendedEl = null;
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const { container } = renderPage();
    // select the first document-type card by tabindex (cards are rendered with tabindex=0)
    const cards = container.querySelectorAll('[tabindex="0"]');
    const affidavitCard = cards[0];
    fireEvent.click(affidavitCard);
    await waitFor(() => expect(screen.getByPlaceholderText(/Full legal name/i)).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText(/Full legal name/i), { target: { value: 'John Doe' } });
    const dateInput = document.querySelector('input[type="date"]');
    fireEvent.change(dateInput, { target: { value: '2026-05-20' } });
    fireEvent.change(screen.getByPlaceholderText(/Complete residential address/i), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByPlaceholderText(/Respondent's full name/i), { target: { value: 'State' } });
    fireEvent.change(screen.getByPlaceholderText(/Respondent's address/i), { target: { value: 'Govt Office' } });
    fireEvent.change(screen.getByPlaceholderText(/Describe the facts of the case/i), { target: { value: 'Test facts' } });
    fireEvent.change(screen.getByPlaceholderText(/What outcome or remedy/i), { target: { value: 'Relief' } });

    // Trigger generate preview so state is consistent
    fireEvent.click(screen.getByRole('button', { name: /Generate Preview/i }));
    await waitFor(() => expect(screen.getByText(/Document generated successfully/i)).toBeInTheDocument());

    // Click Download PDF and assert flows
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((el) => { appendedEl = el; return el; });
    fireEvent.click(screen.getByRole('button', { name: /Download PDF/i }));
    await waitFor(() => expect(lawgpt.generatePdf).toHaveBeenCalled());
    expect(createObjectURL).toHaveBeenCalled();
    expect(appendedEl).not.toBeNull();
    // download name should match pattern: <type>_<Petitioner_Name_with_underscores>.pdf
    expect(appendedEl.download).toBe('affidavit_John_Doe.pdf');

    // Restore spies
    createObjectURL.mockRestore();
    appendSpy.mockRestore();
    anchorClick.mockRestore();
  });
});
