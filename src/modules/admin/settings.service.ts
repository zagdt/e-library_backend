import prisma from '../../config/database.js';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/utils/logger.js';
import { setEmailProvider, getCurrentProvider, getAvailableProviders, EmailProviderType } from '../email/email.provider.js';

type SettingType = 'string' | 'boolean' | 'number' | 'json';

interface SettingValue {
    key: string;
    value: string;
    type: SettingType;
    description?: string;
}

// Default settings that should exist in the system
const DEFAULT_SETTINGS: SettingValue[] = [
    {
        key: 'email.provider',
        value: 'nodemailer',
        type: 'string',
        description: 'Email provider to use: nodemailer or resend',
    },
    {
        key: 'email.fallbackEnabled',
        value: 'true',
        type: 'boolean',
        description: 'Enable automatic fallback to secondary email provider on failure',
    },
    {
        key: 'storage.pdfProvider',
        value: 's3',
        type: 'string',
        description: 'Storage provider for PDFs: s3 or cloudinary',
    },
    {
        key: 'storage.imageProvider',
        value: 'cloudinary',
        type: 'string',
        description: 'Storage provider for images: cloudinary',
    },
];

export class SettingsService {
    /**
     * Initialize default settings if they don't exist
     */
    async initializeDefaults(): Promise<void> {
        for (const setting of DEFAULT_SETTINGS) {
            await prisma.systemSetting.upsert({
                where: { key: setting.key },
                create: setting,
                update: {},
            });
        }
        logger.info('System settings initialized');
    }

    /**
     * Get all system settings
     */
    async getAllSettings() {
        const settings = await prisma.systemSetting.findMany({
            orderBy: { key: 'asc' },
        });

        return settings.map(s => ({
            ...s,
            parsedValue: this.parseValue(s.value, s.type as SettingType),
        }));
    }

    /**
     * Get a single setting by key
     */
    async getSetting(key: string) {
        const setting = await prisma.systemSetting.findUnique({
            where: { key },
        });

        if (!setting) {
            throw new NotFoundError(`Setting not found: ${key}`);
        }

        return {
            ...setting,
            parsedValue: this.parseValue(setting.value, setting.type as SettingType),
        };
    }

    /**
     * Update a setting value
     */
    async updateSetting(key: string, value: string, adminId: string) {
        const existing = await prisma.systemSetting.findUnique({
            where: { key },
        });

        if (!existing) {
            throw new NotFoundError(`Setting not found: ${key}`);
        }

        // Validate the value based on type
        this.validateValue(value, existing.type as SettingType);

        const updated = await prisma.$transaction(async (tx) => {
            const setting = await tx.systemSetting.update({
                where: { key },
                data: { value },
            });

            await tx.auditLog.create({
                data: {
                    entity: 'SystemSetting',
                    entityId: key,
                    action: 'UPDATE',
                    performedById: adminId,
                    meta: { previousValue: existing.value, newValue: value },
                },
            });

            return setting;
        });

        // Apply special settings immediately
        if (key === 'email.provider') {
            setEmailProvider(value as EmailProviderType);
        }

        logger.info('Setting updated', { key, value, adminId });

        return {
            ...updated,
            parsedValue: this.parseValue(updated.value, updated.type as SettingType),
        };
    }

    /**
     * Get email provider settings
     */
    async getEmailSettings() {
        const currentProvider = getCurrentProvider();
        const availableProviders = getAvailableProviders();

        const fallbackSetting = await prisma.systemSetting.findUnique({
            where: { key: 'email.fallbackEnabled' },
        });

        return {
            currentProvider,
            availableProviders,
            fallbackEnabled: fallbackSetting?.value === 'true',
        };
    }

    /**
     * Set email provider
     */
    async setEmailProvider(provider: EmailProviderType, adminId: string) {
        const available = getAvailableProviders();

        if (!available.includes(provider)) {
            throw new BadRequestError(`Invalid email provider: ${provider}. Available: ${available.join(', ')}`);
        }

        // Update in database
        await this.updateSetting('email.provider', provider, adminId);

        // Apply immediately
        setEmailProvider(provider);

        return {
            provider,
            message: `Email provider changed to ${provider}`,
        };
    }

    /**
     * Parse setting value based on type
     */
    private parseValue(value: string, type: SettingType): unknown {
        switch (type) {
            case 'boolean':
                return value === 'true';
            case 'number':
                return Number(value);
            case 'json':
                try {
                    return JSON.parse(value);
                } catch {
                    return null;
                }
            default:
                return value;
        }
    }

    /**
     * Validate value format based on type
     */
    private validateValue(value: string, type: SettingType): void {
        switch (type) {
            case 'boolean':
                if (value !== 'true' && value !== 'false') {
                    throw new BadRequestError('Boolean value must be "true" or "false"');
                }
                break;
            case 'number':
                if (isNaN(Number(value))) {
                    throw new BadRequestError('Value must be a valid number');
                }
                break;
            case 'json':
                try {
                    JSON.parse(value);
                } catch {
                    throw new BadRequestError('Value must be valid JSON');
                }
                break;
        }
    }
}

export const settingsService = new SettingsService();
