/**
 * Single source of truth for the languages Nyay Setu offers.
 *
 * Two different capabilities are tracked, because they are genuinely different:
 *
 * - `uiTranslated` — a complete `public/locales/<code>/` bundle exists, so the
 *   interface itself can be shown in this language. Only these may be passed to
 *   `i18n.changeLanguage()`; the rest would 404 and silently fall back to English.
 * - every entry — Vakil Friend can still converse in the language, because the
 *   assistant's replies are machine-translated by Bhashini at request time rather
 *   than read from a locale bundle.
 *
 * Add a language to the UI list by shipping its locale files and flipping
 * `uiTranslated`; `LocaleCompleteness.test.js` will then hold it to the same
 * key coverage as English.
 */

/** Fallback used whenever a language is unknown or not yet translated. */
export const DEFAULT_LANGUAGE = 'en';

export const LANGUAGES = [
    { code: 'en', nativeName: 'English', englishName: 'English', shortCode: 'EN', speechLocale: 'en-IN', uiTranslated: true },
    { code: 'hi', nativeName: 'हिंदी', englishName: 'Hindi', shortCode: 'HI', speechLocale: 'hi-IN', uiTranslated: true },
    { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi', shortCode: 'MR', speechLocale: 'mr-IN', uiTranslated: true },
    { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', shortCode: 'TA', speechLocale: 'ta-IN', uiTranslated: true },
    { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu', shortCode: 'TE', speechLocale: 'te-IN', uiTranslated: true },
    { code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati', shortCode: 'GU', speechLocale: 'gu-IN', uiTranslated: false },
    { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', shortCode: 'KN', speechLocale: 'kn-IN', uiTranslated: false },
    { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', shortCode: 'BN', speechLocale: 'bn-IN', uiTranslated: false },
    { code: 'ml', nativeName: 'മലയാളം', englishName: 'Malayalam', shortCode: 'ML', speechLocale: 'ml-IN', uiTranslated: false },
    { code: 'pa', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', shortCode: 'PA', speechLocale: 'pa-IN', uiTranslated: false },
];

/** Languages the interface is fully translated into. */
export const UI_LANGUAGES = LANGUAGES.filter((language) => language.uiTranslated);

/** Listed in the switcher but not selectable yet — shown as "coming soon". */
export const PENDING_UI_LANGUAGES = LANGUAGES.filter((language) => !language.uiTranslated);

/** Codes accepted by i18next. Keep `supportedLngs` in i18n.js in step with this. */
export const UI_LANGUAGE_CODES = UI_LANGUAGES.map((language) => language.code);

/**
 * Look up a language, tolerating regional tags such as `en-IN` or `ta-IN`.
 *
 * @param {string} code language tag
 * @returns {object|undefined} the matching entry, if any
 */
export function getLanguage(code) {
    if (typeof code !== 'string' || !code) return undefined;
    const base = code.split('-')[0].toLowerCase();
    return LANGUAGES.find((language) => language.code === base);
}

/**
 * @param {string} code language tag
 * @returns {boolean} true when the interface is available in this language
 */
export function isUiLanguage(code) {
    return Boolean(getLanguage(code)?.uiTranslated);
}

/**
 * Reduce any language tag to a code the interface can actually render.
 *
 * @param {string} code language tag, possibly regional or unsupported
 * @returns {string} a translated language code, falling back to English
 */
export function normalizeUiLanguage(code) {
    const language = getLanguage(code);
    return language?.uiTranslated ? language.code : DEFAULT_LANGUAGE;
}

/**
 * Browser locale used for speech recognition and synthesis.
 *
 * @param {string} code language tag
 * @returns {string} e.g. `"ta-IN"`, defaulting to Indian English
 */
export function getSpeechLocale(code) {
    return getLanguage(code)?.speechLocale ?? 'en-IN';
}
