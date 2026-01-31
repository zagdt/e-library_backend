import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { authenticate } from '../../shared/middleware/auth.js';
import { authRateLimiter, strictRateLimiter } from '../../shared/middleware/rateLimiter.js';
import {
  signupSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
  updateProfileSchema,
} from './auth.validators.js';

const router = Router();

router.post(
  '/signup',
  authRateLimiter,
  validate(signupSchema),
  authController.signup.bind(authController)
);

router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  authController.login.bind(authController)
);

router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refresh.bind(authController)
);

router.post(
  '/logout',
  authenticate,
  authController.logout.bind(authController)
);

router.post(
  '/verify-email',
  validate(verifyEmailSchema),
  authController.verifyEmail.bind(authController)
);

router.post(
  '/forgot-password',
  strictRateLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword.bind(authController)
);

router.post(
  '/reset-password',
  strictRateLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword.bind(authController)
);

router.get(
  '/me',
  authenticate,
  authController.getProfile.bind(authController)
);

router.patch(
  '/me',
  authenticate,
  strictRateLimiter,
  validate(updateProfileSchema),
  authController.updateProfile.bind(authController)
);

router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword.bind(authController)
);

router.post(
  '/resend-verification',
  strictRateLimiter,
  validate(forgotPasswordSchema),
  authController.resendVerification.bind(authController)
);

export default router;
