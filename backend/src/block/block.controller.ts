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
import { BlockService } from './block.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller('blocks')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  create(
    @Body() createBlockDto: CreateBlockDto,
    @GetUser('id') userId: string,
  ) {
    return this.blockService.create(createBlockDto, userId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all blocks for admin with pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  findAllForAdmin(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.blockService.findAllForAdmin(pageNum, limitNum);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  findAll(@GetUser('id') userId: string) {
    return this.blockService.findAll(userId);
  }

  @Get('check/:blockedId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Check if current user has blocked a specific user' })
  checkBlockStatus(@Param('blockedId') blockedId: string, @GetUser('id') userId: string) {
    return this.blockService.isBlocked(userId, blockedId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  findOne(@Param('id') id: string) {
    return this.blockService.findOne(id);
  }

  @Delete(':blockedId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  remove(@Param('blockedId') blockedId: string, @GetUser('id') userId: string) {
    return this.blockService.remove(blockedId, userId);
  }
}
