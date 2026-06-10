import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AILegalAssistantPage from './AILegalAssistantPage';
import { brainAPI } from '../../services/api';

// Mock the brainAPI service
vi.mock('../../services/api', () => ({
  brainAPI: {
    chat: vi.fn(),
  },
}));

describe('AILegalAssistantPage E2E Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user query and correctly formats deterministic markdown response from AI backend', async () => {
    // 1. Mock network response to return deterministic markdown payload
    const mockMarkdownResponse = {
      data: {
        message: "Here is the legal summary:\n\n**Bold Text**\n* List Item 1\n* List Item 2"
      }
    };
    brainAPI.chat.mockResolvedValueOnce(mockMarkdownResponse);

    render(<AILegalAssistantPage />);

    // 2. DOM Interaction: Locate chat input, type "Test query", and click submit
    const inputField = screen.getByPlaceholderText(/Query legal sections, research precedents, or ask for drafting help/i);
    fireEvent.change(inputField, { target: { value: 'Test query' } });

    // Locate the submit button (sibling to the textarea)
    const submitButton = inputField.nextSibling;
    expect(submitButton).not.toBeNull();
    fireEvent.click(submitButton);

    // Verify loading state is shown
    expect(screen.getByText(/AI is researching legal precedents/i)).toBeInTheDocument();

    // 3. DOM Assertions: Wait for the mocked response to resolve and check Markdown formatting
    await waitFor(() => {
      expect(screen.queryByText(/AI is researching legal precedents/i)).not.toBeInTheDocument();
    });

    // Check that "Here is the legal summary:" is displayed
    expect(screen.getByText(/Here is the legal summary:/i)).toBeInTheDocument();

    // Verify it renders markdown as actual HTML elements (strong, ul, li)
    const strongElement = screen.getByText('Bold Text');
    expect(strongElement.tagName).toBe('STRONG');

    const listItem1 = screen.getByText('List Item 1');
    expect(listItem1.tagName).toBe('LI');
    expect(listItem1.closest('ul')).toBeInTheDocument();

    const listItem2 = screen.getByText('List Item 2');
    expect(listItem2.tagName).toBe('LI');
    expect(listItem2.closest('ul')).toBeInTheDocument();

    // Ensure it does not render raw asterisks in the text content
    const chatContainer = strongElement.closest('.markdown-content');
    expect(chatContainer.textContent).not.toContain('**Bold Text**');
    expect(chatContainer.textContent).not.toContain('* List Item 1');
  });
});
