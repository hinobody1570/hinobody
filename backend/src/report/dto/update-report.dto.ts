import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReportStatus } from '@prisma/client';

export class UpdateReportDto {
  @ApiPropertyOptional({
    enum: ReportStatus,
    example: ReportStatus.PENDING,
    description: 'Updated status of the report',
  })
  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;
}


