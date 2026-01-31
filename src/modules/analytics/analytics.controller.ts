import { Request, Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service.js';

export class AnalyticsController {
    async getOverview(req: Request, res: Response, next: NextFunction) {
        try {
            const overview = await analyticsService.getOverview();
            res.json({ success: true, data: overview });
        } catch (error) {
            next(error);
        }
    }

    async getDownloadTrends(req: Request, res: Response, next: NextFunction) {
        try {
            const { startDate, endDate } = req.query;
            const trends = await analyticsService.getDownloadTrends({
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
            });
            res.json({ success: true, data: trends });
        } catch (error) {
            next(error);
        }
    }

    async getUserTrends(req: Request, res: Response, next: NextFunction) {
        try {
            const { startDate, endDate } = req.query;
            const trends = await analyticsService.getUserTrends({
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
            });
            res.json({ success: true, data: trends });
        } catch (error) {
            next(error);
        }
    }

    async getTopResources(req: Request, res: Response, next: NextFunction) {
        try {
            const limit = req.query.limit ? Number(req.query.limit) : 10;
            const resources = await analyticsService.getTopResources(limit);
            res.json({ success: true, data: resources });
        } catch (error) {
            next(error);
        }
    }

    async getTopSearchTerms(req: Request, res: Response, next: NextFunction) {
        try {
            const limit = req.query.limit ? Number(req.query.limit) : 20;
            const terms = await analyticsService.getTopSearchTerms(limit);
            res.json({ success: true, data: terms });
        } catch (error) {
            next(error);
        }
    }

    async getUsersByRole(req: Request, res: Response, next: NextFunction) {
        try {
            const distribution = await analyticsService.getUsersByRole();
            res.json({ success: true, data: distribution });
        } catch (error) {
            next(error);
        }
    }

    async getResourcesByCategory(req: Request, res: Response, next: NextFunction) {
        try {
            const distribution = await analyticsService.getResourcesByCategory();
            res.json({ success: true, data: distribution });
        } catch (error) {
            next(error);
        }
    }

    async getRequestStats(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await analyticsService.getRequestStats();
            res.json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    async generateReport(req: Request, res: Response, next: NextFunction) {
        try {
            const { startDate, endDate } = req.query;
            const report = await analyticsService.generateReport({
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
            });
            res.json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    }
}

export const analyticsController = new AnalyticsController();
