import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LiveHearing from './LiveHearing';
import React from 'react';

vi.mock('../../services/api', () => ({
    judgeAPI: {
        getTodaysHearings: vi.fn(() => Promise.resolve({
            data: [
                {
                    id: 'hearing-1',
                    scheduledDate: new Date().toISOString(), // Keeps it active for today
                    durationMinutes: 60,
                    caseEntity: {
                        id: 'case-123456789',
                        title: 'Test Live Case'
                    }
                }
            ]
        }))
    }
}));

// Helper to render component wrapped inside Router context
const renderComponent = () => {
    return render(
        <BrowserRouter>
            <LiveHearing />
        </BrowserRouter>
    );
};

describe('LiveHearing Accessibility Verification', () => {
    test('Dashboard layout structure matches basic screen reader role expectations', async () => {
        renderComponent();

        // 1. Verify main dashboard heading is discoverable by screen readers
        const mainHeading = await screen.findByRole('heading', { name: /live hearings/i });
        expect(mainHeading).toBeInTheDocument();

        // 2. Verify search input has accessible layout text context
        const searchInput = screen.getByPlaceholderText(/search case name or id.../i);
        expect(searchInput).toBeInTheDocument();
    });

    test('Active hearing workspace contains accessible navigation controls', async () => {
        renderComponent();

        // Click the "Join Now" button to switch to the active hearing viewport layout
        const joinButton = await screen.findByRole('button', { name: /join now/i });
        fireEvent.click(joinButton);

        // 3. Verify upper back navigation button has a valid descriptive aria-label
        const backButton = screen.getByRole('button', { name: /leave hearing/i });
        expect(backButton).toBeInTheDocument();
        expect(backButton).toHaveAttribute('aria-label', 'Leave hearing');

        // 4. Verify major session closure button is discoverable by role matching
        const endSessionButton = screen.getByRole('button', { name: /end session/i });
        expect(endSessionButton).toBeInTheDocument();
    });
});