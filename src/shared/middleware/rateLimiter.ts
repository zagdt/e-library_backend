import rateLimit from 'express-rate-limit';
import { config } from '../../config/index.js';
import { TooManyRequestsError } from '../errors/AppError.js';

export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, _next) => {
    throw new TooManyRequestsError('Too many requests, please try again later');
  },
  skip: (req) => {
    return req.path === '/health' || req.path === '/api/v1/health';
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, _next) => {
    throw new TooManyRequestsError('Too many authentication attempts, please try again in 15 minutes');
  },
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  },
});

export const strictRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, _next) => {
    throw new TooManyRequestsError('Too many requests, please try again in an hour');
  },
});

export const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, _next) => {
    throw new TooManyRequestsError('Too many search requests, please slow down');
  },
});

export const downloadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, _next) => {
    throw new TooManyRequestsError('Download limit exceeded, please try again later');
  },
});
