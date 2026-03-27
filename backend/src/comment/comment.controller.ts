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
  ForbiddenException,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCommentsDto } from './dto/query-comments.dto';
import { UpdateCommentStatusDto } from './dto/update-comment-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  create(
    @Body() createCommentDto: CreateCommentDto,
    @GetUser('id') userId: string,
  ) {
    return this.commentService.create(createCommentDto, userId);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all comments for admin with pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiQuery({ name: 'postId', required: false, description: 'Filter by post ID' })
  @ApiQuery({ name: 'authorId', required: false, description: 'Filter by author ID' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in comment body' })
  findAllForAdmin(
    @Query() query: QueryCommentsDto,
    @GetUser('role') role: string,
  ) {
    if (role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can access all comments');
    }
    return this.commentService.findAllForAdmin(query);
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Admin: update comment active/inactive status' })
  updateStatusByAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateCommentStatusDto,
    @GetUser('role') role: string,
  ) {
    if (role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update comment status');
    }
    return this.commentService.updateStatusByAdmin(id, dto.isActive);
  }

  @Get('post/:postId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get comments by post ID with pagination and search' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'authorId', required: false, description: 'Filter by author ID' })
  findByPost(
    @Param('postId') postId: string,
    @Query() query: QueryCommentsDto,
    @GetUser('id') userId?: string,
  ) {
    return this.commentService.findByPost(postId, { ...query, postId }, userId);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.commentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser('id') userId: string,
  ) {
    return this.commentService.update(id, updateCommentDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  remove(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') role: string,
  ) {
    return this.commentService.remove(id, userId, role === 'ADMIN');
  }
}
