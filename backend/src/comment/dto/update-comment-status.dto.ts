import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentStatusDto {
  @ApiProperty({
    example: true,
    description: 'Whether the comment is active (visible to users)',
  })
  @IsBoolean()
  isActive: boolean;
}

