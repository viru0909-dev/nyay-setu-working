import { Link } from 'react-router-dom';

/**
 * Shown when a signed-in user hits a route their role cannot access.
 */
export default function UnauthorizedPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-amber-600 mb-2">
        403
      </p>
      <h1 className="text-3xl font-bold text-slate-900 mb-3">Unauthorized</h1>
      <p className="max-w-md text-slate-600 mb-8">
        You don&apos;t have permission to access this page. If you believe this is a
        mistake, try signing in with a different account or contact support.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Go home
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
