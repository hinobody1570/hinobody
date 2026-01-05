import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { Post, Prisma } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    // Verify board exists
    const board = await this.prisma.board.findUnique({
      where: { id: createPostDto.boardId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Create post with images
    const post = await this.prisma.post.create({
      data: {
        title: createPostDto.title,
        body: createPostDto.body,
        originalLanguage: createPostDto.originalLanguage,
        authorId: userId,
        boardId: createPostDto.boardId,
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

    const where: Prisma.PostWhereInput = {
      isActive: true,
      isDeleted: false,
      ...(boardId && { boardId }),
      ...(authorId && { authorId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { body: { contains: search, mode: 'insensitive' } },
        ],
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
