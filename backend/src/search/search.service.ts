import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchDto } from './dto/search.dto';
import { PostService } from '../post/post.service';
import { BoardService } from '../board/board.service';
import { UserService } from '../user/user.service';

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaService,
    private postService: PostService,
    private boardService: BoardService,
    private userService: UserService,
  ) {}

  async searchAll(searchDto: SearchDto) {
    const { q, page = 1, limit = 10 } = searchDto;

    if (!q || !q.trim()) {
      return {
        users: { data: [], meta: { total: 0, page, limit, totalPages: 0 } },
        posts: { data: [], meta: { total: 0, page, limit, totalPages: 0 } },
        boards: { data: [], meta: { total: 0, page, limit, totalPages: 0 } },
      };
    }

    // Search all three types in parallel
    const [usersResult, postsResult, boardsResult] = await Promise.all([
      this.userService.findAll({ page, limit, search: q.trim() }),
      this.postService.findAll({ page, limit, search: q.trim() }),
      this.boardService.findAll({ page, limit, search: q.trim() }),
    ]);

    return {
      users: usersResult,
      posts: postsResult,
      boards: boardsResult,
    };
  }
}

