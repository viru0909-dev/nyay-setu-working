import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import MyFirsPage from './MyFirsPage';
import { policeAPI } from '../../services/api';

const navigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => navigate,
    };
});

vi.mock('../../contexts/LanguageContext', () => ({
    useLanguage: () => ({
        t: (key) => key,
    }),
}));

vi.mock('../../services/api', () => ({
    policeAPI: {
        listFirs: vi.fn(),
    },
}));

describe('MyFirsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        policeAPI.listFirs.mockResolvedValue({
            data: [
                {
                    id: 'FIR-123',
                    firNumber: 'NS-FIR-123',
                    title: 'Evidence theft complaint',
                    status: 'VERIFIED',
                    fileHash: '0123456789abcdef0123456789abcdef',
                    fileName: 'fir.pdf',
                    uploadedAt: '2026-06-04T05:00:00.000Z',
                },
            ],
        });
    });

    it('opens the registered investigation detail route when a FIR card is clicked', async () => {
        render(
            <MemoryRouter>
                <MyFirsPage />
            </MemoryRouter>
        );

        const firTitle = await screen.findByText('Evidence theft complaint');

        fireEvent.click(firTitle.closest('div[style*="cursor: pointer"]'));

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith('/police/investigation/FIR-123');
        });
    });
});
