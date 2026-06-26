import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    downloadConstitutionPdf,
    resolvePdfLang,
    CONSTITUTION_PDFS,
    DEFAULT_PDF_LANG,
} from './downloadConstitutionPdf';

// Minimal i18n stub: returns the key so assertions can match on keys.
const t = (key) => key;

/** Build a react-hot-toast-shaped mock (callable + .loading/.success/.error). */
function makeToast() {
    const toast = vi.fn();
    toast.loading = vi.fn(() => 'toast-id');
    toast.success = vi.fn();
    toast.error = vi.fn();
    return toast;
}

/** Build a document stub that records the anchor that gets "clicked". */
function makeDoc() {
    const link = {
        href: '',
        setAttribute: vi.fn(function (k, v) { this[k] = v; }),
        click: vi.fn(),
        remove: vi.fn(),
    };
    return {
        link,
        createElement: vi.fn(() => link),
        body: { appendChild: vi.fn() },
    };
}

function makeUrl() {
    return {
        createObjectURL: vi.fn(() => 'blob:mock-url'),
        revokeObjectURL: vi.fn(),
    };
}

describe('resolvePdfLang', () => {
    it('returns the base code for supported languages', () => {
        expect(resolvePdfLang('en')).toBe('en');
        expect(resolvePdfLang('hi')).toBe('hi');
    });

    it('normalises region-suffixed codes (en-US, hi-IN)', () => {
        expect(resolvePdfLang('en-US')).toBe('en');
        expect(resolvePdfLang('hi-IN')).toBe('hi');
    });

    it('returns null for languages without a shipped PDF', () => {
        expect(resolvePdfLang('te')).toBeNull();
        expect(resolvePdfLang('ta')).toBeNull();
        expect(resolvePdfLang('mr')).toBeNull();
    });

    it('falls back gracefully on empty/undefined input', () => {
        expect(resolvePdfLang(undefined)).toBe(DEFAULT_PDF_LANG);
        expect(resolvePdfLang('')).toBe(DEFAULT_PDF_LANG);
    });
});

describe('downloadConstitutionPdf', () => {
    let toast;
    let doc;
    let urlImpl;
    let fetchImpl;

    beforeEach(() => {
        toast = makeToast();
        doc = makeDoc();
        urlImpl = makeUrl();
        fetchImpl = vi.fn(() =>
            Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob(['pdf'])) })
        );
    });

    const run = (language) =>
        downloadConstitutionPdf(language, t, { fetchImpl, toastImpl: toast, doc, urlImpl });

    it('downloads the English PDF when the language is English', async () => {
        const result = await run('en');

        expect(fetchImpl).toHaveBeenCalledWith(CONSTITUTION_PDFS.en.href);
        expect(doc.link.setAttribute).toHaveBeenCalledWith('download', CONSTITUTION_PDFS.en.filename);
        expect(doc.link.click).toHaveBeenCalledOnce();
        expect(urlImpl.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
        expect(toast.success).toHaveBeenCalledWith('downloadStarted', { id: 'toast-id' });
        expect(result).toEqual({ ok: true, lang: 'en', fellBack: false });
    });

    it('downloads the Hindi PDF when the language is Hindi', async () => {
        const result = await run('hi');

        expect(fetchImpl).toHaveBeenCalledWith(CONSTITUTION_PDFS.hi.href);
        expect(doc.link.setAttribute).toHaveBeenCalledWith('download', CONSTITUTION_PDFS.hi.filename);
        expect(result).toEqual({ ok: true, lang: 'hi', fellBack: false });
    });

    it('falls back to English and notifies the user for unsupported languages', async () => {
        const result = await run('te');

        // Info notice explaining the fallback is shown...
        expect(toast).toHaveBeenCalledWith('downloadOnlyEnHi', expect.objectContaining({ icon: expect.anything() }));
        // ...and the English PDF is what actually downloads.
        expect(fetchImpl).toHaveBeenCalledWith(CONSTITUTION_PDFS.en.href);
        expect(result).toEqual({ ok: true, lang: 'en', fellBack: true });
    });

    it('does not show the fallback notice for supported languages', async () => {
        await run('hi');
        expect(toast).not.toHaveBeenCalledWith('downloadOnlyEnHi', expect.anything());
    });

    it('reports an error toast (and does not click) when the fetch fails', async () => {
        fetchImpl = vi.fn(() => Promise.resolve({ ok: false, status: 404 }));
        const result = await run('en');

        expect(toast.error).toHaveBeenCalledWith('downloadFailed', { id: 'toast-id' });
        expect(doc.link.click).not.toHaveBeenCalled();
        expect(result).toEqual({ ok: false, lang: 'en', fellBack: false });
    });

    it('reports an error toast when the network request rejects', async () => {
        fetchImpl = vi.fn(() => Promise.reject(new Error('network down')));
        const result = await run('en');

        expect(toast.error).toHaveBeenCalledWith('downloadFailed', { id: 'toast-id' });
        expect(result.ok).toBe(false);
    });
});
