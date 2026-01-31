import { Request, Response, NextFunction } from 'express';
import { resourceService } from './resource.service.js';
import { AuthenticatedRequest } from '../../shared/types/index.js';

export class ResourceController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = (req as any).files as {
        file?: Express.Multer.File[];
        coverImage?: Express.Multer.File[];
      } | undefined;

      const file = files?.file?.[0];
      const coverImage = files?.coverImage?.[0];
      const uploaderRole = req.user!.role as 'ADMIN' | 'STAFF';

      const resource = await resourceService.create(
        req.body as any,
        file,
        coverImage,
        req.user!.userId,
        uploaderRole
      );

      const message = uploaderRole === 'ADMIN'
        ? 'Resource created and published successfully'
        : 'Resource created and submitted for approval';

      res.status(201).json({
        success: true,
        message,
        data: resource,
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = (req as any).validated?.query ?? req.query;
      const isAdmin = req.user?.role === 'ADMIN';
      const result = await resourceService.findAll(validatedQuery as any, isAdmin);
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resource = await resourceService.findById(req.params.id);
      res.json({
        success: true,
        data: resource,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const resource = await resourceService.update(req.params.id, req.body, req.user!.userId);
      res.json({
        success: true,
        message: 'Resource updated successfully',
        data: resource,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await resourceService.delete(req.params.id, req.user!.userId);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async download(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await resourceService.getDownloadUrl(
        req.params.id,
        req.user!.userId,
        req.ip,
        req.headers['user-agent']
      );
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async preview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await resourceService.getPreviewUrl(req.params.id, req.user?.userId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTrending(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resources = await resourceService.getTrending();
      res.json({
        success: true,
        data: resources,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLatest(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resources = await resourceService.getLatest();
      res.json({
        success: true,
        data: resources,
      });
    } catch (error) {
      next(error);
    }
  }
  // Admin approval endpoints
  async getPendingResources(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = req.query;
      const result = await resourceService.getPendingResources({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async approveResource(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { note } = req.body;
      const resource = await resourceService.approveResource(
        req.params.id,
        req.user!.userId,
        note
      );
      res.json({
        success: true,
        message: 'Resource approved successfully',
        data: resource,
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectResource(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reason } = req.body;
      const resource = await resourceService.rejectResource(
        req.params.id,
        req.user!.userId,
        reason
      );
      res.json({
        success: true,
        message: 'Resource rejected',
        data: resource,
      });
    } catch (error) {
      next(error);
    }
  }

  async getApprovalStats(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await resourceService.getApprovalStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const resourceController = new ResourceController();
