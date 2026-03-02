import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';

interface AuthenticatedSocket extends Partial<import('socket.io').Socket> {
  userId?: string;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private chatService: ChatService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake?.auth?.token ||
        client.handshake?.query?.token ||
        (client.handshake?.headers?.authorization as string)?.replace('Bearer ', '');
      if (!token) {
        client.emit('error', { message: 'Authentication required' });
        client.disconnect(true);
        return;
      }
      const secret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key';
      const payload = this.jwtService.verify(token, { secret });
      const userId = payload.sub;
      if (!userId) {
        client.emit('error', { message: 'Invalid token' });
        client.disconnect(true);
        return;
      }
      (client as any).userId = userId;
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);
      client.join(`user:${userId}`);
    } catch {
      client.emit('error', { message: 'Invalid token' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = (client as any).userId;
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(client.id);
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { receiverId: string; text: string },
  ) {
    const userId = (client as any).userId;
    if (!userId || !payload?.receiverId || !payload?.text?.trim()) {
      client.emit('error', { message: 'Invalid payload' });
      return;
    }
    try {
      const message = await this.chatService.create(userId, payload.receiverId, {
        text: payload.text.trim(),
      });
      this.emitToUser(payload.receiverId, 'message', message);
      client.emit('message', message);
    } catch (err: any) {
      client.emit('error', { message: err?.message || 'Failed to send message' });
    }
  }

  @SubscribeMessage('message:edit')
  async handleEdit(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { messageId: string; text: string },
  ) {
    const userId = (client as any).userId;
    if (!userId || !payload?.messageId || !payload?.text?.trim()) {
      client.emit('error', { message: 'Invalid payload' });
      return;
    }
    try {
      const message = await this.chatService.update(payload.messageId, userId, {
        text: payload.text.trim(),
      });
      const otherId = message.senderId === userId ? message.receiverId : message.senderId;
      this.emitToUser(otherId, 'message:updated', message);
      client.emit('message:updated', message);
    } catch (err: any) {
      client.emit('error', { message: err?.message || 'Failed to edit message' });
    }
  }

  @SubscribeMessage('message:delete')
  async handleDelete(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { messageId: string },
  ) {
    const userId = (client as any).userId;
    if (!userId || !payload?.messageId) {
      client.emit('error', { message: 'Invalid payload' });
      return;
    }
    try {
      const existing = await this.chatService.findOne(payload.messageId, userId);
      if (!existing) {
        client.emit('error', { message: 'Message not found' });
        return;
      }
      await this.chatService.remove(payload.messageId, userId);
      const otherId = existing.senderId === userId ? existing.receiverId : existing.senderId;
      this.emitToUser(otherId, 'message:deleted', { messageId: payload.messageId });
      client.emit('message:deleted', { messageId: payload.messageId });
    } catch (err: any) {
      client.emit('error', { message: err?.message || 'Failed to delete message' });
    }
  }

  private emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}
