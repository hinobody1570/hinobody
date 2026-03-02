import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('contacts')
  @ApiOperation({ summary: 'Get chat contacts (users with conversations)' })
  getContacts(@GetUser('id') userId: string) {
    return this.chatService.getContacts(userId);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get other users (for starting new chats)' })
  getUsers(@GetUser('id') userId: string, @Query('limit') limit?: string) {
    const take = limit ? Math.min(100, parseInt(limit, 10) || 50) : 50;
    return this.chatService.getOtherUsers(userId, take);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get messages with a user' })
  @ApiQuery({ name: 'withUserId', required: true, description: 'Other user ID' })
  getMessages(
    @GetUser('id') userId: string,
    @Query('withUserId') withUserId: string,
    @Query() query: QueryMessagesDto,
  ) {
    return this.chatService.getMessages(userId, withUserId, query);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a message' })
  create(@GetUser('id') userId: string, @Body() body: SendMessageDto) {
    const { receiverId, text } = body;
    return this.chatService.create(userId, receiverId, { text });
  }

  @Patch('messages/:id')
  @ApiOperation({ summary: 'Edit own message' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMessageDto,
    @GetUser('id') userId: string,
  ) {
    return this.chatService.update(id, userId, dto);
  }

  @Delete('messages/:id')
  @ApiOperation({ summary: 'Delete own message' })
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.chatService.remove(id, userId);
  }
}
