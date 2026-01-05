import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryCommentsDto {
  @ApiPropertyOptional({
    example: 'post_123456',
    description: 'Filter comments by post ID',
  })
  @IsOptional()
  @IsString()
  postId?: string;

  @ApiPropertyOptional({
    example: 'user_123456',
    description: 'Filter comments by author ID',
  })
  @IsOptional()
  @IsString()
  authorId?: string;

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
    description: 'Number of comments per page (default 20, max 100)',
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
    example: 'great post',
    description: 'Full-text search query for comments',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

