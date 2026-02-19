"use client";

import { ContactItem } from "./ContactItem";
import type { Contact, MessagesByContact } from "./types";

interface ChatSidebarProps {
  contacts: Contact[];
  selectedContact: Contact;
  messages: MessagesByContact;
  onSelectContact: (contact: Contact) => void;
}

export function ChatSidebar({
  contacts,
  selectedContact,
  messages,
  onSelectContact,
}: ChatSidebarProps) {
  return (
    <aside className="w-[340px] border-r border-[#1a1a1a] flex flex-col bg-gray-50 flex-shrink-0">
      <div className="py-5 px-4 pb-3 border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold tracking-tight text-black">Messages</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </div>
        <div className="bg-gray-200  rounded-[10px] py-2 px-3.5 flex items-center gap-2">
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
            placeholder="Search"
            className="flex-1 bg-transparent border-none text-white text-sm outline-none font-[inherit] placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2 chat-scrollbar">
        {contacts.map((contact) => {
          const thread = messages[contact.id];
          const lastMsg = thread?.length
            ? thread[thread.length - 1].text.slice(0, 28) + "…"
            : undefined;
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
      </div>
    </aside>
  );
}
