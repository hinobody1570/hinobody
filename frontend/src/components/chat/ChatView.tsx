"use client";

import { useRef, useEffect } from "react";
import { ChatSidebar } from "./ChatSidebar";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { EmptyState } from "./EmptyState";
import { ChatInput } from "./ChatInput";
import type { Contact, Message, MessagesByContact } from "./types";

interface ChatViewProps {
  contacts: Contact[];
  selectedContact: Contact;
  messages: MessagesByContact;
  input: string;
  onSelectContact: (contact: Contact) => void;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export function ChatView({
  contacts,
  selectedContact,
  messages,
  input,
  onSelectContact,
  onInputChange,
  onSend,
}: ChatViewProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const currentMsgs = messages[selectedContact.id] ?? [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedContact.id]);

  return (
    <div className="h-full flex overflow-hidden bg-black text-white font-[inherit]">
      <ChatSidebar
        contacts={contacts}
        selectedContact={selectedContact}
        messages={messages}
        onSelectContact={onSelectContact}
      />

      <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
        <ChatHeader contact={selectedContact} />

        <div className="flex-1 overflow-y-auto py-5 px-5 pb-3 flex flex-col gap-1 chat-scrollbar">
          {currentMsgs.length === 0 ? (
            <EmptyState contact={selectedContact} />
          ) : (
            currentMsgs.map((msg, i) => {
              const prevSame = i > 0 && currentMsgs[i - 1].sent === msg.sent;
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  prevSameSender={prevSame}
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
