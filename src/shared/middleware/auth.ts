import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';
import { AuthenticatedRequest, JwtPayload, RoleType } from '../types/index.js';
import prisma from '../../config/database.js';
import { logger } from '../utils/logger.js';

export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token required');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    const blacklisted = await prisma.blacklistedToken.findUnique({
      where: { token },
    });

    if (blacklisted) {
      throw new UnauthorizedError('Token has been revoked');
    }

    const decoded = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;

    if (decoded.type !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, emailVerified: true },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedError('Email not verified');
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role as RoleType,
      type: 'access',
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT token', { error: error.message });
      next(new UnauthorizedError('Invalid token'));
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Expired JWT token');
      next(new UnauthorizedError('Token expired'));
      return;
    }
    next(error);
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;

      if (decoded.type === 'access') {
        req.user = decoded;
      }
    } catch {
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: RoleType[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.userId,
        requiredRoles: roles,
        userRole: req.user.role,
        path: req.path,
      });
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }

    next();
  };
};

export const requireAdmin = authorize('ADMIN');
export const requireStaff = authorize('STAFF', 'ADMIN');
export const requireAuthenticated = authenticate;
