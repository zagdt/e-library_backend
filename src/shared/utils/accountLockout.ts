import prisma from '../../config/database.js';
import { logger } from './logger.js';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export interface LoginAttemptResult {
    allowed: boolean;
    remainingAttempts?: number;
    lockedUntil?: Date;
    message?: string;
}

/**
 * Check if a user account is locked due to failed login attempts
 */
export const checkAccountLockout = async (email: string): Promise<LoginAttemptResult> => {
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            failedLoginAttempts: true,
            lockedUntil: true,
        },
    });

    if (!user) {
        // Don't reveal that user doesn't exist
        return { allowed: true };
    }

    // Check if account is currently locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
        const remainingMs = user.lockedUntil.getTime() - Date.now();
        const remainingMinutes = Math.ceil(remainingMs / 60000);

        return {
            allowed: false,
            lockedUntil: user.lockedUntil,
            message: `Account is locked. Try again in ${remainingMinutes} minute(s).`,
        };
    }

    // If lock has expired, reset
    if (user.lockedUntil && user.lockedUntil <= new Date()) {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                failedLoginAttempts: 0,
                lockedUntil: null,
            },
        });
    }

    const remainingAttempts = MAX_FAILED_ATTEMPTS - user.failedLoginAttempts;

    return {
        allowed: true,
        remainingAttempts: Math.max(0, remainingAttempts),
    };
};

/**
 * Record a failed login attempt
 */
export const recordFailedLogin = async (email: string, ipAddress?: string, userAgent?: string): Promise<LoginAttemptResult> => {
    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, failedLoginAttempts: true },
    });

    // Log the attempt regardless of user existence
    await prisma.loginAttempt.create({
        data: {
            email,
            success: false,
            ipAddress,
            userAgent,
        },
    });

    if (!user) {
        return { allowed: true };
    }

    const newFailedAttempts = user.failedLoginAttempts + 1;

    if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
        // Lock the account
        const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                failedLoginAttempts: newFailedAttempts,
                lockedUntil,
            },
        });

        logger.warn('Account locked due to failed login attempts', { email, attempts: newFailedAttempts });

        return {
            allowed: false,
            lockedUntil,
            message: `Account locked due to too many failed attempts. Try again in 15 minutes.`,
        };
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: newFailedAttempts },
    });

    return {
        allowed: true,
        remainingAttempts: MAX_FAILED_ATTEMPTS - newFailedAttempts,
    };
};

/**
 * Record a successful login and reset failed attempts
 */
export const recordSuccessfulLogin = async (userId: string, ipAddress?: string, userAgent?: string): Promise<void> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
    });

    if (user) {
        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: {
                    failedLoginAttempts: 0,
                    lockedUntil: null,
                },
            }),
            prisma.loginAttempt.create({
                data: {
                    email: user.email,
                    success: true,
                    ipAddress,
                    userAgent,
                },
            }),
        ]);
    }
};

/**
 * Manually unlock a user account (admin function)
 */
export const unlockAccount = async (userId: string): Promise<void> => {
    await prisma.user.update({
        where: { id: userId },
        data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
        },
    });

    logger.info('Account manually unlocked', { userId });
};
