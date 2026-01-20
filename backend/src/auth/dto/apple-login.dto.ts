import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AppleLoginDto {
  @ApiProperty({
    description: 'Apple ID token from Sign in with Apple',
    example: 'eyJraWQiOiJlWGF1bm1...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

