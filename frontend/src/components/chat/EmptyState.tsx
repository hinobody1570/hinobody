"use client";

import { useTranslations } from "next-intl";
import { ChatAvatar } from "./ChatAvatar";
import type { Contact } from "./types";

interface EmptyStateProps {
  contact: Contact;
  isPlaceholder?: boolean;
}

export function EmptyState({ contact, isPlaceholder }: EmptyStateProps) {
  const t = useTranslations("chat");
  if (isPlaceholder) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-500 px-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div className="font-semibold text-base text-gray-700 text-center">{t("selectOrStartChat")}</div>
        <div className="text-[13px] text-center">{t("useStartNewChatBelow")}</div>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-500">
      <ChatAvatar letter={contact.avatar} color={contact.color} size="lg" />
      <div className="font-semibold text-base text-gray-700 mt-2">{contact.name}</div>
      <div className="text-[13px]">{t("startYourConversation")}</div>
    </div>
  );
}
