import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BoardCategoryService } from './board-category.service';
import { CreateBoardCategoryDto } from './dto/create-board-category.dto';
import { UpdateBoardCategoryDto } from './dto/update-board-category.dto';
import { QueryBoardCategoriesDto } from './dto/query-board-categories.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('Board Categories')
@Controller('board-categories')
export class BoardCategoryController {
  constructor(
    private readonly boardCategoryService: BoardCategoryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new board category (Admin only)' })
  create(@Body() createBoardCategoryDto: CreateBoardCategoryDto) {
    return this.boardCategoryService.create(createBoardCategoryDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all board categories with pagination and filters (Admin only)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'active', required: false, description: 'Filter by active status', type: Boolean })
  findAll(@Query() query: QueryBoardCategoriesDto) {
    return this.boardCategoryService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a board category by ID (Admin only)' })
  findOne(@Param('id') id: string) {
    return this.boardCategoryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a board category (Admin only)' })
  update(
    @Param('id') id: string,
    @Body() updateBoardCategoryDto: UpdateBoardCategoryDto,
  ) {
    return this.boardCategoryService.update(id, updateBoardCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a board category (Admin only)' })
  remove(@Param('id') id: string) {
    return this.boardCategoryService.remove(id);
  }
}
