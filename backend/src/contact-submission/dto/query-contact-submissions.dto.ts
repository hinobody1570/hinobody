import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContactStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryContactSubmissionsDto {
  @ApiPropertyOptional({
    enum: ContactStatus,
    description: 'Filter by status',
    example: ContactStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @ApiPropertyOptional({
    description: 'Filter by assigned user id',
    example: 'ckv9x2m3k0000z6s1abcd1234',
  })
  @IsOptional()
  @IsString()
  assignedToId?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number for pagination (default 1)',
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 20,
    description: 'Items per page (default 20, max 100)',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    example: 'login',
    description: 'Search in name/email/category/subject/message',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

