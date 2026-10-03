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

const { mockNavigate } = vi.hoisted(() => ({
    mockNavigate: vi.fn()
}));

vi.mock('react-router-dom', async () => {
    const actual =
        await vi.importActual('react-router-dom');

    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});
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

    test('Join Now routes to the secured conduct page', async () => {
        renderComponent();

        // Click Join Now and verify routing through the secured hearing page.
        const joinButton = await screen.findByRole('button', { name: /join now/i });
        fireEvent.click(joinButton);
        expect(mockNavigate).toHaveBeenCalledWith(
            '/judge/conduct'
        );

    });
});