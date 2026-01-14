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
        className="cursor-pointer mb-4 px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2"
      >
        {t("addTags")}
        {tags.length > 0 && (
          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
            {tags.length}
          </span>
        )}
      </button>

      {/* Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={popupRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("addTagTitle")}
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <IoClose className="w-6 h-6" />
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400"
              />
              <p className="mt-2 text-xs text-gray-500">
                {t("tagHint")}
              </p>
            </div>

            {/* Tags Display */}
            {tags.length > 0 && (
              <div className="mb-4">
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
                        className="text-blue-500 cursor-pointer hover:text-blue-700 transition-colors"
                      >
                        <IoClose className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-purple-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                {t("done")}
              </button>
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!inputValue.trim()}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
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
      )}
    </>
  );
};

export default TagsInput;

