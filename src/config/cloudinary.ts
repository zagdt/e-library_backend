import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { config } from './index.js';
import { logger } from '../shared/utils/logger.js';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

export interface UploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  bytes: number;
  resourceType: string;
}

export const uploadFile = async (
  filePath: string,
  folder: string = 'e-library',
  options: Record<string, unknown> = {}
): Promise<UploadResult> => {
  try {
    const result: UploadApiResponse = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
      ...options,
    });

    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      format: result.format,
      bytes: result.bytes,
      resourceType: result.resource_type,
    };
  } catch (error) {
    logger.error('Cloudinary upload failed', { error });
    throw error;
  }
};

export const uploadBuffer = async (
  buffer: Buffer,
  folder: string = 'e-library',
  options: Record<string, unknown> = {}
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        ...options,
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          logger.error('Cloudinary buffer upload failed', { error });
          reject(error);
        } else if (result) {
          resolve({
            publicId: result.public_id,
            url: result.url,
            secureUrl: result.secure_url,
            format: result.format,
            bytes: result.bytes,
            resourceType: result.resource_type,
          });
        }
      }
    ).end(buffer);
  });
};

export const generateSignedUrl = (
  publicId: string,
  options: {
    expiresAt?: number;
    resourceType?: string;
    transformation?: Record<string, unknown>[];
  } = {}
): string => {
  const { expiresAt, resourceType = 'image', transformation = [] } = options;
  
  const signedUrl = cloudinary.url(publicId, {
    sign_url: true,
    type: 'authenticated',
    resource_type: resourceType as 'image' | 'video' | 'raw',
    transformation,
    ...(expiresAt && { expires_at: expiresAt }),
  });

  return signedUrl;
};

export const generateDownloadUrl = (
  publicId: string,
  options: {
    expiresInSeconds?: number;
    resourceType?: string;
    filename?: string;
  } = {}
): string => {
  const { expiresInSeconds = 3600, resourceType = 'raw', filename } = options;
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

  return cloudinary.url(publicId, {
    sign_url: true,
    type: 'authenticated',
    resource_type: resourceType as 'image' | 'video' | 'raw',
    expires_at: expiresAt,
    flags: 'attachment',
    ...(filename && { public_id: filename }),
  });
};

export const deleteFile = async (publicId: string, resourceType: string = 'raw'): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result.result === 'ok';
  } catch (error) {
    logger.error('Cloudinary delete failed', { error, publicId });
    throw error;
  }
};

export { cloudinary };
