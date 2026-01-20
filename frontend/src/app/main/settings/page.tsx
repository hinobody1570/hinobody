'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [language, setLanguage] = useState(user?.language || 'en');
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('light');
  const [saved, setSaved] = useState(false);
  const t = useTranslations('settings');
  const tAuth = useTranslations('auth');
  const tLanguage = useTranslations('language');

  const handleSave = () => {
    // In production, save to backend
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-cyan-600 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800">{t('title')}</h1>
            <div className="space-x-2">
              <Link
                href="/main/dashboard"
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                {t('backToDashboard')}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                {tAuth('logout')}
              </button>
            </div>
          </div>

          {saved && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {t('settingsSaved')}
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('preferences')}</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('language')}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="en">{tLanguage('english')}</option>
                    <option value="ko">{tLanguage('korean')}</option>
                    <option value="zh">{tLanguage('chinese')}</option>
                    <option value="ja">{tLanguage('japanese')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('theme')}
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="light">{t('light')}</option>
                    <option value="dark">{t('dark')}</option>
                    <option value="auto">{t('auto')}</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('emailNotifications')}
                    </label>
                    <p className="text-sm text-gray-500">{t('receiveEmailUpdates')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('security')}</h2>
              <div className="space-y-3">
                <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-left">
                  {t('changePassword')}
                </button>
                <button className="w-full bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors text-left">
                  {t('twoFactorAuth')}
                </button>
                <button className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-left">
                  {t('deleteAccount')}
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setLanguage(user?.language || 'en');
                  setNotifications(true);
                  setTheme('light');
                }}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t('reset')}
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                {t('saveSettings')}
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>{t('note')}</strong> {t('demoSettings')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

