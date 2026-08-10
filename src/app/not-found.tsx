import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      {/* Engaging Illustration Placeholder */}
      <div className="mb-8 w-64 h-64 bg-emerald-50 rounded-full flex items-center justify-center">
        <svg
          className="w-32 h-32 text-emerald-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-3-3v6"
          />
        </svg>
      </div>

      <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
        404 - Page Not Found
      </h1>
      
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        Oops! It looks like this page got lost in the wild. Let's get you back on the right path.
      </p>

      <Link 
        href="/"
        className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        Return to Homepage
      </Link>
    </div>
  );
}
