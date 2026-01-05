import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor(private configService: ConfigService) {
    // Get AWS configuration from environment variables
    let accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    let secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    this.region =
      this.configService.get<string>('AWS_REGION') || 'ap-northeast-2';
    this.bucketName =
      this.configService.get<string>('AWS_S3_BUCKET_NAME') || '';

    // Validate AWS credentials exist
    if (!accessKeyId || !secretAccessKey) {
      this.logger.error(
        'AWS credentials are not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file.',
      );
      throw new Error(
        'AWS S3 credentials are not configured. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and AWS_S3_BUCKET_NAME in your .env file.',
      );
    }

    if (!this.bucketName) {
      this.logger.error(
        'AWS S3 bucket name is not configured. Please set AWS_S3_BUCKET_NAME in your .env file.',
      );
      throw new Error(
        'AWS S3 bucket name is not configured. Please set AWS_S3_BUCKET_NAME in your .env file.',
      );
    }

    // Sanitize credentials - remove quotes, whitespace, and ensure proper encoding
    accessKeyId = accessKeyId
      .trim()
      .replace(/^["']|["']$/g, '')
      .trim();
    secretAccessKey = secretAccessKey
      .trim()
      .replace(/^["']|["']$/g, '')
      .trim();

    // Validate credentials are not empty after sanitization
    if (!accessKeyId || !secretAccessKey) {
      this.logger.error(
        'AWS credentials are empty after sanitization. Please check your .env file.',
      );
      throw new Error(
        'AWS credentials are invalid. Please check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file.',
      );
    }

    // Validate credential format (basic checks)
    if (accessKeyId.length < 16) {
      this.logger.warn(
        `AWS Access Key ID seems too short (${accessKeyId.length} chars). Please verify it's correct.`,
      );
    }
    if (secretAccessKey.length < 40) {
      this.logger.warn(
        `AWS Secret Access Key seems too short (${secretAccessKey.length} chars). Please verify it's correct.`,
      );
    }

    // Log credential status (without exposing actual values)
    this.logger.log(`S3 Service initializing...`);
    this.logger.log(`- Bucket: ${this.bucketName}`);
    this.logger.log(`- Region: ${this.region}`);
    this.logger.log(
      `- Access Key ID: ${accessKeyId.substring(0, 4)}...${accessKeyId.substring(accessKeyId.length - 4)} (${accessKeyId.length} chars)`,
    );
    this.logger.log(
      `- Secret Key: ${'*'.repeat(secretAccessKey.length)} (${secretAccessKey.length} chars)`,
    );

    // Initialize S3Client with sanitized credentials
    try {
      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        // Add retry configuration for better error handling
        maxAttempts: 3,
      });

      this.logger.log(
        `S3 Service initialized successfully for bucket: ${this.bucketName} in region: ${this.region}`,
      );
    } catch (error: any) {
      this.logger.error(`Failed to initialize S3Client: ${error.message}`);
      throw new Error(`Failed to initialize S3 client: ${error.message}`);
    }
  }

  /**
   * Upload a file to S3
   * @param file - The file to upload
   * @param folder - Optional folder path in S3 bucket
   * @returns Object with key and URL of uploaded file
   */
  async uploadFile(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<{ key: string; url: string }> {
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
      this.logger.log(`File uploaded successfully: ${key}`);

      // Generate public URL
      const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

      return {
        key,
        url,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to upload file to S3: ${error.message}`,
        error.stack,
      );
      // Provide more specific error messages
      if (
        error.name === 'SignatureDoesNotMatch' ||
        error.message?.includes('SignatureDoesNotMatch')
      ) {
        this.logger.error('Signature mismatch detected. This usually means:');
        this.logger.error('1. AWS_SECRET_ACCESS_KEY is incorrect');
        this.logger.error(
          '2. Credentials have extra quotes or whitespace in .env file',
        );
        this.logger.error('3. Credentials are from a different AWS account');
        throw new BadRequestException(
          'AWS signature mismatch. Please verify:\n' +
            '1. Your AWS_SECRET_ACCESS_KEY is correct (check for typos)\n' +
            '2. Remove any quotes around credentials in .env file\n' +
            '3. Ensure credentials match the AWS account with the S3 bucket\n' +
            '4. Check that there are no extra spaces before/after the credentials',
        );
      }
      if (
        error.message?.includes('Access Key Id') ||
        error.name === 'InvalidAccessKeyId'
      ) {
        throw new BadRequestException(
          'Invalid AWS Access Key ID. Please check your AWS_ACCESS_KEY_ID in the .env file and ensure it matches your AWS account.',
        );
      }
      if (
        error.message?.includes('NoSuchBucket') ||
        error.name === 'NoSuchBucket'
      ) {
        throw new BadRequestException(
          `S3 bucket "${this.bucketName}" does not exist or you don't have access to it. Please check your AWS_S3_BUCKET_NAME and AWS_REGION in the .env file.`,
        );
      }
      if (error.message?.includes('Forbidden') || error.name === 'Forbidden') {
        throw new BadRequestException(
          'Access denied to S3 bucket. Please verify your AWS credentials have permission to upload to this bucket.',
        );
      }

      throw new BadRequestException(
        `Failed to upload file to S3: ${error.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Get all files from S3 bucket
   * @param prefix - Optional prefix to filter files (folder path)
   * @returns Array of file objects with key, url, size, and lastModified
   */
  async getAllFiles(
    prefix?: string,
  ): Promise<
    Array<{ key: string; url: string; size: number; lastModified: Date }>
  > {
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
    } catch (error: any) {
      this.logger.error(
        `Failed to list files from S3: ${error.message}`,
        error.stack,
      );

      if (
        error.message?.includes('Access Key Id') ||
        error.message?.includes('InvalidAccessKeyId')
      ) {
        throw new BadRequestException(
          'Invalid AWS credentials. Please verify your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in the .env file.',
        );
      }

      throw new BadRequestException(
        `Failed to list files from S3: ${error.message || 'Unknown error'}`,
      );
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
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Failed to delete file from S3: ${error.message}`,
        error.stack,
      );

      if (
        error.message?.includes('Access Key Id') ||
        error.message?.includes('InvalidAccessKeyId')
      ) {
        throw new BadRequestException(
          'Invalid AWS credentials. Please verify your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in the .env file.',
        );
      }

      throw new BadRequestException(
        `Failed to delete file from S3: ${error.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Generate a presigned URL for a file (for temporary access)
   * @param key - The S3 key (file path)
   * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
   * @returns Presigned URL
   */
  async getPresignedUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
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
    } catch (error: any) {
      this.logger.error(
        `Failed to generate presigned URL: ${error.message}`,
        error.stack,
      );

      if (
        error.message?.includes('Access Key Id') ||
        error.message?.includes('InvalidAccessKeyId')
      ) {
        throw new BadRequestException(
          'Invalid AWS credentials. Please verify your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in the .env file.',
        );
      }

      throw new BadRequestException(
        `Failed to generate presigned URL: ${error.message || 'Unknown error'}`,
      );
    }
  }
}
