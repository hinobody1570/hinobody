import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Language } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
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

  @ApiProperty({
    example: 'johnDoe123',
    minLength: 3,
    maxLength: 20,
    description: 'Unique nickname (alphanumeric only)',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Nickname must be alphanumeric only',
  })
  nickname: string;

  @ApiPropertyOptional({
    enum: Language,
    example: Language.EN,
    description: 'Preferred language of the user',
    default: Language.EN,
  })
  @IsEnum(Language)
  @IsOptional()
  language?: Language = Language.EN;
}


