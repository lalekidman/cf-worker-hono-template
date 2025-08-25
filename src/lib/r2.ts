import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PresignedUrlRequest, PresignedUrlResponse } from '@/validations/files-metadata';

interface IGeneratePresignedUrlInput {
  contentType: string
  filesize: number
  key: string
  bucketName: string
  expiresIn: number
}
export class R2Service {
  private s3Client: S3Client;
  
  constructor(
    accountId: string,
    accessKeyId: string,
    secretAccessKey: string,
    private bucketName: string
  ) {
    this.s3Client = new S3Client({
      region: 'auto', // R2 only supports 'auto' region
      // endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      endpoint: `https://2ef80f27756abed7e4a905d71df41bd7.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async generatePresignedUrl(request: IGeneratePresignedUrlInput): Promise<PresignedUrlResponse> {
    // Generate a unique key for the file
    // const key = `${request.filepath}/${timestamp}-${randomSuffix}-${request.filename}`;
    const expiresAt = new Date(Date.now() + (request.expiresIn * 1000));

    try {
      // Create a PutObjectCommand for uploading the file
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: request.key,
        ContentType: request.contentType,
        ContentLength: request.filesize,
      });

      // Generate the presigned URL
      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        // expiresIn: request.expiresIn,
      });

      return {
        uploadUrl,
        key: request.key,
        expiresAt,
      };
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new Error('Failed to generate presigned URL');
    }
  }

  async generatePresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating presigned download URL:', error);
      throw new Error('Failed to generate presigned download URL');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  async getPublicUrl(key: string): Promise<string> {
    // Return public URL if bucket has public access configured
    return `https://pub-${this.bucketName}.r2.dev/${key}`;
  }

  // Check if file exists
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }
}