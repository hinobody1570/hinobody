"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">{t('title')}</h1>

        <div className="prose max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">{t('welcomeToHiNobody')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('welcomeDescription')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">{t('features')}</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t('aiPowered')}</li>
              <li>{t('realtimeProcessing')}</li>
              <li>{t('multiLanguage')}</li>
              <li>{t('secureAuth')}</li>
              <li>{t('responsiveDesign')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">{t('technologyStack')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('techDescription')}
            </p>
          </section>

          <section className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">{t('contact')}</h2>
            <p className="text-gray-600">{t('contactDescription')}</p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="inline-block bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors">
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}

