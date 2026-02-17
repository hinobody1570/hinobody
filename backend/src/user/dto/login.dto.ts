import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Registered user email address',
  })
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  email: string;

  @ApiProperty({
    example: 'StrongPass123',
    minLength: 8,
    description: 'User password (minimum 8 characters)',
  })
  @IsString()
  @MinLength(8)
  password: string;
}



