import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBlockDto {
  @ApiProperty({
    example: 'user_123456',
    description: 'ID of the user to be blocked',
  })
  @IsString()
  @IsNotEmpty()
  blockedId: string;
}


