import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateMessageDto {
  @ApiProperty({ example: 'Updated text' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  text: string;
}
