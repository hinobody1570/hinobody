import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportStatus } from '@prisma/client';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async create(createReportDto: CreateReportDto, userId: string) {
    const { reason, postId, commentId } = createReportDto;

    if (!postId && !commentId) {
      throw new BadRequestException('Either postId or commentId must be provided');
    }

    if (postId && commentId) {
      throw new BadRequestException('Cannot report both post and comment');
    }

    // Verify post/comment exists
    if (postId) {
      const post = await this.prisma.post.findUnique({ where: { id: postId } });
      if (!post) {
        throw new NotFoundException('Post not found');
      }
    }

    if (commentId) {
      const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
      if (!comment) {
        throw new NotFoundException('Comment not found');
      }
    }

    return this.prisma.report.create({
      data: {
        reason,
        reportedById: userId,
        postId,
        commentId,
      },
      include: {
        reportedBy: {
          select: {
            id: true,
            nickname: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
        comment: {
          select: {
            id: true,
            body: true,
          },
        },
      },
    });
  }

  async findAll(status?: ReportStatus) {
    return this.prisma.report.findMany({
      where: status ? { status } : undefined,
      include: {
        reportedBy: {
          select: {
            id: true,
            nickname: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            author: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        },
        comment: {
          select: {
            id: true,
            body: true,
            author: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        reportedBy: true,
        post: true,
        comment: true,
      },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return report;
  }

  async update(id: string, updateReportDto: UpdateReportDto, adminId: string) {
    await this.findOne(id); // Verify exists

    return this.prisma.report.update({
      where: { id },
      data: {
        ...updateReportDto,
        reviewedAt: new Date(),
        reviewedBy: adminId,
      },
      include: {
        reportedBy: true,
        post: true,
        comment: true,
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.report.delete({
      where: { id },
    });
  }
}



