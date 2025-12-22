import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Language } from '@prisma/client';

export class CreateCommentDto {
  @ApiProperty({
    example: 'This is a comment body.',
    minLength: 1,
    description: 'Content of the comment',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  body: string;

  @ApiProperty({
    enum: Language,
    example: Language.EN,
    description: 'Original language of the comment',
  })
  @IsEnum(Language)
  originalLanguage: Language;

  @ApiProperty({
    example: 'post_123456',
    description: 'ID of the post this comment belongs to',
  })
  @IsString()
  @IsNotEmpty()
  postId: string;

  @ApiPropertyOptional({
    example: 'comment_654321',
    description: 'Optional parent comment ID for nested comments',
  })
  @IsString()
  @IsOptional()
  parentId?: string;
}


