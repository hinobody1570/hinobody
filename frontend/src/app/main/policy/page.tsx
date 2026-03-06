"use client";

import { ROUTE_PATHS } from "@/routes/paths";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function PolicyPage() {
  const t = useTranslations("policy");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-500 to-slate-700 px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">{t("title")}</h1>
        <p className="text-gray-600 leading-relaxed text-center mb-8">{t("intro")}</p>
        <div className="mt-8 text-center">
          <Link
            href={ROUTE_PATHS.HOME}
            className="inline-block bg-slate-600 text-white px-6 py-2 rounded-md hover:bg-slate-700 transition-colors"
          >
            {t("backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
