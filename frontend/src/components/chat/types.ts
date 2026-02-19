export interface Contact {
  id: number;
  name: string;
  avatar: string;
  color: string;
  online: boolean;
  lastSeen: string;
}

export interface Message {
  id: number;
  text: string;
  sent: boolean;
  time: string;
  seen: boolean;
}

export type MessagesByContact = Record<number, Message[]>;
