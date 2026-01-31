// src/modules/discovery/discovery.controller.ts
import { Request, Response, NextFunction } from 'express';
import { discoveryService } from './discovery.service.js';
import { validate } from '../../shared/middleware/validate.js';
import { discoverySearchSchema } from './discovery.validators.js';

export class DiscoveryController {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req as any).validated.query as any;
      const result = await discoveryService.search(query);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: `Found ${result.pagination.total} free academic resources`,
      });
    } catch (error) {
      next(error);
    }
  }

  async sources(req: Request, res: Response, next: NextFunction) {
    try {
      const sources = await discoveryService.getSources();
      res.json({
        success: true,
        data: sources,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const discoveryController = new DiscoveryController();