import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { ChatMessage, Prisma } from '@prisma/client';

const messageSelect = {
  id: true,
  text: true,
  isDeleted: true,
  editedAt: true,
  createdAt: true,
  senderId: true,
  receiverId: true,
  sender: {
    select: {
      id: true,
      nickname: true,
      avatar: true,
    },
  },
  receiver: {
    select: {
      id: true,
      nickname: true,
      avatar: true,
    },
  },
} as const;

export type ChatMessageWithRelations = Prisma.ChatMessageGetPayload<{
  select: typeof messageSelect;
}>;

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async create(senderId: string, receiverId: string, dto: CreateMessageDto): Promise<ChatMessageWithRelations> {
    if (senderId === receiverId) {
      throw new BadRequestException('Cannot send message to yourself');
    }
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });
    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }
    const message = await this.prisma.chatMessage.create({
      data: {
        senderId,
        receiverId,
        text: dto.text,
      },
      select: messageSelect,
    });
    return message as ChatMessageWithRelations;
  }

  /** List users that the current user has a conversation with (with last message preview). */
  async getContacts(userId: string): Promise<
    Array<{
      id: string;
      nickname: string;
      avatar: string | null;
      lastMessage: string | null;
      lastMessageAt: Date | null;
      unreadCount?: number;
    }>
  > {
    const sent = await this.prisma.chatMessage.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
      distinct: ['receiverId'],
    });
    const received = await this.prisma.chatMessage.findMany({
      where: { receiverId: userId },
      select: { senderId: true },
      distinct: ['senderId'],
    });
    const otherIds = [...new Set([...sent.map((s) => s.receiverId), ...received.map((r) => r.senderId)])];

    if (otherIds.length === 0) {
      return [];
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: otherIds } },
      select: { id: true, nickname: true, avatar: true },
    });

    const lastMessages = await this.prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: { in: otherIds } },
          { senderId: { in: otherIds }, receiverId: userId },
        ],
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, senderId: true, receiverId: true, text: true, createdAt: true },
    });

    const byOther = new Map<string, { text: string; createdAt: Date }>();
    for (const m of lastMessages) {
      const otherId = m.senderId === userId ? m.receiverId : m.senderId;
      if (!byOther.has(otherId)) {
        byOther.set(otherId, { text: m.text, createdAt: m.createdAt });
      }
    }

    return users.map((u) => ({
      id: u.id,
      nickname: u.nickname,
      avatar: u.avatar ?? null,
      lastMessage: byOther.get(u.id)?.text ?? null,
      lastMessageAt: byOther.get(u.id)?.createdAt ?? null,
    }));
  }

  async getMessages(
    userId: string,
    withUserId: string,
    query: QueryMessagesDto,
  ): Promise<{
    data: ChatMessageWithRelations[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const { page = 1, limit = 50 } = query;
    const where = {
      OR: [
        { senderId: userId, receiverId: withUserId },
        { senderId: withUserId, receiverId: userId },
      ],
    };
    const [data, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: messageSelect,
      }),
      this.prisma.chatMessage.count({ where }),
    ]);
    const totalPages = Math.ceil(total / limit) || 1;
    return {
      data: (data as ChatMessageWithRelations[]).reverse(),
      meta: { total, page, limit, totalPages },
    };
  }

  async update(messageId: string, userId: string, dto: UpdateMessageDto): Promise<ChatMessageWithRelations> {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }
    if (message.isDeleted) {
      throw new BadRequestException('Cannot edit a deleted message');
    }
    const updated = await this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { text: dto.text, editedAt: new Date() },
      select: messageSelect,
    });
    return updated as ChatMessageWithRelations;
  }

  async remove(messageId: string, userId: string): Promise<void> {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }
    await this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { isDeleted: true, text: '' },
    });
  }

  /** List other users (for starting new chats). Excludes self. */
  async getOtherUsers(userId: string, limit = 50): Promise<Array<{ id: string; nickname: string; avatar: string | null }>> {
    const users = await this.prisma.user.findMany({
      where: {
        id: { not: userId },
        isActive: true,
      },
      take: limit,
      select: { id: true, nickname: true, avatar: true },
      orderBy: { nickname: 'asc' },
    });
    return users;
  }

  async findOne(messageId: string, userId: string): Promise<ChatMessageWithRelations | null> {
    const message = await this.prisma.chatMessage.findFirst({
      where: {
        id: messageId,
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      select: messageSelect,
    });
    return message as ChatMessageWithRelations | null;
  }
}
