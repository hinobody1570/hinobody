"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ContactItem } from "./ContactItem";
import { ChatAvatar } from "./ChatAvatar";
import type { Contact, MessagesByContact } from "./types";

interface CurrentUserProps {
  nickname: string;
  avatar?: string | null;
}

interface ChatSidebarProps {
  contacts: Contact[];
  selectedContact: Contact;
  messages: MessagesByContact;
  currentUser?: CurrentUserProps | null;
  onSelectContact: (contact: Contact) => void;
  onStartNewChat?: () => void;
}

export function ChatSidebar({
  contacts,
  selectedContact,
  messages,
  currentUser,
  onSelectContact,
  onStartNewChat,
}: ChatSidebarProps) {
  const t = useTranslations("chat");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => c.name.toLowerCase().includes(q));
  }, [contacts, searchQuery]);

  const avatarLetter =
    currentUser?.avatar && (currentUser.avatar.startsWith("http") || currentUser.avatar.startsWith("/"))
      ? currentUser.avatar
      : currentUser?.nickname?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <aside className="w-[340px] border-r border-[#1a1a1a] flex flex-col bg-gray-50 flex-shrink-0">
      <div className="py-5 px-4 pb-3 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-3 mb-4">
          <ChatAvatar
            letter={avatarLetter}
            color="#64748b"
            size="md"
          />
          <span className="text-xl font-bold tracking-tight text-black truncate">{t("messages")}</span>
        </div>
        <div className="bg-gray-200 rounded-[10px] py-2 px-3.5 flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="text-gray-500"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="flex-1 bg-transparent border-none text-black text-sm outline-none font-[inherit] placeholder:text-gray-500"
            aria-label={t("searchPlaceholder")}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2 chat-scrollbar flex flex-col">
        {filteredContacts.map((contact) => {
          const thread = messages[contact.id];
          const lastFromThread =
            thread?.length && thread[thread.length - 1].text
              ? thread[thread.length - 1].text.slice(0, 28) + (thread[thread.length - 1].text.length > 28 ? "…" : "")
              : undefined;
          const lastMsg = contact.lastMessage ?? lastFromThread;
          return (
            <ContactItem
              key={contact.id}
              contact={contact}
              isActive={selectedContact.id === contact.id}
              lastMessagePreview={lastMsg}
              onClick={() => onSelectContact(contact)}
            />
          );
        })}
        {onStartNewChat && (
          <button
            type="button"
            onClick={onStartNewChat}
            className="w-full flex cursor-pointer items-center gap-3 py-2.5 px-4 rounded-xl transition-colors duration-150 hover:bg-white/5 text-left border border-dashed border-gray-300 mt-2"
          >
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <span className="font-semibold text-sm text-black">{t("startNewChat")}</span>
          </button>
        )}
      </div>
    </aside>
  );
}
