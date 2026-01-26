import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardCategoryDto } from './dto/create-board-category.dto';
import { UpdateBoardCategoryDto } from './dto/update-board-category.dto';
import { QueryBoardCategoriesDto } from './dto/query-board-categories.dto';
import { BoardCategory, Prisma } from '@prisma/client';

@Injectable()
export class BoardCategoryService {
  constructor(private prisma: PrismaService) {}

  async create(
    createBoardCategoryDto: CreateBoardCategoryDto,
  ): Promise<BoardCategory> {
    // Check if category name already exists
    const existing = await this.prisma.boardCategory.findUnique({
      where: { name: createBoardCategoryDto.name },
    });

    if (existing) {
      throw new ConflictException(
        'Board category with this name already exists',
      );
    }

    const category = await this.prisma.boardCategory.create({
      data: {
        name: createBoardCategoryDto.name,
        active:
          createBoardCategoryDto.active !== undefined
            ? createBoardCategoryDto.active
            : true,
      },
    });

    return category;
  }

  async findAll(query: QueryBoardCategoriesDto) {
    const { page = 1, limit = 20, search, active } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BoardCategoryWhereInput = {};

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (active !== undefined) {
      where.active = active;
    }

    const [categories, total] = await Promise.all([
      this.prisma.boardCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.boardCategory.count({ where }),
    ]);

    return {
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<BoardCategory> {
    const category = await this.prisma.boardCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(
        `Board category with ID ${id} not found`,
      );
    }

    return category;
  }

  async update(
    id: string,
    updateBoardCategoryDto: UpdateBoardCategoryDto,
  ): Promise<BoardCategory> {
    await this.findOne(id); // Check if exists

    // If name is being updated, check for conflicts
    if (updateBoardCategoryDto.name) {
      const existing = await this.prisma.boardCategory.findFirst({
        where: {
          name: updateBoardCategoryDto.name,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException(
          'Board category with this name already exists',
        );
      }
    }

    return this.prisma.boardCategory.update({
      where: { id },
      data: updateBoardCategoryDto,
    });
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    // Check if category is being used by any boards
    const boardsCount = await this.prisma.board.count({
      where: { categoryId: id },
    });

    if (boardsCount > 0) {
      throw new ConflictException(
        `Cannot delete category. It is being used by ${boardsCount} board(s).`,
      );
    }

    await this.prisma.boardCategory.delete({
      where: { id },
    });
  }
}
