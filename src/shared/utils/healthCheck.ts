import prisma from '../../config/database.js';
import { isRedisConnected } from '../../config/redis.js';
import { isS3Configured, verifyS3Connection } from '../../config/s3.js';
import { verifyCurrentProvider, getProvidersHealth } from '../../modules/email/email.provider.js';
import { logger } from './logger.js';

export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: number;
    services: {
        database: ServiceHealth;
        redis: ServiceHealth;
        s3: ServiceHealth;
        email: ServiceHealth;
    };
    version: string;
}

export interface ServiceHealth {
    status: 'up' | 'down' | 'unknown';
    latencyMs?: number;
    details?: Record<string, unknown>;
}

const startTime = Date.now();

/**
 * Check database connectivity
 */
const checkDatabase = async (): Promise<ServiceHealth> => {
    const start = Date.now();
    try {
        await prisma.$queryRaw`SELECT 1`;
        return {
            status: 'up',
            latencyMs: Date.now() - start,
        };
    } catch (error) {
        logger.error('Database health check failed', { error });
        return {
            status: 'down',
            latencyMs: Date.now() - start,
            details: { error: (error as Error).message },
        };
    }
};

/**
 * Check Redis connectivity
 */
const checkRedis = async (): Promise<ServiceHealth> => {
    const start = Date.now();
    try {
        const connected = isRedisConnected();
        return {
            status: connected ? 'up' : 'down',
            latencyMs: Date.now() - start,
        };
    } catch (error) {
        return {
            status: 'down',
            latencyMs: Date.now() - start,
            details: { error: (error as Error).message },
        };
    }
};

/**
 * Check S3 connectivity
 */
const checkS3 = async (): Promise<ServiceHealth> => {
    const start = Date.now();
    try {
        if (!isS3Configured()) {
            return {
                status: 'unknown',
                details: { message: 'S3 not configured' },
            };
        }
        const connected = await verifyS3Connection();
        return {
            status: connected ? 'up' : 'down',
            latencyMs: Date.now() - start,
        };
    } catch (error) {
        return {
            status: 'down',
            latencyMs: Date.now() - start,
            details: { error: (error as Error).message },
        };
    }
};

/**
 * Check email service connectivity
 */
const checkEmail = async (): Promise<ServiceHealth> => {
    const start = Date.now();
    try {
        const result = await verifyCurrentProvider();
        return {
            status: result.connected ? 'up' : 'down',
            latencyMs: Date.now() - start,
            details: { provider: result.provider },
        };
    } catch (error) {
        return {
            status: 'down',
            latencyMs: Date.now() - start,
            details: { error: (error as Error).message },
        };
    }
};

/**
 * Get comprehensive health status
 */
export const getHealthStatus = async (): Promise<HealthStatus> => {
    const [database, redis, s3, email] = await Promise.all([
        checkDatabase(),
        checkRedis(),
        checkS3(),
        checkEmail(),
    ]);

    const services = { database, redis, s3, email };

    // Determine overall status
    const criticalDown = database.status === 'down';
    const anyDown = Object.values(services).some(s => s.status === 'down');

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (criticalDown) {
        status = 'unhealthy';
    } else if (anyDown) {
        status = 'degraded';
    } else {
        status = 'healthy';
    }

    return {
        status,
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - startTime) / 1000),
        services,
        version: process.env.npm_package_version || '1.0.0',
    };
};

/**
 * Simple liveness check (just confirms process is running)
 */
export const getLivenessStatus = () => ({
    status: 'alive',
    timestamp: new Date().toISOString(),
});

/**
 * Readiness check (confirms app can serve traffic)
 */
export const getReadinessStatus = async (): Promise<{ ready: boolean; details?: string }> => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return { ready: true };
    } catch (error) {
        return { ready: false, details: 'Database not available' };
    }
};
