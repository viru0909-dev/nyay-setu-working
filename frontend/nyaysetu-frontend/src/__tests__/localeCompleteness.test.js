/**
 * Holds every shipped language to the same key coverage as English.
 *
 * Before this existed, `ta/forms.json` and `te/forms.json` were zero-byte files:
 * i18next could not parse them, the namespace failed to load, and Tamil and
 * Telugu users silently saw English with no error anywhere. A drifting locale
 * bundle is invisible at runtime, so it needs to be visible at test time.
 */

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { UI_LANGUAGE_CODES } from '../config/languages';

const LOCALES_DIR = join(process.cwd(), 'public', 'locales');
const REFERENCE_LOCALE = 'en';

function namespacesOf(locale) {
    return readdirSync(join(LOCALES_DIR, locale))
        .filter((file) => file.endsWith('.json'))
        .map((file) => file.replace(/\.json$/, ''))
        .sort();
}

function flatten(value, prefix = '') {
    return Object.entries(value).flatMap(([key, entry]) => {
        const path = `${prefix}${key}`;
        return entry !== null && typeof entry === 'object'
            ? flatten(entry, `${path}.`)
            : [path];
    });
}

function loadKeys(locale, namespace) {
    const raw = readFileSync(join(LOCALES_DIR, locale, `${namespace}.json`), 'utf-8');
    return flatten(JSON.parse(raw));
}

const referenceNamespaces = namespacesOf(REFERENCE_LOCALE);
const otherLocales = UI_LANGUAGE_CODES.filter((code) => code !== REFERENCE_LOCALE);

describe('locale bundles', () => {
    it('ships a directory for every language offered in the switcher', () => {
        const onDisk = readdirSync(LOCALES_DIR).filter((entry) =>
            statSync(join(LOCALES_DIR, entry)).isDirectory()
        );
        for (const code of UI_LANGUAGE_CODES) {
            expect(onDisk, `public/locales/${code} is missing`).toContain(code);
        }
    });

    describe.each(otherLocales)('%s', (locale) => {
        it('covers the same namespaces as English', () => {
            expect(namespacesOf(locale)).toEqual(referenceNamespaces);
        });

        it.each(referenceNamespaces)('%s.json is non-empty, valid JSON', (namespace) => {
            const path = join(LOCALES_DIR, locale, `${namespace}.json`);
            const raw = readFileSync(path, 'utf-8');

            expect(raw.trim().length, `${locale}/${namespace}.json is empty`).toBeGreaterThan(0);
            expect(() => JSON.parse(raw)).not.toThrow();
        });

        it.each(referenceNamespaces)('%s.json has every English key', (namespace) => {
            const expected = loadKeys(REFERENCE_LOCALE, namespace);
            const actual = new Set(loadKeys(locale, namespace));
            const missing = expected.filter((key) => !actual.has(key));

            expect(missing, `${locale}/${namespace}.json is missing: ${missing.join(', ')}`)
                .toHaveLength(0);
        });
    });
});
