import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactSubmissionDto } from './dto/create-contact-submission.dto';
import { QueryContactSubmissionsDto } from './dto/query-contact-submissions.dto';
import { UpdateContactSubmissionDto } from './dto/update-contact-submission.dto';
import { ContactStatus, Prisma } from '@prisma/client';

@Injectable()
export class ContactSubmissionService {
  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreateContactSubmissionDto,
    meta: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    return this.prisma.contactSubmission.create({
      data: {
        ...dto,
        ipAddress: meta.ipAddress || null,
        userAgent: meta.userAgent || null,
      },
    });
  }

  async findAll(query: QueryContactSubmissionsDto) {
    const { status, assignedToId, page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ContactSubmissionWhereInput = {
      ...(status && { status }),
      ...(assignedToId && { assignedToId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } },
          { message: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.contactSubmission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contactSubmission.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.contactSubmission.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`ContactSubmission with ID ${id} not found`);
    }

    return item;
  }

  async update(id: string, dto: UpdateContactSubmissionDto) {
    const existing = await this.prisma.contactSubmission.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!existing) {
      throw new NotFoundException(`ContactSubmission with ID ${id} not found`);
    }

    const assignedToId =
      dto.assignedToId !== undefined && dto.assignedToId.trim() === ''
        ? null
        : dto.assignedToId;

    if (assignedToId) {
      const userExists = await this.prisma.user.findUnique({
        where: { id: assignedToId },
        select: { id: true },
      });
      if (!userExists) {
        throw new BadRequestException('assignedToId user not found');
      }
    }

    let resolvedAtUpdate: Date | null | undefined;
    if (dto.status) {
      if (dto.status === ContactStatus.RESOLVED || dto.status === ContactStatus.CLOSED) {
        resolvedAtUpdate = new Date();
      } else {
        resolvedAtUpdate = null;
      }
    }

    return this.prisma.contactSubmission.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.assignedToId !== undefined && { assignedToId }),
        ...(resolvedAtUpdate !== undefined && { resolvedAt: resolvedAtUpdate }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.contactSubmission.delete({ where: { id } });
  }
}

