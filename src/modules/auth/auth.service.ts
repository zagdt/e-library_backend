import prisma from '../../config/database.js';
import { hashPassword, comparePassword, generateSecureToken } from '../../shared/utils/password.js';
import { generateTokenPair, verifyRefreshToken, getTokenExpiration } from '../../shared/utils/jwt.js';
import { BadRequestError, UnauthorizedError, NotFoundError, ConflictError } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/utils/logger.js';
import { emailQueue } from '../queue/email.queue.js';
import { RoleType } from '../../shared/types/index.js';
import { validatePassword, checkPasswordStrength } from '../../shared/utils/passwordStrength.js';
import { checkAccountLockout, recordFailedLogin, recordSuccessfulLogin } from '../../shared/utils/accountLockout.js';
import type { SignupInput, LoginInput, ForgotPasswordInput, ResetPasswordInput, UpdateProfileInput } from './auth.validators.js';

export class AuthService {
  async signup(data: SignupInput) {
    // Validate password strength
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
      throw new BadRequestError(passwordValidation.message || 'Password does not meet requirements');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const hashedPassword = await hashPassword(data.password);
    const verificationToken = generateSecureToken();

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        hashedPassword,
        verificationToken,
        role: 'STUDENT',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    await emailQueue.addVerificationEmail({
      to: user.email,
      name: user.name,
      token: verificationToken,
    });

    logger.info('User signed up', { userId: user.id, email: user.email });

    return user;
  }

  async login(data: LoginInput, ipAddress?: string, userAgent?: string) {
    // Check account lockout first
    const lockoutStatus = await checkAccountLockout(data.email.toLowerCase());
    if (!lockoutStatus.allowed) {
      throw new UnauthorizedError(lockoutStatus.message || 'Account is locked');
    }

    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      // Record failed attempt even for non-existent users (prevent enumeration)
      await recordFailedLogin(data.email.toLowerCase(), ipAddress, userAgent);
      logger.warn('Login attempt with non-existent email', { email: data.email });
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is suspended
    if (user.suspendedAt) {
      throw new UnauthorizedError(`Account is suspended: ${user.suspendedReason || 'Contact administrator'}`);
    }

    const isPasswordValid = await comparePassword(data.password, user.hashedPassword);

    if (!isPasswordValid) {
      const result = await recordFailedLogin(data.email.toLowerCase(), ipAddress, userAgent);
      logger.warn('Login attempt with invalid password', { userId: user.id, remainingAttempts: result.remainingAttempts });

      if (!result.allowed) {
        throw new UnauthorizedError(result.message || 'Account locked due to too many failed attempts');
      }

      throw new UnauthorizedError(
        result.remainingAttempts !== undefined && result.remainingAttempts <= 2
          ? `Invalid email or password. ${result.remainingAttempts} attempts remaining.`
          : 'Invalid email or password'
      );
    }

    if (!user.emailVerified) {
      throw new UnauthorizedError('Please verify your email before logging in');
    }

    // Record successful login and reset failed attempts
    await recordSuccessfulLogin(user.id, ipAddress, userAgent);

    const tokens = generateTokenPair(user.id, user.email, user.role as RoleType);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    logger.info('User logged in', { userId: user.id });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      logger.warn('Invalid refresh token attempt');
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedError('Invalid token type');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.refreshToken !== refreshToken) {
      logger.warn('Refresh token mismatch or user not found', { userId: decoded.userId });
      throw new UnauthorizedError('Invalid refresh token');
    }

    const blacklisted = await prisma.blacklistedToken.findUnique({
      where: { token: refreshToken },
    });

    if (blacklisted) {
      throw new UnauthorizedError('Token has been revoked');
    }

    const tokens = generateTokenPair(user.id, user.email, user.role as RoleType);

    const expiration = getTokenExpiration(refreshToken);
    if (expiration) {
      await prisma.blacklistedToken.create({
        data: {
          token: refreshToken,
          expiresAt: expiration,
        },
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    logger.info('Tokens refreshed', { userId: user.id });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens,
    };
  }

  async logout(userId: string, accessToken: string, refreshToken?: string) {
    const expiration = getTokenExpiration(accessToken);

    await prisma.$transaction(async (tx) => {
      if (expiration) {
        await tx.blacklistedToken.create({
          data: {
            token: accessToken,
            expiresAt: expiration,
          },
        });
      }

      if (refreshToken) {
        const refreshExpiration = getTokenExpiration(refreshToken);
        if (refreshExpiration) {
          await tx.blacklistedToken.create({
            data: {
              token: refreshToken,
              expiresAt: refreshExpiration,
            },
          });
        }
      }

      await tx.user.update({
        where: { id: userId },
        data: { refreshToken: null },
      });
    });

    logger.info('User logged out', { userId });
  }

  async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired verification token');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
    });

    logger.info('Email verified', { userId: user.id });

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(data: ForgotPasswordInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      return { message: 'If an account exists with this email, a password reset link has been sent' };
    }

    const resetToken = generateSecureToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    await emailQueue.addPasswordResetEmail({
      to: user.email,
      name: user.name,
      token: resetToken,
    });

    logger.info('Password reset requested', { userId: user.id });

    return { message: 'If an account exists with this email, a password reset link has been sent' };
  }

  async resetPassword(data: ResetPasswordInput) {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: data.token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    const hashedPassword = await hashPassword(data.password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        refreshToken: null,
      },
    });

    logger.info('Password reset completed', { userId: user.id });

    return { message: 'Password reset successfully' };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info('Profile updated', { userId });

    return updatedUser;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isPasswordValid = await comparePassword(currentPassword, user.hashedPassword);

    if (!isPasswordValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { hashedPassword },
    });

    logger.info('Password changed', { userId });

    return { message: 'Password changed successfully' };
  }

  async resendVerificationEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { message: 'If an account exists with this email, a verification link has been sent' };
    }

    if (user.emailVerified) {
      throw new BadRequestError('Email is already verified');
    }

    const verificationToken = generateSecureToken();

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });

    await emailQueue.addVerificationEmail({
      to: user.email,
      name: user.name,
      token: verificationToken,
    });

    logger.info('Verification email resent', { userId: user.id });

    return { message: 'If an account exists with this email, a verification link has been sent' };
  }
}

export const authService = new AuthService();
