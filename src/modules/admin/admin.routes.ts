import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { settingsController } from './settings.controller.js';
import { resourceController } from '../resources/resource.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import {
  updateUserRoleSchema,
  userQuerySchema,
  auditLogQuerySchema,
  userIdSchema,
} from './admin.validators.js';
import { resourceIdSchema } from '../resources/resource.validators.js';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

// Approval routes
router.get(
  '/resources/pending-approval',
  resourceController.getPendingResources.bind(resourceController)
);

router.post(
  '/resources/:id/approve',
  validate(resourceIdSchema, 'params'),
  resourceController.approveResource.bind(resourceController)
);

router.post(
  '/resources/:id/reject',
  validate(resourceIdSchema, 'params'),
  resourceController.rejectResource.bind(resourceController)
);

router.get(
  '/resources/approval-stats',
  resourceController.getApprovalStats.bind(resourceController)
);

// User management routes
router.get(
  '/users',
  validate(userQuerySchema, 'query'),
  adminController.getUsers.bind(adminController)
);

router.get(
  '/users/suspended',
  adminController.getSuspendedUsers.bind(adminController)
);

router.get(
  '/users/export',
  validate(userQuerySchema, 'query'),
  adminController.exportUsers.bind(adminController)
);

router.get(
  '/users/:id',
  validate(userIdSchema, 'params'),
  adminController.getUserById.bind(adminController)
);

router.put(
  '/users/:id/role',
  validate(userIdSchema, 'params'),
  validate(updateUserRoleSchema),
  adminController.updateUserRole.bind(adminController)
);

router.post(
  '/users/:id/suspend',
  validate(userIdSchema, 'params'),
  adminController.suspendUser.bind(adminController)
);

router.post(
  '/users/:id/unsuspend',
  validate(userIdSchema, 'params'),
  adminController.unsuspendUser.bind(adminController)
);

router.delete(
  '/users/:id',
  validate(userIdSchema, 'params'),
  adminController.deleteUser.bind(adminController)
);

// Bulk operations
router.post(
  '/users/bulk/roles',
  adminController.bulkUpdateRoles.bind(adminController)
);

router.post(
  '/users/bulk/delete',
  adminController.bulkDeleteUsers.bind(adminController)
);

// Metrics and audit routes
router.get(
  '/metrics',
  adminController.getMetrics.bind(adminController)
);

router.get(
  '/audit-logs',
  validate(auditLogQuerySchema, 'query'),
  adminController.getAuditLogs.bind(adminController)
);

// System settings routes
router.get(
  '/settings',
  settingsController.getAllSettings.bind(settingsController)
);

router.get(
  '/settings/email',
  settingsController.getEmailSettings.bind(settingsController)
);

router.put(
  '/settings/email/provider',
  settingsController.setEmailProvider.bind(settingsController)
);

router.get(
  '/settings/:key',
  settingsController.getSetting.bind(settingsController)
);

router.put(
  '/settings/:key',
  settingsController.updateSetting.bind(settingsController)
);

router.post(
  '/settings/initialize',
  settingsController.initializeSettings.bind(settingsController)
);

export default router;


