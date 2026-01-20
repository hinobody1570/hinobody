"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { IoClose, IoChevronBack, IoChevronForward } from "react-icons/io5";
import { boardsApi, CreateBoardDto, BoardVisibility } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

interface StartCommunityPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  "health",
  "sport",
  "study",
  "tourist",
  "entertainment",
  "technology",
  "food",
  "travel",
  "fashion",
  "music",
  "art",
  "photography",
  "gaming",
  "books",
  "movies",
  "science",
  "business",
  "education",
  "lifestyle",
  "pets",
];

const StartCommunityPopup = ({ isOpen, onClose }: StartCommunityPopupProps) => {
  const t = useTranslations("startCommunity");
  const tToast = useTranslations("toast");
  const { showSuccess, showError } = useToast();
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [visibility, setVisibility] = useState<BoardVisibility>("PUBLIC");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Mount check for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Reset form when popup closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedCategory("");
      setVisibility("PUBLIC");
      setName("");
      setDescription("");
    }
  }, [isOpen]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleNext = () => {
    if (step === 1 && selectedCategory) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showError(t("nameRequired"));
      return;
    }

    if (!selectedCategory) {
      showError(t("categoryRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      const boardData: CreateBoardDto = {
        name: name.trim(),
        category: selectedCategory,
        description: description.trim() || undefined,
        visibilityAccess: visibility,
      };

      await boardsApi.create(boardData);
      showSuccess(tToast("communityCreatedSuccess") || t("communityCreatedSuccess"));
      onClose();
    } catch (error: any) {
      console.error("Error creating community:", error);
      const errorMessage = error?.message || tToast("communityCreatedError") || t("communityCreatedError");
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div ref={popupRef} className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 1 && t("step1Title")}
            {step === 2 && t("step2Title")}
            {step === 3 && t("step3Title")}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
            <IoClose className="w-6 h-6" />
          </button>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {/* Step 1: Category Selection */}
          {step === 1 && (
            <div>
              <p className="text-gray-600 mb-4">{t("step1Description")}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                    className={`px-4 py-3 cursor-pointer rounded-lg border-2 transition-all text-sm font-medium ${
                      selectedCategory === category
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {t(`categories.${category}`) || category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Visibility Selection */}
          {step === 2 && (
            <div>
              <p className="text-gray-600 mb-6">{t("step2Description")}</p>
              <div className="space-y-4">
                {(
                  [
                    { value: "PUBLIC", label: t("visibility.public"), desc: t("visibility.publicDesc") },
                    { value: "PRIVATE", label: t("visibility.private"), desc: t("visibility.privateDesc") },
                    { value: "RESTRICTED", label: t("visibility.restricted"), desc: t("visibility.restrictedDesc") },
                  ] as const
                ).map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      visibility === option.value ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={visibility === option.value}
                      onChange={(e) => setVisibility(e.target.value as BoardVisibility)}
                      className="mt-1 mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Name and Description */}
          {step === 3 && (
            <div>
              <p className="text-gray-600 mb-6">{t("step3Description")}</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("nameLabel")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("namePlaceholder")}
                    maxLength={100}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {name.length}/100 {t("characters")}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("descriptionLabel")}</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("descriptionPlaceholder")}
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {description.length}/500 {t("characters")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={step === 1 ? onClose : handleBack}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            {step > 1 && <IoChevronBack className="w-4 h-4" />}
            {step === 1 ? t("cancel") : t("back")}
          </button>
          {/* Progress Indicator */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-3 align-center">
              {[1, 2, 3].map((s) => (
                <div className={`w-4 h-4 rounded-full ${step >= s ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}></div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={(step === 1 && !selectedCategory) || (step === 2 && !visibility)}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                  (step === 1 && selectedCategory) || (step === 2 && visibility)
                    ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {t("next")}
                <IoChevronForward className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!name.trim() || isSubmitting}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                  name.trim() && !isSubmitting ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? t("creating") : t("createCommunity")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default StartCommunityPopup;
