import { useTranslations } from "next-intl";
import React from "react";

const PostingGuide = () => {
  const t = useTranslations("createPost");

  return (
    <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-800 mb-3">{t("postingGuidelines")}</h3>
      <ul className="space-y-2 text-sm text-gray-600">
        <li className="flex items-start gap-2">
          <span className="text-gray-400">•</span>
          <span>{t("guidelines.rememberHuman")}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-gray-400">•</span>
          <span>{t("guidelines.behaveRealLife")}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-gray-400">•</span>
          <span>{t("guidelines.originalSource")}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-gray-400">•</span>
          <span>{t("guidelines.searchDuplicates")}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-gray-400">•</span>
          <span>{t("guidelines.readRules")}</span>
        </li>
      </ul>
    </div>
  );
};

export default PostingGuide;
