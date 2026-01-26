import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBoardCategoryDto {
  @ApiProperty({
    example: 'Technology',
    minLength: 1,
    description: 'Name of the board category',
  })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the category is active',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
