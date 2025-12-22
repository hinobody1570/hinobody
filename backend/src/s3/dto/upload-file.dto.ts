import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadFileDto {
  @ApiPropertyOptional({
    example: 'images',
    description: 'Optional folder path in S3 bucket',
  })
  @IsString()
  @IsOptional()
  folder?: string;
}

