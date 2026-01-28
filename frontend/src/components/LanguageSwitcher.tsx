"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BiCheck, BiChevronDown } from "react-icons/bi";
import CHINA_FLAG from "./../../public/assets/images/flag/chinease.webp";
import ENGLISH_FLAG from "./../../public/assets/images/flag/english.webp";
import JAPAN_FLAG from "./../../public/assets/images/flag/japan.png";
import KOREAN_FLAG from "./../../public/assets/images/flag/koren.png";

const languages = [
  { code: "en", name: "English", nativeName: "English", flag: ENGLISH_FLAG },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: KOREAN_FLAG },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: CHINA_FLAG },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: JAPAN_FLAG },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

  const t = useTranslations("language");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: any) => {
    setLocale(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button - compact on mobile, full on sm+ */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex items-center gap-1.5 sm:gap-2 px-2.5 py-2 sm:px-4 sm:py-2.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 justify-center sm:justify-start bg-white border border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        aria-label="Switch language"
      >
        <Image src={currentLanguage.flag} alt={currentLanguage.name} className="w-5 h-5 sm:w-6 sm:h-6 object-cover flex-shrink-0" />
        <span className="hidden sm:inline font-medium text-gray-700">{currentLanguage.nativeName}</span>
        <BiChevronDown size={18} className={`text-gray-500 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu - responsive width, touch-friendly on mobile */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[min(200px,calc(100vw-2rem))] sm:w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="py-2 max-h-[min(288px,60vh)] overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`cursor-pointer w-full flex items-center justify-between px-3 py-3 sm:px-4 min-h-[44px] sm:min-h-0 hover:bg-blue-50 transition-colors duration-150 ${
                  locale === lang.code ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Image src={lang.flag} alt={lang.name} className="w-6 h-6 flex-shrink-0 block object-cover" />
                  <div className="text-left min-w-0">
                    <p className="font-medium text-gray-800 truncate">{lang.nativeName}</p>
                    <p className="text-xs text-gray-500 truncate">{lang.name}</p>
                  </div>
                </div>

                {locale === lang.code && <BiCheck size={18} className="text-blue-600 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
