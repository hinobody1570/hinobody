"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { chatApi } from "@/lib/api";
import { contactFromUser } from "@/app/main/chat/chatHelpers";
import type { Contact } from "./types";
import { ChatAvatar } from "./ChatAvatar";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (contact: Contact) => void;
}

export function NewChatModal({ isOpen, onClose, onSelectUser }: NewChatModalProps) {
  const [users, setUsers] = useState<Array<{ id: string; nickname: string; avatar: string | null }>>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setSearch("");
    chatApi
      .getUsers(100)
      .then(setUsers)
      .finally(() => setLoading(false));
  }, [isOpen]);

  const filtered = search.trim()
    ? users.filter(
        (u) =>
          u.nickname.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const handleSelect = (user: { id: string; nickname: string; avatar: string | null }) => {
    onSelectUser(contactFromUser(user));
    onClose();
  };

  const t = useTranslations("chat");
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{t("startNewChatTitle")}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
            aria-label={t("closeAria")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-2 border-b border-gray-100">
          <input
            type="search"
            placeholder={t("searchUsers")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-2 min-h-0">
          {loading ? (
            <div className="py-8 text-center text-gray-500 text-sm">{t("loadingUsers")}</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm">{t("noUsersFound")}</div>
          ) : (
            filtered.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleSelect(user)}
                className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-gray-100 transition-colors text-left"
              >
                <ChatAvatar
                  letter={user.avatar ?? user.nickname.charAt(0).toUpperCase()}
                  color="#94a3b8"
                  size="sm"
                />
                <span className="font-medium text-gray-900">{user.nickname}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
