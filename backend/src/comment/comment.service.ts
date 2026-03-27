import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
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
  private async fetchCommentWithReplies(commentId: string, blockedUserIds: string[] = [], reportedCommentIds: string[] = []): Promise<any> {
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

    // If comment author is blocked, return null to exclude it
    if (blockedUserIds.length > 0 && blockedUserIds.includes(comment.authorId)) {
      return null;
    }

    // If comment was reported by current user, exclude it
    if (reportedCommentIds.length > 0 && reportedCommentIds.includes(comment.id)) {
      return null;
    }

    // Fetch direct replies (first level), excluding blocked users and reported comments
    const directReplies = await this.prisma.comment.findMany({
      where: {
        parentId: commentId,
        isActive: true,
        isDeleted: false,
        ...(blockedUserIds.length > 0 && {
          authorId: {
            notIn: blockedUserIds,
          },
        }),
        ...(reportedCommentIds.length > 0 && { id: { notIn: reportedCommentIds } }),
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
    // Recursively fetch nested replies for each direct reply
    // This will fetch replies to replies, replies to those replies, etc.
    // If there are no direct replies, this will be an empty array
    const repliesWithNested = directReplies.length > 0
      ? await Promise.all(
          directReplies.map((reply) => this.fetchCommentWithReplies(reply.id, blockedUserIds, reportedCommentIds))
        )
      : [];
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

  async findByPost(postId: string, query?: QueryCommentsDto, userId?: string) {
    const { page = 1, limit = 20, search, authorId } = query || {};
    const skip = (page - 1) * limit;

    // Get blocked user IDs if userId is provided
    let blockedUserIds: string[] = [];
    let reportedCommentIds: string[] = [];
    if (userId) {
      const [blocks, reports] = await Promise.all([
        this.prisma.block.findMany({
          where: { blockerId: userId },
          select: { blockedId: true },
        }),
        this.prisma.report.findMany({
          where: { reportedById: userId, commentId: { not: null } },
          select: { commentId: true },
        }),
      ]);
      blockedUserIds = blocks.map((block) => block.blockedId);
      reportedCommentIds = reports.map((r) => r.commentId).filter((id): id is string => !!id);
    }

    // If authorId is specified and that author is blocked, return empty results
    if (authorId && blockedUserIds.length > 0 && blockedUserIds.includes(authorId)) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    }

    // Use PostgreSQL FTS when search is provided, otherwise use Prisma query builder
    if (search) {
      return this.findByPostWithFTS(postId, query, blockedUserIds, reportedCommentIds);
    }

    const where: Prisma.CommentWhereInput = {
      postId,
      isActive: true,
      isDeleted: false,
      parentId: null, // Top-level comments only
      ...(authorId && { authorId }),
      // Exclude comments from blocked users (only if authorId is not specified)
      ...(!authorId && blockedUserIds.length > 0 && {
        authorId: {
          notIn: blockedUserIds,
        },
      }),
      ...(reportedCommentIds.length > 0 && { id: { notIn: reportedCommentIds } }),
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
      topLevelComments.map((comment) => this.fetchCommentWithReplies(comment.id, blockedUserIds, reportedCommentIds))
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

  private async findByPostWithFTS(postId: string, query: QueryCommentsDto, blockedUserIds: string[] = [], reportedCommentIds: string[] = []) {
    const { page = 1, limit = 20, search, authorId } = query;
    const skip = (page - 1) * limit;

    // If authorId is specified and that author is blocked, return empty results
    if (authorId && blockedUserIds.length > 0 && blockedUserIds.includes(authorId)) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    }

    // Search ALL comments (including replies) - not just top-level
    const matchWhere: Prisma.CommentWhereInput = {
      postId,
      isActive: true,
      isDeleted: false,
      body: {
        contains: search,
        mode: 'insensitive',
      },
      ...(authorId && { authorId }),
      ...(!authorId && blockedUserIds.length > 0 && {
        authorId: {
          notIn: blockedUserIds,
        },
      }),
      ...(reportedCommentIds.length > 0 && { id: { notIn: reportedCommentIds } }),
    };

    const matchingComments = await this.prisma.comment.findMany({
      where: matchWhere,
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    if (matchingComments.length === 0) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    }

    const total = matchingComments.length;
    const paginatedIds = matchingComments.slice(skip, skip + limit).map((m) => m.id);

    // Fetch only the matching comments (flat list, no parent/thread) with same shape as tree nodes
    const fullComments = await this.prisma.comment.findMany({
      where: { id: { in: paginatedIds } },
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

    // Preserve creation order and return each as a single comment with no replies
    const idToOrder = new Map(paginatedIds.map((id, i) => [id, i]));
    const ordered = fullComments
      .slice()
      .sort((a, b) => (idToOrder.get(a.id) ?? 0) - (idToOrder.get(b.id) ?? 0));

    const data = ordered.map((comment) => ({
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
      replies: [],
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all comments for admin (flat list with pagination)
   */
  async findAllForAdmin(query: QueryCommentsDto) {
    const { page = 1, limit = 20, postId, authorId, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CommentWhereInput = {
      ...(postId && { postId }),
      ...(authorId && { authorId }),
      ...(search && {
        body: { contains: search, mode: 'insensitive' as const },
      }),
    };

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      this.prisma.comment.count({ where }),
    ]);

    return {
      data: comments,
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

    const postId = comment.postId;

    if (isAdmin) {
      // Admin: permanent delete from database (reports/votes cascade via FK)
      await this.prisma.comment.delete({
        where: { id },
      });
    } else {
      // Regular user: soft delete
      await this.prisma.comment.update({
        where: { id },
        data: { isDeleted: true, isActive: false },
      });
    }

    // Update post comment count
    await this.prisma.post.update({
      where: { id: postId },
      data: { commentCount: { decrement: 1 } },
    });
  }

  async updateStatusByAdmin(id: string, isActive: boolean): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    if (comment.isDeleted && isActive) {
      throw new BadRequestException('Cannot activate a deleted comment');
    }

    return this.prisma.comment.update({
      where: { id },
      data: { isActive },
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
  }
}
