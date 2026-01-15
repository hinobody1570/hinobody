import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { QueryBoardsDto } from './dto/query-boards.dto';
import { Board, Prisma } from '@prisma/client';

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
      isActive: true,
    };

    const [boards, total] = await Promise.all([
      this.prisma.board.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
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
    });

    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }

    return board;
  }


  async update(id: string, updateBoardDto: UpdateBoardDto): Promise<Board> {
    await this.findOne(id); // Check if exists

    return this.prisma.board.update({
      where: { id },
      data: updateBoardDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if exists
    await this.prisma.board.delete({
      where: { id },
    });
  }
}
