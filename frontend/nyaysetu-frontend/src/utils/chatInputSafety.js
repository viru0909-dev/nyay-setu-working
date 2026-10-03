/**
 * Input safety helpers for the Nyay Saarthi (Vakil Friend) chat interface.
 *
 * Chat text is forwarded to the NLP orchestrator and on to external AI
 * providers (Groq Llama 3.1, Gemini), so an unbounded input field lets a
 * single user drain the shared token quota, and injection-style phrasing can
 * pull the assistant away from its legal-focus system prompt.
 *
 * These helpers are the first line of defence only — the orchestrator
 * re-sanitizes and re-validates every query server-side.
 */

/** Maximum number of characters a single chat message may contain. */
export const MAX_CHAT_INPUT_LENGTH = 2000;

/** Fraction of the limit at which the character counter switches to red. */
export const CHAT_INPUT_WARNING_RATIO = 0.9;

const HTML_TAGS = /<[^>]*>/g;

const TAB = 9;
const LINE_FEED = 10;
const FIRST_PRINTABLE = 32;
const DELETE = 127;

// Phrasing commonly used to talk the assistant out of its system prompt.
// Matching is advisory: we warn the user, we never silently drop their text.
const INJECTION_PATTERNS = [
    /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
    /disregard\s+your\s+(system|initial)\s+prompt/i,
    /you\s+are\s+now\s+a/i,
    /act\s+as\s+if\s+you\s+are/i,
];

/**
 * Control characters carry no meaning in a legal question but can corrupt
 * prompt construction and downstream rendering. Tab and newline are kept so
 * multi-line questions survive intact.
 */
function isControlCharacter(character) {
    const code = character.codePointAt(0);
    if (code === TAB || code === LINE_FEED) return false;
    return code < FIRST_PRINTABLE || code === DELETE;
}

/**
 * Strip HTML/XML tags and control characters from a chat message and collapse
 * runs of blank lines. Mirrors `sanitize_user_input` in the NLP orchestrator.
 *
 * @param {string} text raw text from the input field or speech recognition
 * @returns {string} text safe to send to the backend
 */
export function sanitizeChatInput(text) {
    if (typeof text !== 'string') return '';

    const withoutTags = text.replace(HTML_TAGS, '');
    const printable = Array.from(withoutTags)
        .filter((character) => !isControlCharacter(character))
        .join('');

    return printable.replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * @param {string} text current input field value
 * @returns {boolean} true when the message is longer than the allowed limit
 */
export function isChatInputOverLimit(text) {
    return typeof text === 'string' && text.length > MAX_CHAT_INPUT_LENGTH;
}

/**
 * @param {string} text current input field value
 * @returns {boolean} true once the counter should be shown in red
 */
export function isChatInputNearLimit(text) {
    if (typeof text !== 'string') return false;
    return text.length >= MAX_CHAT_INPUT_LENGTH * CHAT_INPUT_WARNING_RATIO;
}

/**
 * Detect phrasing that commonly precedes a prompt injection attempt.
 *
 * @param {string} text current input field value
 * @returns {boolean} true when the user should see the advisory
 */
export function hasPromptInjectionPattern(text) {
    if (typeof text !== 'string' || !text.trim()) return false;
    return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Build the live counter label, e.g. `"1,847 / 2,000"`.
 *
 * @param {number} length current character count
 * @param {number} [limit] maximum allowed characters
 * @returns {string} formatted counter label
 */
export function formatCharacterCount(length, limit = MAX_CHAT_INPUT_LENGTH) {
    return `${length.toLocaleString('en-IN')} / ${limit.toLocaleString('en-IN')}`;
}
