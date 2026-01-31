import { Response, NextFunction } from 'express';
import { adminService } from './admin.service.js';
import { AuthenticatedRequest } from '../../shared/types/index.js';

export class AdminController {
  async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = (req as any).validated?.query ?? req.query;
      const result = await adminService.getUsers(validatedQuery as any);
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await adminService.getUserById(req.params.id);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await adminService.updateUserRole(req.params.id, req.body, req.user!.userId);
      res.json({
        success: true,
        message: 'User role updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminService.deleteUser(req.params.id, req.user!.userId);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await adminService.getMetrics();
      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = (req as any).validated?.query ?? req.query;
      const result = await adminService.getAuditLogs(validatedQuery as any);
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async suspendUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reason } = req.body;
      const user = await adminService.suspendUser(req.params.id, reason, req.user!.userId);
      res.json({
        success: true,
        message: 'User suspended successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async unsuspendUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await adminService.unsuspendUser(req.params.id, req.user!.userId);
      res.json({
        success: true,
        message: 'User unsuspended successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSuspendedUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await adminService.getSuspendedUsers();
      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkUpdateRoles(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userIds, role } = req.body;
      const result = await adminService.bulkUpdateRoles(userIds, role, req.user!.userId);
      res.json({
        success: true,
        message: `${result.updated} users updated`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkDeleteUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userIds } = req.body;
      const result = await adminService.bulkDeleteUsers(userIds, req.user!.userId);
      res.json({
        success: true,
        message: `${result.deleted} users deleted`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async exportUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = (req as any).validated?.query ?? req.query;
      const result = await adminService.exportUsers(validatedQuery as any);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();

