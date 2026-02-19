"use client";

import { useState } from "react";
import { ChatView } from "@/components/chat/ChatView";
import type { Contact, MessagesByContact } from "@/components/chat/types";

const CONTACTS: Contact[] = [
  { id: 1, name: "aria.design", avatar: "A", color: "#f09433", online: true, lastSeen: "Active now" },
  { id: 2, name: "kai.visuals", avatar: "K", color: "#833ab4", online: false, lastSeen: "Active 3h ago" },
  { id: 3, name: "muse.collective", avatar: "M", color: "#e1306c", online: true, lastSeen: "Active now" },
  { id: 4, name: "void.studio", avatar: "V", color: "#405de6", online: false, lastSeen: "Active 1d ago" },
];

const INITIAL_MESSAGES: MessagesByContact = {
  1: [
    { id: 1, text: "hey! loved your latest post 🔥", sent: false, time: "10:32 AM", seen: true },
    { id: 2, text: "thank you so much! been working on it for weeks", sent: true, time: "10:33 AM", seen: true },
    { id: 3, text: "it really shows. the composition is insane", sent: false, time: "10:34 AM", seen: true },
  ],
  2: [
    { id: 1, text: "did you see the new drop?", sent: false, time: "Yesterday", seen: true },
    { id: 2, text: "not yet, sending the link?", sent: true, time: "Yesterday", seen: true },
  ],
  3: [
    { id: 1, text: "collab soon? 👀", sent: false, time: "2d ago", seen: true },
  ],
  4: [],
};

export default function ChatPage() {
  const [selectedContact, setSelectedContact] = useState<Contact>(CONTACTS[0]);
  const [messages, setMessages] = useState<MessagesByContact>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const newMsg = { id: Date.now(), text, sent: true, time: "Just now", seen: false };
    setMessages((prev) => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] ?? []), newMsg],
    }));
    setInput("");
  };

  return (
    <ChatView
      contacts={CONTACTS}
      selectedContact={selectedContact}
      messages={messages}
      input={input}
      onSelectContact={setSelectedContact}
      onInputChange={setInput}
      onSend={handleSend}
    />
  );
}
