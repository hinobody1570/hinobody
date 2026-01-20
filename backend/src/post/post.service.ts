import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BoardMemberService } from '../board-member/board-member.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { Post, Prisma } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private boardMemberService: BoardMemberService,
  ) {}

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    // Verify board exists
    const board = await this.prisma.board.findUnique({
      where: { id: createPostDto.boardId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Check if user is an approved member of the board
    const isMember = await this.boardMemberService.isMember(createPostDto.boardId, userId);
    if (!isMember) {
      const membership = await this.boardMemberService.getMembershipStatus(createPostDto.boardId, userId);
      
      if (!membership) {
        throw new BadRequestException('You must join this board before posting. Your request will be processed based on board visibility settings.');
      } else if (membership.status === 'PENDING') {
        throw new BadRequestException('Your request to join this board is pending approval. You can post once your request is approved.');
      } else if (membership.status === 'REJECTED') {
        throw new ForbiddenException('Your request to join this board was rejected. You cannot post in this board.');
      }
    }

    // Create post with images and tags
    const post = await this.prisma.post.create({
      data: {
        title: createPostDto.title,
        body: createPostDto.body,
        originalLanguage: createPostDto.originalLanguage,
        authorId: userId,
        boardId: createPostDto.boardId,
        tags: createPostDto.tags || [],
        images: createPostDto.imageIds
          ? {
              connect: createPostDto.imageIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            language: true,
          },
        },
        board: true,
        images: true,
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
    });

    return post;
  }

  async findAll(query: QueryPostsDto) {
    const { boardId, authorId, page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    // Use PostgreSQL FTS when search is provided, otherwise use Prisma query builder
    if (search) {
      return this.findAllWithFTS(query);
    }

    const where: Prisma.PostWhereInput = {
      isActive: true,
      isDeleted: false,
      ...(boardId && { boardId }),
      ...(authorId && { authorId }),
    };

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
              language: true,
            },
          },
          board: true,
          images: {
            take: 1, // First image as thumbnail
          },
          _count: {
            select: {
              comments: true,
              votes: true,
            },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async findAllWithFTS(query: QueryPostsDto) {
    const { boardId, authorId, page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    // Build WHERE conditions
    const conditions: string[] = [
      '"isActive" = true',
      '"isDeleted" = false',
    ];

    const params: any[] = [];
    const countParams: any[] = [];
    let paramIndex = 1;

    if (boardId) {
      conditions.push(`"boardId" = $${paramIndex}`);
      params.push(boardId);
      countParams.push(boardId);
      paramIndex++;
    }

    if (authorId) {
      conditions.push(`"authorId" = $${paramIndex}`);
      params.push(authorId);
      countParams.push(authorId);
      paramIndex++;
    }

    // Add FTS search condition - search parameter will be at current paramIndex
    const searchParamIndex = paramIndex;
    params.push(search);
    countParams.push(search);
    paramIndex++;

    const whereClause = conditions.join(' AND ');
    const ftsCondition = `"search_vector" @@ plainto_tsquery('english', $${searchParamIndex})`;
    const fullWhereClause = `${whereClause} AND ${ftsCondition}`;

    // Build the main query with FTS ranking
    const postsQuery = `
      SELECT 
        p.id,
        p.title,
        p.body,
        p."originalLanguage",
        p."authorId",
        p."boardId",
        p."isActive",
        p."isDeleted",
        p."upvoteCount",
        p."downvoteCount",
        p."commentCount",
        p."viewCount",
        p."createdAt",
        p."updatedAt",
        (
          SELECT json_build_object(
            'id', u.id,
            'nickname', u.nickname,
            'language', u."language"
          )
          FROM "users" u
          WHERE u.id = p."authorId"
        ) as author,
        (
          SELECT json_build_object(
            'id', b.id,
            'name', b.name,
            'slug', b.slug,
            'description', b.description,
            'isActive', b."isActive",
            'createdAt', b."createdAt",
            'updatedAt', b."updatedAt"
          )
          FROM "boards" b
          WHERE b.id = p."boardId"
        ) as board,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', i.id,
                'url', i.url,
                'key', i.key,
                'postId', i."postId",
                'userId', i."userId",
                'size', i.size,
                'mimeType', i."mimeType",
                'width', i.width,
                'height', i.height,
                'createdAt', i."createdAt"
              )
            )
            FROM (
              SELECT * FROM "images" 
              WHERE "postId" = p.id 
              LIMIT 1
            ) i
          ),
          '[]'::json
        ) as images,
        (
          SELECT COUNT(*)::int
          FROM "comments" c
          WHERE c."postId" = p.id
            AND c."isActive" = true
            AND c."isDeleted" = false
        ) as comment_count,
        (
          SELECT COUNT(*)::int
          FROM "votes" v
          WHERE v."postId" = p.id
        ) as vote_count
      FROM "posts" p
      WHERE ${fullWhereClause}
      ORDER BY ts_rank(p."search_vector", plainto_tsquery('english', $${searchParamIndex})) DESC, p."createdAt" DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, skip);

    // Count query (same WHERE clause, no LIMIT/OFFSET)
    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM "posts" p
      WHERE ${fullWhereClause}
    `;

    const [postsResult, countResult] = await Promise.all([
      this.prisma.$queryRawUnsafe(postsQuery, ...params),
      this.prisma.$queryRawUnsafe(countQuery, ...countParams),
    ]);

    const posts = (postsResult as any[]).map((row: any) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      originalLanguage: row.originalLanguage,
      authorId: row.authorId,
      boardId: row.boardId,
      isActive: row.isActive,
      isDeleted: row.isDeleted,
      upvoteCount: row.upvoteCount,
      downvoteCount: row.downvoteCount,
      commentCount: row.commentCount || 0,
      viewCount: row.viewCount,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      author: row.author,
      board: row.board,
      images: Array.isArray(row.images) ? row.images : [],
      _count: {
        comments: row.comment_count || 0,
        votes: row.vote_count || 0,
      },
    }));

    const total = (countResult as any[])[0]?.total || 0;

    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            language: true,
          },
        },
        board: true,
        images: true,
        comments: {
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
          take: 50, // Limit comments for performance
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Increment view count
    await this.prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return post;
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    userId: string,
  ): Promise<Post> {
    const post = await this.findOne(id);

    // Check if user is the author
    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        ...updatePostDto,
        ...(updatePostDto.imageIds && {
          images: {
            set: updatePostDto.imageIds.map((imageId) => ({ id: imageId })),
          },
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        board: true,
        images: true,
      },
    });
  }

  async remove(
    id: string,
    userId: string,
    isAdmin: boolean = false,
  ): Promise<void> {
    const post = await this.findOne(id);

    // Check if user is the author or admin
    if (post.authorId !== userId && !isAdmin) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    // Soft delete
    await this.prisma.post.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
    });
  }

  // Get home feed (all boards combined)
  async getHomeFeed(query: QueryPostsDto) {
    return this.findAll({
      ...query,
      boardId: undefined, // Remove board filter for home feed
    });
  }
}
