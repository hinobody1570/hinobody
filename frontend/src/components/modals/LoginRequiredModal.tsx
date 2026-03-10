"use client";

import { useTranslations } from "next-intl";
import { FiX } from "react-icons/fi";

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  title?: string;
  description?: string;
  loginText?: string;
  closeText?: string;
}

export function LoginRequiredModal({
  isOpen,
  onClose,
  onLogin,
  title,
  description,
  loginText,
  closeText,
}: LoginRequiredModalProps) {
  const t = useTranslations("common");
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-gray-900/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 z-10">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {title || t("loginRequiredTitle")}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label={t("close")}
          >
            <FiX size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700">
            {description || t("loginRequiredBody")}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            {closeText || t("close")}
          </button>
          <button
            onClick={onLogin}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
          >
            {loginText || t("login")}
          </button>
        </div>
      </div>
    </div>
  );
}

