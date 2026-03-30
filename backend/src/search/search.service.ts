import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchDto } from './dto/search.dto';
import { PostService } from '../post/post.service';
import { BoardService } from '../board/board.service';

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaService,
    private postService: PostService,
    private boardService: BoardService,
  ) {}

  async searchAll(searchDto: SearchDto, userId: string, isAdmin: boolean = false) {
    const { q, page = 1, limit = 10 } = searchDto;

    if (!q || !q.trim()) {
      return {
        users: { data: [], meta: { total: 0, page, limit, totalPages: 0 } },
        posts: { data: [], meta: { total: 0, page, limit, totalPages: 0 } },
        boards: { data: [], meta: { total: 0, page, limit, totalPages: 0 } },
      };
    }

    const normalizedQuery = q.trim();
    const skip = (page - 1) * limit;

    // Search all three types in parallel. Pass userId/isAdmin so posts respect the same rules as
    // the feed (e.g. hide posts the user has reported, blocks, board visibility).
    const [usersResult, postsResult, boardsResult] = await Promise.all([
      this.searchUsers(normalizedQuery, page, limit, skip),
      this.postService.findAll({ page, limit, search: normalizedQuery }, userId, isAdmin),
      this.boardService.findAll({ page, limit, search: normalizedQuery }),
    ]);

    return {
      users: usersResult,
      posts: postsResult,
      boards: boardsResult,
    };
  }

  private async searchUsers(query: string, page: number, limit: number, skip: number) {
    const where = {
      isActive: true,
      emailVerified: true,
      OR: [
        {
          nickname: {
            contains: query,
            mode: 'insensitive' as const,
          },
        },
        {
          email: {
            contains: query,
            mode: 'insensitive' as const,
          },
        },
      ],
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          nickname: true,
          language: true,
          role: true,
          isActive: true,
          emailVerified: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
          provider: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

