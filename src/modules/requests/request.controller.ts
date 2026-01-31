import { Response, NextFunction } from 'express';
import { requestService } from './request.service.js';
import { AuthenticatedRequest } from '../../shared/types/index.js';

export class RequestController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await requestService.create(req.body, req.user!.userId);
      res.status(201).json({
        success: true,
        message: 'Resource request submitted successfully',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyRequests(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = (req as any).validated?.query ?? req.query;
      const result = await requestService.findUserRequests(req.user!.userId, validatedQuery as any);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const isAdmin = req.user!.role === 'ADMIN';
      const validatedQuery = (req as any).validated?.query ?? req.query;
      const result = isAdmin
        ? await requestService.findAll(validatedQuery as any, undefined, true)
        : await requestService.findUserRequests(req.user!.userId, validatedQuery as any);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const isAdmin = req.user!.role === 'ADMIN';
      const request = await requestService.findById(req.params.id, req.user!.userId, isAdmin);
      res.json({
        success: true,
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await requestService.update(req.params.id, req.body, req.user!.userId);
      res.json({
        success: true,
        message: 'Request updated successfully',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const isAdmin = req.user!.role === 'ADMIN';
      const result = await requestService.delete(req.params.id, req.user!.userId, isAdmin);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await requestService.getStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async respond(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await requestService.respondToRequest(
        req.params.id,
        {
          status: req.body.status,
          adminReply: req.body.adminReply,
          accessInstructions: req.body.accessInstructions,
          externalSourceUrl: req.body.externalSourceUrl,
          fulfilledResourceId: req.body.fulfilledResourceId,
        },
        req.user!.userId
      );
      res.json({
        success: true,
        message: 'Request responded to successfully',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const requestController = new RequestController();

