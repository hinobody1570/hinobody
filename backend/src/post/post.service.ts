import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BoardMemberService } from '../board-member/board-member.service';
import { S3Service } from '../s3/s3.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto, PostSortBy } from './dto/query-posts.dto';
import { Post, Prisma, BoardVisibility } from '@prisma/client';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    private prisma: PrismaService,
    private boardMemberService: BoardMemberService,
    private s3Service: S3Service,
  ) { }

  private readonly VALID_CATEGORIES = ['News', 'Reviews', 'Recommend', 'Free Board'];

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    const hasBoard = !!createPostDto.boardId;
    const hasCategory = !!createPostDto.category;

    if (!hasBoard && !hasCategory) {
      throw new BadRequestException('Either boardId or category must be provided');
    }

    if (hasBoard && hasCategory) {
      throw new BadRequestException('Provide either boardId or category, not both');
    }

    // If boardId is provided: verify board exists and check membership
    if (hasBoard) {
      const board = await this.prisma.board.findUnique({
        where: { id: createPostDto.boardId },
      });

      if (!board) {
        throw new NotFoundException('Board not found');
      }

      const isDraft = createPostDto.isActive === false;

      if (!isDraft) {
        const isMember = await this.boardMemberService.isMember(createPostDto.boardId!, userId);
        if (!isMember) {
          const membership = await this.boardMemberService.getMembershipStatus(createPostDto.boardId!, userId);

          if (!membership) {
            throw new BadRequestException('You must join this board before posting. Your request will be processed based on board visibility settings.');
          } else if (membership.status === 'PENDING') {
            throw new BadRequestException('Your request to join this board is pending approval. You can post once your request is approved.');
          } else if (membership.status === 'REJECTED') {
            throw new ForbiddenException('Your request to join this board was rejected. You cannot post in this board.');
          }
        }
      }
    }

    // If category is provided: validate it's one of the allowed values
    if (hasCategory) {
      if (!this.VALID_CATEGORIES.includes(createPostDto.category!)) {
        throw new BadRequestException(
          `Invalid category. Must be one of: ${this.VALID_CATEGORIES.join(', ')}`,
        );
      }
    }

    const post = await this.prisma.post.create({
      data: {
        title: createPostDto.title,
        body: createPostDto.body?.trim() || null,
        originalLanguage: createPostDto.originalLanguage,
        authorId: userId,
        boardId: createPostDto.boardId ?? undefined,
        ...(createPostDto.category && { postCategory: createPostDto.category }),
        tags: createPostDto.tags || [],
        isActive: createPostDto.isActive !== undefined ? createPostDto.isActive : true,
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

  private async enrichPostsWithFilteredCommentCounts(
    posts: any[],
    blockedUserIds: string[],
    reportedCommentIds: string[] = [],
  ): Promise<any[]> {
    const postIds = posts.map((p) => p.id);
    const counts = await this.prisma.comment.groupBy({
      by: ['postId'],
      where: {
        postId: { in: postIds },
        isActive: true,
        isDeleted: false,
        ...(blockedUserIds.length > 0 && { authorId: { notIn: blockedUserIds } }),
        ...(reportedCommentIds.length > 0 && { id: { notIn: reportedCommentIds } }),
      },
      _count: { id: true },
    });
    const countMap = new Map(counts.map((c) => [c.postId, c._count.id]));
    return posts.map((post) => {
      const commentCount = countMap.get(post.id) ?? 0;
      return {
        ...post,
        commentCount,
        _count: { ...post._count, comments: commentCount },
      };
    });
  }

  private getOrderBy(sortBy: PostSortBy = 'newest'): Prisma.PostOrderByWithRelationInput | Prisma.PostOrderByWithRelationInput[] {
    switch (sortBy) {
      case 'newest':
      default:
        return { createdAt: 'desc' };
    }
  }

  /**
   * Fetch post IDs in correct order for mostLiked (net likes) or trending (engagement).
   * Uses raw SQL because Prisma orderBy cannot express (upvote_count - downvote_count).
   */
  private async getOrderedPostIds(
    params: { boardId?: string; authorId?: string; commenterId?: string; blockedUserIds: string[]; reportedPostIds?: string[]; search?: string; category?: string; isAdmin?: boolean },
    sortBy: 'mostLiked' | 'trending',
    limit: number,
    skip: number,
  ): Promise<string[]> {
    const conditions: Prisma.Sql[] = [
      ...(!params.isAdmin ? [Prisma.sql`"isActive" = true`] : []),
      Prisma.sql`"isDeleted" = false`,
    ];
    if (params.boardId) {
      conditions.push(Prisma.sql`"boardId" = ${params.boardId}`);
    }
    if (params.authorId) {
      conditions.push(Prisma.sql`"authorId" = ${params.authorId}`);
    } else if (params.blockedUserIds.length > 0) {
      conditions.push(Prisma.sql`"authorId" NOT IN (${Prisma.join(params.blockedUserIds)})`);
    }
    if (params.commenterId) {
      conditions.push(Prisma.sql`EXISTS (SELECT 1 FROM "comments" c WHERE c."postId" = "posts"."id" AND c."authorId" = ${params.commenterId} AND c."isActive" = true AND c."isDeleted" = false)`);
    }
    if (params.category) {
      conditions.push(Prisma.sql`"postCategory" = ${params.category}`);
    }
    if (params.reportedPostIds && params.reportedPostIds.length > 0) {
      conditions.push(Prisma.sql`"id" NOT IN (${Prisma.join(params.reportedPostIds)})`);
    }
    if (params.search) {
      const pattern = `%${params.search}%`;
      conditions.push(
        Prisma.sql`("title" ILIKE ${pattern} OR "body" ILIKE ${pattern})`,
      );
    }
    const whereSql = Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;
    const orderBy =
      sortBy === 'mostLiked'
        ? Prisma.sql`ORDER BY ("upvoteCount" - "downvoteCount") DESC, "createdAt" DESC`
        : Prisma.sql`ORDER BY ("upvoteCount" - "downvoteCount" + "commentCount") DESC, "createdAt" DESC`;
    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "posts"
      ${whereSql}
      ${orderBy}
      LIMIT ${limit} OFFSET ${skip}
    `;
    return rows.map((r) => r.id);
  }

  async findAll(query: QueryPostsDto, userId?: string, isAdmin: boolean = false) {
    const { boardId, authorId, commenterId, page = 1, limit = 20, search, sortBy = 'newest', category } = query;
    const skip = (page - 1) * limit;

    // Get blocked user IDs if userId is provided
    let blockedUserIds: string[] = [];
    if (userId) {
      const blocks = await this.prisma.block.findMany({
        where: { blockerId: userId },
        select: { blockedId: true },
      });
      blockedUserIds = blocks.map((block) => block.blockedId);
    }

    // Get board IDs where user is an approved member (for filtering private/restricted boards)
    let memberBoardIds: string[] = [];
    if (userId && !isAdmin) {
      const memberships = await this.prisma.boardMember.findMany({
        where: {
          userId,
          status: 'APPROVED',
        },
        select: { boardId: true },
      });
      memberBoardIds = memberships.map((m) => m.boardId);
    }

    // Get post and comment IDs the current user has reported (hide those from their feed)
    let reportedPostIds: string[] = [];
    let reportedCommentIds: string[] = [];
    if (userId) {
      const reports = await this.prisma.report.findMany({
        where: { reportedById: userId },
        select: { postId: true, commentId: true },
      });
      reportedPostIds = reports.map((r) => r.postId).filter((id): id is string => !!id);
      reportedCommentIds = reports.map((r) => r.commentId).filter((id): id is string => !!id);
    }

    // Use PostgreSQL FTS when search is provided, otherwise use Prisma query builder
    if (search) {
      return this.findAllWithFTS(query, blockedUserIds, reportedPostIds, userId, isAdmin);
    }

    // If authorId or commenterId is specified and that user is blocked, return empty results
    if (blockedUserIds.length > 0) {
      if (authorId && blockedUserIds.includes(authorId)) {
        return {
          data: [],
          meta: { total: 0, page, limit, totalPages: 0 },
        };
      }
      if (commenterId && blockedUserIds.includes(commenterId)) {
        return {
          data: [],
          meta: { total: 0, page, limit, totalPages: 0 },
        };
      }
    }

    const where: Prisma.PostWhereInput = {
      ...(!isAdmin && { isActive: true }),
      isDeleted: false,
      ...(boardId && { boardId }),
      ...(authorId && { authorId }),
      ...(commenterId && {
        comments: {
          some: {
            authorId: commenterId,
            isActive: true,
            isDeleted: false,
          },
        },
      }),
      ...(category && { postCategory: category }),
      ...(!authorId && blockedUserIds.length > 0 && {
        authorId: { notIn: blockedUserIds },
      }),
      ...(reportedPostIds.length > 0 && { id: { notIn: reportedPostIds } }),
    };

    let posts: any[];
    let total: number;

    if (sortBy === 'mostLiked' || sortBy === 'trending') {
      // Use raw SQL for accurate (upvote_count - downvote_count) ordering
      const [orderedIds, totalCount] = await Promise.all([
        this.getOrderedPostIds(
          { boardId, authorId, commenterId, blockedUserIds, reportedPostIds, search: undefined, category, isAdmin },
          sortBy,
          limit,
          skip,
        ),
        this.prisma.post.count({ where }),
      ]);
      total = totalCount;
      if (orderedIds.length === 0) {
        posts = [];
      } else {
        const fetched = await this.prisma.post.findMany({
          where: { id: { in: orderedIds } },
          include: {
            author: { select: { id: true, nickname: true, language: true } },
            board: true,
            images: true,
            _count: { select: { votes: true, comments: true } },
          },
        });
        // Preserve order from getOrderedPostIds (findMany does not guarantee order)
        const orderMap = new Map(orderedIds.map((id, i) => [id, i]));
        posts = fetched.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
      }
    } else {
      // newest: use Prisma orderBy
      const [fetched, totalCount] = await Promise.all([
        this.prisma.post.findMany({
          where,
          skip,
          take: limit,
          orderBy: this.getOrderBy(sortBy),
          include: {
            author: { select: { id: true, nickname: true, language: true } },
            board: true,
            images: true,
            _count: { select: { votes: true, comments: true } },
          },
        }),
        this.prisma.post.count({ where }),
      ]);
      posts = fetched;
      total = totalCount;
    }

    const postsWithFilteredCounts =
      blockedUserIds.length === 0 && reportedCommentIds.length === 0
        ? posts.map((post) => ({
            ...post,
            commentCount: post._count.comments,
            _count: { ...post._count, comments: post._count.comments },
          }))
        : await this.enrichPostsWithFilteredCommentCounts(posts, blockedUserIds, reportedCommentIds);

    // Filter posts by board visibility and membership (unless admin)
    const filteredPosts = isAdmin
      ? postsWithFilteredCounts
      : postsWithFilteredCounts.filter((post) => {
          // Category posts (no board) are always visible
          if (!post.boardId || !post.board) {
            return true;
          }

          const boardVisibility = post.board.visibilityAccess;

          // PUBLIC boards are always visible
          if (boardVisibility === BoardVisibility.PUBLIC) {
            return true;
          }

          // PRIVATE/RESTRICTED boards: only visible if user is a member
          if (boardVisibility === BoardVisibility.PRIVATE || boardVisibility === BoardVisibility.RESTRICTED) {
            return memberBoardIds.includes(post.boardId);
          }

          // Default: hide if visibility is unknown
          return false;
        });

    return {
      data: filteredPosts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async findAllWithFTS(query: QueryPostsDto, blockedUserIds: string[] = [], reportedPostIds: string[] = [], userId?: string, isAdmin: boolean = false) {
    const { boardId, authorId, commenterId, page = 1, limit = 20, search, sortBy = 'newest', category } = query;
    const skip = (page - 1) * limit;

    // Get board IDs where user is an approved member (for filtering private/restricted boards)
    let memberBoardIds: string[] = [];
    if (userId && !isAdmin) {
      const memberships = await this.prisma.boardMember.findMany({
        where: {
          userId,
          status: 'APPROVED',
        },
        select: { boardId: true },
      });
      memberBoardIds = memberships.map((m) => m.boardId);
    }

    // Get reported post and comment IDs if not passed (for FTS path called with search)
    let reportedIds = reportedPostIds;
    let reportedCommentIds: string[] = [];
    if (userId) {
      const reports = await this.prisma.report.findMany({
        where: { reportedById: userId },
        select: { postId: true, commentId: true },
      });
      if (reportedIds.length === 0) {
        reportedIds = reports.map((r) => r.postId).filter((id): id is string => !!id);
      }
      reportedCommentIds = reports.map((r) => r.commentId).filter((id): id is string => !!id);
    }

    // If authorId or commenterId is specified and that user is blocked, return empty results
    if (blockedUserIds.length > 0) {
      if (authorId && blockedUserIds.includes(authorId)) {
        return {
          data: [],
          meta: { total: 0, page, limit, totalPages: 0 },
        };
      }
      if (commenterId && blockedUserIds.includes(commenterId)) {
        return {
          data: [],
          meta: { total: 0, page, limit, totalPages: 0 },
        };
      }
    }

    const where: Prisma.PostWhereInput = {
      ...(!isAdmin && { isActive: true }),
      isDeleted: false,
      ...(boardId && { boardId }),
      ...(authorId && { authorId }),
      ...(commenterId && {
        comments: {
          some: {
            authorId: commenterId,
            isActive: true,
            isDeleted: false,
          },
        },
      }),
      ...(category && { postCategory: category }),
      ...(!authorId && blockedUserIds.length > 0 && {
        authorId: { notIn: blockedUserIds },
      }),
      ...(reportedIds.length > 0 && { id: { notIn: reportedIds } }),
      OR: search
        ? [
          { title: { contains: search, mode: 'insensitive' } },
          { body: { contains: search, mode: 'insensitive' } },
        ]
        : undefined,
    };

    let posts: any[];
    let total: number;
    if (sortBy === 'mostLiked' || sortBy === 'trending') {
      const [orderedIds, totalCount] = await Promise.all([
        this.getOrderedPostIds(
          { boardId, authorId, commenterId, blockedUserIds, reportedPostIds: reportedIds, search, category, isAdmin },
          sortBy,
          limit,
          skip,
        ),
        this.prisma.post.count({ where }),
      ]);
      total = totalCount;
      if (orderedIds.length === 0) {
        posts = [];
      } else {
        const fetched = await this.prisma.post.findMany({
          where: { id: { in: orderedIds } },
          include: {
            author: { select: { id: true, nickname: true, language: true } },
            board: true,
            images: { take: 1 },
            _count: { select: { votes: true, comments: true } },
          },
        });
        const orderMap = new Map(orderedIds.map((id, i) => [id, i]));
        posts = fetched.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
      }
    } else {
      const [fetched, totalCount] = await Promise.all([
        this.prisma.post.findMany({
          where,
          skip,
          take: limit,
          orderBy: this.getOrderBy(sortBy),
          include: {
            author: { select: { id: true, nickname: true, language: true } },
            board: true,
            images: { take: 1 },
            _count: { select: { votes: true, comments: true } },
          },
        }),
        this.prisma.post.count({ where }),
      ]);
      posts = fetched;
      total = totalCount;
    }

    const postsWithFilteredCounts =
      blockedUserIds.length === 0 && reportedCommentIds.length === 0
        ? posts.map((post) => ({
            ...post,
            commentCount: post._count.comments,
            _count: { ...post._count, comments: post._count.comments },
          }))
        : await this.enrichPostsWithFilteredCommentCounts(posts, blockedUserIds, reportedCommentIds);

    // Filter posts by board visibility and membership (unless admin)
    const filteredPosts = isAdmin
      ? postsWithFilteredCounts
      : postsWithFilteredCounts.filter((post) => {
          // Category posts (no board) are always visible
          if (!post.boardId || !post.board) {
            return true;
          }

          const boardVisibility = post.board.visibilityAccess;

          // PUBLIC boards are always visible
          if (boardVisibility === BoardVisibility.PUBLIC) {
            return true;
          }

          // PRIVATE/RESTRICTED boards: only visible if user is a member
          if (boardVisibility === BoardVisibility.PRIVATE || boardVisibility === BoardVisibility.RESTRICTED) {
            return memberBoardIds.includes(post.boardId);
          }

          // Default: hide if visibility is unknown
          return false;
        });

    return {
      data: filteredPosts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId?: string): Promise<Post> {
    let blockedUserIds: string[] = [];
    if (userId) {
      const blocks = await this.prisma.block.findMany({
        where: { blockerId: userId },
        select: { blockedId: true },
      });
      blockedUserIds = blocks.map((block) => block.blockedId);
    }

    // If user has reported this post, do not show it to them
    if (userId) {
      const report = await this.prisma.report.findFirst({
        where: { reportedById: userId, postId: id },
      });
      if (report) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }
    }

    // Get reported comment IDs to exclude from comments (only for the reporter)
    let reportedCommentIds: string[] = [];
    if (userId) {
      const reportedComments = await this.prisma.report.findMany({
        where: { reportedById: userId, commentId: { not: null } },
        select: { commentId: true },
      });
      reportedCommentIds = reportedComments.map((r) => r.commentId).filter((id): id is string => !!id);
    }
    
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
            ...(blockedUserIds.length > 0 && {
              authorId: { notIn: blockedUserIds },
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
          },
          orderBy: { createdAt: 'asc' },
          take: 50, // Limit comments for performance
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Calculate comment count excluding blocked users and reported comments
    const commentCountWhere: Prisma.CommentWhereInput = {
      postId: post.id,
      isActive: true,
      isDeleted: false,
      ...(blockedUserIds.length > 0 && { authorId: { notIn: blockedUserIds } }),
      ...(reportedCommentIds.length > 0 && { id: { notIn: reportedCommentIds } }),
    };
    const commentCount = await this.prisma.comment.count({
      where: commentCountWhere,
    });

    // Increment view count
    await this.prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return {
      ...post,
      commentCount: commentCount, // Update the commentCount field for frontend
      _count: {
        ...post._count,
        comments: commentCount,
      },
    } as any;
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    userId: string,
    isAdmin: boolean = false,
  ): Promise<Post> {
    const post = await this.findOne(id, userId);

    // Check if user is the author or admin
    if (post.authorId !== userId && !isAdmin) {
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
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Check if user is the author or admin
    if (post.authorId !== userId && !isAdmin) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    // Delete post images from S3 and remove Image records
    for (const image of post.images) {
      try {
        if (image.key) {
          await this.s3Service.deleteFile(image.key);
        }
      } catch (err: any) {
        this.logger.warn(
          `Failed to delete post image from S3 (key: ${image.key}): ${err?.message || err}`,
        );
      }
      try {
        await this.prisma.image.delete({ where: { id: image.id } });
      } catch (err: any) {
        this.logger.warn(
          `Failed to delete image record ${image.id}: ${err?.message || err}`,
        );
      }
    }

    // Delete images embedded in post body (rich text) from S3
    if (post.body) {
      const bodyKeys = this.s3Service.extractS3KeysFromHtml(post.body);
      for (const key of bodyKeys) {
        try {
          await this.s3Service.deleteFile(key);
        } catch (err: any) {
          this.logger.warn(
            `Failed to delete body image from S3 (key: ${key}): ${err?.message || err}`,
          );
        }
      }
    }

    // Soft delete the post
    await this.prisma.post.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
    });
  }

  // Get home feed (all boards combined)
  async getHomeFeed(query: QueryPostsDto, userId?: string, isAdmin: boolean = false) {
    return this.findAll(
      {
        ...query,
        boardId: undefined, // Remove board filter for home feed
      },
      userId,
      isAdmin,
    );
  }
}
