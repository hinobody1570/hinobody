'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const t = useTranslations('common');

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-rose-600 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-4xl font-bold text-gray-800">Profile</h1>
              <div className="space-x-2">
                <Link
                  href="/dashboard"
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Back to Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">User Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-700 w-32">User ID:</span>
                    <span className="text-gray-600">{user?.id}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-700 w-32">Email:</span>
                    <span className="text-gray-600">{user?.email}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-700 w-32">Nickname:</span>
                    <span className="text-gray-600">{user?.nickname}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-700 w-32">Role:</span>
                    <span className="text-gray-600 capitalize">{user?.role || 'User'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-700 w-32">Language:</span>
                    <span className="text-gray-600 uppercase">{user?.language || 'EN'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Actions</h2>
                <div className="space-y-3">
                  <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-left">
                    Edit Profile
                  </button>
                  <button className="w-full bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors text-left">
                    Change Password
                  </button>
                  <button className="w-full bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors text-left">
                    Privacy Settings
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This is a demo profile page. In production, these actions would be fully functional.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

