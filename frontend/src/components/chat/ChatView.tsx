"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ChatSidebar } from "./ChatSidebar";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { EmptyState } from "./EmptyState";
import { ChatInput } from "./ChatInput";
import type { Contact, MessagesByContact } from "./types";

interface ChatViewProps {
  contacts: Contact[];
  selectedContact: Contact;
  messages: MessagesByContact;
  input: string;
  currentUserId: string;
  currentUser?: { nickname: string; avatar?: string | null } | null;
  connected?: boolean;
  loadingMessages?: boolean;
  error?: string | null;
  onSelectContact: (contact: Contact) => void;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onEditMessage?: (messageId: string, text: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onDismissError?: () => void;
  onStartNewChat?: () => void;
  /** When false (e.g. opened via ?with=userId), start with conversation visible on mobile. */
  initialSidebarOpen?: boolean;
}

export function ChatView({
  contacts,
  selectedContact,
  messages,
  input,
  currentUserId,
  currentUser,
  connected = true,
  loadingMessages = false,
  error,
  onSelectContact,
  onInputChange,
  onSend,
  onEditMessage,
  onDeleteMessage,
  onDismissError,
  onStartNewChat,
  initialSidebarOpen = true,
}: ChatViewProps) {
  const t = useTranslations("chat");
  const endRef = useRef<HTMLDivElement>(null);
  const currentMsgs = messages[selectedContact.id] ?? [];
  const [sidebarOpen, setSidebarOpen] = useState(initialSidebarOpen);

  const handleSelectContact = useCallback(
    (contact: Contact) => {
      onSelectContact(contact);
      if (contact.id !== "__placeholder__") setSidebarOpen(false);
    },
    [onSelectContact]
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedContact.id]);

  return (
    <div className="h-full flex overflow-hidden bg-black text-white font-[inherit]">
      <ChatSidebar
        contacts={contacts}
        selectedContact={selectedContact}
        messages={messages}
        currentUser={currentUser}
        onSelectContact={handleSelectContact}
        onStartNewChat={onStartNewChat}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />

      <div
        className={`flex-1 flex flex-col bg-gray-50 min-w-0 ${sidebarOpen ? "hidden md:flex" : "flex"}`}
      >
        <ChatHeader
          contact={selectedContact}
          connected={connected}
          onBack={sidebarOpen ? undefined : () => setSidebarOpen(true)}
        />
        {/* {error && (
          <div className="px-4 py-2 bg-red-100 text-red-800 text-sm flex items-center justify-between">
            <span>{error}</span>
            {onDismissError && (
              <button type="button" onClick={onDismissError} className="font-medium">
                Dismiss
              </button>
            )}
          </div>
        )} */}
        <div className="flex-1 overflow-y-auto py-5 px-5 pb-3 flex flex-col gap-1 chat-scrollbar">
          {loadingMessages ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              {t("loadingMessages")}
            </div>
          ) : currentMsgs.length === 0 ? (
            <EmptyState contact={selectedContact} isPlaceholder={selectedContact.id === "__placeholder__"} />
          ) : (
            currentMsgs.map((msg, i) => {
              const prevSame = i > 0 && currentMsgs[i - 1].sent === msg.sent;
              const senderAvatar = msg.sent
                ? (currentUser?.avatar ?? currentUser?.nickname?.charAt(0))
                : selectedContact.avatar;
              const senderColor = msg.sent ? "#3897f0" : selectedContact.color;
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  prevSameSender={prevSame}
                  isOwn={msg.sent}
                  senderAvatar={senderAvatar}
                  senderColor={senderColor}
                  onEdit={onEditMessage ? (text) => onEditMessage(msg.id, text) : undefined}
                  onDelete={onDeleteMessage ? () => onDeleteMessage(msg.id) : undefined}
                />
              );
            })
          )}
          <div ref={endRef} />
        </div>

        <ChatInput value={input} onChange={onInputChange} onSend={onSend} />
      </div>
    </div>
  );
}
