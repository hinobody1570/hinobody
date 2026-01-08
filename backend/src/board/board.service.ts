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

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    // Check if board name already exists
    const existing = await this.prisma.board.findUnique({
      where: { name: createBoardDto.name },
    });

    if (existing) {
      throw new ConflictException('Board with this name already exists');
    }

    return this.prisma.board.create({
      data: createBoardDto,
    });
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

    const conditions: string[] = ['"isActive" = true'];
    const params: any[] = [];
    const countParams: any[] = [];
    let paramIndex = 1;

    const searchParamIndex = paramIndex;
    params.push(search);
    countParams.push(search);
    paramIndex++;

    const whereClause = conditions.join(' AND ');
    const ftsCondition = `"search_vector" @@ plainto_tsquery('english', $${searchParamIndex})`;
    const fullWhereClause = `${whereClause} AND ${ftsCondition}`;

    const boardsQuery = `
      SELECT 
        b.id,
        b.name,
        b.category,
        b.description,
        b."visibilityAccess",
        b."isActive",
        b."createdAt",
        b."updatedAt",
        ts_rank(b."search_vector", plainto_tsquery('english', $${searchParamIndex})) as rank
      FROM "boards" b
      WHERE ${fullWhereClause}
      ORDER BY rank DESC, b."createdAt" ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, skip);

    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM "boards" b
      WHERE ${fullWhereClause}
    `;

    const [boardsResult, countResult] = await Promise.all([
      this.prisma.$queryRawUnsafe(boardsQuery, ...params),
      this.prisma.$queryRawUnsafe(countQuery, ...countParams),
    ]);

    const boards = (boardsResult as any[]).map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      description: row.description,
      visibilityAccess: row.visibilityAccess,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));

    const total = (countResult as any[])[0]?.total || 0;

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
