"use client";

import Link from "next/link";
import { ChatAvatar } from "./ChatAvatar";
import type { Contact } from "./types";
import { ROUTE_PATHS } from "@/routes/paths";

interface ChatHeaderProps {
  contact: Contact;
  connected?: boolean;
}

export function ChatHeader({ contact, connected = true }: ChatHeaderProps) {
  return (
    <header className="py-3.5 px-5 border-b border-[#1a1a1a] flex items-center justify-between gap-3 bg-gray-50">
      <div className="flex items-center gap-3 min-w-0">
        <ChatAvatar letter={contact.avatar} color={contact.color} size="sm" />
        <div className="min-w-0">
          <div className="font-bold text-[15px] text-black truncate">{contact.name}</div>
          <div
            className="text-xs"
            style={{ color: connected ? "#31d95e" : "#666" }}
          >
            {/* {connected ? "Connected" : "Reconnecting…"} */}
          </div>
        </div>
      </div>
      <Link
        href={ROUTE_PATHS.HOME}
        className="flex-shrink-0 p-2 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
        title="Go to home feed"
        aria-label="Go to home feed"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </Link>
    </header>
  );
}
