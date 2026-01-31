import { Router } from 'express';
import { requestController } from './request.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import {
  createRequestSchema,
  updateRequestSchema,
  requestQuerySchema,
  requestIdSchema,
} from './request.validators.js';

const router = Router();

router.post(
  '/',
  authenticate,
  validate(createRequestSchema),
  requestController.create.bind(requestController)
);

router.get(
  '/',
  authenticate,
  validate(requestQuerySchema, 'query'),
  requestController.findAll.bind(requestController)
);

router.get(
  '/my',
  authenticate,
  validate(requestQuerySchema, 'query'),
  requestController.getMyRequests.bind(requestController)
);

router.get(
  '/stats',
  authenticate,
  authorize('ADMIN'),
  requestController.getStats.bind(requestController)
);

router.get(
  '/:id',
  authenticate,
  validate(requestIdSchema, 'params'),
  requestController.findById.bind(requestController)
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(requestIdSchema, 'params'),
  validate(updateRequestSchema),
  requestController.update.bind(requestController)
);

// Admin respond to request with structured access information
router.post(
  '/:id/respond',
  authenticate,
  authorize('ADMIN'),
  validate(requestIdSchema, 'params'),
  requestController.respond.bind(requestController)
);

router.delete(
  '/:id',
  authenticate,
  validate(requestIdSchema, 'params'),
  requestController.delete.bind(requestController)
);

export default router;

