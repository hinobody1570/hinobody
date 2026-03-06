export interface Contact {
  id: string;
  name: string;
  avatar: string;
  color: string;
  online?: boolean;
  lastSeen?: string;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
}

export interface Message {
  id: string;
  text: string;
  sent: boolean;
  time: string;
  seen?: boolean;
  senderId?: string;
  receiverId?: string;
  editedAt?: string | null;
  isDeleted?: boolean;
  createdAt?: string;
}

export type MessagesByContact = Record<string, Message[]>;
