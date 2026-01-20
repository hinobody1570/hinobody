import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsArray,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Language } from '@prisma/client';

export class CreatePostDto {
  @ApiProperty({
    example: 'My First Post',
    minLength: 1,
    description: 'Title of the post',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  title: string;

  @ApiProperty({
    example: 'This is the content of the post.',
    minLength: 1,
    description: 'Body content of the post',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  body: string;

  @ApiProperty({
    enum: Language,
    example: Language.EN,
    description: 'Original language of the post',
  })
  @IsEnum(Language)
  originalLanguage: Language;

  @ApiProperty({
    example: 'board_123456',
    description: 'ID of the board this post belongs to',
  })
  @IsString()
  @IsNotEmpty()
  boardId: string;

  @ApiPropertyOptional({
    example: ['image_abc123', 'image_def456'],
    description: 'Array of image IDs attached to the post',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageIds?: string[];

  @ApiPropertyOptional({
    example: ['javascript', 'react', 'nextjs'],
    description: 'Array of tags for the post',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
