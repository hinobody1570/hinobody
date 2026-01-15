import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EyeMaskedImageService } from './eye-masked-image.service';
import { CreateEyeMaskedImageDto, BulkCreateEyeMaskedImageDto } from './dto/create-eye-masked-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('EyeMaskedImages')
@Controller('eye-masked-images')
export class EyeMaskedImageController {
  constructor(private readonly eyeMaskedImageService: EyeMaskedImageService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a single eye-masked image record' })
  create(
    @Body() createEyeMaskedImageDto: CreateEyeMaskedImageDto,
    @GetUser('id') userId: string,
  ) {
    return this.eyeMaskedImageService.create(createEyeMaskedImageDto, userId);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create multiple eye-masked image records' })
  createBulk(
    @Body() bulkCreateDto: BulkCreateEyeMaskedImageDto,
    @GetUser('id') userId: string,
  ) {
    return this.eyeMaskedImageService.createBulk(bulkCreateDto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all eye-masked images (optionally filtered by user)' })
  findAll(@GetUser('id') userId: string) {
    return this.eyeMaskedImageService.findByUserId(userId);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all eye-masked images from all users (admin) or filter by userId' })
  findAllImages(@Query('userId') userId?: string) {
    return this.eyeMaskedImageService.findAll(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get eye-masked image by ID' })
  findOne(@Param('id') id: string) {
    return this.eyeMaskedImageService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete eye-masked image by ID' })
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.eyeMaskedImageService.remove(id, userId);
  }
}

