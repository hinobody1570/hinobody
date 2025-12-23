import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  create(@Body() createCommentDto: CreateCommentDto, @GetUser('id') userId: string) {
    return this.commentService.create(createCommentDto, userId);
  }

  @Get('post/:postId')
  findByPost(@Param('postId') postId: string) {
    return this.commentService.findByPost(postId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser('id') userId: string,
  ) {
    return this.commentService.update(id, updateCommentDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') role: string,
  ) {
    return this.commentService.remove(id, userId, role === 'ADMIN');
  }
}



