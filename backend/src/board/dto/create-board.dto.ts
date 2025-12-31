import {
  IsString,
  IsOptional,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBoardDto {
  @ApiProperty({
    example: 'Project Board',
    minLength: 1,
    description: 'Name of the board',
  })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({
    example: 'project-board',
    minLength: 1,
    description: 'URL-friendly unique slug (lowercase, hyphen-separated)',
  })
  @IsString()
  @MinLength(1)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only',
  })
  slug: string;

  @ApiPropertyOptional({
    example: 'This board is used to manage project tasks',
    description: 'Optional board description',
  })
  @IsString()
  @IsOptional()
  description?: string;
}


