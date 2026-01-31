import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';
import { config } from '../../config/index.js';

interface PrismaError extends Error {
  code?: string;
}

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error caught by error handler', {
    name: error.name,
    message: error.message,
    stack: config.env === 'development' ? error.stack : undefined,
  });

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.errors && { errors: error.errors }),
      ...(config.env === 'development' && { stack: error.stack }),
    });
    return;
  }

  if (error instanceof ZodError) {
    const formattedErrors: Record<string, string[]> = {};
    error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      if (!formattedErrors[path]) {
        formattedErrors[path] = [];
      }
      formattedErrors[path].push(issue.message);
    });

    res.status(422).json({
      success: false,
      message: 'Validation Error',
      errors: formattedErrors,
    });
    return;
  }

  const prismaError = error as PrismaError;
  if (prismaError.name === 'PrismaClientKnownRequestError' && prismaError.code) {
    let message = 'Database error';
    let statusCode = 500;

    switch (prismaError.code) {
      case 'P2002':
        message = 'A record with this value already exists';
        statusCode = 409;
        break;
      case 'P2025':
        message = 'Record not found';
        statusCode = 404;
        break;
      case 'P2003':
        message = 'Foreign key constraint failed';
        statusCode = 400;
        break;
      default:
        message = 'Database operation failed';
    }

    res.status(statusCode).json({
      success: false,
      message,
      ...(config.env === 'development' && { code: prismaError.code }),
    });
    return;
  }

  if (prismaError.name === 'PrismaClientValidationError') {
    res.status(400).json({
      success: false,
      message: 'Invalid data provided',
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    ...(config.env === 'development' && { 
      error: error.message,
      stack: error.stack 
    }),
  });
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
};
