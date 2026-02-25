"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChatAvatar } from "./ChatAvatar";
import type { Contact } from "./types";
import { ROUTE_PATHS } from "@/routes/paths";

interface ChatHeaderProps {
  contact: Contact;
  connected?: boolean;
  /** On mobile: when set, shows a back button to return to conversation list (sidebar). */
  onBack?: () => void;
}

export function ChatHeader({ contact, connected = true, onBack }: ChatHeaderProps) {
  const t = useTranslations("chat");
  return (
    <header className="py-3.5 px-5 border-b border-[#1a1a1a] flex items-center justify-between gap-3 bg-gray-50">
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="md:hidden flex-shrink-0 p-2 -ml-1 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
            title={t("backToConversations")}
            aria-label={t("backToConversations")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <ChatAvatar letter={contact.avatar} color={contact.color} size="sm" />
        <div className="min-w-0">
          <div className="font-bold text-[15px] text-black truncate">{contact.name}</div>
        </div>
      </div>
      <Link
        href={ROUTE_PATHS.HOME}
        className="flex-shrink-0 p-2 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
        title={t("goToHomeFeed")}
        aria-label={t("goToHomeFeedAria")}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </Link>
    </header>
  );
}
