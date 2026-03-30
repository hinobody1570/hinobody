import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchDto } from './dto/search.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Search')
@ApiBearerAuth('JWT-auth')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Search across users, posts, and boards' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query', type: String })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Results per type', type: Number })
  search(
    @Query() searchDto: SearchDto,
    @GetUser('id') userId: string,
    @GetUser('role') role?: string,
  ) {
    return this.searchService.searchAll(searchDto, userId, role === 'ADMIN');
  }
}

