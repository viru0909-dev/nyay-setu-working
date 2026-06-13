export const GUEST_SEARCH_VISIBLE_LIMIT = 3;
export const GUEST_SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

export const GUEST_STORAGE_KEYS = {
    user: 'guest_user',
    sessionId: 'guest_session_id',
    createdAt: 'guest_created_at',
    modalShown: 'guest_modal_shown',
    prefs: 'guest_prefs',
    intent: 'guest_post_auth_intent',
    onboarding: 'guest_onboarding_dismissed',
};

export const GUEST_ONBOARDING_STEPS = [
    'Browse the Constitution and public pages freely.',
    'Try the AI assistant for general legal questions.',
    'Create an account when you are ready to file cases or access your dashboard.',
];
