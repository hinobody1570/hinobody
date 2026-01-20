"use client";

import { useState } from "react";
import { FiX } from "react-icons/fi";
import { useTranslations } from "next-intl";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  title?: string;
  isLoading?: boolean;
}

export const ReportModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  isLoading = false,
}: ReportModalProps) => {
  const t = useTranslations("postCard");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!reason.trim()) {
      setError(t("pleaseProvideReason"));
      return;
    }

    if (reason.trim().length < 10) {
      setError(t("reasonMinLength"));
      return;
    }

    try {
      await onSubmit(reason.trim());
      setReason("");
      onClose();
    } catch (err: any) {
      setError(err.message || t("failedToSubmitReport"));
    }
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{title || t("reportPost")}</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            disabled={isLoading}
          >
            <FiX size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("reasonForReporting")}
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              placeholder={t("reasonPlaceholder")}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isLoading}
              minLength={10}
            />
            <p className="mt-1 text-xs text-gray-500">
              {t("minimumCharactersRequired")}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isLoading || !reason.trim() || reason.trim().length < 10}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? t("submitting") : t("submitReport")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

