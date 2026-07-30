import { describe, it, expect } from 'vitest';
import {
    DEFAULT_LANGUAGE,
    LANGUAGES,
    PENDING_UI_LANGUAGES,
    UI_LANGUAGES,
    UI_LANGUAGE_CODES,
    getLanguage,
    getSpeechLocale,
    isUiLanguage,
    normalizeUiLanguage,
} from './languages';

describe('language catalogue', () => {
    it('exposes the four languages this platform commits to', () => {
        expect(UI_LANGUAGE_CODES).toEqual(['en', 'hi', 'mr', 'ta', 'te']);
    });

    it('splits every language into exactly one of translated or pending', () => {
        expect(UI_LANGUAGES.length + PENDING_UI_LANGUAGES.length).toBe(LANGUAGES.length);
        expect(UI_LANGUAGES.some((l) => PENDING_UI_LANGUAGES.includes(l))).toBe(false);
    });

    it('gives every entry the fields the switchers render', () => {
        for (const language of LANGUAGES) {
            expect(language.code).toMatch(/^[a-z]{2}$/);
            expect(language.nativeName).toBeTruthy();
            expect(language.englishName).toBeTruthy();
            expect(language.shortCode).toBe(language.code.toUpperCase());
            expect(language.speechLocale).toMatch(/^[a-z]{2}-IN$/);
        }
    });

    it('uses unique codes', () => {
        const codes = LANGUAGES.map((l) => l.code);
        expect(new Set(codes).size).toBe(codes.length);
    });
});

describe('getLanguage', () => {
    it('resolves plain and regional tags', () => {
        expect(getLanguage('ta')?.englishName).toBe('Tamil');
        expect(getLanguage('ta-IN')?.englishName).toBe('Tamil');
        expect(getLanguage('EN-us')?.englishName).toBe('English');
    });

    it('returns undefined for anything it does not know', () => {
        expect(getLanguage('xx')).toBeUndefined();
        expect(getLanguage('')).toBeUndefined();
        expect(getLanguage(null)).toBeUndefined();
    });
});

describe('isUiLanguage', () => {
    it('accepts languages with a locale bundle', () => {
        expect(isUiLanguage('mr')).toBe(true);
        expect(isUiLanguage('te-IN')).toBe(true);
    });

    it('rejects languages that would fall back to English', () => {
        expect(isUiLanguage('gu')).toBe(false);
        expect(isUiLanguage('xx')).toBe(false);
        expect(isUiLanguage(undefined)).toBe(false);
    });
});

describe('normalizeUiLanguage', () => {
    it('strips the region from a supported tag', () => {
        expect(normalizeUiLanguage('hi-IN')).toBe('hi');
    });

    it('falls back to English for untranslated or unknown languages', () => {
        expect(normalizeUiLanguage('gu')).toBe(DEFAULT_LANGUAGE);
        expect(normalizeUiLanguage('klingon')).toBe(DEFAULT_LANGUAGE);
        expect(normalizeUiLanguage(undefined)).toBe(DEFAULT_LANGUAGE);
    });
});

describe('getSpeechLocale', () => {
    it('maps a language to its Indian speech locale', () => {
        expect(getSpeechLocale('ta')).toBe('ta-IN');
        expect(getSpeechLocale('en')).toBe('en-IN');
        expect(getSpeechLocale('pa')).toBe('pa-IN');
    });

    it('defaults to Indian English for unknown languages', () => {
        expect(getSpeechLocale('xx')).toBe('en-IN');
        expect(getSpeechLocale(undefined)).toBe('en-IN');
    });
});
