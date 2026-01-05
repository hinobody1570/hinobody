import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiPropertyOptional({
    example: 'Updated comment body.',
    minLength: 1,
    description: 'Updated content of the comment',
  })
  @IsString()
  @MinLength(1)
  @IsOptional()
  body?: string;
}
