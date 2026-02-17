import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'reset-token-here',
    description: 'Password reset token received via email',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'NewStrongPass123!',
    minLength: 8,
    description: 'New password (minimum 8 characters, uppercase, lowercase, number, special character)',
  })
  @IsString()
  @MinLength(8, {
    message:
      'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/, {
    message:
      'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
  })
  newPassword: string;
}
