import { Request, Response, NextFunction } from 'express';
import { searchService } from './search.service.js';
import { AuthenticatedRequest } from '../../shared/types/index.js';

export class SearchController {
  async search(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = (req as any).validated?.query ?? req.query;
      const result = await searchService.search(validatedQuery as any, req.user?.userId);
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTopSearchTerms(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const terms = await searchService.getTopSearchTerms();
      res.json({
        success: true,
        data: terms,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q } = req.query;
      const suggestions = await searchService.getSuggestions(q as string);
      res.json({
        success: true,
        data: suggestions,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();
