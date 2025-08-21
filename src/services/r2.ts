import { PresignedUrlRequest, PresignedUrlResponse } from '@/validations/files';

export class R2Service {
  constructor(private r2Bucket: R2Bucket) {}

  async generatePresignedUrl(request: PresignedUrlRequest, baseUrl: string): Promise<PresignedUrlResponse> {
    // Generate a unique key for the file
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    const key = `uploads/${timestamp}-${randomSuffix}-${request.fileName}`;

    const expiresAt = new Date(Date.now() + (request.expiresIn * 1000));

    try {
      // Since R2 doesn't directly support presigned URLs in Workers,
      // we'll create an upload endpoint URL with the key and metadata
      const uploadParams = new URLSearchParams({
        key,
        contentType: request.contentType,
        fileSize: request.fileSize.toString(),
        expires: Math.floor(expiresAt.getTime() / 1000).toString(),
      });

      const uploadUrl = `${baseUrl}/api/files/upload?${uploadParams.toString()}`;

      return {
        uploadUrl,
        key,
        expiresAt,
      };
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new Error('Failed to generate presigned URL');
    }
  }

  async uploadFile(key: string, file: ArrayBuffer, contentType: string): Promise<void> {
    try {
      await this.r2Bucket.put(key, file, {
        httpMetadata: {
          contentType,
        },
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  async getFile(key: string): Promise<R2ObjectBody | null> {
    try {
      return await this.r2Bucket.get(key);
    } catch (error) {
      console.error('Error getting file:', error);
      throw new Error('Failed to get file');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.r2Bucket.delete(key);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  async getPublicUrl(key: string, bucketName: string): Promise<string> {
    // Return public URL if bucket has public access configured
    // Otherwise, generate a temporary signed URL
    return `https://pub-${bucketName}.r2.dev/${key}`;
  }
}