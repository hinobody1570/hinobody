import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListFilesDto {
  @ApiPropertyOptional({
    example: 'images/',
    description: 'Optional prefix (folder path) to filter files',
  })
  @IsString()
  @IsOptional()
  prefix?: string;
}

