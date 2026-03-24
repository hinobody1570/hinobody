"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  autoFocus?: boolean;
}

export function ChatInput({ value, onChange, onSend, autoFocus = false }: ChatInputProps) {
  const t = useTranslations("chat");
  const hasText = value.trim().length > 0;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!autoFocus) return;
    inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <div className="py-3 px-4 border-t border-[#1a1a1a] flex items-center gap-2.5">
      <div className="flex-1 bg-gray-50 rounded-[22px] py-2.5 px-4 flex items-center gap-2 border border-[#2a2a2a] transition-colors focus-within:border-[#333]">
        <input
          ref={inputRef}
          type="text"
          placeholder={t("messagePlaceholder")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          className="flex-1 text-black bg-transparent border-none text-sm font-[inherit] outline-none placeholder:text-gray-500"
        />
      </div>

      {hasText && (
        <button
          type="button"
          onClick={onSend}
          className="py-1.5 px-2.5 rounded-lg text-[#3897f0] text-[13px] font-semibold tracking-wide hover:opacity-75 disabled:opacity-30 disabled:cursor-default transition-opacity"
        >
          {t("send")}
        </button>
      )}
    </div>
  );
}
