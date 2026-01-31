import { Router, Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types/index.js';
import multer from 'multer';
import { resourceController } from './resource.controller.js';
import { favoritesService } from './favorites.service.js';
import { validate } from '../../shared/middleware/validate.js';
import { authenticate, authorize, optionalAuth } from '../../shared/middleware/auth.js';
import { downloadRateLimiter, searchRateLimiter } from '../../shared/middleware/rateLimiter.js';
import {
  createResourceSchema,
  updateResourceSchema,
  resourceQuerySchema,
  resourceIdSchema,
} from './resource.validators.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const documentMimes = [
      'application/pdf',
      'application/epub+zip',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    const imageMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];

    if (file.fieldname === 'coverImage') {
      // Allow common image types for cover images
      if (imageMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid cover image type. Only common image formats (JPEG, PNG, WebP, GIF, SVG) are allowed.'));
      }
      return;
    }

    // Default behavior for main resource file
    if (documentMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, EPUB, DOC, DOCX, PPT, and PPTX files are allowed.'));
    }
  },
});

// Custom middleware to parse FormData fields
const parseFormData = (req: any, res: any, next: any) => {
  if (req.is('multipart/form-data')) {
    // Parse JSON strings in FormData
    const parsedBody: any = {};

    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string') {
        // Try to parse as JSON if it looks like JSON
        if (value.trim().startsWith('[') || value.trim().startsWith('{')) {
          try {
            parsedBody[key] = JSON.parse(value);
          } catch {
            parsedBody[key] = value;
          }
        } else {
          parsedBody[key] = value;
        }
      } else {
        parsedBody[key] = value;
      }
    }

    // Convert publicationYear to number if present
    if (parsedBody.publicationYear) {
      parsedBody.publicationYear = Number(parsedBody.publicationYear);
    }

    req.body = parsedBody;
  }
  next();
};

router.get(
  '/trending',
  resourceController.getTrending.bind(resourceController)
);

router.get(
  '/latest',
  resourceController.getLatest.bind(resourceController)
);

// Get user's favorites
router.get(
  '/favorites',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { page, limit, category } = req.query;
      const result = await favoritesService.getUserFavorites(userId, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        category: category as string | undefined,
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/',
  searchRateLimiter,
  optionalAuth,
  validate(resourceQuerySchema, 'query'),
  resourceController.findAll.bind(resourceController)
);

router.get(
  '/:id',
  validate(resourceIdSchema, 'params'),
  resourceController.findById.bind(resourceController)
);

router.post(
  '/',
  authenticate,
  authorize('STAFF', 'ADMIN'),
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  parseFormData, // Add this middleware before validation
  validate(createResourceSchema),
  resourceController.create.bind(resourceController)
);

router.put(
  '/:id',
  authenticate,
  authorize('STAFF', 'ADMIN'),
  validate(resourceIdSchema, 'params'),
  validate(updateResourceSchema),
  resourceController.update.bind(resourceController)
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(resourceIdSchema, 'params'),
  resourceController.delete.bind(resourceController)
);

router.post(
  '/:id/download',
  authenticate,
  downloadRateLimiter,
  validate(resourceIdSchema, 'params'),
  resourceController.download.bind(resourceController)
);

router.get(
  '/:id/preview',
  optionalAuth,
  validate(resourceIdSchema, 'params'),
  resourceController.preview.bind(resourceController)
);

// Favorites routes
router.post(
  '/:id/favorite',
  authenticate,
  validate(resourceIdSchema, 'params'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await favoritesService.addFavorite(userId, id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id/favorite',
  authenticate,
  validate(resourceIdSchema, 'params'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await favoritesService.removeFavorite(userId, id);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id/is-favorite',
  authenticate,
  validate(resourceIdSchema, 'params'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const isFavorite = await favoritesService.isFavorite(userId, id);
      res.json({ success: true, data: { isFavorite } });
    } catch (error) {
      next(error);
    }
  }
);

export default router;