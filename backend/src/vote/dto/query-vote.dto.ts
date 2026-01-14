import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryVoteDto {
  @ApiPropertyOptional({
    description: 'Post ID to get vote for',
    example: 'post_123456',
  })
  @IsOptional()
  @IsString()
  postId?: string;

  @ApiPropertyOptional({
    description: 'Comment ID to get vote for',
    example: 'comment_123456',
  })
  @IsOptional()
  @IsString()
  commentId?: string;
}

