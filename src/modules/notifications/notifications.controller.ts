import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types/index.js';
import { notificationsService } from './notifications.service.js';

export class NotificationsController {
    async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const { page, limit, unreadOnly } = req.query;

            const result = await notificationsService.getUserNotifications(userId, {
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                unreadOnly: unreadOnly === 'true',
            });

            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const count = await notificationsService.getUnreadCount(userId);

            res.json({ success: true, data: { unreadCount: count } });
        } catch (error) {
            next(error);
        }
    }

    async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;

            const notification = await notificationsService.markAsRead(id, userId);
            res.json({ success: true, data: notification });
        } catch (error) {
            next(error);
        }
    }

    async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const result = await notificationsService.markAllAsRead(userId);

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;

            const result = await notificationsService.deleteNotification(id, userId);
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    async clearReadNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const result = await notificationsService.clearReadNotifications(userId);

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}

export const notificationsController = new NotificationsController();
