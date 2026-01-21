"use client";

import { useTranslations } from "next-intl";
import { FiX } from "react-icons/fi";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: "red" | "blue" | "green";
  isLoading?: boolean;
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  confirmButtonColor = "red",
  isLoading = false,
}: ConfirmationModalProps) => {
  const t = useTranslations("admin");

  if (!isOpen) return null;

  const buttonColors = {
    red: "bg-red-600 hover:bg-red-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/60 flex items-center justify-center"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <FiX size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700">{description}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {cancelText || t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${buttonColors[confirmButtonColor]}`}
          >
            {isLoading ? t("loading") : confirmText || t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
};

