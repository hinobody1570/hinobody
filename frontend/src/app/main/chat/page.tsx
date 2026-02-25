"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChatView } from "@/components/chat/ChatView";
import { NewChatModal } from "@/components/chat/NewChatModal";
import type { Contact, Message, MessagesByContact } from "@/components/chat/types";
import { useAuth } from "@/contexts/AuthContext";
import { useChatSocket } from "@/hooks/useChatSocket";
import { chatApi, usersApi, type ChatMessageDto } from "@/lib/api";
import {
  contactFromDto,
  contactFromUser,
  messageFromDto,
} from "./chatHelpers";

function sortContactsByRecent(contacts: Contact[]): Contact[] {
  return [...contacts].sort((a, b) => {
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return bTime - aTime;
  });
}

export default function ChatPage() {
  const t = useTranslations("chat");
  const searchParams = useSearchParams();
  const { user, token, isAuthenticated } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<MessagesByContact>({});
  const [input, setInput] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);

  const currentUserId = user?.id ?? "";

  const applyMessage = useCallback(
    (dto: ChatMessageDto) => {
      const msg = messageFromDto(dto, currentUserId);
      const otherId = dto.senderId === currentUserId ? dto.receiverId : dto.senderId;
      setMessages((prev) => {
        const list = prev[otherId] ?? [];
        const idx = list.findIndex((m) => m.id === dto.id);
        let next: Message[];
        if (idx >= 0) {
          next = [...list];
          next[idx] = msg;
        } else {
          // Remove any optimistic (temp) message so we don't duplicate when server echoes back
          const withoutTemp = list.filter((m) => typeof m.id !== "string" || !m.id.startsWith("temp-"));
          next = [...withoutTemp, msg];
        }
        return { ...prev, [otherId]: next };
      });
    },
    [currentUserId]
  );

  const handleSocketEvent = useCallback(
    (event: import("@/hooks/useChatSocket").ChatSocketEvent) => {
      if (event.type === "message") {
        applyMessage(event.message);
      } else if (event.type === "message:updated") {
        applyMessage(event.message);
      } else if (event.type === "message:deleted") {
        setMessages((prev) => {
          const next = { ...prev };
          for (const contactId of Object.keys(next)) {
            const list = next[contactId];
            const idx = list.findIndex((m) => m.id === event.messageId);
            if (idx >= 0) {
              next[contactId] = list.map((m) =>
                m.id === event.messageId
                  ? { ...m, text: "", isDeleted: true }
                  : m
              );
              break;
            }
          }
          return next;
        });
      } else if (event.type === "error") {
        setError(event.message);
      }
    },
    [applyMessage]
  );

  const { connected, sendMessage, editMessage, deleteMessage } = useChatSocket(
    token,
    handleSocketEvent
  );

  // Load only contacts with existing conversations (recent first)
  useEffect(() => {
    if (!isAuthenticated || !token) return;
    const withUserId = searchParams?.get("with");
    setLoadingContacts(true);
    setError(null);
    chatApi
      .getContacts()
      .then((data) => {
        const list = sortContactsByRecent(data.map(contactFromDto));
        setContacts(list);
        if (list.length > 0 && !selectedContact && !withUserId) {
          setSelectedContact(list[0]);
        }
      })
      .catch((err: any) => setError(err?.message ?? "Failed to load contacts"))
      .finally(() => setLoadingContacts(false));
  }, [isAuthenticated, token]);

  // URL ?with=userId: open chat with that user (e.g. from profile)
  useEffect(() => {
    const withUserId = searchParams?.get("with");
    if (!withUserId || !currentUserId || withUserId === currentUserId) return;
    usersApi
      .getById(withUserId)
      .then((userData) => {
        const contact = contactFromUser({
          id: userData.id,
          nickname: userData.nickname,
          avatar: userData.avatar,
        });
        setContacts((prev) => {
          const exists = prev.some((c) => c.id === contact.id);
          if (exists) return prev;
          return [...prev, contact];
        });
        setSelectedContact(contact);
      })
      .catch(() => setError("User not found"));
  }, [searchParams?.get("with"), currentUserId]);

  // Load messages when selected contact changes (from DB – both users' messages)
  useEffect(() => {
    if (!selectedContact || !currentUserId || selectedContact.id === "__placeholder__") return;
    const contactId = selectedContact.id;
    setLoadingMessages(true);
    chatApi
      .getMessages(contactId)
      .then((res) => {
        // Backend returns { data: ChatMessageDto[], meta } – use the data array (both users' messages)
        const rawList = res?.data ?? [];
        const list = rawList.map((d) => messageFromDto(d, currentUserId));
        setMessages((prev) => ({ ...prev, [contactId]: list }));
      })
      .catch((err: any) => setError(err?.message ?? "Failed to load messages"))
      .finally(() => setLoadingMessages(false));
  }, [selectedContact?.id, currentUserId]);

  const handleStartNewChatSelect = useCallback((contact: Contact) => {
    setContacts((prev) => {
      const exists = prev.some((c) => c.id === contact.id);
      if (exists) return prev;
      return [...prev, contact];
    });
    setSelectedContact(contact);
    setNewChatModalOpen(false);
  }, []);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !selectedContact) return;
    const receiverId = selectedContact.id;
    // Optimistic update: show message immediately, replace with server message when it arrives
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      text,
      sent: true,
      time: "Just now",
      senderId: currentUserId,
      receiverId,
    };
    setMessages((prev) => ({
      ...prev,
      [receiverId]: [...(prev[receiverId] ?? []), optimisticMessage],
    }));
    setInput("");
    sendMessage(receiverId, text);
  };

  const handleEditMessage = (messageId: string, text: string) => {
    editMessage(messageId, text);
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };

  if (!isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center bg-black text-white">
        <p>{t("pleaseLogIn")}</p>
      </div>
    );
  }

  if (loadingContacts && contacts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-black text-white">
        <p>{t("loading")}</p>
      </div>
    );
  }

  const PLACEHOLDER_CONTACT: Contact = {
    id: "__placeholder__",
    name: t("selectOrStartChatShort"),
    avatar: "…",
    color: "#94a3b8",
  };
  const displayContact = selectedContact ?? contacts[0] ?? PLACEHOLDER_CONTACT;

  return (
    <>
      <ChatView
        contacts={contacts}
        selectedContact={displayContact}
        messages={messages}
        input={input}
        currentUserId={currentUserId}
        currentUser={user ? { nickname: user.nickname, avatar: user.avatar } : null}
        connected={connected}
        loadingMessages={loadingMessages}
        error={error}
        onSelectContact={(c) => setSelectedContact(c)}
        onInputChange={setInput}
        onSend={handleSend}
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
        onDismissError={() => setError(null)}
        onStartNewChat={() => setNewChatModalOpen(true)}
        initialSidebarOpen={!searchParams?.get("with")}
      />
      <NewChatModal
        isOpen={newChatModalOpen}
        onClose={() => setNewChatModalOpen(false)}
        onSelectUser={handleStartNewChatSelect}
      />
    </>
  );
}
