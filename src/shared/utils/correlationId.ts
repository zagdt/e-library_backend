import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { logger } from './logger.js';

const CORRELATION_ID_HEADER = 'x-correlation-id';

/**
 * Middleware to add correlation ID to requests for tracing
 */
export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    // Get correlation ID from header or generate new one
    const correlationId = req.headers[CORRELATION_ID_HEADER] as string || uuidv4();

    // Attach to request for use in handlers
    (req as any).correlationId = correlationId;

    // Add to response headers
    res.setHeader(CORRELATION_ID_HEADER, correlationId);

    // Log request with correlation ID
    logger.debug('Request received', {
        correlationId,
        method: req.method,
        path: req.path,
        ip: req.ip,
    });

    next();
};

/**
 * Get correlation ID from request
 */
export const getCorrelationId = (req: Request): string => {
    return (req as any).correlationId || 'unknown';
};

/**
 * Create a child logger with correlation ID context
 */
export const createRequestLogger = (req: Request) => {
    const correlationId = getCorrelationId(req);

    return {
        debug: (message: string, meta?: Record<string, unknown>) =>
            logger.debug(message, { ...meta, correlationId }),
        info: (message: string, meta?: Record<string, unknown>) =>
            logger.info(message, { ...meta, correlationId }),
        warn: (message: string, meta?: Record<string, unknown>) =>
            logger.warn(message, { ...meta, correlationId }),
        error: (message: string, meta?: Record<string, unknown>) =>
            logger.error(message, { ...meta, correlationId }),
    };
};
