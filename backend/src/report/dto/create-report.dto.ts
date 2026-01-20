import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({
    example: 'This post contains inappropriate content.',
    minLength: 10,
    description: 'Reason for reporting',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  reason: string;

  @ApiPropertyOptional({
    example: 'post_123456',
    description:
      'ID of the post being reported (required if commentId is not provided)',
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.commentId)
  postId?: string;

  @ApiPropertyOptional({
    example: 'comment_654321',
    description:
      'ID of the comment being reported (required if postId is not provided)',
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.postId)
  commentId?: string;
}
