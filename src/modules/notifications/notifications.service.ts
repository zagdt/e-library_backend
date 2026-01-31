import prisma from '../../config/database.js';
import { NotFoundError } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/utils/logger.js';

type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'request_update' | 'resource_added' | 'system';

interface CreateNotificationInput {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, unknown>;
}

interface NotificationQueryInput {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
}

export class NotificationsService {
    /**
     * Get user's notifications
     */
    async getUserNotifications(userId: string, query: NotificationQueryInput) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {
            userId,
        };

        if (query.unreadOnly) {
            where.read = false;
        }

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where: where as any,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.notification.count({ where: where as any }),
            prisma.notification.count({
                where: { userId, read: false },
            }),
        ]);

        return {
            data: notifications,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
            unreadCount,
        };
    }

    /**
     * Create a notification for a user
     */
    async createNotification(input: CreateNotificationInput) {
        const notification = await prisma.notification.create({
            data: {
                userId: input.userId,
                type: input.type,
                title: input.title,
                message: input.message,
                data: (input.data ? input.data : undefined) as any,
            },
        });

        logger.debug('Notification created', {
            notificationId: notification.id,
            userId: input.userId,
            type: input.type
        });

        return notification;
    }

    /**
     * Create notifications for multiple users
     */
    async createBulkNotifications(
        userIds: string[],
        type: NotificationType,
        title: string,
        message: string,
        data?: Record<string, unknown>
    ) {
        const notifications = await prisma.notification.createMany({
            data: userIds.map(userId => ({
                userId,
                type,
                title,
                message,
                data: (data ? data : undefined) as any,
            })),
        });

        logger.info('Bulk notifications created', {
            count: notifications.count,
            type,
            userCount: userIds.length
        });

        return { created: notifications.count };
    }

    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId: string, userId: string) {
        const notification = await prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });

        if (!notification) {
            throw new NotFoundError('Notification not found');
        }

        const updated = await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true },
        });

        return updated;
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string) {
        const result = await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });

        logger.info('All notifications marked as read', { userId, count: result.count });

        return { updated: result.count };
    }

    /**
     * Delete a notification
     */
    async deleteNotification(notificationId: string, userId: string) {
        const notification = await prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });

        if (!notification) {
            throw new NotFoundError('Notification not found');
        }

        await prisma.notification.delete({
            where: { id: notificationId },
        });

        return { message: 'Notification deleted' };
    }

    /**
     * Delete all read notifications for a user
     */
    async clearReadNotifications(userId: string) {
        const result = await prisma.notification.deleteMany({
            where: { userId, read: true },
        });

        logger.info('Read notifications cleared', { userId, count: result.count });

        return { deleted: result.count };
    }

    /**
     * Get unread count for a user
     */
    async getUnreadCount(userId: string): Promise<number> {
        return prisma.notification.count({
            where: { userId, read: false },
        });
    }

    // Helper methods for common notification types

    /**
     * Notify user about request status update
     */
    async notifyRequestUpdate(
        userId: string,
        requestTitle: string,
        status: string,
        adminReply?: string
    ) {
        return this.createNotification({
            userId,
            type: 'request_update',
            title: 'Request Updated',
            message: `Your request "${requestTitle}" has been ${status.toLowerCase()}.${adminReply ? ` Admin: ${adminReply}` : ''}`,
            data: { status, adminReply },
        });
    }

    /**
     * Notify user about new resource in their department/course
     */
    async notifyNewResource(userId: string, resourceTitle: string, resourceId: string) {
        return this.createNotification({
            userId,
            type: 'resource_added',
            title: 'New Resource Available',
            message: `A new resource "${resourceTitle}" has been added.`,
            data: { resourceId },
        });
    }

    /**
     * Send system notification to all users
     */
    async notifyAllUsers(title: string, message: string, type: NotificationType = 'system') {
        const users = await prisma.user.findMany({
            select: { id: true },
        });

        return this.createBulkNotifications(
            users.map(u => u.id),
            type,
            title,
            message
        );
    }
}

export const notificationsService = new NotificationsService();
