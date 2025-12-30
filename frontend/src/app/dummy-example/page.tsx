"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import Link from "next/link";

/**
 * DUMMY ROUTE FOR UNDERSTANDING
 *
 * This is an example route that demonstrates:
 * 1. How file-based routing works in Next.js App Router
 * 2. How dynamic route protection works via routes.config.ts
 *
 * File location: frontend/src/app/dummy-example/page.tsx
 * URL: /dummy-example (no locale in URL!)
 *
 * Route protection is handled automatically by RouteGuard in the layout.
 * Check routes.config.ts to change access level (public/private).
 */

export default function DummyExamplePage() {
  const { isAuthenticated, user } = useAuth();
  const t = useTranslations("common");

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 to-orange-500 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Dummy Example Route</h1>
          <p className="text-lg text-gray-600 mb-6">This is a dummy route created for understanding the routing system.</p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Route Information</h2>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>
                <strong>File Path:</strong> app/dummy-example/page.tsx
              </li>
              <li>
                <strong>URL Pattern:</strong> /dummy-example (no locale!)
              </li>
              <li>
                <strong>Route Type:</strong> Public (accessible without login)
              </li>
              <li>
                <strong>Locale:</strong> Stored in localStorage, not in URL
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Public Routes</h3>
              <p className="text-green-700 mb-3">Public routes are accessible to everyone, even without authentication.</p>
              <ul className="list-disc list-inside text-green-700 text-sm space-y-1">
                <li>/login</li>
                <li>/register</li>
                <li>/about</li>
                <li>/dummy-example (this page)</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-3">Private Routes</h3>
              <p className="text-red-700 mb-3">Private routes require authentication. Users are redirected to login if not authenticated.</p>
              <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                <li>/dashboard</li>
                <li>/profile</li>
                <li>/settings</li>
              </ul>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-3">How to Create Routes</h3>
            <ol className="list-decimal list-inside text-purple-700 space-y-2">
              <li>
                Create a folder in <code className="bg-purple-100 px-1 rounded">app/</code>
              </li>
              <li>
                Add a <code className="bg-purple-100 px-1 rounded">page.tsx</code> file inside
              </li>
              <li>
                Add route config in <code className="bg-purple-100 px-1 rounded">routes.config.ts</code> with access level (public/private)
              </li>
              <li>Export a default React component (no wrapper needed!)</li>
              <li>
                The route is automatically available at <code className="bg-purple-100 px-1 rounded">/your-route-name</code> (no locale!)
              </li>
              <li>RouteGuard handles protection automatically based on config!</li>
            </ol>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Auth Status</h3>
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>Authenticated:</strong>{" "}
                <span className={isAuthenticated ? "text-green-600" : "text-red-600"}>{isAuthenticated ? "Yes" : "No"}</span>
              </p>
              {isAuthenticated && user && (
                <p className="text-gray-700">
                  <strong>User:</strong> {user.email}
                </p>
              )}
              {!isAuthenticated && <p className="text-sm text-gray-500">Try logging in to see how private routes work!</p>}
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <Link href="/login" className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors">
              Go to Login
            </Link>
            {isAuthenticated ? (
              <Link href="/dashboard" className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors">
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/about" className="bg-purple-500 text-white px-6 py-2 rounded-md hover:bg-purple-600 transition-colors">
                Go to About
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Code Example</h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
            {`// 1. Add route to routes.config.ts
{
  path: '/my-route',
  access: 'public', // or 'private' or 'public-redirect-if-auth'
  redirectTo: '/login' // optional, for private routes
}

// 2. Create page - NO WRAPPER NEEDED!
export default function MyPage() {
  return <div>This page is protected automatically!</div>;
}

// That's it! RouteGuard handles everything!`}
          </pre>
        </div>
      </div>
    </div>
  );
}

