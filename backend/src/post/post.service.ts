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

    // If isActive is not provided, default to true (published)
    // If isActive is false, it's a draft and we skip membership check
    const isDraft = createPostDto.isActive === false;
    
    // Only check membership if posting (not saving as draft)
    if (!isDraft) {
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
    }

    const post = await this.prisma.post.create({
      data: {
        title: createPostDto.title,
        body: createPostDto.body,
        originalLanguage: createPostDto.originalLanguage,
        authorId: userId,
        boardId: createPostDto.boardId,
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

  async findAll(query: QueryPostsDto, userId?: string) {
    const { boardId, authorId, page = 1, limit = 20, search } = query;
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

    // Use PostgreSQL FTS when search is provided, otherwise use Prisma query builder
    if (search) {
      return this.findAllWithFTS(query, blockedUserIds);
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

    const where: Prisma.PostWhereInput = {
      isActive: true,
      isDeleted: false,
      ...(boardId && { boardId }),
      ...(authorId && { authorId }),
      // Exclude posts from blocked users (only if authorId is not specified)
      ...(!authorId && blockedUserIds.length > 0 && {
        authorId: {
          notIn: blockedUserIds,
        },
      }),
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

  private async findAllWithFTS(query: QueryPostsDto, blockedUserIds: string[] = []) {
    const { boardId, authorId, page = 1, limit = 20, search } = query;
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

    // Use simple Prisma search instead of FTS to avoid requiring search_vector column
    const where: Prisma.PostWhereInput = {
      isActive: true,
      isDeleted: false,
      ...(boardId && { boardId }),
      ...(authorId && { authorId }),
      // Exclude posts from blocked users (only if authorId is not specified)
      ...(!authorId && blockedUserIds.length > 0 && {
        authorId: {
          notIn: blockedUserIds,
        },
      }),
      OR: search
        ? [
            {
              title: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              body: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ]
        : undefined,
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
            take: 1,
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
    isAdmin: boolean = false,
  ): Promise<Post> {
    const post = await this.findOne(id);

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
  async getHomeFeed(query: QueryPostsDto, userId?: string) {
    return this.findAll(
      {
        ...query,
        boardId: undefined, // Remove board filter for home feed
      },
      userId,
    );
  }
}
