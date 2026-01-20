import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VoteType } from '@prisma/client';

export class CreateVoteDto {
  @ApiProperty({
    enum: VoteType,
    description: 'Type of vote: UPVOTE or DOWNVOTE',
    example: VoteType.UPVOTE,
  })
  @IsEnum(VoteType)
  type: VoteType;

  @ApiPropertyOptional({
    description: 'Post ID to vote on',
    example: 'post_123456',
  })
  @IsOptional()
  @IsString()
  postId?: string;

  @ApiPropertyOptional({
    description: 'Comment ID to vote on',
    example: 'comment_123456',
  })
  @IsOptional()
  @IsString()
  commentId?: string;
}

