import { Link } from 'react-router-dom';
import { Home, ShieldAlert } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">

                <div className="flex justify-center mb-5">
                    <div className="bg-red-100 p-4 rounded-full">
                        <ShieldAlert className="w-10 h-10 text-red-500" />
                    </div>
                </div>

                <h1 className="text-5xl font-bold text-gray-800 mb-2">
                    404
                </h1>

                <h2 className="text-2xl font-semibold text-gray-700 mb-3">
                    Page Not Found
                </h2>

                <p className="text-gray-500 mb-6">
                    The page you are trying to access does not exist.
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-black text-white rounded-xl hover:opacity-90 transition"
                >
                    <Home size={18} />
                    Go Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;