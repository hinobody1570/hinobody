import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export type PostSortBy = 'newest' | 'mostLiked' | 'trending';

export class QueryPostsDto {
  @ApiPropertyOptional({
    example: 'board_123456',
    description: 'Filter posts by board ID',
  })
  @IsOptional()
  @IsString()
  boardId?: string;

  @ApiPropertyOptional({
    example: 'user_123456',
    description: 'Filter posts by author ID',
  })
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiPropertyOptional({
    example: 'user_123456',
    description: 'Filter posts that have comments by this user ID',
  })
  @IsOptional()
  @IsString()
  commenterId?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number for pagination (default 1)',
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 20,
    description: 'Number of posts per page (default 20, max 100)',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    example: 'nestjs',
    description: 'Full-text search query for posts',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'newest',
    description: 'Sort order: newest, mostLiked (highest upvotes), trending (engagement score)',
    enum: ['newest', 'mostLiked', 'trending'],
  })
  @IsOptional()
  @IsIn(['newest', 'mostLiked', 'trending'])
  sortBy?: PostSortBy = 'newest';

  @ApiPropertyOptional({
    example: 'News',
    description: 'Filter posts by category: News, Reviews, Recommend, Free Board',
    enum: ['News', 'Reviews', 'Recommend', 'Free Board'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['News', 'Reviews', 'Recommend', 'Free Board'])
  category?: string;
}
