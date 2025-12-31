import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from '@prisma/client';

@Injectable()
export class BoardService {
  constructor(private prisma: PrismaService) {}

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    // Check if slug already exists
    const existing = await this.prisma.board.findUnique({
      where: { slug: createBoardDto.slug },
    });

    if (existing) {
      throw new ConflictException('Board with this slug already exists');
    }

    return this.prisma.board.create({
      data: createBoardDto,
    });
  }

  async findAll(): Promise<Board[]> {
    return this.prisma.board.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
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

  async findBySlug(slug: string): Promise<Board> {
    const board = await this.prisma.board.findUnique({
      where: { slug },
    });

    if (!board) {
      throw new NotFoundException(`Board with slug ${slug} not found`);
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



