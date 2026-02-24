import {
  IsString,
  IsOptional,
  MinLength,
  IsBoolean,
  IsArray,
  ArrayMaxSize,
  IsIn,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const VALID_CATEGORIES = ['News', 'Reviews', 'Recommend', 'Free Board'] as const;

export class UpdatePostDto {
  @ApiPropertyOptional({
    example: 'Updated Post Title',
    minLength: 1,
    description: 'Updated title of the post',
  })
  @IsString()
  @MinLength(1)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated content of the post.',
    minLength: 1,
    description: 'Updated body content of the post',
  })
  @IsString()
  @MinLength(1)
  @IsOptional()
  body?: string;

  @ApiPropertyOptional({
    example: 'cm123board456',
    description: 'Board/community ID when post is moved to a community (mutually exclusive with postCategory)',
  })
  @IsString()
  @IsOptional()
  boardId?: string;

  @ApiPropertyOptional({
    example: 'News',
    description: 'Post category when post is a category post (mutually exclusive with boardId)',
    enum: VALID_CATEGORIES,
  })
  @IsString()
  @IsIn(VALID_CATEGORIES, {
    message: `postCategory must be one of: ${VALID_CATEGORIES.join(', ')}`,
  })
  @IsOptional()
  postCategory?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Activate or deactivate the post',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: ['image_abc123', 'image_def456'],
    description: 'Updated list of image IDs attached to the post (max 5)',
    type: [String],
    maxItems: 5,
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5, { message: 'Maximum 5 images allowed per post' })
  @IsOptional()
  imageIds?: string[];
}
