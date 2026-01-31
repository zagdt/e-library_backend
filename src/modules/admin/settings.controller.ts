import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types/index.js';
import { settingsService } from './settings.service.js';
import { EmailProviderType } from '../email/email.provider.js';

export class SettingsController {
    async getAllSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const settings = await settingsService.getAllSettings();
            res.json({ success: true, data: settings });
        } catch (error) {
            next(error);
        }
    }

    async getSetting(req: Request, res: Response, next: NextFunction) {
        try {
            const { key } = req.params;
            const setting = await settingsService.getSetting(key);
            res.json({ success: true, data: setting });
        } catch (error) {
            next(error);
        }
    }

    async updateSetting(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const { key } = req.params;
            const { value } = req.body;
            const adminId = req.user!.userId;

            const setting = await settingsService.updateSetting(key, value, adminId);
            res.json({ success: true, data: setting });
        } catch (error) {
            next(error);
        }
    }

    async getEmailSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const settings = await settingsService.getEmailSettings();
            res.json({ success: true, data: settings });
        } catch (error) {
            next(error);
        }
    }

    async setEmailProvider(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const { provider } = req.body;
            const adminId = req.user!.userId;

            const result = await settingsService.setEmailProvider(provider as EmailProviderType, adminId);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async initializeSettings(req: Request, res: Response, next: NextFunction) {
        try {
            await settingsService.initializeDefaults();
            res.json({ success: true, message: 'Settings initialized' });
        } catch (error) {
            next(error);
        }
    }
}

export const settingsController = new SettingsController();
