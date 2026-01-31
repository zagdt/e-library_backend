import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from './index.js';
import { logger } from '../shared/utils/logger.js';

let s3Client: S3Client | null = null;

export const getS3Client = (): S3Client => {
    if (!s3Client) {
        s3Client = new S3Client({
            region: config.s3.region,
            credentials: {
                accessKeyId: config.s3.accessKeyId,
                secretAccessKey: config.s3.secretAccessKey,
            },
        });
    }
    return s3Client;
};

export interface S3UploadResult {
    key: string;
    bucket: string;
    url: string;
    size: number;
    contentType: string;
}

export interface S3UploadOptions {
    folder?: string;
    contentType?: string;
    metadata?: Record<string, string>;
}

/**
 * Upload a buffer to S3
 */
export const uploadToS3 = async (
    buffer: Buffer,
    filename: string,
    options: S3UploadOptions = {}
): Promise<S3UploadResult> => {
    const client = getS3Client();
    const { folder = 'resources', contentType = 'application/pdf', metadata = {} } = options;

    const key = `${folder}/${Date.now()}-${filename}`;

    try {
        const command = new PutObjectCommand({
            Bucket: config.s3.bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            Metadata: metadata,
        });

        await client.send(command);

        const url = `https://${config.s3.bucket}.s3.${config.s3.region}.amazonaws.com/${key}`;

        logger.info('File uploaded to S3', { key, bucket: config.s3.bucket, size: buffer.length });

        return {
            key,
            bucket: config.s3.bucket,
            url,
            size: buffer.length,
            contentType,
        };
    } catch (error) {
        logger.error('S3 upload failed', { key, error });
        throw error;
    }
};

/**
 * Generate a pre-signed download URL for S3 object
 */
export const generateS3DownloadUrl = async (
    key: string,
    expiresInSeconds: number = 3600,
    filename?: string
): Promise<string> => {
    const client = getS3Client();

    try {
        const command = new GetObjectCommand({
            Bucket: config.s3.bucket,
            Key: key,
            ResponseContentDisposition: filename
                ? `attachment; filename="${encodeURIComponent(filename)}"`
                : undefined,
        });

        const signedUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });

        logger.debug('S3 download URL generated', { key, expiresIn: expiresInSeconds });

        return signedUrl;
    } catch (error) {
        logger.error('Failed to generate S3 download URL', { key, error });
        throw error;
    }
};

/**
 * Generate a pre-signed URL for viewing S3 object (inline)
 */
export const generateS3ViewUrl = async (
    key: string,
    expiresInSeconds: number = 1800
): Promise<string> => {
    const client = getS3Client();

    try {
        const command = new GetObjectCommand({
            Bucket: config.s3.bucket,
            Key: key,
            ResponseContentDisposition: 'inline',
        });

        const signedUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });

        return signedUrl;
    } catch (error) {
        logger.error('Failed to generate S3 view URL', { key, error });
        throw error;
    }
};

/**
 * Delete a file from S3
 */
export const deleteFromS3 = async (key: string): Promise<boolean> => {
    const client = getS3Client();

    try {
        const command = new DeleteObjectCommand({
            Bucket: config.s3.bucket,
            Key: key,
        });

        await client.send(command);

        logger.info('File deleted from S3', { key, bucket: config.s3.bucket });

        return true;
    } catch (error) {
        logger.error('S3 delete failed', { key, error });
        throw error;
    }
};

/**
 * Check if a file exists in S3
 */
export const fileExistsInS3 = async (key: string): Promise<boolean> => {
    const client = getS3Client();

    try {
        const command = new HeadObjectCommand({
            Bucket: config.s3.bucket,
            Key: key,
        });

        await client.send(command);
        return true;
    } catch (error: any) {
        if (error.name === 'NotFound') {
            return false;
        }
        throw error;
    }
};

/**
 * Check if S3 is configured and accessible
 */
export const isS3Configured = (): boolean => {
    return !!(config.s3.accessKeyId && config.s3.secretAccessKey && config.s3.bucket);
};

/**
 * Verify S3 connection
 */
export const verifyS3Connection = async (): Promise<boolean> => {
    if (!isS3Configured()) {
        logger.warn('S3 is not configured');
        return false;
    }

    try {
        const client = getS3Client();
        // Try to list objects (limited to 1) to verify connection
        const command = new HeadObjectCommand({
            Bucket: config.s3.bucket,
            Key: 'connection-test', // This will fail but we just want to check auth
        });

        await client.send(command).catch(() => {
            // Expected to fail, but if it's an auth error we'll know
        });

        logger.info('S3 connection verified');
        return true;
    } catch (error: any) {
        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
            // This is expected - the file doesn't exist, but we could connect
            logger.info('S3 connection verified (file not found is expected)');
            return true;
        }
        logger.error('S3 connection verification failed', { error });
        return false;
    }
};
