"use client";

import { ChatAvatar } from "./ChatAvatar";
import type { Contact } from "./types";

interface ChatHeaderProps {
  contact: Contact;
}

export function ChatHeader({ contact }: ChatHeaderProps) {
  return (
    <header className="py-3.5 px-5 border-b border-[#1a1a1a] flex items-center gap-3 bg-gray-50">
      <ChatAvatar letter={contact.avatar} gradient size="sm" />
      <div>
        <div className="font-bold text-[15px] text-black">{contact.name}</div>
        <div
          className="text-xs"
          style={{ color: contact.online ? "#31d95e" : "#666" }}
        >
          {contact.lastSeen}
        </div>
      </div>
    </header>
  );
}
