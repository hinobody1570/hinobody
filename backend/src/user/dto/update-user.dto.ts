import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Language } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'johnDoe123',
    minLength: 3,
    maxLength: 20,
    description: 'Updated nickname (letters, numbers, and special characters allowed)',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9\s._\-'!@#$%&*()+=[\]{}|;:,?/~]+$/, {
    message: 'Nickname can only contain letters, numbers, and special characters (e.g. . _ - \' ! @ # $ % & * + = [ ] { } | ; : , ? / ~)',
  })
  @IsOptional()
  nickname?: string;

  @ApiPropertyOptional({
    enum: Language,
    example: Language.EN,
    description: 'Updated preferred language',
  })
  @IsEnum(Language)
  @IsOptional()
  language?: Language;

  @ApiPropertyOptional({
    example: true,
    description: 'User active status',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL (profile picture)',
  })
  @IsString()
  @IsOptional()
  avatar?: string;
}
