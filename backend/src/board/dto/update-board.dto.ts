import {
  IsString,
  IsOptional,
  MinLength,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBoardDto {
  @ApiPropertyOptional({
    example: 'Updated Project Board',
    minLength: 1,
    description: 'Updated name of the board',
  })
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'Updated description for this board',
    description: 'Updated board description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Enable or disable the board',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}


