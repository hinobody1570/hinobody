import { useTranslations } from "next-intl";
import React from "react";

const PostingGuide = () => {
  const t = useTranslations("createPost");

  return (
    <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
      <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-base sm:text-inherit">{t("postingGuidelines")}</h3>
      <ul className="space-y-1.5 sm:space-y-2 text-sm text-gray-600">
        <li className="flex items-start gap-2">
          <span className="text-gray-400">•</span>
          <span>{t("guidelines.photoResponsibility")}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-gray-400">•</span>
          <span>{t("guidelines.unpublishedNotStored")}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-gray-400">•</span>
          <span>{t("guidelines.noMedicalAdvice")}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-gray-400">•</span>
          <span>{t("guidelines.consultMedicalProfessional")}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-gray-400">•</span>
          <span>{t("guidelines.contentResponsibility")}</span>
        </li>
      </ul>
    </div>
  );
};

export default PostingGuide;
