import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import LegalLiteracyTipsWidget from './LegalLiteracyTipsWidget';

describe('LegalLiteracyTipsWidget', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders the first tip and all six tip selectors', () => {
        render(<LegalLiteracyTipsWidget />);

        expect(screen.getByRole('region', { name: /legal literacy tip/i })).toBeInTheDocument();
        expect(screen.getByText('Right to Counsel')).toBeInTheDocument();
        expect(screen.getByText('1 / 6')).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: /^show tip \d/i })).toHaveLength(6);
    });

    it('moves between tips with the next and previous buttons', () => {
        render(<LegalLiteracyTipsWidget />);

        fireEvent.click(screen.getByRole('button', { name: /show next legal literacy tip/i }));
        expect(screen.getByText('FIR Copy')).toBeInTheDocument();
        expect(screen.getByText('2 / 6')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /show previous legal literacy tip/i }));
        expect(screen.getByText('Right to Counsel')).toBeInTheDocument();
        expect(screen.getByText('1 / 6')).toBeInTheDocument();
    });

    it('wraps to the last tip when previous is selected from the first tip', () => {
        render(<LegalLiteracyTipsWidget />);

        fireEvent.click(screen.getByRole('button', { name: /show previous legal literacy tip/i }));

        expect(screen.getByText('Women and Arrest')).toBeInTheDocument();
        expect(screen.getByText('6 / 6')).toBeInTheDocument();
    });

    it('selects a tip using its indicator', () => {
        render(<LegalLiteracyTipsWidget />);

        fireEvent.click(screen.getByRole('button', { name: /show tip 5: consumer protection/i }));

        expect(screen.getByText('Consumer Protection')).toBeInTheDocument();
        expect(screen.getByText('5 / 6')).toBeInTheDocument();
    });

    it('automatically rotates to the next tip after six seconds', () => {
        vi.useFakeTimers();
        render(<LegalLiteracyTipsWidget />);

        act(() => {
            vi.advanceTimersByTime(6000);
        });

        expect(screen.getByText('FIR Copy')).toBeInTheDocument();
        expect(screen.getByText('2 / 6')).toBeInTheDocument();
    });
});
