import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BoardMemberStatus } from '@prisma/client';

export class UpdateMembershipDto {
  @ApiProperty({
    enum: BoardMemberStatus,
    example: BoardMemberStatus.APPROVED,
    description: 'New status for the membership',
  })
  @IsEnum(BoardMemberStatus)
  @IsNotEmpty()
  status: BoardMemberStatus;
}

