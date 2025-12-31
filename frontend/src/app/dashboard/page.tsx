'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const t = useTranslations('dashboard');
  const tAuth = useTranslations('auth');

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-blue-600 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800">{t('title')}</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
            >
              {tAuth('logout')}
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">{t('welcomeBack')}</h2>
            <p className="text-blue-700">
              {t('loggedInAs')} <strong>{user?.email}</strong>
            </p>
            <p className="text-blue-700">
              {t('nickname')} <strong>{user?.nickname}</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">{t('profile')}</h3>
              <p className="mb-4">{t('manageAccount')}</p>
              <Link
                href="/profile"
                className="inline-block bg-white text-purple-600 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                {t('goToProfile')}
              </Link>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-lg p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">{t('settings')}</h3>
              <p className="mb-4">{t('configurePreferences')}</p>
              <Link
                href="/settings"
                className="inline-block bg-white text-green-600 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                {t('goToSettings')}
              </Link>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">{t('home')}</h3>
              <p className="mb-4">{t('returnToMainPage')}</p>
              <Link
                href="/"
                className="inline-block bg-white text-orange-600 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                {t('goToHome')}
              </Link>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('quickStats')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">0</div>
                <div className="text-sm text-gray-600">{t('totalPosts')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">0</div>
                <div className="text-sm text-gray-600">{t('comments')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">0</div>
                <div className="text-sm text-gray-600">{t('likes')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">0</div>
                <div className="text-sm text-gray-600">{t('views')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

