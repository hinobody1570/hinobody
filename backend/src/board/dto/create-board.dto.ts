import { IsString, IsOptional, MinLength, Matches, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BoardVisibility } from '@prisma/client';

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
    example: 'technology',
    minLength: 1,
    description: 'Category of the board',
  })
  @IsString()
  @MinLength(1)
  category: string;

  @ApiPropertyOptional({
    example: 'This board is used to manage project tasks',
    description: 'Optional board description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: BoardVisibility,
    example: BoardVisibility.PUBLIC,
    description: 'Visibility access level for the board',
    default: BoardVisibility.PUBLIC,
  })
  @IsEnum(BoardVisibility)
  @IsOptional()
  visibilityAccess?: BoardVisibility;
}
