import { render, fireEvent, act } from '@testing-library/react';
import { expect, it, describe, vi, beforeEach, afterEach } from 'vitest';
import BackToTop from '../BackToTop';

describe('BackToTop', () => {
      beforeEach(() => {
      Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
      });

      afterEach(() => {
        vi.restoreAllMocks();
      });

      it('is hidden when page is at top', () => {
        const { getByRole } = render(<BackToTop />);
        const button = getByRole('button');
        expect(button.style.opacity).toBe('0');
        expect(button.style.pointerEvents).toBe('none');
      });

      it('appears after scrolling down 300px', () => {
        const { getByRole } = render(<BackToTop />);
        act(() => {
          Object.defineProperty(window, 'scrollY', { value: 400, writable: true });
          fireEvent.scroll(window);
        });
        expect(getByRole('button')).toBeTruthy();
      });

      it('scrolls to top on click', () => {
        window.scrollTo = vi.fn();
        const { getByRole } = render(<BackToTop />);
        act(() => {
          Object.defineProperty(window, 'scrollY', { value: 400, writable: true });
          fireEvent.scroll(window);
        });
        fireEvent.click(getByRole('button'));
        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
      });
});