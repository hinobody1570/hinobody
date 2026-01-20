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

    const [comments, total] = await Promise.all([
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
          replies: {
            where: {
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
            },
            orderBy: { createdAt: 'asc' },
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

  private async findByPostWithFTS(postId: string, query: QueryCommentsDto) {
    const { page = 1, limit = 20, search, authorId } = query;
    const skip = (page - 1) * limit;

    const conditions: string[] = [
      '"postId" = $1',
      '"isActive" = true',
      '"isDeleted" = false',
      '"parentId" IS NULL',
    ];

    const params: any[] = [postId];
    const countParams: any[] = [postId];
    let paramIndex = 2;

    if (authorId) {
      conditions.push(`"authorId" = $${paramIndex}`);
      params.push(authorId);
      countParams.push(authorId);
      paramIndex++;
    }

    const searchParamIndex = paramIndex;
    params.push(search);
    countParams.push(search);
    paramIndex++;

    const whereClause = conditions.join(' AND ');
    const ftsCondition = `"search_vector" @@ plainto_tsquery('english', $${searchParamIndex})`;
    const fullWhereClause = `${whereClause} AND ${ftsCondition}`;

    const commentsQuery = `
      SELECT 
        c.id,
        c.body,
        c."originalLanguage",
        c."postId",
        c."authorId",
        c."parentId",
        c."isActive",
        c."isDeleted",
        c."upvoteCount",
        c."downvoteCount",
        c."createdAt",
        c."updatedAt",
        (
          SELECT json_build_object(
            'id', u.id,
            'nickname', u.nickname
          )
          FROM "users" u
          WHERE u.id = c."authorId"
        ) as author,
        (
          SELECT json_agg(
            json_build_object(
              'id', r.id,
              'body', r.body,
              'originalLanguage', r."originalLanguage",
              'postId', r."postId",
              'authorId', r."authorId",
              'parentId', r."parentId",
              'isActive', r."isActive",
              'isDeleted', r."isDeleted",
              'upvoteCount', r."upvoteCount",
              'downvoteCount', r."downvoteCount",
              'createdAt', r."createdAt",
              'updatedAt', r."updatedAt",
              'author', (
                SELECT json_build_object(
                  'id', u2.id,
                  'nickname', u2.nickname
                )
                FROM "users" u2
                WHERE u2.id = r."authorId"
              )
            )
          )
          FROM (
            SELECT * FROM "comments" r
            WHERE r."parentId" = c.id
              AND r."isActive" = true
              AND r."isDeleted" = false
            ORDER BY r."createdAt" ASC
          ) r
        ) as replies,
        (
          SELECT COUNT(*)::int
          FROM "comments" r
          WHERE r."parentId" = c.id
            AND r."isActive" = true
            AND r."isDeleted" = false
        ) as reply_count,
        (
          SELECT COUNT(*)::int
          FROM "votes" v
          WHERE v."commentId" = c.id
        ) as vote_count
      FROM "comments" c
      WHERE ${fullWhereClause}
      ORDER BY ts_rank(c."search_vector", plainto_tsquery('english', $${searchParamIndex})) DESC, c."createdAt" ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, skip);

    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM "comments" c
      WHERE ${fullWhereClause}
    `;

    const [commentsResult, countResult] = await Promise.all([
      this.prisma.$queryRawUnsafe(commentsQuery, ...params),
      this.prisma.$queryRawUnsafe(countQuery, ...countParams),
    ]);

    const comments = (commentsResult as any[]).map((row: any) => ({
      id: row.id,
      body: row.body,
      originalLanguage: row.originalLanguage,
      postId: row.postId,
      authorId: row.authorId,
      parentId: row.parentId,
      isActive: row.isActive,
      isDeleted: row.isDeleted,
      upvoteCount: row.upvoteCount,
      downvoteCount: row.downvoteCount,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      author: row.author,
      replies: Array.isArray(row.replies) ? row.replies : [],
      _count: {
        votes: row.vote_count || 0,
        replies: row.reply_count || 0,
      },
    }));

    const total = (countResult as any[])[0]?.total || 0;

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
