import app from './app.js';
import { config } from './config/index.js';
import { logger } from './shared/utils/logger.js';
import { getRedisClient, closeRedisConnection } from './config/redis.js';
import prisma from './config/database.js';
import { startEmailWorker, stopEmailWorker } from './modules/queue/email.queue.js';
import { startAnalyticsWorker, stopAnalyticsWorker } from './modules/queue/analytics.queue.js';

const startServer = async () => {
  try {
    logger.info('Starting Victoria University E-Library API...');

    try {
      getRedisClient();
      logger.info('Redis client initialized');
    } catch (error) {
      logger.warn('Redis connection failed, running without Redis features', { error });
    }

    try {
      startEmailWorker();
      startAnalyticsWorker();
      logger.info('Background workers initialized');
    } catch (error) {
      logger.warn('Failed to start background workers', { error });
    }

    const server = app.listen(config.port, '0.0.0.0', () => {
      logger.info(`Server started successfully`, {
        port: config.port,
        environment: config.env,
        apiVersion: config.apiVersion,
      });
      logger.info(`API available at: http://0.0.0.0:${config.port}/api/${config.apiVersion}`);
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await stopEmailWorker();
          await stopAnalyticsWorker();
          logger.info('Background workers stopped');
        } catch (error) {
          logger.error('Error stopping workers', { error });
        }

        try {
          await closeRedisConnection();
          logger.info('Redis connection closed');
        } catch (error) {
          logger.error('Error closing Redis connection', { error });
        }

        try {
          await prisma.$disconnect();
          logger.info('Database connection closed');
        } catch (error) {
          logger.error('Error closing database connection', { error });
        }

        logger.info('Graceful shutdown complete');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled Rejection', { reason });
    });

  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

startServer();
