import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { QueryBoardsDto } from './dto/query-boards.dto';
import { Board, BoardMember, Prisma } from '@prisma/client';

@Injectable()
export class BoardService {
  constructor(private prisma: PrismaService) {}

  async create(createBoardDto: CreateBoardDto, creatorId: string): Promise<Board> {
    // Check if board name already exists
    const existing = await this.prisma.board.findUnique({
      where: { name: createBoardDto.name },
    });

    if (existing) {
      throw new ConflictException('Board with this name already exists');
    }

    // Validate category exists and is active
    const category = await this.prisma.boardCategory.findUnique({
      where: { id: createBoardDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Board category with ID ${createBoardDto.categoryId} not found`,
      );
    }

    if (!category.active) {
      throw new BadRequestException(
        'Cannot create board with inactive category',
      );
    }

    // Create board with creator and auto-approve creator as member
    const board = await this.prisma.board.create({
      data: {
        ...createBoardDto,
        creatorId,
        members: {
          create: {
            userId: creatorId,
            status: 'APPROVED',
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            active: true,
          },
        },
      },
    });

    return board;
  }

  async findAll(query: QueryBoardsDto) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    // Use PostgreSQL FTS when search is provided, otherwise use Prisma query builder
    if (search) {
      return this.findAllWithFTS(query);
    }

    const where: Prisma.BoardWhereInput = {
      // isActive: true,
    };

    const [boards, total] = await Promise.all([
      this.prisma.board.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              active: true,
            },
          },
        },
      }),
      this.prisma.board.count({ where }),
    ]);

    return {
      data: boards,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async findAllWithFTS(query: QueryBoardsDto) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    // Use simple Prisma search instead of FTS to avoid requiring search_vector column
    const where: Prisma.BoardWhereInput = {
      isActive: true,
      OR: [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    };

    const [boards, total] = await Promise.all([
      this.prisma.board.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              active: true,
            },
          },
        },
      }),
      this.prisma.board.count({ where }),
    ]);

    return {
      data: boards,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Board> {
    const board = await this.prisma.board.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            active: true,
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }

    return board;
  }


  async update(id: string, updateBoardDto: UpdateBoardDto): Promise<Board> {
    await this.findOne(id); // Check if exists

    // If categoryId is being updated, validate it exists and is active
    if (updateBoardDto.categoryId) {
      const category = await this.prisma.boardCategory.findUnique({
        where: { id: updateBoardDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Board category with ID ${updateBoardDto.categoryId} not found`,
        );
      }

      if (!category.active) {
        throw new BadRequestException(
          'Cannot update board to inactive category',
        );
      }
    }

    return this.prisma.board.update({
      where: { id },
      data: updateBoardDto,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            active: true,
          },
        },
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if exists
    await this.prisma.board.delete({
      where: { id },
    });
  }

  async findByUserId(userId: string) {
    // This method returns boards for the specified userId (from URL parameter)
    // It works for both viewing your own profile and viewing other users' profiles
    
    // Get boards created by the specified user
    const createdBoards = await this.prisma.board.findMany({
      where: {
        creatorId: userId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            active: true,
          },
        },
      },
    });

    // Get boards where the specified user is a member (approved status)
    const memberBoards = await this.prisma.board.findMany({
      where: {
        members: {
          some: {
            userId: userId,
            status: 'APPROVED',
          },
        },
        isActive: true,
        // Exclude boards created by user (already in createdBoards)
        creatorId: {
          not: userId,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            active: true,
          },
        },
      },
    });

    return {
      created: createdBoards,
      member: memberBoards,
    };
  }

  async joinBoard(boardId: string, userId: string): Promise<BoardMember> {
    // Check if board exists
    const board = await this.findOne(boardId);

    // Check if user is already a member
    const existingMembership = await this.prisma.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId,
          boardId,
        },
      },
    });

    if (existingMembership) {
      if (existingMembership.status === 'APPROVED') {
        throw new ConflictException('User is already a member of this board');
      }
      if (existingMembership.status === 'PENDING') {
        throw new ConflictException('Membership request is already pending');
      }
      // If rejected, allow them to request again
      await this.prisma.boardMember.delete({
        where: { id: existingMembership.id },
      });
    }

    // Determine membership status based on board visibility
    let membershipStatus: 'PENDING' | 'APPROVED' = 'APPROVED';
    if (board.visibilityAccess === 'PRIVATE' || board.visibilityAccess === 'RESTRICTED') {
      membershipStatus = 'PENDING';
    }

    // Create membership
    const membership = await this.prisma.boardMember.create({
      data: {
        userId,
        boardId,
        status: membershipStatus,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            email: true,
            avatar: true,
          },
        },
        board: {
          select: {
            id: true,
            name: true,
            visibilityAccess: true,
          },
        },
      },
    });

    return membership;
  }

  /**
   * Get all BoardMember records for the current logged-in user
   */
  async getPendingRequests(userId: string) {
    const memberships = await this.prisma.boardMember.findMany({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            email: true,
            avatar: true,
            createdAt: true,
          },
        },
        board: {
          select: {
            id: true,
            name: true,
            description: true,
            visibilityAccess: true,
            creator: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    // Sort: PENDING first, then APPROVED, then REJECTED
    const order = { PENDING: 0, APPROVED: 1, REJECTED: 2 };
    return memberships.sort((a, b) => {
      const diff = (order[a.status] ?? 3) - (order[b.status] ?? 3);
      return diff !== 0 ? diff : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async approveMembership(membershipId: string, userId: string): Promise<BoardMember> {
    // Get membership
    const membership = await this.prisma.boardMember.findUnique({
      where: { id: membershipId },
      include: {
        board: {
          select: {
            creatorId: true,
          },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Membership request not found');
    }

    // Check if user is the board creator
    if (membership.board.creatorId !== userId) {
      throw new ForbiddenException('Only board creator can approve membership requests');
    }

    if (membership.status !== 'PENDING') {
      throw new ConflictException('Membership request is not pending');
    }

    // Update membership status
    const updatedMembership = await this.prisma.boardMember.update({
      where: { id: membershipId },
      data: {
        status: 'APPROVED',
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            email: true,
            avatar: true,
          },
        },
        board: {
          select: {
            id: true,
            name: true,
            visibilityAccess: true,
          },
        },
      },
    });

    return updatedMembership;
  }

  async rejectMembership(membershipId: string, userId: string): Promise<void> {
    // Get membership
    const membership = await this.prisma.boardMember.findUnique({
      where: { id: membershipId },
      include: {
        board: {
          select: {
            creatorId: true,
          },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Membership request not found');
    }

    // Check if user is the board creator
    if (membership.board.creatorId !== userId) {
      throw new ForbiddenException('Only board creator can reject membership requests');
    }

    if (membership.status !== 'PENDING') {
      throw new ConflictException('Membership request is not pending');
    }

    // Delete the membership request (or update to REJECTED if you want to keep history)
    await this.prisma.boardMember.delete({
      where: { id: membershipId },
    });
  }
}
