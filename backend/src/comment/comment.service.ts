import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCommentsDto } from './dto/query-comments.dto';
import { Comment, Prisma } from '@prisma/client';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async create(
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<Comment> {
    // Verify post exists
    const post = await this.prisma.post.findUnique({
      where: { id: createCommentDto.postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // If parent comment, verify it exists
    if (createCommentDto.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: createCommentDto.parentId },
      });

      if (!parent) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        body: createCommentDto.body,
        originalLanguage: createCommentDto.originalLanguage,
        postId: createCommentDto.postId,
        authorId: userId,
        parentId: createCommentDto.parentId,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Update post comment count
    await this.prisma.post.update({
      where: { id: createCommentDto.postId },
      data: { commentCount: { increment: 1 } },
    });

    return comment;
  }

  // Helper function to recursively fetch nested replies
  private async fetchCommentWithReplies(commentId: string): Promise<any> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        _count: {
          select: {
            votes: true,
            replies: true,
          },
        },
      },
    });

    if (!comment) return null;

    // Fetch direct replies (first level)
    const directReplies = await this.prisma.comment.findMany({
      where: {
        parentId: commentId,
        isActive: true,
        isDeleted: false,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        _count: {
          select: {
            votes: true,
            replies: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    console.log("reply",directReplies)
    // Recursively fetch nested replies for each direct reply
    // This will fetch replies to replies, replies to those replies, etc.
    // If there are no direct replies, this will be an empty array
    const repliesWithNested = directReplies.length > 0
      ? await Promise.all(
          directReplies.map((reply) => this.fetchCommentWithReplies(reply.id))
        )
      : [];
        console.log("repliesWithNested",repliesWithNested)
    // Explicitly construct the return object to ensure all properties are included
    // This ensures nested replies are always included in the response
    return {
      id: comment.id,
      body: comment.body,
      originalLanguage: comment.originalLanguage,
      postId: comment.postId,
      authorId: comment.authorId,
      parentId: comment.parentId,
      isActive: comment.isActive,
      isDeleted: comment.isDeleted,
      upvoteCount: comment.upvoteCount,
      downvoteCount: comment.downvoteCount,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: comment.author,
      _count: comment._count,
      replies: repliesWithNested.filter((r) => r !== null),
    };
  }

  async findByPost(postId: string, query?: QueryCommentsDto) {
    const { page = 1, limit = 20, search, authorId } = query || {};
    const skip = (page - 1) * limit;

    // Use PostgreSQL FTS when search is provided, otherwise use Prisma query builder
    if (search) {
      return this.findByPostWithFTS(postId, query);
    }

    const where: Prisma.CommentWhereInput = {
      postId,
      isActive: true,
      isDeleted: false,
      parentId: null, // Top-level comments only
      ...(authorId && { authorId }),
    };

    const [topLevelComments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
            },
          },
          _count: {
            select: {
              votes: true,
              replies: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.comment.count({ where }),
    ]);
    console.log("topLevelComments",topLevelComments)
    // Fetch nested replies for each top-level comment
    const commentsWithReplies = await Promise.all(
      topLevelComments.map((comment) => this.fetchCommentWithReplies(comment.id))
    );

    return {
      data: commentsWithReplies.filter((c) => c !== null),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async findByPostWithFTS(postId: string, query: QueryCommentsDto) {
    const { page = 1, limit = 20, search, authorId } = query;
    const skip = (page - 1) * limit;

    // Use simple ILIKE search instead of FTS to avoid requiring search_vector column
    const where: Prisma.CommentWhereInput = {
      postId,
      isActive: true,
      isDeleted: false,
      parentId: null, // Top-level comments only
      body: {
        contains: search,
        mode: 'insensitive',
      },
      ...(authorId && { authorId }),
    };

    const [topLevelComments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
            },
          },
          _count: {
            select: {
              votes: true,
              replies: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.comment.count({ where }),
    ]);

    // Fetch nested replies for each top-level comment
    const commentsWithReplies = await Promise.all(
      topLevelComments.map((comment) => this.fetchCommentWithReplies(comment.id))
    );

    return {
      data: commentsWithReplies.filter((c) => c !== null),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        post: true,
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const comment = await this.findOne(id);

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    return this.prisma.comment.update({
      where: { id },
      data: updateCommentDto,
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });
  }

  async remove(
    id: string,
    userId: string,
    isAdmin: boolean = false,
  ): Promise<void> {
    const comment = await this.findOne(id);

    if (comment.authorId !== userId && !isAdmin) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // Soft delete
    await this.prisma.comment.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
    });

    // Update post comment count
    await this.prisma.post.update({
      where: { id: comment.postId },
      data: { commentCount: { decrement: 1 } },
    });
  }
}
