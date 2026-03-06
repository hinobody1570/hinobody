import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ description: 'Receiver user ID' })
  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @ApiProperty({ example: 'Hello!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  text: string;
}
