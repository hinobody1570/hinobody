"use client";

import { ChatAvatar } from "./ChatAvatar";
import type { Contact } from "./types";

interface EmptyStateProps {
  contact: Contact;
}

export function EmptyState({ contact }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-500">
      <ChatAvatar letter={contact.avatar} gradient size="lg" />
      <div className="font-semibold text-base text-white mt-2">{contact.name}</div>
      <div className="text-[13px]">Start your conversation</div>
    </div>
  );
}
