import { Request, Response, NextFunction } from 'express';
import { courseService } from './course.service.js';
import { AuthenticatedRequest } from '../../shared/types/index.js';

export class CourseController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await courseService.create(req.body, req.user!.userId);
      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course,
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = (req as any).validated?.query ?? req.query;
      const result = await courseService.findAll(validatedQuery as any);
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
      const course = await courseService.findById(req.params.id);
      res.json({
        success: true,
        data: course,
      });
    } catch (error) {
      next(error);
    }
  }

  async getResources(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = (req as any).validated?.query ?? req.query;
      const result = await courseService.getResources(req.params.id, validatedQuery as any);
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await courseService.update(req.params.id, req.body, req.user!.userId);
      res.json({
        success: true,
        message: 'Course updated successfully',
        data: course,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await courseService.delete(req.params.id, req.user!.userId);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDepartments(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const departments = await courseService.getDepartments();
      res.json({
        success: true,
        data: departments,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const courseController = new CourseController();
