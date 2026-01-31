import { Server } from 'http';
import prisma from '../../config/database.js';
import { getRedisClient, isRedisConnected } from '../../config/redis.js';
import { logger } from './logger.js';

let isShuttingDown = false;

/**
 * Check if server is shutting down
 */
export const isServerShuttingDown = (): boolean => isShuttingDown;

/**
 * Graceful shutdown handler
 */
export const gracefulShutdown = async (server: Server, signal: string): Promise<void> => {
    if (isShuttingDown) {
        logger.warn('Shutdown already in progress');
        return;
    }

    isShuttingDown = true;
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(() => {
        logger.info('HTTP server closed');
    });

    // Give existing requests time to complete (30 seconds max)
    const shutdownTimeout = setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
    }, 30000);

    try {
        // Close database connection
        await prisma.$disconnect();
        logger.info('Database connection closed');

        // Close Redis connection
        if (isRedisConnected()) {
            const redis = getRedisClient();
            await redis.quit();
            logger.info('Redis connection closed');
        }

        clearTimeout(shutdownTimeout);
        logger.info('Graceful shutdown complete');
        process.exit(0);
    } catch (error) {
        logger.error('Error during shutdown', { error });
        clearTimeout(shutdownTimeout);
        process.exit(1);
    }
};

/**
 * Setup shutdown signal handlers
 */
export const setupShutdownHandlers = (server: Server): void => {
    // Handle SIGTERM (sent by Docker, Kubernetes, etc.)
    process.on('SIGTERM', () => gracefulShutdown(server, 'SIGTERM'));

    // Handle SIGINT (sent by Ctrl+C)
    process.on('SIGINT', () => gracefulShutdown(server, 'SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
        logger.error('Uncaught exception', { error: error.message, stack: error.stack });
        gracefulShutdown(server, 'uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled rejection', { reason, promise });
        gracefulShutdown(server, 'unhandledRejection');
    });

    logger.info('Shutdown handlers registered');
};
