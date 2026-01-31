import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

import { config } from './config/index.js';
import { logger } from './shared/utils/logger.js';
import { errorHandler, notFoundHandler } from './shared/middleware/errorHandler.js';
import { globalRateLimiter } from './shared/middleware/rateLimiter.js';
import { correlationIdMiddleware } from './shared/utils/correlationId.js';
import { getHealthStatus, getLivenessStatus, getReadinessStatus } from './shared/utils/healthCheck.js';

import authRoutes from './modules/auth/auth.routes.js';
import resourceRoutes from './modules/resources/resource.routes.js';
import searchRoutes from './modules/search/search.routes.js';
import requestRoutes from './modules/requests/request.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import courseRoutes from './modules/courses/course.routes.js';
import discoveryRoutes from './modules/discovery/discovery.routes.js';
import notificationRoutes from './modules/notifications/notifications.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import courseUnitRoutes from './modules/courses/course-unit.routes.js';

const app: Application = express();

// Add correlation ID to all requests for tracing
app.use(correlationIdMiddleware);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: config.cors.origin === '*' ? true : config.cors.origin.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Correlation-Id'],
}));

app.use(compression());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(globalRateLimiter);

app.use((req, _res, next) => {
  logger.debug('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    correlationId: (req as any).correlationId,
  });
  next();
});

// Health check endpoints (Kubernetes-style)
app.get('/health', async (_req, res) => {
  const status = await getHealthStatus();
  const httpStatus = status.status === 'healthy' ? 200 : status.status === 'degraded' ? 200 : 503;
  res.status(httpStatus).json(status);
});

app.get('/health/live', (_req, res) => {
  res.json(getLivenessStatus());
});

app.get('/health/ready', async (_req, res) => {
  const status = await getReadinessStatus();
  res.status(status.ready ? 200 : 503).json(status);
});

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Victoria University E-Library API',
    version: config.apiVersion,
    documentation: `/api/${config.apiVersion}/docs`,
    endpoints: {
      auth: `/api/${config.apiVersion}/auth`,
      resources: `/api/${config.apiVersion}/resources`,
      search: `/api/${config.apiVersion}/search`,
      requests: `/api/${config.apiVersion}/requests`,
      courses: `/api/${config.apiVersion}/courses`,
      admin: `/api/${config.apiVersion}/admin`,
      notifications: `/api/${config.apiVersion}/notifications`,
      discovery: `/api/${config.apiVersion}/discovery`,
      analytics: `/api/${config.apiVersion}/analytics`,
    },
    healthChecks: {
      comprehensive: '/health',
      liveness: '/health/live',
      readiness: '/health/ready',
    },
  });
});

const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/resources', resourceRoutes);
apiRouter.use('/search', searchRoutes);
apiRouter.use('/requests', requestRoutes);
apiRouter.use('/courses', courseRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/discovery', discoveryRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/units', courseUnitRoutes);

app.use(`/api/${config.apiVersion}`, apiRouter);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;



