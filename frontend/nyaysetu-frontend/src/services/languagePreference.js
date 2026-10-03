/**
 * Keeps the interface language in step between i18next and the user's account.
 *
 * i18next already persists the choice to localStorage, which is enough for a
 * single browser. Litigants routinely switch between a shared computer and a
 * phone, so the choice is mirrored onto the profile and adopted again at login.
 *
 * Every call here is best-effort: a guest session, an offline device or an older
 * backend must never block the user from changing language locally.
 */

import i18n from '../i18n';
import { profileAPI } from './api';
import { isUiLanguage, normalizeUiLanguage } from '../config/languages';

function isSignedIn() {
    return Boolean(localStorage.getItem('token'));
}

/**
 * Change the interface language and remember it on the user's account.
 *
 * @param {string} code language code from the switcher
 * @returns {Promise<string>} the language actually applied
 */
export async function changeLanguage(code) {
    const language = normalizeUiLanguage(code);
    await i18n.changeLanguage(language);

    if (isSignedIn()) {
        try {
            await profileAPI.updateLanguage(language);
        } catch (error) {
            // The local switch already succeeded; syncing is an enhancement.
            console.warn('Could not save language preference to profile:', error?.message);
        }
    }

    return language;
}

/**
 * Adopt the language stored on the account, if the user has ever chosen one.
 *
 * Called right after login. A user who has not set a preference keeps whatever
 * browser detection picked, so this never overrides a deliberate local choice
 * with a default.
 *
 * @returns {Promise<string|null>} the language applied, or null if unchanged
 */
export async function applyStoredLanguagePreference() {
    if (!isSignedIn()) return null;

    try {
        const { data } = await profileAPI.getLanguage();
        const stored = data?.language;

        if (isUiLanguage(stored) && stored !== i18n.language) {
            await i18n.changeLanguage(normalizeUiLanguage(stored));
            return normalizeUiLanguage(stored);
        }
    } catch (error) {
        console.warn('Could not load language preference from profile:', error?.message);
    }

    return null;
}
