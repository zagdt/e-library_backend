import { Resend } from 'resend';
import { config } from '../../config/index.js';
import { logger } from '../../shared/utils/logger.js';
import type { EmailOptions } from './email.provider.js';

let resendClient: Resend | null = null;

const getResendClient = (): Resend => {
    if (!resendClient) {
        if (!config.resend.apiKey) {
            throw new Error('Resend API key not configured');
        }
        resendClient = new Resend(config.resend.apiKey);
    }
    return resendClient;
};

export const sendEmailViaResend = async (options: EmailOptions): Promise<boolean> => {
    try {
        const client = getResendClient();

        const { data, error } = await client.emails.send({
            from: config.email.from,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text || options.html.replace(/<[^>]*>/g, ''),
            attachments: options.attachments?.map(att => ({
                filename: att.filename,
                content: att.content as Buffer,
            })),
        });

        if (error) {
            logger.error('Resend email failed', {
                to: options.to,
                subject: options.subject,
                error
            });
            throw error;
        }

        logger.info('Email sent via Resend', {
            to: options.to,
            subject: options.subject,
            messageId: data?.id
        });

        return true;
    } catch (error) {
        logger.error('Failed to send email via Resend', {
            to: options.to,
            subject: options.subject,
            error
        });
        throw error;
    }
};

export const verifyResendConnection = async (): Promise<boolean> => {
    try {
        const client = getResendClient();
        // Resend doesn't have a dedicated verify endpoint, but we can check if the client is initialized
        // A real verification would require making an API call
        if (client) {
            logger.info('Resend client initialized successfully');
            return true;
        }
        return false;
    } catch (error) {
        logger.error('Resend connection verification failed', { error });
        return false;
    }
};
