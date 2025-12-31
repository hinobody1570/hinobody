import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateImageDto {
  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'URL of the uploaded image',
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    example: 'images/abc123.jpg',
    description: 'Storage key or path for the image',
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiPropertyOptional({
    example: 'post_123456',
    description: 'ID of the post associated with this image',
  })
  @IsString()
  @IsOptional()
  postId?: string;

  @ApiPropertyOptional({
    example: 102400,
    description: 'Size of the image file in bytes',
  })
  @IsNumber()
  @IsOptional()
  @IsInt()
  size?: number;

  @ApiPropertyOptional({
    example: 'image/jpeg',
    description: 'MIME type of the image',
  })
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiPropertyOptional({
    example: 800,
    description: 'Width of the image in pixels',
  })
  @IsNumber()
  @IsOptional()
  @IsInt()
  width?: number;

  @ApiPropertyOptional({
    example: 600,
    description: 'Height of the image in pixels',
  })
  @IsNumber()
  @IsOptional()
  @IsInt()
  height?: number;
}


