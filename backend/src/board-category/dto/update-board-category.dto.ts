import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBoardCategoryDto {
  @ApiPropertyOptional({
    example: 'Updated Technology',
    minLength: 1,
    description: 'Updated name of the board category',
  })
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the category is active',
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
