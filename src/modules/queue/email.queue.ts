import { Queue, Worker, Job } from 'bullmq';
import { getRedisClient, isRedisConnected } from '../../config/redis.js';
import { sendEmailWithProvider, EmailOptions } from '../email/email.provider.js';
import { config } from '../../config/index.js';
import { logger } from '../../shared/utils/logger.js';

const QUEUE_NAME = 'email-queue';

interface VerificationEmailData {
  to: string;
  name: string;
  token: string;
}

interface PasswordResetEmailData {
  to: string;
  name: string;
  token: string;
}

interface RequestStatusEmailData {
  to: string;
  name: string;
  requestTitle: string;
  status: string;
  adminReply?: string;
}

interface GenericEmailData extends EmailOptions { }

type EmailJobData =
  | { type: 'verification'; data: VerificationEmailData }
  | { type: 'passwordReset'; data: PasswordResetEmailData }
  | { type: 'requestStatus'; data: RequestStatusEmailData }
  | { type: 'generic'; data: GenericEmailData };

let emailQueue: Queue<EmailJobData> | null = null;
let emailWorker: Worker<EmailJobData> | null = null;

const getEmailQueue = (): Queue<EmailJobData> | null => {
  if (!isRedisConnected()) {
    logger.warn('Redis not connected, email queue disabled');
    return null;
  }

  if (!emailQueue) {
    emailQueue = new Queue<EmailJobData>(QUEUE_NAME, {
      connection: getRedisClient(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    });
  }

  return emailQueue;
};

const processEmailJob = async (job: Job<EmailJobData>): Promise<void> => {
  const { type, data } = job.data;
  logger.info('Processing email job', { jobId: job.id, type });

  try {
    switch (type) {
      case 'verification': {
        const verificationUrl = `${config.frontendUrl}/verify-email?token=${data.token}`;
        await sendEmailWithProvider({
          to: data.to,
          subject: 'Verify Your Email - Victoria University E-Library',
          html: `
            <h1>Welcome to Victoria University E-Library</h1>
            <p>Hello ${data.name},</p>
            <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
            <p><a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
            <p>Or copy and paste this link: ${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not create an account, please ignore this email.</p>
            <p>Best regards,<br>Victoria University E-Library Team</p>
          `,
        });
        break;
      }

      case 'passwordReset': {
        const resetUrl = `${config.frontendUrl}/reset-password?token=${data.token}`;
        await sendEmailWithProvider({
          to: data.to,
          subject: 'Password Reset Request - Victoria University E-Library',
          html: `
            <h1>Password Reset Request</h1>
            <p>Hello ${data.name},</p>
            <p>We received a request to reset your password. Click the link below to reset it:</p>
            <p><a href="${resetUrl}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
            <p>Or copy and paste this link: ${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request a password reset, please ignore this email or contact support if you're concerned about your account security.</p>
            <p>Best regards,<br>Victoria University E-Library Team</p>
          `,
        });
        break;
      }

      case 'requestStatus': {
        await sendEmailWithProvider({
          to: data.to,
          subject: `Resource Request Update - ${data.status} - Victoria University E-Library`,
          html: `
            <h1>Resource Request Update</h1>
            <p>Hello ${data.name},</p>
            <p>Your resource request "<strong>${data.requestTitle}</strong>" has been updated.</p>
            <p><strong>Status:</strong> ${data.status}</p>
            ${data.adminReply ? `<p><strong>Admin Response:</strong> ${data.adminReply}</p>` : ''}
            <p>Thank you for using Victoria University E-Library.</p>
            <p>Best regards,<br>Victoria University E-Library Team</p>
          `,
        });
        break;
      }

      case 'generic': {
        await sendEmailWithProvider(data);
        break;
      }

      default:
        logger.error('Unknown email job type', { type });
    }

    logger.info('Email job completed', { jobId: job.id, type });
  } catch (error) {
    logger.error('Email job failed', { jobId: job.id, type, error });
    throw error;
  }
};

export const startEmailWorker = (): void => {
  if (!emailWorker) {
    const connection = getRedisClient();
    emailWorker = new Worker<EmailJobData>(QUEUE_NAME, processEmailJob, {
      connection,
      concurrency: 5,
    });

    emailWorker.on('completed', (job) => {
      logger.info('Email job completed', { jobId: job.id });
    });

    emailWorker.on('failed', (job, error) => {
      logger.error('Email job failed', { jobId: job?.id, error: error.message });
    });

    emailWorker.on('error', (error) => {
      logger.error('Email worker error', { error: error.message });
    });

    logger.info('Email worker started');
  }
};

export const stopEmailWorker = async (): Promise<void> => {
  if (emailWorker) {
    await emailWorker.close();
    emailWorker = null;
    logger.info('Email worker stopped');
  }
  if (emailQueue) {
    await emailQueue.close();
    emailQueue = null;
  }
};

export const emailQueueService = {
  addVerificationEmail: async (data: VerificationEmailData): Promise<void> => {
    const queue = getEmailQueue();
    if (queue) {
      await queue.add('verification', { type: 'verification', data });
      logger.info('Verification email job added', { to: data.to });
    } else {
      logger.warn('Email queue not available, sending directly');
      await processEmailJob({ data: { type: 'verification', data } } as Job<EmailJobData>);
    }
  },

  addPasswordResetEmail: async (data: PasswordResetEmailData): Promise<void> => {
    const queue = getEmailQueue();
    if (queue) {
      await queue.add('passwordReset', { type: 'passwordReset', data });
      logger.info('Password reset email job added', { to: data.to });
    } else {
      logger.warn('Email queue not available, sending directly');
      await processEmailJob({ data: { type: 'passwordReset', data } } as Job<EmailJobData>);
    }
  },

  addRequestStatusEmail: async (data: RequestStatusEmailData): Promise<void> => {
    const queue = getEmailQueue();
    if (queue) {
      await queue.add('requestStatus', { type: 'requestStatus', data });
      logger.info('Request status email job added', { to: data.to });
    } else {
      logger.warn('Email queue not available, sending directly');
      await processEmailJob({ data: { type: 'requestStatus', data } } as Job<EmailJobData>);
    }
  },

  addGenericEmail: async (data: GenericEmailData): Promise<void> => {
    const queue = getEmailQueue();
    if (queue) {
      await queue.add('generic', { type: 'generic', data });
      logger.info('Generic email job added', { to: data.to });
    } else {
      logger.warn('Email queue not available, sending directly');
      await processEmailJob({ data: { type: 'generic', data } } as Job<EmailJobData>);
    }
  },
};

export { emailQueueService as emailQueue };
