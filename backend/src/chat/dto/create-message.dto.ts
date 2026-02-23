import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ example: 'Hello!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  text: string;
}
