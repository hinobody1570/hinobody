"use client";

import { ChatAvatar } from "./ChatAvatar";
import type { Contact } from "./types";

interface ContactItemProps {
  contact: Contact;
  isActive: boolean;
  lastMessagePreview?: string;
  onClick: () => void;
}

export function ContactItem({
  contact,
  isActive,
  lastMessagePreview,
  onClick,
}: ContactItemProps) {
  const preview = lastMessagePreview ?? contact.lastSeen;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 py-2.5 px-4 rounded-xl transition-colors duration-150
        hover:bg-white/5
        ${isActive ? "bg-white/10" : ""}
      `}
    >
      <ChatAvatar
        letter={contact.avatar}
        color={contact.color}
        // showOnline={contact.online}
      />
      <div className="flex-1 min-w-0 text-left">
        <div className="font-semibold text-sm text-black">{contact.name}</div>
        <div className="text-xs text-gray-500 mt-0.5 truncate">
          {preview}
        </div>
      </div>
    </button>
  );
}
