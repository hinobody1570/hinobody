import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateImageDto } from './dto/create-image.dto';
import { Image } from '@prisma/client';

@Injectable()
export class ImageService {
  constructor(private prisma: PrismaService) {}

  async create(createImageDto: CreateImageDto, userId: string): Promise<Image> {
    return this.prisma.image.create({
      data: {
        ...createImageDto,
        userId,
      },
    });
  }

  async findAll() {
    return this.prisma.image.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
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
      },
    });
  }

  async findOne(id: string): Promise<Image> {
    const image = await this.prisma.image.findUnique({
      where: { id },
      include: {
        user: true,
        post: true,
      },
    });

    if (!image) {
      throw new Error(`Image with ID ${id} not found`);
    }

    return image;
  }

  async findByPost(postId: string): Promise<Image[]> {
    return this.prisma.image.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.image.delete({
      where: { id },
    });
  }
}



