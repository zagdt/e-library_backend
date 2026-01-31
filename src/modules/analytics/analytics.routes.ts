import { Router } from 'express';
import { analyticsController } from './analytics.controller.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';

const router = Router();

// All analytics routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

// Overview stats
router.get('/overview', analyticsController.getOverview.bind(analyticsController));

// Trend data
router.get('/trends/downloads', analyticsController.getDownloadTrends.bind(analyticsController));
router.get('/trends/users', analyticsController.getUserTrends.bind(analyticsController));

// Top items
router.get('/top/resources', analyticsController.getTopResources.bind(analyticsController));
router.get('/top/search-terms', analyticsController.getTopSearchTerms.bind(analyticsController));

// Distributions
router.get('/distribution/users-by-role', analyticsController.getUsersByRole.bind(analyticsController));
router.get('/distribution/resources-by-category', analyticsController.getResourcesByCategory.bind(analyticsController));

// Request stats
router.get('/requests', analyticsController.getRequestStats.bind(analyticsController));

// Comprehensive report
router.get('/report', analyticsController.generateReport.bind(analyticsController));

export default router;
