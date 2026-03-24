"use client";

import { useTranslations } from "next-intl";
import { ChatAvatar } from "./ChatAvatar";
import type { Contact } from "./types";

interface ContactItemProps {
  contact: Contact;
  isActive: boolean;
  lastMessagePreview?: string;
  unreadCount?: number;
  onClick: () => void;
}

export function ContactItem({ contact, isActive, lastMessagePreview, unreadCount = 0, onClick }: ContactItemProps) {
  const t = useTranslations("chat");
  const preview = lastMessagePreview ?? contact.lastSeen ?? t("noMessagesYet");
  const showUnread = unreadCount > 0 && !isActive;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? "true" : undefined}
      className={`
        w-full flex items-center gap-3 py-2.5 px-4 rounded-xl border transition-all duration-150
        ${isActive
          ? "bg-gray-200 border-gray-300 ring-1 ring-gray-300"
          : "border-transparent hover:bg-gray-100"}
      `}
    >
      <ChatAvatar
        letter={contact.avatar ?? contact.name?.charAt(0).toUpperCase()}
        color={"red"}
        // showOnline={contact.online}
      />
      <div className="flex-1 min-w-0 text-left">
        <div className="font-semibold text-sm text-black">{contact.name}</div>
        <div className={`text-xs mt-0.5 truncate ${isActive ? "text-gray-700" : "text-gray-500"}`}>{preview}</div>
      </div>
      {showUnread && (
        <span className="min-w-5 h-5 px-1 rounded-full bg-[#3897f0] text-white text-[11px] leading-5 font-semibold text-center">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
