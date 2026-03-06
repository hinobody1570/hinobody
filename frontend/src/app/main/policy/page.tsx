"use client";

import { ROUTE_PATHS } from "@/routes/paths";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import policyDocumentsEn from "@/content/policy-documents-en.json";
import policyDocumentsJa from "@/content/policy-documents-ja.json";
import policyDocumentsKo from "@/content/policy-documents-ko.json";
import policyDocumentsZh from "@/content/policy-documents-zh.json";

type PolicySection = { number: number; title: string; body: string };
type PolicyDocument = { id: string; title: string; sections: PolicySection[] };

const POLICY_DOCUMENTS_BY_LOCALE: Record<string, PolicyDocument[]> = {
  en: policyDocumentsEn as PolicyDocument[],
  zh: policyDocumentsZh as PolicyDocument[],
  ko: policyDocumentsKo as PolicyDocument[],
  ja: policyDocumentsJa as PolicyDocument[],
};

function formatBody(body: string) {
  const lines = body.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let paragraphLines: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={elements.length} className="list-disc list-inside ml-4 my-2 space-y-1 text-gray-600">
          {listItems.map((item, i) => (
            <li key={i}>{item.trim().replace(/^[•\-]\s*/, "")}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      const text = paragraphLines.join(" ").trim();
      if (text) {
        elements.push(
          <p key={elements.length} className="my-2 text-gray-600 leading-relaxed">
            {text}
          </p>
        );
      }
      paragraphLines = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      flushParagraph();
      continue;
    }
    if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
      flushParagraph();
      listItems.push(trimmed);
    } else {
      flushList();
      paragraphLines.push(trimmed);
    }
  }
  flushList();
  flushParagraph();

  return <div className="space-y-1">{elements}</div>;
}

export default function PolicyPage() {
  const t = useTranslations("policy");
  const locale = useLocale();
  const documents = POLICY_DOCUMENTS_BY_LOCALE[locale] ?? POLICY_DOCUMENTS_BY_LOCALE.en;

  return (
    <div className="min-h-screen px-4 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8 md:p-10 space-y-14">
          {documents.map((doc) => (
            <article key={doc.id} id={doc.id} className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-slate-200">
                {doc.title}
              </h2>
              <div className="space-y-8">
                {doc.sections.map((section) => (
                  <section key={section.number} className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-baseline gap-2">
                      <span className="text-slate-500 font-mono text-sm">{section.number}.</span>
                      {section.title}
                    </h3>
                    <div className="pl-5 border-l-2 border-slate-200">
                      {formatBody(section.body)}
                    </div>
                  </section>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="p-6 sm:p-8 md:p-10 border-t border-gray-100 bg-slate-50/30 text-center">
          <Link
            href={ROUTE_PATHS.HOME}
            className="inline-block bg-slate-600 text-white px-6 py-2.5 rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            {t("backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
