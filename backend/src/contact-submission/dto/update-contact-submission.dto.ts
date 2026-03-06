import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContactStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateContactSubmissionDto {
  @ApiPropertyOptional({
    enum: ContactStatus,
    example: ContactStatus.IN_PROGRESS,
    description: 'Update submission status',
  })
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @ApiPropertyOptional({
    example: 'ckv9x2m3k0000z6s1abcd1234',
    description: 'Assign to a support/admin user (user id). Send null/empty to unassign.',
  })
  @IsOptional()
  @IsString()
  assignedToId?: string;
}

