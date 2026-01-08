import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinBoardDto {
  @ApiProperty({
    example: 'board-id-123',
    description: 'ID of the board to join',
  })
  @IsString()
  @IsNotEmpty()
  boardId: string;
}

