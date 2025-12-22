import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { S3Service } from './s3.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { ListFilesDto } from './dto/list-files.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('S3')
@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload a file to S3' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
        folder: {
          type: 'string',
          description: 'Optional folder path in S3 bucket',
          example: 'images',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        key: { type: 'string', example: 'images/1234567890-abc123.jpg' },
        url: { type: 'string', example: 'https://bucket.s3.region.amazonaws.com/images/1234567890-abc123.jpg' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - No file provided or invalid file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query() uploadFileDto: UploadFileDto,
  ) {
    return this.s3Service.uploadFile(file, uploadFileDto.folder);
  }

  @Get('files')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all files from S3 bucket' })
  @ApiQuery({
    name: 'prefix',
    required: false,
    type: String,
    description: 'Optional prefix (folder path) to filter files',
    example: 'images/',
  })
  @ApiResponse({
    status: 200,
    description: 'List of files retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string', example: 'images/1234567890-abc123.jpg' },
          url: { type: 'string', example: 'https://bucket.s3.region.amazonaws.com/images/1234567890-abc123.jpg' },
          size: { type: 'number', example: 102400 },
          lastModified: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllFiles(@Query() listFilesDto: ListFilesDto) {
    return this.s3Service.getAllFiles(listFilesDto.prefix);
  }

  @Delete('files/:key')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a file from S3' })
  @ApiParam({
    name: 'key',
    type: String,
    description: 'S3 key (file path) to delete',
    example: 'images/1234567890-abc123.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'File deleted successfully' },
        key: { type: 'string', example: 'images/1234567890-abc123.jpg' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid key' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(@Param('key') key: string) {
    // Decode the key in case it's URL encoded
    const decodedKey = decodeURIComponent(key);
    return this.s3Service.deleteFile(decodedKey);
  }
}

