import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEyeMaskedImageDto, BulkCreateEyeMaskedImageDto } from './dto/create-eye-masked-image.dto';
import { EyeMaskedImage } from '@prisma/client';

@Injectable()
export class EyeMaskedImageService {
  constructor(private prisma: PrismaService) {}

  async create(
    createEyeMaskedImageDto: CreateEyeMaskedImageDto,
    userId: string,
  ): Promise<EyeMaskedImage> {
    return this.prisma.eyeMaskedImage.create({
      data: {
        ...createEyeMaskedImageDto,
        userId,
      },
    });
  }

  async createBulk(
    bulkCreateDto: BulkCreateEyeMaskedImageDto,
    userId: string,
  ): Promise<EyeMaskedImage[]> {
    // Create all images in a transaction
    const images = await this.prisma.$transaction(
      bulkCreateDto.images.map((imageDto) =>
        this.prisma.eyeMaskedImage.create({
          data: {
            ...imageDto,
            userId,
          },
        }),
      ),
    );

    return images;
  }

  async findAll(userId?: string): Promise<any[]> {
    const where = userId ? { userId } : {};
    
    return this.prisma.eyeMaskedImage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string): Promise<EyeMaskedImage[]> {
    return this.prisma.eyeMaskedImage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<EyeMaskedImage> {
    const image = await this.prisma.eyeMaskedImage.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
      },
    });

    if (!image) {
      throw new Error(`EyeMaskedImage with ID ${id} not found`);
    }

    return image;
  }

  async remove(id: string, userId: string, isAdmin: boolean = false): Promise<void> {
    // Verify the image belongs to the user or user is admin
    const image = await this.prisma.eyeMaskedImage.findUnique({
      where: { id },
    });

    if (!image) {
      throw new Error(`EyeMaskedImage with ID ${id} not found`);
    }

    if (image.userId !== userId && !isAdmin) {
      throw new Error('You do not have permission to delete this image');
    }

    await this.prisma.eyeMaskedImage.delete({
      where: { id },
    });
  }
}

