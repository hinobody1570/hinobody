import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { CreateImageDto } from './dto/create-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  create(@Body() createImageDto: CreateImageDto, @GetUser('id') userId: string) {
    return this.imageService.create(createImageDto, userId);
  }

  @Get()
  findAll() {
    return this.imageService.findAll();
  }

  @Get('post/:postId')
  findByPost(@Param('postId') postId: string) {
    return this.imageService.findByPost(postId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.imageService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.imageService.remove(id);
  }
}



