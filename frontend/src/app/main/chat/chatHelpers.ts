import type { Contact, Message } from "@/components/chat/types";
import type { ChatContact, ChatMessageDto } from "@/lib/api";

const COLORS = ["#f09433", "#833ab4", "#e1306c", "#405de6", "#fd1d1d", "#fcb045"];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function contactFromDto(dto: ChatContact): Contact {
  const colorIndex = hash(dto.id) % COLORS.length;
  return {
    id: dto.id,
    name: dto.nickname,
    avatar: dto.avatar ?? dto.nickname.charAt(0).toUpperCase(),
    color: COLORS[colorIndex],
    lastMessage: dto.lastMessage,
    lastMessageAt: dto.lastMessageAt,
  };
}

/** Create a Contact from a user object (e.g. for "Start new chat") */
export function contactFromUser(user: {
  id: string;
  nickname: string;
  avatar?: string | null;
}): Contact {
  const colorIndex = hash(user.id) % COLORS.length;
  return {
    id: user.id,
    name: user.nickname,
    avatar: user.avatar ?? user.nickname.charAt(0).toUpperCase(),
    color: COLORS[colorIndex],
  };
}

export function messageFromDto(dto: ChatMessageDto, currentUserId: string): Message {
  const sent = dto.senderId === currentUserId;
  return {
    id: dto.id,
    text: dto.isDeleted ? "" : dto.text,
    sent,
    time: formatMessageTime(dto.createdAt),
    seen: true,
    senderId: dto.senderId,
    receiverId: dto.receiverId,
    editedAt: dto.editedAt,
    isDeleted: dto.isDeleted,
    createdAt: dto.createdAt,
  };
}

export function formatMessageTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}
