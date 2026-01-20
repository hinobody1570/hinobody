import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { QueryReportsDto } from './dto/query-reports.dto';
import { ReportStatus, Prisma } from '@prisma/client';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async create(createReportDto: CreateReportDto, userId: string) {
    const { reason, postId, commentId } = createReportDto;

    if (!postId && !commentId) {
      throw new BadRequestException(
        'Either postId or commentId must be provided',
      );
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
      const comment = await this.prisma.comment.findUnique({
        where: { id: commentId },
      });
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

  async findAll(query: QueryReportsDto) {
    const { status, page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    // Use PostgreSQL FTS when search is provided, otherwise use Prisma query builder
    if (search) {
      return this.findAllWithFTS(query);
    }

    const where: Prisma.ReportWhereInput = {
      ...(status && { status }),
    };

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip,
        take: limit,
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
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data: reports,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async findAllWithFTS(query: QueryReportsDto) {
    const { status, page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    const countParams: any[] = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`"status" = $${paramIndex}`);
      params.push(status);
      countParams.push(status);
      paramIndex++;
    }

    const searchParamIndex = paramIndex;
    params.push(search);
    countParams.push(search);
    paramIndex++;

    const whereClause = conditions.length > 0 ? conditions.join(' AND ') : '1=1';
    const ftsCondition = `"search_vector" @@ plainto_tsquery('english', $${searchParamIndex})`;
    const fullWhereClause = `${whereClause} AND ${ftsCondition}`;

    const reportsQuery = `
      SELECT 
        r.id,
        r.reason,
        r.status,
        r."reportedById",
        r."postId",
        r."commentId",
        r."createdAt",
        r."reviewedAt",
        r."reviewedBy",
        (
          SELECT json_build_object(
            'id', u.id,
            'nickname', u.nickname
          )
          FROM "users" u
          WHERE u.id = r."reportedById"
        ) as "reportedBy",
        (
          SELECT json_build_object(
            'id', p.id,
            'title', p.title,
            'author', (
              SELECT json_build_object(
                'id', u2.id,
                'nickname', u2.nickname
              )
              FROM "users" u2
              WHERE u2.id = p."authorId"
            )
          )
          FROM "posts" p
          WHERE p.id = r."postId"
        ) as post,
        (
          SELECT json_build_object(
            'id', c.id,
            'body', c.body,
            'author', (
              SELECT json_build_object(
                'id', u3.id,
                'nickname', u3.nickname
              )
              FROM "users" u3
              WHERE u3.id = c."authorId"
            )
          )
          FROM "comments" c
          WHERE c.id = r."commentId"
        ) as comment
      FROM "reports" r
      WHERE ${fullWhereClause}
      ORDER BY ts_rank(r."search_vector", plainto_tsquery('english', $${searchParamIndex})) DESC, r."createdAt" DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, skip);

    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM "reports" r
      WHERE ${fullWhereClause}
    `;

    const [reportsResult, countResult] = await Promise.all([
      this.prisma.$queryRawUnsafe(reportsQuery, ...params),
      this.prisma.$queryRawUnsafe(countQuery, ...countParams),
    ]);

    const reports = (reportsResult as any[]).map((row: any) => ({
      id: row.id,
      reason: row.reason,
      status: row.status,
      reportedById: row.reportedById,
      postId: row.postId,
      commentId: row.commentId,
      createdAt: row.createdAt,
      reviewedAt: row.reviewedAt,
      reviewedBy: row.reviewedBy,
      reportedBy: row.reportedBy,
      post: row.post,
      comment: row.comment,
    }));

    const total = (countResult as any[])[0]?.total || 0;

    return {
      data: reports,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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
