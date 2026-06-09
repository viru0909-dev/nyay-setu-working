import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LanguageProvider, useLanguage, translations } from './LanguageContext';

// ─── Helper: consumer component ───────────────────────────────────────────────
function TestConsumer() {
  const { language, toggleLanguage, t } = useLanguage();

  const handleFetch = () => {
    fetch('/api/test', {
      headers: { 'Accept-Language': language },
    });
  };

  return (
    <div>
      <span data-testid="home-text">{t('home')}</span>
      <span data-testid="login-text">{t('login')}</span>
      <span data-testid="current-lang">{language}</span>
      <button onClick={toggleLanguage}>Toggle</button>
      <button onClick={handleFetch} data-testid="fetch-btn">Fetch</button>
    </div>
  );
}

// ─── Helper: render inside provider ───────────────────────────────────────────
function renderWithProvider() {
  return render(
    <LanguageProvider>
      <TestConsumer />
    </LanguageProvider>
  );
}

// ──────────────────────────────────────────────────────────────────────────────

describe('LanguageProvider', () => {

  // 1. Default language is English
  it('renders English text by default', () => {
    renderWithProvider();
    expect(screen.getByTestId('home-text').textContent).toBe(translations.en.home);
    expect(screen.getByTestId('login-text').textContent).toBe(translations.en.login);
    expect(screen.getByTestId('current-lang').textContent).toBe('en');
  });

  // 2. Static text updates after locale switch — NO hard reload
  it('updates static text to Hindi after toggleLanguage without page reload', () => {
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadSpy },
      writable: true,
    });

    renderWithProvider();

    // Before toggle — English
    expect(screen.getByTestId('home-text').textContent).toBe(translations.en.home);

    // Toggle to Hindi
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    });

    // After toggle — Hindi
    expect(screen.getByTestId('home-text').textContent).toBe(translations.hi.home);
    expect(screen.getByTestId('login-text').textContent).toBe(translations.hi.login);
    expect(screen.getByTestId('current-lang').textContent).toBe('hi');

    // No hard reload triggered
    expect(reloadSpy).not.toHaveBeenCalled();
  });

  // 3. Toggle back to English works correctly
  it('toggles back to English on second toggle', () => {
    renderWithProvider();

    const toggleBtn = screen.getByRole('button', { name: 'Toggle' });

    act(() => { fireEvent.click(toggleBtn); }); // en → hi
    expect(screen.getByTestId('current-lang').textContent).toBe('hi');

    act(() => { fireEvent.click(toggleBtn); }); // hi → en
    expect(screen.getByTestId('current-lang').textContent).toBe('en');
    expect(screen.getByTestId('home-text').textContent).toBe(translations.en.home);
  });

  // 4. Accept-Language header reflects updated locale
  it('sends correct Accept-Language header after locale switch', () => {
    const fetchSpy = vi.fn(() => Promise.resolve(new Response()));
    vi.stubGlobal('fetch', fetchSpy);

    renderWithProvider();

    // Toggle to Hindi then fire fetch
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    });

    act(() => {
      fireEvent.click(screen.getByTestId('fetch-btn'));
    });

    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(fetchSpy).toHaveBeenCalledWith('/api/test', {
      headers: { 'Accept-Language': 'hi' },
    });

    vi.unstubAllGlobals();
  });

  // 5. Accept-Language header is 'en' by default (before any toggle)
  it('sends Accept-Language: en before any locale switch', () => {
    const fetchSpy = vi.fn(() => Promise.resolve(new Response()));
    vi.stubGlobal('fetch', fetchSpy);

    renderWithProvider();

    act(() => {
      fireEvent.click(screen.getByTestId('fetch-btn'));
    });

    expect(fetchSpy).toHaveBeenCalledWith('/api/test', {
      headers: { 'Accept-Language': 'en' },
    });

    vi.unstubAllGlobals();
  });

  // 6. window.location is never reassigned or reloaded during toggle
  it('never reassigns window.location during language switch', () => {
    const reloadSpy = vi.fn();
    const assignSpy = vi.fn();
    const replaceSpy = vi.fn();

    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        reload: reloadSpy,
        assign: assignSpy,
        replace: replaceSpy,
      },
      writable: true,
    });

    renderWithProvider();

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    });

    expect(reloadSpy).not.toHaveBeenCalled();
    expect(assignSpy).not.toHaveBeenCalled();
    expect(replaceSpy).not.toHaveBeenCalled();
  });

  // 7. useLanguage throws outside provider
  it('throws if useLanguage is used outside LanguageProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      'useLanguage must be used within LanguageProvider'
    );

    consoleError.mockRestore();
  });

  // 8. t() returns the key itself for unknown keys (graceful fallback)
  it('returns the key as fallback for unknown translation keys', () => {
    function FallbackConsumer() {
      const { t } = useLanguage();
      return <span data-testid="fallback">{t('nonExistentKey')}</span>;
    }

    render(
      <LanguageProvider>
        <FallbackConsumer />
      </LanguageProvider>
    );

    expect(screen.getByTestId('fallback').textContent).toBe('nonExistentKey');
  });

});