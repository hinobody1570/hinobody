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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Posts')
@ApiBearerAuth('JWT-auth')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post successfully created' })
  create(@Body() createPostDto: CreatePostDto, @GetUser('id') userId: string) {
    return this.postService.create(createPostDto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all posts with pagination and filters' })
  @ApiQuery({
    name: 'boardId',
    required: false,
    description: 'Filter by board ID',
  })
  @ApiQuery({
    name: 'authorId',
    required: false,
    description: 'Filter by author ID',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiResponse({ status: 200, description: 'List of posts with pagination' })
  findAll(@Query() query: QueryPostsDto) {
    return this.postService.findAll(query);
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get home feed (all boards combined)' })
  @ApiResponse({ status: 200, description: 'Home feed posts' })
  getHomeFeed(@Query() query: QueryPostsDto) {
    return this.postService.getHomeFeed(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @GetUser('id') userId: string,
    @GetUser('role') role: string,
  ) {
    return this.postService.update(id, updatePostDto, userId, role === 'ADMIN');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  remove(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') role: string,
  ) {
    return this.postService.remove(id, userId, role === 'ADMIN');
  }
}
