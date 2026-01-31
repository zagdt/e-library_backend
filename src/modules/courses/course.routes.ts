import { Router } from 'express';
import { courseController } from './course.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import {
  createCourseSchema,
  updateCourseSchema,
  courseQuerySchema,
  courseIdSchema,
  courseResourcesQuerySchema,
} from './course.validators.js';

const router = Router();

router.get(
  '/departments',
  courseController.getDepartments.bind(courseController)
);

router.get(
  '/',
  validate(courseQuerySchema, 'query'),
  courseController.findAll.bind(courseController)
);

router.get(
  '/:id',
  validate(courseIdSchema, 'params'),
  courseController.findById.bind(courseController)
);

router.get(
  '/:id/resources',
  validate(courseIdSchema, 'params'),
  validate(courseResourcesQuerySchema, 'query'),
  courseController.getResources.bind(courseController)
);

router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(createCourseSchema),
  courseController.create.bind(courseController)
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(courseIdSchema, 'params'),
  validate(updateCourseSchema),
  courseController.update.bind(courseController)
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(courseIdSchema, 'params'),
  courseController.delete.bind(courseController)
);

// Import and mount course unit routes
// import courseUnitRoutes from './course-unit.routes.js';
// router.use('/', courseUnitRoutes);

export default router;
