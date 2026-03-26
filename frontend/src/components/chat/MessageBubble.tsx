"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ChatAvatar } from "./ChatAvatar";
import type { Message } from "./types";

interface MessageBubbleProps {
  message: Message;
  prevSameSender: boolean;
  isOwn?: boolean;
  senderAvatar?: string;
  senderColor?: string;
  onEdit?: (newText: string) => void;
  onDelete?: () => void;
}

export function MessageBubble({
  message,
  prevSameSender,
  isOwn = false,
  senderAvatar,
  senderColor = "#64748b",
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const t = useTranslations("chat");
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const menuRef = useRef<HTMLDivElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditText(message.text);
  }, [message.text]);

  useEffect(() => {
    if (!editing) return;
    const ta = editTextareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const maxPx = Math.min(typeof window !== "undefined" ? window.innerHeight * 0.7 : 560, 560);
    const next = Math.min(ta.scrollHeight, maxPx);
    ta.style.height = `${next}px`;
  }, [editing, editText]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  const isSent = message.sent;
  const showActions = isOwn && (onEdit || onDelete) && !message.isDeleted;

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== message.text && onEdit) {
      onEdit(trimmed);
    }
    setEditing(false);
    setMenuOpen(false);
  };

  const avatarLetter =
    senderAvatar && (senderAvatar.startsWith("http") || senderAvatar.startsWith("/"))
      ? senderAvatar
      : (senderAvatar || "?").charAt(0).toUpperCase();

  if (message.isDeleted) {
    return (
      <div className={`flex flex-row gap-2 ${isSent ? "justify-end" : "justify-start"} ${prevSameSender ? "mt-0.5" : "mt-2"}`}>
        {!isSent && (
          <ChatAvatar letter={avatarLetter} color={senderColor} size="sm" className="flex-shrink-0 mt-0.5" />
        )}
        <div className="flex flex-col max-w-[65%]">
          <div
            className={`
              py-2 px-3 rounded-[22px] text-sm italic text-gray-500
              ${isSent ? "bg-gray-200 rounded-br-[6px]" : "bg-gray-200 rounded-bl-[6px]"}
              ${prevSameSender ? (isSent ? "rounded-br-[22px]" : "rounded-bl-[22px]") : ""}
            `}
          >
            {t("messageDeleted")}
          </div>
        </div>
        {isSent && (
          <ChatAvatar letter={avatarLetter} color={senderColor} size="sm" className="flex-shrink-0 mt-0.5" />
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative flex min-w-0 flex-row gap-2 ${isSent ? "justify-end" : "justify-start"} ${prevSameSender ? "mt-0.5" : "mt-2"} ${
        menuOpen ? "z-30" : "z-0"
      }`}
    >
      {!isSent && (
        <ChatAvatar letter={avatarLetter} color={senderColor} size="sm" className="flex-shrink-0 mt-0.5" />
      )}
      <div
        className={`flex flex-col relative group min-w-0 ${
          editing ? "flex-1 basis-0 max-w-[65%]" : "max-w-[65%]"
        }`}
      >
        {editing ? (
          <div
            className={`
              w-full min-w-0 max-w-full py-2.5 px-3.5 rounded-[22px] text-sm leading-snug
              bg-[#3897f0] text-white rounded-br-[6px]
            `}
          >
            <textarea
              ref={editTextareaRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="block w-full min-w-0 max-w-full min-h-0 max-h-[min(70vh,560px)] bg-transparent resize-none outline-none text-inherit placeholder:text-white/70 break-words overflow-x-hidden overflow-y-auto"
              rows={1}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveEdit();
                }
                if (e.key === "Escape") {
                  setEditText(message.text);
                  setEditing(false);
                }
              }}
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setEditText(message.text);
                  setEditing(false);
                }}
                className="text-xs opacity-80 hover:opacity-100 cursor-pointer"
              >
                {t("cancel")}
              </button>
              <button type="button" onClick={handleSaveEdit} className="text-xs cursor-pointer font-medium opacity-80 hover:opacity-100">
                {t("save")}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              className={`
                max-w-[100%] py-2.5 px-3.5 rounded-[22px] text-sm leading-snug break-words
                animate-[popIn_0.2s_cubic-bezier(0.34,1.56,0.64,1)]
                ${isSent ? "bg-[#3897f0] text-white rounded-br-[6px] cursor-pointer" : "bg-[#1c1c1c] text-white rounded-bl-[6px]"}
                ${prevSameSender ? (isSent ? "rounded-br-[22px]" : "rounded-bl-[22px]") : ""}
              `}
               onClick={() => setMenuOpen((o) => !o)}
            >
              {message.text}
              {message.editedAt && <span className="ml-1 text-[10px] opacity-80">{t("edited")}</span>}
            </div>
            {showActions && (
              <div className="absolute top-8 -translate-y-1/2 right-0 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                {/* <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  className="p-1 text-2xl mt-12 rounded-full cursor-pointer text-black"
                  aria-label={t("messageOptions")}
                >
                  <CiMenuKebab />
                </button> */}
                {menuOpen && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 top-full cursor-pointer mt-1 py-1 bg-[#1c1c1c] rounded-lg shadow-lg border border-white/10 min-w-[100px] z-50"
                  >
                    {onEdit && (
                      <button
                        type="button"
                        className="w-full px-3 py-1.5 cursor-pointer text-left text-sm hover:bg-white/10"
                        onClick={() => {
                          setEditing(true);
                          setMenuOpen(false);
                        }}
                      >
                        {t("edit")}
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        className="w-full px-3 py-1.5 cursor-pointer text-left text-sm text-red-400 hover:bg-white/10"
                        onClick={() => {
                          onDelete();
                          setMenuOpen(false);
                        }}
                      >
                        {t("delete")}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
        <div className="flex items-center gap-1 mt-1 text-[11px] text-[#444]">
          <span>{message.time}</span>
        </div>
      </div>
      {isSent && (
        <ChatAvatar letter={avatarLetter} color={senderColor} size="sm" className="flex-shrink-0 mt-0.5" />
      )}
    </div>
  );
}
