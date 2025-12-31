import {
  IsString,
  IsOptional,
  MinLength,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

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
    example: true,
    description: 'Activate or deactivate the post',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: ['image_abc123', 'image_def456'],
    description: 'Updated list of image IDs attached to the post',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageIds?: string[];
}


