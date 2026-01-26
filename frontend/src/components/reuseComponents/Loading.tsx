import { useTranslations } from "next-intl";
import React from "react";

interface propTypes {
  title?: string;
}

const Loading = ({ title }: propTypes) => {
  const t = useTranslations("admin");

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-gray-500">{title || t("loading")}</div>
    </div>
  );
};

export default Loading;
