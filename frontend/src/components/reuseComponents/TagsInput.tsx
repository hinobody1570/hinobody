"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { IoClose } from "react-icons/io5";

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

const TagsInput = ({ tags, onChange }: TagsInputProps) => {
  const t = useTranslations("createPost");
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Focus input when popup opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('[data-tags-button]')
      ) {
        setIsOpen(false);
        setInputValue("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleAddTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onChange([...tags, trimmedValue]);
      setInputValue("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setInputValue("");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setInputValue("");
  };

  return (
    <>
      {/* Add Tags Button */}
      <button
        type="button"
        data-tags-button
        onClick={() => setIsOpen(true)}
        className="cursor-pointer mb-3 sm:mb-4 px-4 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2 touch-manipulation"
      >
        {t("addTags")}
        {tags.length > 0 && (
          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
            {tags.length}
          </span>
        )}
      </button>

      {/* Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div
            ref={popupRef}
            className="bg-white rounded-t-xl sm:rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col"
          >
            <div className="p-4 sm:p-6 flex-shrink-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  {t("addTagTitle")}
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 -m-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer touch-manipulation"
                  aria-label="Close"
                >
                  <IoClose className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Input Field */}
              <div className="mb-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("tagPlaceholder")}
                  className="w-full px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400 text-base sm:text-inherit"
                />
                <p className="mt-2 text-xs text-gray-500">
                  {t("tagHint")}
                </p>
              </div>

              {/* Tags Display */}
              {tags.length > 0 && (
                <div className="mb-4 max-h-32 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-500 cursor-pointer hover:text-blue-700 transition-colors p-0.5 -m-0.5 rounded touch-manipulation"
                          aria-label={`Remove ${tag}`}
                        >
                          <IoClose className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto min-h-[44px] sm:min-h-0 px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 border border-purple-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer touch-manipulation"
                >
                  {t("done")}
                </button>
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!inputValue.trim()}
                  className={`w-full sm:w-auto min-h-[44px] sm:min-h-0 px-4 py-2.5 sm:py-2 text-sm font-medium rounded-lg transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed ${
                    inputValue.trim()
                      ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {t("addTag")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TagsInput;

