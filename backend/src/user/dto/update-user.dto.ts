import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Language } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'johnDoe123',
    minLength: 3,
    maxLength: 20,
    description: 'Updated nickname (alphanumeric only)',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Nickname must be alphanumeric only',
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
}
