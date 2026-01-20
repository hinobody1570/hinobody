import { IsString, IsNotEmpty, IsOptional, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEyeMaskedImageDto {
  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'URL of the uploaded eye-masked image',
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    example: 'eye-masked-images/abc123.jpg',
    description: 'Storage key or path for the image',
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiPropertyOptional({
    example: 102400,
    description: 'File size in bytes',
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  size?: number;

  @ApiPropertyOptional({
    example: 'image/jpeg',
    description: 'MIME type of the image',
  })
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiPropertyOptional({
    example: 1920,
    description: 'Width of the image in pixels',
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  width?: number;

  @ApiPropertyOptional({
    example: 1080,
    description: 'Height of the image in pixels',
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  height?: number;
}

export class BulkCreateEyeMaskedImageDto {
  @ApiProperty({
    type: [CreateEyeMaskedImageDto],
    description: 'Array of eye-masked images to create',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEyeMaskedImageDto)
  images: CreateEyeMaskedImageDto[];
}

