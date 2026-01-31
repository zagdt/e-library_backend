import { Router } from 'express';
import { notificationsController } from './notifications.controller.js';
import { authenticate } from '../../shared/middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user's notifications
router.get('/', notificationsController.getNotifications.bind(notificationsController));

// Get unread count
router.get('/unread-count', notificationsController.getUnreadCount.bind(notificationsController));

// Mark all as read
router.put('/read-all', notificationsController.markAllAsRead.bind(notificationsController));

// Clear read notifications
router.delete('/clear-read', notificationsController.clearReadNotifications.bind(notificationsController));

// Mark specific notification as read
router.put('/:id/read', notificationsController.markAsRead.bind(notificationsController));

// Delete specific notification
router.delete('/:id', notificationsController.deleteNotification.bind(notificationsController));

export default router;
