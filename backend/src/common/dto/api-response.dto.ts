import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ example: 'Success', description: 'Response message' })
  message: string;

  @ApiProperty({ example: false, description: 'Error flag' })
  error: boolean;

  @ApiProperty({ description: 'Response data' })
  data: T;
}

