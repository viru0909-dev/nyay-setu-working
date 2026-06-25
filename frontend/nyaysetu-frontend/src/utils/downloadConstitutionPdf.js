import toast from 'react-hot-toast';

/**
 * Constitution PDFs that actually ship in `public/documents`.
 *
 * To make a new translated Constitution available, drop the PDF into
 * `public/documents` and add an entry here — the download button will pick it
 * up automatically for that language, with no component changes required.
 */
export const CONSTITUTION_PDFS = {
    en: {
        href: '/documents/COI_MAY2024.pdf',
        filename: 'Constitution_of_India_English.pdf',
    },
    hi: {
        href: '/documents/COI_MAY2024_Hindi.pdf',
        filename: 'Constitution_of_India_Hindi.pdf',
    },
};

/** Language used when the active language has no dedicated PDF yet. */
export const DEFAULT_PDF_LANG = 'en';

/**
 * Normalise an i18next language code (e.g. "en-US", "hi-IN") to a base code
 * ("en", "hi") and return it only if we actually ship a PDF for it.
 *
 * @param {string} language Active i18n language code.
 * @returns {string|null} A supported base language code, or null when none ships.
 */
export function resolvePdfLang(language) {
    const base = (language || DEFAULT_PDF_LANG).toLowerCase().split('-')[0];
    return Object.prototype.hasOwnProperty.call(CONSTITUTION_PDFS, base) ? base : null;
}

/**
 * Download the Constitution of India PDF in the closest available language.
 *
 *  - `en` / `hi` resolve to their dedicated PDFs.
 *  - Any other language (te / ta / mr / ...) falls back to the English PDF and
 *    surfaces a notice explaining that translated PDFs aren't available yet,
 *    so the user understands why they received the English document.
 *
 * The file is fetched as a Blob (rather than relying on a bare anchor click) so
 * that network failures and missing files can be detected and reported instead
 * of silently doing nothing — which was the behaviour users hit before.
 *
 * `deps` exists purely to make the function unit-testable; production callers
 * never pass it.
 *
 * @param {string} language Active i18n language code.
 * @param {(key: string) => string} t i18next translator bound to the `constitution` namespace.
 * @param {object} [deps] Injectable dependencies for testing.
 * @returns {Promise<{ok: boolean, lang: string, fellBack: boolean}>}
 */
export async function downloadConstitutionPdf(language, t, deps = {}) {
    const {
        fetchImpl = typeof fetch !== 'undefined' ? fetch : undefined,
        toastImpl = toast,
        doc = typeof document !== 'undefined' ? document : undefined,
        urlImpl = typeof URL !== 'undefined' ? URL : undefined,
    } = deps;

    const resolved = resolvePdfLang(language);
    const fellBack = resolved === null;
    const lang = resolved ?? DEFAULT_PDF_LANG;
    const pdf = CONSTITUTION_PDFS[lang];

    // Let speakers of languages we don't yet have a PDF for know why they're
    // getting the English document instead of silently swapping it on them.
    if (fellBack) {
        toastImpl(t('downloadOnlyEnHi'), { icon: 'ℹ️' });
    }

    const toastId = toastImpl.loading(t('downloadPreparing'));
    try {
        const response = await fetchImpl(pdf.href);
        if (!response || !response.ok) {
            throw new Error(
                `Failed to fetch ${pdf.href}: ${response ? response.status : 'no response'}`
            );
        }

        const blob = await response.blob();
        const objectUrl = urlImpl.createObjectURL(blob);

        const link = doc.createElement('a');
        link.href = objectUrl;
        link.setAttribute('download', pdf.filename);
        doc.body.appendChild(link);
        link.click();
        link.remove();
        urlImpl.revokeObjectURL(objectUrl);

        toastImpl.success(t('downloadStarted'), { id: toastId });
        return { ok: true, lang, fellBack };
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[Constitution] PDF download failed:', error);
        toastImpl.error(t('downloadFailed'), { id: toastId });
        return { ok: false, lang, fellBack };
    }
}
