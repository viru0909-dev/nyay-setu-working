import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { UI_LANGUAGE_CODES } from './config/languages';

i18n
    // Load translations using http backend
    .use(HttpBackend)
    // Detect user language
    .use(LanguageDetector)
    // Pass the i18n instance to react-i18next
    .use(initReactI18next)
    // Initialize i18next
    .init({
        fallbackLng: 'en',
        debug: import.meta.env.DEV, // Only in development

        // Supported languages — only those with a complete locale bundle under
        // public/locales. Listing a language without one makes i18next request
        // files that 404 and silently fall back to English.
        supportedLngs: UI_LANGUAGE_CODES,

        // Namespaces for organizing translations
        ns: ['common', 'landing', 'auth', 'dashboard', 'forms', 'notifications','constitution', 'aiAssistant'],
        defaultNS: 'common',

        // Backend configuration for loading translation files
        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json',
        },

        // Language detector options
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng',
        },

        // Interpolation settings
        interpolation: {
            escapeValue: false, // React already escapes values
        },

        // React settings
        react: {
            useSuspense: true,
        },
    });

export default i18n;
