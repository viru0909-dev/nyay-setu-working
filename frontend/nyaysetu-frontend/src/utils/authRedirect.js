import useAuthStore from '../store/authStore';

const ROLE_HOME = {
    ADMIN: '/admin',
    JUDGE: '/judge',
    LAWYER: '/lawyer',
    LITIGANT: '/litigant',
    POLICE: '/police',
    TECH_ADMIN: '/admin',
    TECHNICAL_TEAM: '/admin',
    SUPER_JUDGE: '/admin',
};

/**
 * Resolves where to send the user after login/signup.
 * Priority: saved guest intent → attempted protected path → role home.
 */
export function resolvePostAuthPath(role, locationState) {
    const { getGuestIntent, clearGuestIntent } = useAuthStore.getState();
    const intent = getGuestIntent();

    if (intent?.path) {
        clearGuestIntent();
        return intent.path;
    }

    const roleHome = ROLE_HOME[role] || '/';
    const attemptedPath = locationState?.from?.pathname;

    if (attemptedPath && (attemptedPath.startsWith(roleHome) || attemptedPath === '/litigant/file')) {
        return attemptedPath;
    }

    return roleHome;
}
