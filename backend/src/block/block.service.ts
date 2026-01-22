import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlockDto } from './dto/create-block.dto';

@Injectable()
export class BlockService {
  constructor(private prisma: PrismaService) {}

  async create(createBlockDto: CreateBlockDto, userId: string) {
    const { blockedId } = createBlockDto;

    if (userId === blockedId) {
      throw new BadRequestException('Cannot block yourself');
    }

    // Verify user exists
    const blockedUser = await this.prisma.user.findUnique({
      where: { id: blockedId },
    });

    if (!blockedUser) {
      throw new NotFoundException('User to block not found');
    }

    // Check if already blocked
    const existing = await this.prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: userId,
          blockedId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('User is already blocked');
    }

    return this.prisma.block.create({
      data: {
        blockerId: userId,
        blockedId,
      },
      include: {
        blocked: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.block.findMany({
      where: { blockerId: userId },
      include: {
        blocked: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllForAdmin(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [blocks, total] = await Promise.all([
      this.prisma.block.findMany({
        skip,
        take: limit,
        include: {
          blocker: {
            select: {
              id: true,
              nickname: true,
              email: true,
            },
          },
          blocked: {
            select: {
              id: true,
              nickname: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.block.count(),
    ]);

    return {
      data: blocks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const block = await this.prisma.block.findUnique({
      where: { id },
      include: {
        blocker: true,
        blocked: true,
      },
    });

    if (!block) {
      throw new NotFoundException(`Block with ID ${id} not found`);
    }

    return block;
  }

  async remove(blockedId: string, userId: string): Promise<void> {
    const block = await this.prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: userId,
          blockedId,
        },
      },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    await this.prisma.block.delete({
      where: { id: block.id },
    });
  }

  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const block = await this.prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });

    return !!block;
  }
}
