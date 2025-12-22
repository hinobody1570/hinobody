import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME') || '';

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  /**
   * Upload a file to S3
   * @param file - The file to upload
   * @param folder - Optional folder path in S3 bucket
   * @returns Object with key and URL of uploaded file
   */
  async uploadFile(file: Express.Multer.File, folder?: string): Promise<{ key: string; url: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!this.bucketName) {
      throw new BadRequestException('AWS S3 bucket name is not configured');
    }

    // Generate unique file name
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    const key = folder ? `${folder}/${fileName}` : fileName;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // Note: ACL is deprecated in some regions. Use bucket policy for public access instead.
        // ACL: 'public-read',
      });

      await this.s3Client.send(command);

      // Generate public URL
      const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

      return {
        key,
        url,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upload file to S3: ${error.message}`);
    }
  }

  /**
   * Get all files from S3 bucket
   * @param prefix - Optional prefix to filter files (folder path)
   * @returns Array of file objects with key, url, size, and lastModified
   */
  async getAllFiles(prefix?: string): Promise<Array<{ key: string; url: string; size: number; lastModified: Date }>> {
    if (!this.bucketName) {
      throw new BadRequestException('AWS S3 bucket name is not configured');
    }

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix || '',
      });

      const response = await this.s3Client.send(command);

      if (!response.Contents || response.Contents.length === 0) {
        return [];
      }

      const files = response.Contents.map((object) => {
        const key = object.Key || '';
        const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

        return {
          key,
          url,
          size: object.Size || 0,
          lastModified: object.LastModified || new Date(),
        };
      });

      return files;
    } catch (error) {
      throw new BadRequestException(`Failed to list files from S3: ${error.message}`);
    }
  }

  /**
   * Delete a file from S3
   * @param key - The S3 key (file path) to delete
   * @returns Success message
   */
  async deleteFile(key: string): Promise<{ message: string; key: string }> {
    if (!key) {
      throw new BadRequestException('File key is required');
    }

    if (!this.bucketName) {
      throw new BadRequestException('AWS S3 bucket name is not configured');
    }

    try {
      // First, check if file exists by trying to get it
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: key,
      });

      const listResponse = await this.s3Client.send(listCommand);
      const fileExists = listResponse.Contents?.some((obj) => obj.Key === key);

      if (!fileExists) {
        throw new NotFoundException(`File with key "${key}" not found in S3`);
      }

      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(deleteCommand);

      return {
        message: 'File deleted successfully',
        key,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete file from S3: ${error.message}`);
    }
  }

  /**
   * Generate a presigned URL for a file (for temporary access)
   * @param key - The S3 key (file path)
   * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
   * @returns Presigned URL
   */
  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!key) {
      throw new BadRequestException('File key is required');
    }

    if (!this.bucketName) {
      throw new BadRequestException('AWS S3 bucket name is not configured');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      throw new BadRequestException(`Failed to generate presigned URL: ${error.message}`);
    }
  }
}

