import { sendEmail as sendEmailViaNodemailer, verifyEmailConnection as verifyNodemailerConnection } from './email.service.js';
import { sendEmailViaResend, verifyResendConnection } from './resend.service.js';
import { config } from '../../config/index.js';
import { logger } from '../../shared/utils/logger.js';

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: Array<{
        filename: string;
        content?: Buffer | string;
        path?: string;
    }>;
}

export type EmailProviderType = 'nodemailer' | 'resend';

interface EmailProvider {
    name: EmailProviderType;
    send: (options: EmailOptions) => Promise<boolean>;
    verify: () => Promise<boolean>;
}

const providers: Record<EmailProviderType, EmailProvider> = {
    nodemailer: {
        name: 'nodemailer',
        send: sendEmailViaNodemailer,
        verify: verifyNodemailerConnection,
    },
    resend: {
        name: 'resend',
        send: sendEmailViaResend,
        verify: verifyResendConnection,
    },
};

let currentProvider: EmailProviderType = config.email.provider as EmailProviderType || 'nodemailer';

/**
 * Get the current email provider type
 */
export const getCurrentProvider = (): EmailProviderType => currentProvider;

/**
 * Set the email provider type
 */
export const setEmailProvider = (provider: EmailProviderType): void => {
    if (!providers[provider]) {
        throw new Error(`Unknown email provider: ${provider}`);
    }
    currentProvider = provider;
    logger.info('Email provider changed', { provider });
};

/**
 * Get available email providers
 */
export const getAvailableProviders = (): EmailProviderType[] => {
    return Object.keys(providers) as EmailProviderType[];
};

/**
 * Send email using the current provider with fallback
 */
export const sendEmailWithProvider = async (options: EmailOptions): Promise<boolean> => {
    const provider = providers[currentProvider];

    try {
        return await provider.send(options);
    } catch (error) {
        logger.error(`Email send failed with ${currentProvider}`, { error });

        // Try fallback to the other provider
        const fallbackProviderName: EmailProviderType = currentProvider === 'nodemailer' ? 'resend' : 'nodemailer';
        const fallbackProvider = providers[fallbackProviderName];

        try {
            logger.info(`Attempting fallback to ${fallbackProviderName}`);
            const result = await fallbackProvider.send(options);
            logger.info(`Email sent successfully via fallback provider: ${fallbackProviderName}`);
            return result;
        } catch (fallbackError) {
            logger.error(`Fallback email provider ${fallbackProviderName} also failed`, { error: fallbackError });
            throw new Error(`All email providers failed. Primary: ${currentProvider}, Fallback: ${fallbackProviderName}`);
        }
    }
};

/**
 * Verify the current provider's connection
 */
export const verifyCurrentProvider = async (): Promise<{ provider: EmailProviderType; connected: boolean }> => {
    const provider = providers[currentProvider];
    const connected = await provider.verify();
    return { provider: currentProvider, connected };
};

/**
 * Get health status of all providers
 */
export const getProvidersHealth = async (): Promise<Record<EmailProviderType, boolean>> => {
    const results: Record<EmailProviderType, boolean> = {
        nodemailer: false,
        resend: false,
    };

    for (const [name, provider] of Object.entries(providers)) {
        try {
            results[name as EmailProviderType] = await provider.verify();
        } catch {
            results[name as EmailProviderType] = false;
        }
    }

    return results;
};
